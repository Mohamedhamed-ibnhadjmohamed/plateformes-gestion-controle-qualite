import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  debounceTime,
  filter,
  forkJoin,
  interval,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { AuthService } from './login/auth.service';
import { DataRefreshService, RessourceDonnees } from './data-refresh.service';
import { DefautsService } from './defauts.service';
import { FamilliedefaultService } from './familliedefault.service';
import { InspectionsService } from './inspections.service';
import { AnalysesUtilisateur, DonneesAnalyses, PorteeAnalyses } from '../models/Statistiques';
import { calculerAnalysesUtilisateur } from './analyses-utilisateur.calculs';

/** Collections nécessaires aux analyses de contrôle. */
const RESSOURCES_SUIVIES: RessourceDonnees[] = ['inspection', 'defaults', 'familledefault'];

/** Filet de sécurité : rechargement périodique lorsque l'onglet est visible. */
const INTERVALLE_RAFRAICHISSEMENT = 60_000;

/** Délai de groupement des modifications successives (ms). */
const DELAI_GROUPEMENT = 250;

/** Vue exposée à la page d'analyses. */
export interface VueAnalyses {
  analyses: AnalysesUtilisateur;
  chargement: boolean;
  erreur: string | null;
  /** Collections qui n'ont pas pu être chargées (serveur indisponible). */
  echecs: string[];
  /** Vrai jusqu'au premier chargement abouti (affichage des squelettes). */
  initial: boolean;
}

/**
 * Agrège les inspections, défauts et familles de l'application et en dérive
 * les analyses de l'espace de contrôle.
 *
 * Même principe que `StatistiquesService` : flux froid (aucune requête tant
 * qu'aucun écran n'observe), réamorcé à l'ouverture de la page, après chaque
 * modification détectée par `DataRefreshInterceptor`, au changement de
 * périmètre et sur un contrôle de sécurité périodique.
 */
@Injectable({ providedIn: 'root' })
export class AnalysesUtilisateurService {
  private readonly inspectionsService = inject(InspectionsService);
  private readonly defautsService = inject(DefautsService);
  private readonly famillesService = inject(FamilliedefaultService);
  private readonly authService = inject(AuthService);
  private readonly dataRefresh = inject(DataRefreshService);

  /** Dernières données consolidées connues, conservées entre deux rechargements. */
  private donnees: DonneesAnalyses = { inspections: [], defaults: [], familles: [] };
  private initial = true;
  /** Collections en échec lors du dernier chargement. */
  private echecs: string[] = [];

  /** Périmètre d'analyse : l'utilisateur connecté, ou toute l'application. */
  private readonly portee = new BehaviorSubject<PorteeAnalyses>('moi');
  readonly portee$: Observable<PorteeAnalyses> = this.portee.asObservable();

  /** Périmètre effectif : « tous » n'est proposé qu'aux administrateurs. */
  private get porteeAutorisee(): PorteeAnalyses {
    return this.authService.isAdmin() ? this.portee.getValue() : 'moi';
  }

  /** Vrai si l'utilisateur peut basculer sur le périmètre « tous ». */
  get peutVoirTous(): boolean {
    return this.authService.isAdmin();
  }

  choisirPortee(portee: PorteeAnalyses): void {
    if (this.authService.isAdmin()) {
      this.portee.next(portee);
    }
  }

  /** Analyses en continu, partagées entre les écrans abonnés. */
  readonly vue$: Observable<VueAnalyses> = merge(
    // 1. Chargement immédiat à l'ouverture de la page.
    of('*' as const),
    // 2. Modifications détectées par l'intercepteur HTTP, groupées.
    this.dataRefresh.modifications$.pipe(
      filter(
        (evenement): evenement is RessourceDonnees | '*' =>
          evenement === '*' || RESSOURCES_SUIVIES.includes(evenement)
      ),
      debounceTime(DELAI_GROUPEMENT)
    ),
    // 3. Changement de périmètre (réservé aux administrateurs).
    this.portee$.pipe(map(() => '*' as const)),
    // 4. Filet de sécurité, inactif si l'onglet est en arrière-plan.
    interval(INTERVALLE_RAFRAICHISSEMENT).pipe(
      filter(() => !document.hidden),
      map(() => '*' as const)
    )
  ).pipe(
    switchMap(() => this.charger()),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Rechargement explicite (bouton « Actualiser »). */
  rafraichir(): void {
    this.dataRefresh.notifier('*');
  }

  /** Identifiant de l'utilisateur connecté, ou `null` s'il est indéterminé. */
  private get idUtilisateur(): number | null {
    const id = Number(this.authService.getUser()?.id_utilisateur);
    return Number.isFinite(id) ? id : null;
  }

  private charger(): Observable<VueAnalyses> {
    this.echecs = [];

    const sources: Observable<Partial<DonneesAnalyses>>[] = [
      this.collection(
        this.inspectionsService.getAllinspection(),
        'inspections',
        (reponse) => reponse.inspections ?? []
      ),
      this.collection(
        this.defautsService.getAlldefault(),
        'defaults',
        (reponse) => reponse.defaults ?? []
      ),
      this.collection(
        this.famillesService.getAllfamilledefault(),
        'familles',
        (reponse) => reponse.familles ?? []
      ),
    ];

    return forkJoin(sources).pipe(
      map((parties) => {
        this.donnees = parties.reduce<DonneesAnalyses>(
          (accumulateur, partie) => ({ ...accumulateur, ...partie }),
          this.donnees
        );
        this.initial = false;
        return this.construireVue(false, null);
      }),
      startWith(this.construireVue(true, null, this.initial)),
      catchError((error) => {
        console.error('Erreur lors du chargement des analyses :', error);
        return of(this.construireVue(false, 'Impossible de charger vos analyses.'));
      })
    );
  }

  /**
   * Requête associée à une collection ; une collection en échec reste vide afin
   * qu'une indisponibilité partielle ne casse pas toute la page.
   */
  private collection<T>(
    source: Observable<T>,
    cle: keyof DonneesAnalyses,
    extraction: (valeur: T) => unknown[]
  ): Observable<Partial<DonneesAnalyses>> {
    return source.pipe(
      map((valeur) => ({ [cle]: extraction(valeur) }) as unknown as Partial<DonneesAnalyses>),
      catchError((error) => {
        console.error(`Analyses : échec du chargement de « ${cle} ».`, error);
        this.echecs = [...this.echecs, cle];
        return of<Partial<DonneesAnalyses>>({ [cle]: [] });
      })
    );
  }

  /** Construit la vue à partir des données actuellement connues. */
  private construireVue(
    chargement: boolean,
    erreur: string | null,
    initial = false
  ): VueAnalyses {
    return {
      analyses: calculerAnalysesUtilisateur(
        this.donnees,
        this.porteeAutorisee,
        this.idUtilisateur
      ),
      chargement,
      erreur,
      echecs: this.echecs,
      initial,
    };
  }
}

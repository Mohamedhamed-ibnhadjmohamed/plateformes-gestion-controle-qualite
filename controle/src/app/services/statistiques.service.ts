import { Injectable, inject } from '@angular/core';
import {
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
import { AqlsService } from './aqls.service';
import { DataRefreshService, RessourceDonnees } from './data-refresh.service';
import { DefautsService } from './defauts.service';
import { EmployeesService } from './employees.service';
import { FamilliedefaultService } from './familliedefault.service';
import { InspectionsService } from './inspections.service';
import { OrdersService } from './orders.service';
import { ProduitsService } from './produits.service';
import { UtilisateursService } from './utilisateurs.service';
import { DonneesDashboard, StatistiquesDashboard } from '../models/Statistiques';
import { calculerStatistiques, donneesVides } from './statistiques.calculs';

/** Collections consolidées par le tableau de bord. */
const RESSOURCES_SUIVIES: RessourceDonnees[] = [
  'produit',
  'aql',
  'order',
  'inspection',
  'defaults',
  'familledefault',
  'employee',
  'utilisateur',
];

/** Filet de sécurité : rechargement périodique lorsque l'onglet est visible. */
const INTERVALLE_RAFRAICHISSEMENT = 60_000;

/** Délai de groupement des modifications successives (ms). */
const DELAI_GROUPEMENT = 250;

/** Vue exposée au tableau de bord. */
export interface VueDashboard {
  statistiques: StatistiquesDashboard;
  chargement: boolean;
  erreur: string | null;
  /** Collections qui n'ont pas pu être chargées (serveur indisponible). */
  echecs: string[];
  /** Vrai jusqu'au premier chargement abouti (affichage des squelettes). */
  initial: boolean;
}

/**
 * Agrège les collections de l'application et en dérive les statistiques.
 *
 * Le flux est froid : il ne interroge le serveur que lorsqu'un écran l'observe,
 * et s'arrête dès que le tableau de bord est fermé. Il se réamorce ensuite :
 * sur le chargement initial, sur chaque modification détectée par
 * `DataRefreshInterceptor`, et sur un contrôle de sécurité périodique.
 */
@Injectable({ providedIn: 'root' })
export class StatistiquesService {
  private readonly produitsService = inject(ProduitsService);
  private readonly aqlsService = inject(AqlsService);
  private readonly ordersService = inject(OrdersService);
  private readonly inspectionsService = inject(InspectionsService);
  private readonly defautsService = inject(DefautsService);
  private readonly famillesService = inject(FamilliedefaultService);
  private readonly employeesService = inject(EmployeesService);
  private readonly utilisateursService = inject(UtilisateursService);
  private readonly dataRefresh = inject(DataRefreshService);

  /** Dernier état consolidé connu, conservé entre deux rafraîchissements. */
  private donnees: DonneesDashboard = donneesVides();
  private initial = true;
  /** Collections en échec lors du dernier chargement. */
  private echecs: string[] = [];

  /** Statistiques en continu, partagées entre les écrans abonnés. */
  readonly vue$: Observable<VueDashboard> = merge(
    // 1. Chargement immédiat à l'ouverture du tableau de bord.
    of('*' as const),
    // 2. Modifications détectées par l'intercepteur HTTP, groupées pour ne pas
    //    déclencher une rafale de requêtes lors d'une série d'écritures.
    this.dataRefresh.modifications$.pipe(
      filter(
        (evenement): evenement is RessourceDonnees | '*' =>
          evenement === '*' || RESSOURCES_SUIVIES.includes(evenement)
      ),
      debounceTime(DELAI_GROUPEMENT)
    ),
    // 3. Filet de sécurité (autre poste, correction en base…), inactif si
    //    l'onglet est en arrière-plan.
    interval(INTERVALLE_RAFRAICHISSEMENT).pipe(
      filter(() => !document.hidden),
      map(() => '*' as const)
    )
  ).pipe(
    switchMap((ressource) => this.charger(ressource)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Rechargement explicite (bouton « Actualiser » du tableau de bord). */
  rafraichir(): void {
    this.dataRefresh.notifier('*');
  }

  /**
   * Charge une ressource précise, ou l'ensemble des collections.
   * Seules les données modifiées sont retéléchargées.
   */
  private charger(ressource: RessourceDonnees | '*'): Observable<VueDashboard> {
    const sources =
      ressource === '*'
        ? RESSOURCES_SUIVIES.map((cible) => this.source(cible))
        : [this.source(ressource)];

    this.echecs = [];

    return forkJoin(sources).pipe(
      map((parties) => {
        this.donnees = parties.reduce<DonneesDashboard>(
          (accumulateur, partie) => ({ ...accumulateur, ...partie }),
          this.donnees
        );
        // Le premier chargement est terminé : les squelettes disparaissent.
        this.initial = false;
        return this.construireVue(false, null);
      }),
      startWith(this.construireVue(true, null, this.initial)),
      catchError((error) => {
        console.error('Erreur lors du chargement des statistiques :', error);
        return of(
          this.construireVue(false, 'Impossible de charger les statistiques.')
        );
      })
    );
  }

  /**
   * Requête associée à une ressource ; une collection en échec reste vide
   * afin qu'une indisponibilité partielle ne casse pas tout le tableau de bord.
   */
  private source(
    ressource: RessourceDonnees
  ): Observable<Partial<DonneesDashboard>> {
    switch (ressource) {
      case 'produit':
        return this.collection(
          this.produitsService.getAllProduits(),
          'produits',
          (reponse) => reponse.produits ?? []
        );
      case 'aql':
        return this.collection(
          this.aqlsService.getAllAql(),
          'aqls',
          (reponse) => reponse.aqls ?? []
        );
      case 'order':
        return this.collection(
          this.ordersService.getAllordersFabrication(),
          'orders',
          (reponse) => reponse.orders ?? []
        );
      case 'inspection':
        return this.collection(
          this.inspectionsService.getAllinspection(),
          'inspections',
          (reponse) => reponse.inspections ?? []
        );
      case 'defaults':
        return this.collection(
          this.defautsService.getAlldefault(),
          'defaults',
          (reponse) => reponse.defaults ?? []
        );
      case 'familledefault':
        return this.collection(
          this.famillesService.getAllfamilledefault(),
          'familles',
          (reponse) => reponse.familles ?? []
        );
      case 'employee':
        return this.collection(
          this.employeesService.getAllEmployees(),
          'employees',
          (reponse) => reponse.employees ?? []
        );
      case 'utilisateur':
        return this.collection(
          this.utilisateursService.getAllUtilisateurs(),
          'utilisateurs',
          (reponse) => reponse.utilisateurs ?? []
        );
      case 'contact':
        // Les messages de contact ne sont pas représentés au tableau de bord.
        return of<Partial<DonneesDashboard>>({});
    }
  }

  /** Transforme une réponse d'API en fragment de `DonneesDashboard`. */
  private collection<T>(
    source: Observable<T>,
    cle: keyof DonneesDashboard,
    extraction: (valeur: T) => unknown[]
  ): Observable<Partial<DonneesDashboard>> {
    return source.pipe(
      map((valeur) => ({ [cle]: extraction(valeur) }) as unknown as Partial<DonneesDashboard>),
      catchError((error) => {
        console.error(`Statistiques : échec du chargement de « ${cle} ».`, error);
        this.echecs = [...this.echecs, cle];
        return of<Partial<DonneesDashboard>>({ [cle]: [] });
      })
    );
  }

  /** Construit la vue à partir des données actuellement connues. */
  private construireVue(
    chargement: boolean,
    erreur: string | null,
    initial = false
  ): VueDashboard {
    return {
      statistiques: calculerStatistiques(this.donnees),
      chargement,
      erreur,
      echecs: this.echecs,
      initial,
    };
  }
}

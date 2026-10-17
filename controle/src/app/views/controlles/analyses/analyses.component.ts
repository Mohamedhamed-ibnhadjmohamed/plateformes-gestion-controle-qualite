import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { AuthService } from '../../../services/login/auth.service';
import { AnalysesUtilisateurService, VueAnalyses } from '../../../services/analyses-utilisateur.service';
import { PartAnneau, PorteeAnalyses } from '../../../models/Statistiques';

/** Vue de la page : analyses + périmètre et période d'affichage choisis. */
export interface VueAnalysesPage extends VueAnalyses {
  portee: PorteeAnalyses;
}

/**
 * Page « Analyses » de l'espace de contrôle.
 *
 * Destinée aux opérateurs : elle reprend les mêmes indicateurs et graphiques
 * que le tableau de bord administrateur, mais limités aux contrôles qui les
 * concernent (ou à toute l'application pour un administrateur).
 */
@Component({
  selector: 'app-analyses',
  templateUrl: './analyses.component.html',
  styleUrl: './analyses.component.css',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysesComponent {
  private readonly service = inject(AnalysesUtilisateurService);
  private readonly authService = inject(AuthService);

  /** Utilisateur connecté, affiché dans l'en-tête de la page. */
  readonly utilisateur = this.authService.getUser();

  /** Fenêtre d'affichage de la courbe d'évolution, en mois. */
  private readonly periode = new BehaviorSubject<number>(12);
  readonly periode$ = this.periode.asObservable();

  /** Périmètre des analyses (« tous » réservé aux administrateurs). */
  readonly peutVoirTous = this.service.peutVoirTous;
  readonly portee$ = this.service.portee$;

  /** Vue complète : courbe réduite à la période choisie, périmètre connu. */
  readonly vue$: Observable<VueAnalysesPage> = combineLatest([
    this.service.vue$,
    this.periode$,
    this.service.portee$,
  ]).pipe(
    map(([vue, mois, portee]) => ({
      ...vue,
      portee,
      analyses: {
        ...vue.analyses,
        inspectionsParMois: vue.analyses.inspectionsParMois.slice(-mois),
      },
    }))
  );

  choisirPeriode(mois: number): void {
    this.periode.next(mois);
  }

  choisirPortee(portee: PorteeAnalyses): void {
    this.service.choisirPortee(portee);
  }

  rafraichir(): void {
    this.service.rafraichir();
  }

  /** Couleurs des évaluations, dans l'ordre des lignes du classement. */
  couleursEvaluations(parts: PartAnneau[]): string[] {
    return parts.map((part) => part.couleur ?? '#2864dc');
  }

  /** Titre de la page selon le périmètre affiché. */
  titre(portee: PorteeAnalyses): string {
    return portee === 'tous' ? 'Analyses de l\'équipe' : 'Mes analyses';
  }
}

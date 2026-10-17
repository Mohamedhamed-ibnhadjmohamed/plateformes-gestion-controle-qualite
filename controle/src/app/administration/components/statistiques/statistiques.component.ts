import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';
import { StatistiquesService, VueDashboard } from '../../../services/statistiques.service';
import { PartAnneau } from '../../../models/Statistiques';

/**
 * Tableau de bord : section statistiques de l'espace d'administration.
 *
 * Toutes les valeurs sont dérivées des collections déjà chargées par
 * `StatistiquesService` (aucun appel supplémentaire, aucune duplication) et se
 * rafraîchissent automatiquement après chaque création, modification ou
 * suppression effectuée dans l'application.
 */
@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.css',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatistiquesComponent {
  private readonly statistiquesService = inject(StatistiquesService);

  /** Fenêtre d'affichage de la courbe d'évolution, en mois. */
  private readonly periode = new BehaviorSubject<number>(12);
  readonly periode$ = this.periode.asObservable();

  /** Vue complète, la courbe étant réduite à la période choisie. */
  readonly vue$: Observable<VueDashboard> = combineLatest([
    this.statistiquesService.vue$,
    this.periode$,
  ]).pipe(
    map(([vue, mois]) => ({
      ...vue,
      statistiques: {
        ...vue.statistiques,
        inspectionsParMois: vue.statistiques.inspectionsParMois.slice(-mois),
      },
    }))
  );

  choisirPeriode(mois: number): void {
    this.periode.next(mois);
  }

  rafraichir(): void {
    this.statistiquesService.rafraichir();
  }

  /** Couleurs des évaluations, dans l'ordre des lignes du classement. */
  couleursEvaluations(parts: PartAnneau[]): string[] {
    return parts.map((part) => part.couleur ?? '#2864dc');
  }
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BarreSerie } from '../../models/Statistiques';

/**
 * Classement en barres horizontales (HTML/CSS).
 * Sert de vue « liste » aux mêmes données que les graphiques SVG, lorsque la
 * lecture ligne par ligne est plus parlante : fréquences, volumétries…
 */
@Component({
  selector: 'app-bar-list',
  templateUrl: './bar-list.component.html',
  styleUrl: './bar-list.component.css',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarListComponent {
  @Input({ required: true })
  set items(valeur: BarreSerie[]) {
    this.source = valeur ?? [];
  }
  get items(): BarreSerie[] {
    return this.source;
  }

  /** Unité affichée à côté de la valeur. */
  @Input() suffixe = '';

  /** Couleur par défaut des barres. */
  @Input() couleur = '#2864dc';

  /** Couleurs éventuelles, une par ligne (sinon `couleur`). */
  @Input() couleurs: string[] = [];

  private source: BarreSerie[] = [];

  get maximum(): number {
    return this.source.reduce((max, item) => Math.max(max, item.valeur), 0) || 1;
  }

  pourcentage(valeur: number): number {
    return (valeur / this.maximum) * 100;
  }

  couleurDe(index: number): string {
    return this.couleurs[index] ?? this.couleur;
  }
}

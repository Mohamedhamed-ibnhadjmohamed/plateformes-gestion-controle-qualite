import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BarreSerie } from '../../models/Statistiques';

/** Barre positionnée dans le repère du graphique. */
export interface BarrePositionnee extends BarreSerie {
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
  centreX: number;
  /** Zone de survol (colonne complète). */
  zoneX: number;
  zoneLargeur: number;
}

/**
 * Graphique en barres verticales, dessiné en SVG.
 * Le survol d'une colonne affiche son détail (« info ») dans une infobulle.
 */
@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent {
  @Input({ required: true })
  set series(valeur: BarreSerie[]) {
    this.source = valeur ?? [];
    this.barres = this.positionner();
  }
  get series(): BarreSerie[] {
    return this.source;
  }

  /** Unité affichée dans l'infobulle et sur l'axe. */
  @Input() suffixe = '';

  /** Couleur des barres (jeton du design par défaut). */
  @Input() couleur = '#2864dc';

  private source: BarreSerie[] = [];
  barres: BarrePositionnee[] = [];
  actif: number | null = null;

  private readonly largeur = 340;
  private readonly hauteur = 190;
  private readonly margeHaut = 20;
  private readonly margeDroite = 8;
  private readonly margeBas = 36;
  private readonly margeGauche = 30;

  /** Échelle verticale : toujours au moins 1 pour éviter une division par zéro. */
  get maximum(): number {
    return this.source.reduce((max, serie) => Math.max(max, serie.valeur), 0) || 1;
  }

  get hauteurUtile(): number {
    return this.hauteur - this.margeHaut - this.margeBas;
  }

  get largeurUtile(): number {
    return this.largeur - this.margeGauche - this.margeDroite;
  }

  /** Graduations horizontales (0, 50 % et 100 % du maximum). */
  get graduations(): { valeur: number; y: number }[] {
    return [0, 0.5, 1].map((ratio) => ({
      valeur: Math.round(this.maximum * ratio),
      y: this.margeHaut + this.hauteurUtile * (1 - ratio),
    }));
  }

  private positionner(): BarrePositionnee[] {
    const nombre = this.source.length || 1;
    const pas = this.largeurUtile / nombre;
    const largeurBarre = Math.min(pas * 0.5, 46);

    return this.source.map((serie, index) => {
      const hauteur = (serie.valeur / this.maximum) * this.hauteurUtile;
      const centreX = this.margeGauche + pas * index + pas / 2;
      return {
        ...serie,
        hauteur,
        largeur: largeurBarre,
        x: centreX - largeurBarre / 2,
        y: this.margeHaut + this.hauteurUtile - hauteur,
        centreX,
        zoneX: this.margeGauche + pas * index,
        zoneLargeur: pas,
      };
    });
  }

  /** Déclenche le rafraîchissement de la géométrie quand les entrées changent. */
  survoler(index: number | null): void {
    this.actif = index;
  }
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PointSerie } from '../../models/Statistiques';

/** Point positionné dans le repère du graphique. */
export interface PointPositionne extends PointSerie {
  x: number;
  y: number;
}

/**
 * Courbe d'évolution (aire + ligne) dessinée en SVG.
 * Le survol affiche un repère vertical, met le point en évidence et ouvre
 * une infobulle contenant la valeur exacte.
 */
@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent {
  @Input({ required: true })
  set points(valeur: PointSerie[]) {
    this.source = valeur ?? [];
    this.serie = this.positionner();
  }
  get points(): PointSerie[] {
    return this.source;
  }

  /** Unité affichée dans l'infobulle et sur l'axe. */
  @Input() suffixe = '';

  /** Couleur de la courbe et de son aire. */
  @Input() couleur = '#2864dc';

  /** Identifiant unique du dégradé (obligatoire s'il y a plusieurs courbes). */
  @Input() identifiant = 'aire';

  private source: PointSerie[] = [];
  serie: PointPositionne[] = [];
  actif: number | null = null;

  private readonly largeur = 520;
  private readonly hauteur = 230;
  private readonly margeHaut = 22;
  private readonly margeDroite = 14;
  private readonly margeBas = 30;
  private readonly margeGauche = 34;

  get maximum(): number {
    return this.source.reduce((max, point) => Math.max(max, point.valeur), 0) || 1;
  }

  get hauteurUtile(): number {
    return this.hauteur - this.margeHaut - this.margeBas;
  }

  get largeurUtile(): number {
    return this.largeur - this.margeGauche - this.margeDroite;
  }

  get graduations(): { valeur: number; y: number }[] {
    return [0, 0.5, 1].map((ratio) => ({
      valeur: Math.round(this.maximum * ratio),
      y: this.margeHaut + this.hauteurUtile * (1 - ratio),
    }));
  }

  /** Tracé de la ligne reliant les points. */
  get cheminLigne(): string {
    return this.serie
      .map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`)
      .join(' ');
  }

  /** Tracé de l'aire sous la courbe (fermé sur la ligne de base). */
  get cheminAire(): string {
    if (!this.serie.length) {
      return '';
    }
    const base = this.margeHaut + this.hauteurUtile;
    const dernier = this.serie[this.serie.length - 1];
    return `${this.cheminLigne} L ${dernier.x} ${base} L ${this.serie[0].x} ${base} Z`;
  }

  private positionner(): PointPositionne[] {
    const nombre = this.source.length;
    if (nombre < 2) {
      return [];
    }
    const pas = this.largeurUtile / (nombre - 1);

    return this.source.map((point, index) => ({
      ...point,
      x: this.margeGauche + pas * index,
      y: this.margeHaut + this.hauteurUtile * (1 - point.valeur / this.maximum),
    }));
  }

  survoler(index: number | null): void {
    this.actif = index;
  }
}

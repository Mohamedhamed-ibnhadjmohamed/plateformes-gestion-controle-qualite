import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PartAnneau } from '../../models/Statistiques';

/** Segment prêt à être dessiné (géométrie calculée une seule fois). */
export interface SegmentAnneau {
  libelle: string;
  valeur: number;
  couleur: string;
  dasharray: string;
  dashoffset: number;
  pourcentage: number;
}

/**
 * Graphique en anneau.
 * Chaque part est survolable : le détail s'affiche au centre et la légende
 * se met en évidence. Aucune dépendance externe, tout est en SVG.
 */
@Component({
  selector: 'app-donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrl: './donut-chart.component.css',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent {
  /** Parts à représenter ; les valeurs nulles sont ignorées. */
  @Input({ required: true })
  set parts(valeur: PartAnneau[]) {
    this.source = valeur ?? [];
    this.segments = this.construire();
  }
  get parts(): PartAnneau[] {
    return this.source;
  }

  /** Libellé affiché au centre quand aucune part n'est survolée. */
  @Input() libelleCentre = 'Total';

  private source: PartAnneau[] = [];
  segments: SegmentAnneau[] = [];
  total = 0;
  actif: SegmentAnneau | null = null;

  /** Palette de repli (Bleu · Vert · Orange · Rouge · Violet · Cyan · Gris),
   *  alignée sur les jetons de couleur du design. */
  private readonly palette = [
    '#2864dc',
    '#159a68',
    '#c77708',
    '#d92d20',
    '#7c3aed',
    '#0ea5e9',
    '#64748b',
  ];

  private readonly rayon = 48;
  private readonly circonference = 2 * Math.PI * 48;
  /** Espace vide entre deux parts, en unités du viewBox. */
  private readonly fente = 2.5;

  private construire(): SegmentAnneau[] {
    const parts = this.source.filter((part) => part.valeur > 0);
    this.total = parts.reduce((total, part) => total + part.valeur, 0);

    let cumul = 0;
    return parts.map((part, index) => {
      const ratio = part.valeur / (this.total || 1);
      const longueur = Math.max(ratio * this.circonference - this.fente, 0);
      const segment: SegmentAnneau = {
        libelle: part.libelle,
        valeur: part.valeur,
        couleur: part.couleur ?? this.palette[index % this.palette.length],
        dasharray: `${longueur} ${this.circonference - longueur}`,
        dashoffset: -cumul,
        pourcentage: ratio * 100,
      };
      cumul += ratio * this.circonference;
      return segment;
    });
  }

  survoler(segment: SegmentAnneau | null): void {
    this.actif = segment;
  }
}

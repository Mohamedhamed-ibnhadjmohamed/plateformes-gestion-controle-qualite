import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Article présenté dans la section « Actualités ». */
interface Article {
  categorie: string;
  titre: string;
  extrait: string;
  date: string;
  lecture: string;
  icone: string;
  /** Route interne ouverte par « Lire la suite ». */
  lien: string;
}

/**
 * Section « Blog / actualités » : met en avant des conseils et nouveautés
 * autour du contrôle qualité.
 */
@Component({
    selector: 'app-actualites',
    templateUrl: './actualites.component.html',
    styleUrl: './actualites.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActualitesComponent {
  readonly articles: Article[] = [
    {
      categorie: 'Bonnes pratiques',
      titre: 'Bien choisir son plan d\'échantillonnage AQL',
      extrait: 'Comment définir les niveaux de contrôle et interpréter les seuils d\'acceptation pour des inspections fiables.',
      date: '12 mars 2026',
      lecture: '5 min',
      icone: 'fa-solid fa-clipboard-check',
      lien: '/home/souschain',
    },
    {
      categorie: 'Méthode',
      titre: 'Réduire les non-conformités grâce aux analyses',
      extrait: 'Exploitez les indicateurs de conformité et les défauts récurrents pour cibler vos actions correctives.',
      date: '28 février 2026',
      lecture: '7 min',
      icone: 'fa-solid fa-chart-line',
      lien: '/home/analyses',
    },
    {
      categorie: 'Nouveauté',
      titre: 'Des rapports de contrôle exportables en un clic',
      extrait: 'Découvrez la génération automatique des fiches de rapport à partir de vos inspections enregistrées.',
      date: '9 février 2026',
      lecture: '3 min',
      icone: 'fa-solid fa-file-pdf',
      lien: '/home/consulter',
    },
  ];
}

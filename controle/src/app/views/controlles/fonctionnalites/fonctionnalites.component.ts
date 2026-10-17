import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Carte présentant une capacité de la plateforme. */
interface Fonctionnalite {
  icone: string;
  titre: string;
  texte: string;
}

/**
 * Section « Fonctionnalités » de la page d'accueil : grille de cartes
 * mettant en avant les grandes capacités de la plateforme.
 */
@Component({
    selector: 'app-fonctionnalites',
    templateUrl: './fonctionnalites.component.html',
    styleUrl: './fonctionnalites.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FonctionnalitesComponent {
  readonly fonctionnalites: Fonctionnalite[] = [
    {
      icone: 'fa-solid fa-diagram-project',
      titre: 'Contrôle sous-chaîne',
      texte: 'Inspectez chaque étape intermédiaire de production et enregistrez les défauts détectés en temps réel.',
    },
    {
      icone: 'fa-solid fa-clipboard-check',
      titre: 'Contrôle fin de chaîne',
      texte: 'Validez les produits finis selon un plan d\'échantillonnage AQL strict avant leur mise sur le marché.',
    },
    {
      icone: 'fa-solid fa-clipboard-list',
      titre: 'Audit qualité',
      texte: 'Menez des audits complets, évaluez les critères et suivez les actions correctives à mettre en place.',
    },
    {
      icone: 'fa-solid fa-file-pdf',
      titre: 'Rapports exportables',
      texte: 'Générez des fiches de contrôle claires et prêtes à imprimer pour chaque inspection réalisée.',
    },
    {
      icone: 'fa-solid fa-chart-pie',
      titre: 'Analyses & indicateurs',
      texte: 'Suivez vos taux de conformité et vos défauts récurrents grâce à des tableaux de bord visuels.',
    },
    {
      icone: 'fa-solid fa-bug',
      titre: 'Gestion des défauts',
      texte: 'Cataloguez vos défauts par famille et par gravité pour prioriser efficacement vos corrections.',
    },
  ];
}

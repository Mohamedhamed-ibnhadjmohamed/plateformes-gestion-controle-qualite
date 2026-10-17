import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Question fréquente et sa réponse. */
interface QuestionFaq {
  question: string;
  reponse: string;
  ouvert: boolean;
}

/**
 * Section « FAQ » : liste de questions dépliables.
 * Seule une réponse reste ouverte à la fois, pour garder la lecture fluide.
 */
@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrl: './faq.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  readonly questions: QuestionFaq[] = [
    {
      question: 'Qu\'est-ce que le contrôle qualité en production ?',
      reponse:
        'Le contrôle qualité consiste à vérifier les produits à différentes étapes de la chaîne de production afin de détecter les défauts au plus tôt et de garantir la conformité avant la livraison.',
      ouvert: true,
    },
    {
      question: 'Quelle est la différence entre sous-chaîne, fin de chaîne et audit ?',
      reponse:
        'La sous-chaîne vérifie les étapes intermédiaires, la fin de chaîne valide le produit fini selon un plan d\'échantillonnage AQL, et l\'audit contrôle l\'ensemble du processus et des critères qualité.',
      ouvert: false,
    },
    {
      question: 'Comment sont déterminés les défauts majeurs et mineurs ?',
      reponse:
        'Chaque famille de défauts est classée selon sa gravité (critique, majeure, mineure). Les quantités acceptées sont ensuite comparées aux seuils définis par les niveaux AQL.',
      ouvert: false,
    },
    {
      question: 'Puis-je générer des rapports de contrôle ?',
      reponse:
        'Oui. Chaque inspection enregistrée donne lieu à une fiche de rapport consultable et exportable, prête à être imprimée ou partagée.',
      ouvert: false,
    },
    {
      question: 'Mes analyses sont-elles personnalisées ?',
      reponse:
        'Les analyses affichent vos propres indicateurs. Les administrateurs peuvent en plus basculer sur une vue globale de toute l\'application.',
      ouvert: false,
    },
    {
      question: 'La plateforme gère-t-elle plusieurs niveaux d\'accès ?',
      reponse:
        'Oui. Les rôles administrateur et opérateur limitent l\'accès aux fonctionnalités et aux données selon le profil de chaque utilisateur.',
      ouvert: false,
    },
  ];

  /** Ouvre une réponse et referme les autres. */
  basculer(cible: QuestionFaq): void {
    this.questions.forEach((question) => {
      question.ouvert = question === cible ? !question.ouvert : false;
    });
  }
}

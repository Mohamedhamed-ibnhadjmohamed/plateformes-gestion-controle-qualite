import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Témoignage d'un utilisateur de la plateforme. */
interface Temoignage {
  texte: string;
  auteur: string;
  role: string;
  initiales: string;
  note: number;
}

/**
 * Section « Témoignages » : retours d'utilisateurs présentés en cartes.
 */
@Component({
    selector: 'app-temoignages',
    templateUrl: './temoignages.component.html',
    styleUrl: './temoignages.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemoignagesComponent {
  readonly temoignages: Temoignage[] = [
    {
      texte:
        'Depuis que nous utilisons la plateforme, la traçabilité de nos contrôles est irréprochable. Les fiches de rapport nous font gagner un temps précieux.',
      auteur: 'Sami Benali',
      role: 'Responsable qualité',
      initiales: 'SB',
      note: 5,
    },
    {
      texte:
        'La saisie des défauts par gravité et les analyses en temps réel nous ont permis de réduire nettement nos non-conformités.',
      auteur: 'Claire Dubois',
      role: 'Cheffe de production',
      initiales: 'CD',
      note: 5,
    },
    {
      texte:
        'Une interface claire et des contrôles sous-chaîne / fin de chaîne très bien pensés. Nos opérateurs l\'ont adoptée immédiatement.',
      auteur: 'Hakim Cherif',
      role: 'Auditeur qualité',
      initiales: 'HC',
      note: 4,
    },
  ];
}

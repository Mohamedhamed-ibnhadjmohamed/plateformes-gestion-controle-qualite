import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CarteStatistique } from '../../models/Statistiques';

/**
 * Carte d'indicateur clé du tableau de bord.
 * Cliquable lorsqu'une page d'administration détaille la donnée.
 */
@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  @Input({ required: true }) carte!: CarteStatistique;
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthService } from '../../../services/login/auth.service';
import { AnalysesUtilisateurService } from '../../../services/analyses-utilisateur.service';
import { CarteStatistique } from '../../../models/Statistiques';

/** Bandeau de synthèse affiché au-dessus de la page d'accueil. */
export interface ResumeAccueil {
  cartes: CarteStatistique[];
  /** Prénom de l'utilisateur, pour l'accroche du bandeau. */
  prenom: string;
  /** Vrai lorsque des analyses peuvent être affichées sans gêner la lecture. */
  pret: boolean;
}

/**
 * Page d'accueil de l'espace de contrôle.
 *
 * Le contenumarketing (`app-landing`) est conservé tel quel : un bandeau de
 * synthèse personnelle est ajouté au-dessus, afin qu'un opérateur retrouve
 * immédiatement ses indicateurs de qualité après connexion. Le détail complet
 * reste disponible sur la page « Analyses ».
 */
@Component({
    selector: 'app-accueil',
    templateUrl: './accueil.component.html',
    styleUrl: './accueil.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccueilComponent {
  private readonly service = inject(AnalysesUtilisateurService);
  private readonly authService = inject(AuthService);

  /** Utilisateur connecté, affiché dans l'accroche du bandeau. */
  readonly utilisateur = this.authService.getUser();

  /**
   * Synthèse prête à l'affichage. Le bandeau n'apparaît que lorsque les
   * indicateurs sont réellement disponibles : pas de squelette ni de message
   * d'erreur sur une page dont le rôle premier est informatif.
   */
  readonly resume$: Observable<ResumeAccueil> = this.service.vue$.pipe(
    map((vue) => ({
      cartes: vue.analyses.cartes.slice(0, 4),
      prenom: this.utilisateur?.prenom ?? this.utilisateur?.nom ?? '',
      pret:
        !vue.initial &&
        !vue.chargement &&
        !vue.erreur &&
        !vue.echecs.length &&
        !vue.analyses.aucuneDonnee,
    }))
  );
}

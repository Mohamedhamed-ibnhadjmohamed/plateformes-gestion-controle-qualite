import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Pied de page partagé (espace de contrôle et pages de contrôle).
 *
 * Présente la marque, des raccourcis de navigation et un retour en haut
 * de page. Aucune donnée de contact réelle n'est affichée : l'utilisateur
 * est invité à utiliser le formulaire de contact de la page d'accueil.
 */
@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
    /** Année courante, pour le copyright. */
    readonly annee = new Date().getFullYear();

    /** Remonte en douceur en haut de la page (instantané si animations réduites). */
    remonter(): void {
        if (typeof window === 'undefined') {
            return;
        }

        const reduire = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduire ? 'auto' : 'smooth' });
    }
}

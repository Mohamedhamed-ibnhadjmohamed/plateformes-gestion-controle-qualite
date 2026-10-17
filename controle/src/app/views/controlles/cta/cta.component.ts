import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Bandeau d'appel à l'action : invite l'utilisateur à démarrer un contrôle.
 */
@Component({
    selector: 'app-cta',
    templateUrl: './cta.component.html',
    styleUrl: './cta.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaComponent {}

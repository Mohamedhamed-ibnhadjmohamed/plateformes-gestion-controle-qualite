import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/login/auth.service';

/**
 * Barre de navigation de l'espace de contrôle.
 *
 * Regroupe les liens de navigation, le menu « Contrôle » et le menu
 * utilisateur. Sur mobile, les liens sont repliés derrière un bouton.
 */
@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly destroyRef = inject(DestroyRef);

    /** Nom complet affiché dans le menu utilisateur. */
    nom = '';
    /** Adresse de l'utilisateur, affichée en en-tête du menu. */
    email = '';
    /** Libellé lisible du rôle. */
    roleLabel = '';
    /** Initiales servant d'avatar. */
    initiales = '';
    /** Vrai lorsque le menu mobile est déplié. */
    menuOuvert = false;

    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    ngOnInit(): void {
        const user = this.authService.getUser();
        if (!user) {
            this.redirectToLogin();
            return;
        }

        this.nom = [user.prenom, user.nom].filter(Boolean).join(' ') || user.email || 'Utilisateur';
        this.email = user.email ?? '';
        this.roleLabel = user.role === 'admin' ? 'Administrateur' : 'Opérateur';
        this.initiales = this.calculerInitiales(user.prenom, user.nom, user.email);

        // Le menu mobile se referme dès qu'une navigation aboutit.
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.fermerMenu());
    }

    /** Replie le menu lorsqu'on revient à une largeur d'écran desktop. */
    @HostListener('window:resize')
    onRedimensionnement(): void {
        if (typeof window !== 'undefined' && window.innerWidth > 991 && this.menuOuvert) {
            this.menuOuvert = false;
        }
    }

    /** Referme le menu mobile lorsqu'un clic a lieu en dehors de la navbar. */
    @HostListener('document:click', ['$event'])
    onClicDocument(event: MouseEvent): void {
        if (!this.menuOuvert) {
            return;
        }
        const cible = event.target as HTMLElement | null;
        if (!cible?.closest('.navigation-bar')) {
            this.menuOuvert = false;
        }
    }

    basculerMenu(): void {
        this.menuOuvert = !this.menuOuvert;
    }

    fermerMenu(): void {
        this.menuOuvert = false;
    }

    redirectToLogin(): void {
        this.router.navigate(['/login']);
    }

    logout(): void {
        this.authService.logout();
        this.redirectToLogin();
    }

    /** Construit deux initiales à partir du prénom, du nom ou de l'email. */
    private calculerInitiales(prenom?: string, nom?: string, email?: string): string {
        const p = (prenom ?? '').trim();
        const n = (nom ?? '').trim();

        if (p && n) {
            return (p[0] + n[0]).toUpperCase();
        }
        if (p) {
            return p.slice(0, 2).toUpperCase();
        }
        if (n) {
            return n.slice(0, 2).toUpperCase();
        }
        return (email ?? '?').slice(0, 2).toUpperCase();
    }
}

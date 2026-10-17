import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    OnInit,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../services/login/auth.service';
import { AdminLayoutService } from '../admin-layout.service';
import { navbarData } from '../sidebarr-admin/nav-data';

/**
 * Barre supérieure de l'administration.
 *
 * Contient le bouton d'ouverture/fermeture du menu latéral, le titre de la
 * page courante, quelques liens rapides et le menu utilisateur.
 */
@Component({
    selector: 'app-navbar-admin',
    templateUrl: './navbar-admin.component.html',
    styleUrls: ['./navbar-admin.component.css'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarAdminComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly layout = inject(AdminLayoutService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly cdr = inject(ChangeDetectorRef);

    nom = '';
    email = '';
    roleLabel = '';
    initiales = '';
    titre = 'Administration';

    ngOnInit(): void {
        const user = this.authService.getUser();
        if (!user) {
            this.redirectToLogin();
            return;
        }

        this.nom =
            [user.prenom, user.nom].filter(Boolean).join(' ') ||
            user.email ||
            'Utilisateur';
        this.email = user.email ?? '';
        this.roleLabel = user.role === 'admin' ? 'Administrateur' : 'Opérateur';
        this.initiales = this.calculerInitiales(user.prenom, user.nom, user.email);

        this.majTitre(this.router.url);
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((event) =>
                this.majTitre((event as NavigationEnd).urlAfterRedirects)
            );
    }

    /** Bouton du menu : tiroir sur mobile, repli en icônes sur desktop. */
    basculerMenu(): void {
        this.layout.basculer();
    }

    logout(): void {
        this.authService.logout();
        this.redirectToLogin();
    }

    private redirectToLogin(): void {
        this.router.navigate(['/login']);
    }

    /** Détermine le libellé de la page à partir de la route courante. */
    private majTitre(url: string): void {
        const chemin = (url || '').split('?')[0];
        const item = navbarData.find((entree) =>
            chemin.startsWith(entree.routeLink)
        );
        this.titre = item?.label ?? 'Administration';
        this.cdr.markForCheck();
    }

    private calculerInitiales(
        prenom?: string,
        nom?: string,
        email?: string
    ): string {
        const premier = prenom?.trim()?.[0] ?? '';
        const second = nom?.trim()?.[0] ?? '';
        const initiales = `${premier}${second}`.toUpperCase();
        return initiales || email?.trim()?.[0]?.toUpperCase() || '?';
    }
}

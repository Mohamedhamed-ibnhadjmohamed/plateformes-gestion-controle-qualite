import {
    Component,
    DestroyRef,
    HostListener,
    OnInit,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AdminLayoutService } from '../../administration/shared/admin-layout.service';

/**
 * Coquille de l'espace d'administration.
 *
 * Coordonne la barre latérale et la navbar via {@link AdminLayoutService} :
 * ouverture en tiroir sur mobile, repli en icônes sur desktop. Le tiroir est
 * refermé automatiquement lors d'un changement de page ou d'un redimensionnement
 * vers un écran large.
 */
@Component({
    selector: 'app-administration',
    templateUrl: './administration.component.html',
    styleUrls: ['./administration.component.css'],
    standalone: false,
})
export class AdministrationComponent implements OnInit {
    title = 'Administration';

    private readonly layout = inject(AdminLayoutService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    readonly reduit$ = this.layout.reduit$;
    readonly mobileOuvert$ = this.layout.mobileOuvert$;

    ngOnInit(): void {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => this.layout.fermerMobile());
    }

    /** Ferme le tiroir (clic sur le voile sombre). */
    fermerMenu(): void {
        this.layout.fermerMobile();
    }

    /** Referme le tiroir lorsque l'on repasse sur un écran large. */
    @HostListener('window:resize')
    onResize(): void {
        if (!AdminLayoutService.estLargeurMobile(window.innerWidth)) {
            this.layout.fermerMobile();
        }
    }
}

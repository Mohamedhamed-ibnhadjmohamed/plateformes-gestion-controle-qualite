import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminLayoutService } from '../admin-layout.service';
import { ADMIN_NAV_SECTIONS, AdminNavItem, navbarData } from './nav-data';

/**
 * Barre latérale de l'administration.
 *
 * Les entrées sont regroupées par section. Sur desktop, la barre peut être
 * repliée en icônes ; sur mobile, elle s'affiche en tiroir au-dessus du
 * contenu.
 */
@Component({
    selector: 'app-sidebarr-admin',
    templateUrl: './sidebarr-admin.component.html',
    styleUrls: ['./sidebarr-admin.component.css'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarrAdminComponent {
    private readonly layout = inject(AdminLayoutService);

    readonly reduit$ = this.layout.reduit$;
    readonly mobileOuvert$ = this.layout.mobileOuvert$;

    /** Menu regroupé par section, dans l'ordre défini. */
    readonly sections: { titre: string; items: AdminNavItem[] }[] = ADMIN_NAV_SECTIONS.map((titre) => ({
        titre,
        items: navbarData.filter((item) => item.section === titre),
    })).filter((section) => section.items.length > 0);

    fermerMobile(): void {
        this.layout.fermerMobile();
    }

    basculerReduit(): void {
        this.layout.basculerReduit();
    }
}

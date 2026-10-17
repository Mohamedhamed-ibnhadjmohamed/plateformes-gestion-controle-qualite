/** Entrée du menu latéral de l'administration. */
export interface AdminNavItem {
    /** Route Angular ciblée. */
    routeLink: string;
    /** Classes Font Awesome de l'icône. */
    icon: string;
    /** Libellé affiché. */
    label: string;
    /** Section de regroupement dans le menu. */
    section: string;
}

/** Ordre d'affichage des sections du menu latéral. */
export const ADMIN_NAV_SECTIONS = ['Pilotage', 'Référentiels', 'Accès', 'Communication'];

export const navbarData: AdminNavItem[] = [
    {
        routeLink: '/admin/statistiques',
        icon: 'fas fa-chart-pie',
        label: 'Tableau de bord',
        section: 'Pilotage',
    },
    {
        routeLink: '/admin/inspection',
        icon: 'fas fa-search',
        label: 'Inspection',
        section: 'Pilotage',
    },
    {
        routeLink: '/admin/produit',
        icon: 'fas fa-box',
        label: 'Produit',
        section: 'Référentiels',
    },
    {
        routeLink: '/admin/aql',
        icon: 'fas fa-clipboard-check',
        label: 'AQL',
        section: 'Référentiels',
    },
    {
        routeLink: '/admin/order',
        icon: 'fas fa-industry',
        label: 'Ordres de fabrication',
        section: 'Référentiels',
    },
    {
        routeLink: '/admin/rapprochement',
        icon: 'fas fa-scale-balanced',
        label: 'Rapprochement qtés',
        section: 'Pilotage',
    },
    {
        routeLink: '/admin/default',
        icon: 'fas fa-exclamation-triangle',
        label: 'Défaut',
        section: 'Référentiels',
    },
    {
        routeLink: '/admin/famille',
        icon: 'fas fa-sitemap',
        label: 'Familles défaut',
        section: 'Référentiels',
    },
    {
        routeLink: '/admin/utilisateur',
        icon: 'fas fa-users',
        label: 'Utilisateur',
        section: 'Accès',
    },
    {
        routeLink: '/admin/employee',
        icon: 'fas fa-user-tie',
        label: 'Employé',
        section: 'Accès',
    },
    {
        routeLink: '/admin/contacter',
        icon: 'fas fa-envelope',
        label: 'Contact',
        section: 'Communication',
    },
];

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { OrdersService } from '../../../services/orders.service';
import { LigneRapprochement } from '../../../models/api';

type StatutEcart = 'conforme' | 'sous-quantite' | 'sur-enregistrement' | 'non-controle';

/**
 * Rapport de rapprochement des quantités.
 *
 * Pour chaque ordre de fabrication, compare la quantité commandée à la
 * somme des quantités enregistrées sur ses produits, et affiche les
 * inspections/défauts associés. Signale automatiquement les écarts.
 */
@Component({
    selector: 'app-rapprochement',
    templateUrl: './rapprochement.component.html',
    styleUrl: './rapprochement.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RapprochementComponent implements OnInit {
    private readonly ordersService = inject(OrdersService);
    private readonly toastr = inject(ToastrService);

    lignes: LigneRapprochement[] = [];
    chargement = true;

    /** Filtre de statut appliqué au tableau. */
    filtre: 'tous' | 'ecarts' | 'conformes' = 'tous';

    ngOnInit(): void {
        this.charger();
    }

    charger(): void {
        this.chargement = true;
        this.ordersService.getRapprochement().subscribe({
            next: (reponse) => {
                this.lignes = reponse.rapprochement ?? [];
                this.chargement = false;
            },
            error: () => {
                this.chargement = false;
                this.toastr.error(
                    'Impossible de charger le rapport de rapprochement.',
                    'Erreur'
                );
            },
        });
    }

    /** Statut métier d'une ligne. */
    statut(ligne: LigneRapprochement): StatutEcart {
        if (ligne.nb_produits === 0) {
            return 'non-controle';
        }
        if (ligne.ecart === 0) {
            return 'conforme';
        }
        return ligne.ecart > 0 ? 'sous-quantite' : 'sur-enregistrement';
    }

    /** Libellé lisible du statut. */
    libelleStatut(ligne: LigneRapprochement): string {
        switch (this.statut(ligne)) {
            case 'conforme':
                return 'Conforme';
            case 'sous-quantite':
                return 'Sous-quantité';
            case 'sur-enregistrement':
                return 'Sur-enregistrement';
            default:
                return 'Aucun produit';
        }
    }

    /** Lignes visibles après application du filtre. */
    get lignesFiltrees(): LigneRapprochement[] {
        switch (this.filtre) {
            case 'ecarts':
                return this.lignes.filter((l) => l.ecart !== 0);
            case 'conformes':
                return this.lignes.filter((l) => l.nb_produits > 0 && l.ecart === 0);
            default:
                return this.lignes;
        }
    }

    /** Nombre total d'OF présentant un écart. */
    get nbEcarts(): number {
        return this.lignes.filter((l) => l.ecart !== 0).length;
    }

    /** Taux de conformité global (% d'OF sans écart parmi ceux ayant des produits). */
    get tauxConformite(): number | null {
        const avecProduits = this.lignes.filter((l) => l.nb_produits > 0);
        if (avecProduits.length === 0) {
            return null;
        }
        const conformes = avecProduits.filter((l) => l.ecart === 0).length;
        return Math.round((conformes / avecProduits.length) * 100);
    }

    /** Somme absolue des écarts en quantité. */
    get sommeEcarts(): number {
        return this.lignes.reduce((somme, l) => somme + Math.abs(l.ecart), 0);
    }

    /** Formate un nombre avec séparateur de milliers. */
    formatNbre(valeur: number | undefined): string {
        return new Intl.NumberFormat('fr-FR').format(valeur ?? 0);
    }

    /**
     * Exporte les lignes visibles (filtre courant) au format CSV.
     * BOM UTF-8 + point-virgule pour un ouverture correcte dans Excel FR.
     */
    exporterCsv(): void {
        const lignes = this.lignesFiltrees;
        if (lignes.length === 0) {
            this.toastr.info('Aucune ligne à exporter pour ce filtre.', 'Export');
            return;
        }

        const entetes = [
            'OF',
            'Désignation',
            'Qté commandée',
            'Qté enregistrée',
            'Écart',
            'Produits',
            'Inspections',
            'Défauts',
            'Statut',
        ];

        const echapper = (valeur: unknown): string => {
            const texte = String(valeur ?? '');
            // Échappe les guillemets et entoure le champ s'il contient le séparateur.
            return /[";\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
        };

        const lignesCsv = lignes.map((l) =>
            [
                l.libelle_order,
                l.designation_order,
                l.qte_demandee,
                l.qte_enregistree,
                l.ecart,
                l.nb_produits,
                l.nb_inspections,
                l.nb_defauts,
                this.libelleStatut(l),
            ]
                .map(echapper)
                .join(';')
        );

        const contenu = '\uFEFF' + [entetes.join(';'), ...lignesCsv].join('\r\n');
        const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8;' });
        const lien = document.createElement('a');
        const url = URL.createObjectURL(blob);
        lien.href = url;
        lien.download = `rapprochement-quantites-${new Date().toISOString().slice(0, 10)}.csv`;
        lien.click();
        URL.revokeObjectURL(url);
        this.toastr.success(`${lignes.length} ligne(s) exportée(s).`, 'Export CSV');
    }
}

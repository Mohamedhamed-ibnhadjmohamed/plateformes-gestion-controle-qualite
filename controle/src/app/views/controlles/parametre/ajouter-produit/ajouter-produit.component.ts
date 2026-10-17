import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AQL } from '../../../../models/AQL';
import { Order } from '../../../../models/Order';
import { Produit } from '../../../../models/Produit';
import { AqlsService } from '../../../../services/aqls.service';
import { OrdersService } from '../../../../services/orders.service';
import { ProduitsService } from '../../../../services/produits.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-ajouter-produit',
    templateUrl: './ajouter-produit.component.html',
    styleUrl: './ajouter-produit.component.css',
    standalone: false
})
export class AjouterProduitComponent  implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  produits: Produit[] = [];
  aqls: AQL[] = [];
  orders: Order[] = [];

  // Contrôle à la saisie : suivi de la quantité de l'OF sélectionné.
  suiviQuantite: { qte_demandee: number; qte_enregistree: number; qte_restante: number } | null = null;
  private readonly suiviRecherche$ = new Subject<number>();

  constructor(
    private produitService: ProduitsService,
    private aqlservice: AqlsService,
    private orderservice: OrdersService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // Recherche automatique du suivi de quantité dès qu'un OF est sélectionné
    // (avec anti-rebond).
    this.suiviRecherche$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((idOrder) => this.orderservice.getSuiviQuantite(idOrder)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (suivi) => (this.suiviQuantite = suivi),
        error: () => (this.suiviQuantite = null),
      });
  }

  /** Quantité formulée pour l'OF en cours de saisie. */
  get quantiteSaisie(): number {
    return Number(this.produitForm.get('quantite')?.value) || 0;
  }

  /** Vrai si la quantité saisie + quantité déjà enregistrée dépasse la commande. */
  get depassementQuantite(): boolean {
    if (!this.suiviQuantite) {
      return false;
    }
    return this.quantiteSaisie > this.suiviQuantite.qte_restante;
  }

  /** Déclenche la vérification du suivi de quantité pour l'OF sélectionné. */
  verifierSuiviQuantite(): void {
    const idOrder = this.produitForm.get('id_order')?.value;
    if (idOrder) {
      this.suiviRecherche$.next(Number(idOrder));
    } else {
      this.suiviQuantite = null;
    }
  }

  /** Formate un nombre avec séparateur de milliers. */
  formatNbre(valeur: number): string {
    return new Intl.NumberFormat('fr-FR').format(valeur);
  }

  reloadData(): void {
    this.getAllProduits();
    this.getAllAql();
    this.getAllOrdersFabrication();
  }

  resetForm() {
    this.produitForm.reset();
  }

  getAllOrdersFabrication(): void {
    this.orderservice.getAllordersFabrication().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        if (response.orders && Array.isArray(response.orders)) {
          this.orders = response.orders;
        } else {
        }
      },
      (error: any) => {
      }
    );
  }

  getAllProduits(): void {
    this.produitService.getAllProduits().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        if (response.produits && Array.isArray(response.produits)) {
          this.produits = response.produits;
        } else {
        }
      },
      (error: any) => {
      }
    );
  }

  getAllAql(): void {
    this.aqlservice.getAllAql().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        if (response.aqls && Array.isArray(response.aqls)) {
          this.aqls = response.aqls;
        } else {
        }
      },
      (error: any) => {
      }
    );
  }
  // ajouter produit
  produitForm = new FormGroup({
    code: new FormControl('', Validators.required),
    designation: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    libelle_produit: new FormControl('', Validators.required),
    niveau: new FormControl(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    quantite: new FormControl(null, [Validators.required, Validators.min(1)]),
    id_aql: new FormControl(null, Validators.required),
    id_order: new FormControl(null, Validators.required),
  });

  // Getters pour chaque champ de formulaire
  get code() {
    return this.produitForm.get('code');
  }

  get designation() {
    return this.produitForm.get('designation');
  }

  get libelle_produit() {
    return this.produitForm.get('libelle_produit');
  }

  get niveau() {
    return this.produitForm.get('niveau');
  }

  get quantite() {
    return this.produitForm.get('quantite');
  }

  get id_aql() {
    return this.produitForm.get('id_aql');
  }

  get id_order() {
    return this.produitForm.get('id_order');
  }
  ajouter() {
    if (this.produitForm.valid) {
      const depassement = this.depassementQuantite;
      const suivi = this.suiviQuantite;
      const quantiteSaisie = this.quantiteSaisie;
      this.produitService.createProduit(this.produitForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        (response: any) => {
          this.produits.push(response);
          this.toastr.success('Produit ajouté avec succès.');
          // Contrôle à la saisie : avertir si la quantité dépasse la commande.
          if (depassement && suivi) {
            this.toastr.warning(
              `Quantité dépassée : la commande prévoit ${this.formatNbre(suivi.qte_demandee)} pcs, ` +
              `vous enregistrez ${this.formatNbre(suivi.qte_enregistree + quantiteSaisie)} pcs.`,
              'Écart de quantité'
            );
          }
          this.resetForm(); // Réinitialiser le formulaire après ajout
          this.reloadData(); // Mettre à jour la liste des produits sans recharger la page
        },
        (error: any) => {
          this.toastr.error("Erreur lors de l'ajout du produit.");
        }
      );
    } else {
      this.toastr.error(
        'Le formulaire contient des erreurs. Veuillez les corriger avant de soumettre.'
      );
    }
  }

  
}

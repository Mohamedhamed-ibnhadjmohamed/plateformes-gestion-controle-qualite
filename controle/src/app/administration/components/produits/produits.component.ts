import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { AQL } from '../../../models/AQL';
import { Order } from '../../../models/Order';
import { Produit } from '../../../models/Produit';
import { ProduitsResponse } from '../../../models/api';
import { AqlsService } from '../../../services/aqls.service';
import { OrdersService } from '../../../services/orders.service';
import { ProduitsService } from '../../../services/produits.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-produits',
    templateUrl: './produits.component.html',
    styleUrls: ['../../shared/styles/style.css'],
    standalone: false
})
export class ProduitsComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  name = 'Produit';
  produits: Produit[] = [];
  aqls: AQL[] = [];
  produit: Produit = new Produit();
  orders: Order[] = [];
  order = new Order();
  isLoading = false;
  message: string = '';

  // Contrôle à la saisie : suivi de la quantité de l'OF sélectionné.
  suiviQuantite: { qte_demandee: number; qte_enregistree: number; qte_restante: number } | null = null;
  private readonly suiviRecherche$ = new Subject<number>();

  // Chargement initial (affiché avant les données) et pagination.
  chargement = true;
  page = 1;
  pageSize = 10;

  get produitsPage(): Produit[] {
    const debut = (this.page - 1) * this.pageSize;
    return this.produits.slice(debut, debut + this.pageSize);
  }

  changerPage(page: number): void {
    this.page = page;
  }

  constructor(
    private produitService: ProduitsService,
    private aqlservice: AqlsService,
    private orderservice: OrdersService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.reloadData();

    // Recherche automatique du suivi de quantité dès qu'un OF est sélectionné
    // ou que la quantité saisie change (avec anti-rebond).
    this.suiviRecherche$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((idOrder) => this.orderservice.getSuiviQuantite(idOrder, this.produit.id_produit)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (suivi) => (this.suiviQuantite = suivi),
        error: () => (this.suiviQuantite = null),
      });

    // Réinitialise l'alerte quand le formulaire est vidé.
    this.produitForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.produitForm.pristine) {
        this.suiviQuantite = null;
      }
    });
  }

  reloadData(): void {
    this.getAllProduits();
    this.getAllAql();
    this.getAllOrdersFabrication();
  }

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
        this.chargement = false;
        if (response.produits && Array.isArray(response.produits)) {
          this.produits = response.produits;
          this.page = 1;
          this.toastr.success('Produits récupérés avec succès.');
        }
      },
      (error: any) => {
        this.chargement = false;
        console.error('Erreur lors de la récupération des produits.', error);
        this.toastr.error('Erreur lors de la récupération des produits.');
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

  ajouter() {
    if (this.produitForm.valid) {
      // Contrôle à la saisie : avertir (sans bloquer) si le dépassement est confirmé
      // par le serveur au moment de l'enregistrement.
      this.produitService.createProduit(this.produitForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        (response: any) => {
          this.toastr.success('Produit ajouté avec succès.');
          if (this.depassementQuantite && this.suiviQuantite) {
            this.toastr.warning(
              `Quantité dépassée : la commande prévoit ${this.formatNbre(this.suiviQuantite.qte_demandee)} pcs, ` +
              `vous enregistrez ${this.formatNbre(this.suiviQuantite.qte_enregistree + this.quantiteSaisie)} pcs.`,
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

  /** Formate un nombre avec séparateur de milliers. */
  formatNbre(valeur: number): string {
    return new Intl.NumberFormat('fr-FR').format(valeur);
  }

  modifier() {
    if (this.produitForm.valid) {
      const updatedProduit = {
        ...this.produit, // Conserve l'identifiant et autres propriétés non modifiables
        ...this.produitForm.value, // Remplace les valeurs par celles du formulaire
      };

      this.produitService
        .updateProduit(this.produit.id_produit, updatedProduit)
        .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
          (response: any) => {
            this.toastr.success('Produit modifié avec succès.');
            if (this.depassementQuantite && this.suiviQuantite) {
              this.toastr.warning(
                `Quantité dépassée : la commande prévoit ${this.formatNbre(this.suiviQuantite.qte_demandee)} pcs, ` +
                `vous enregistrez ${this.formatNbre(this.suiviQuantite.qte_enregistree + this.quantiteSaisie)} pcs.`,
                'Écart de quantité'
              );
            }
            this.resetForm(); // Réinitialiser le formulaire après modification
            this.reloadData(); // Rafraîchir les données affichées sans recharger la page
          },
          (error: any) => {
            this.toastr.error('Erreur lors de la mise à jour du produit.');
          }
        );
    } else {
      this.toastr.error(
        'Le formulaire contient des erreurs. Veuillez les corriger avant de soumettre.'
      );
    }
  }

  confirmer(produit: Produit) {
    this.produit = produit;
  }

  /** Sélectionne le produit et pré-remplit le formulaire de modification. */
  ouvrirModifier(produit: Produit): void {
    this.produit = produit;
    this.produitForm.patchValue({
      code: produit.code ?? '',
      designation: produit.designation ?? '',
      libelle_produit: produit.libelle_produit ?? '',
      niveau: produit.niveau ?? null,
      quantite: produit.quantite ?? null,
      id_aql: produit.id_aql != null ? String(produit.id_aql) : null,
      id_order: produit.id_order != null ? String(produit.id_order) : null,
    } as any);
    // Charge le suivi de quantité de l'OF concerné (hors produit en cours).
    if (produit.id_order != null) {
      this.suiviRecherche$.next(Number(produit.id_order));
    }
  }

  supprimer(produit: Produit) {
    this.produitService.deleteProduit(produit.id_produit).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.produits = this.produits.filter(
          (item) => item.id_produit !== produit.id_produit
        );
        this.toastr.success('Produit supprimé avec succès.');
        this.reloadData();
      },
      (error: any) => {
        this.toastr.error('Erreur lors de la suppression du produit.');
      }
    );
  }

  searchForm = new FormGroup({
    rech: new FormControl('', Validators.required),
  });

  rechercher() {
    const searchValue = this.searchForm.get('rech')?.value;

    // Vérification que searchValue est un code non vide
    if (
      searchValue === null ||
      searchValue === undefined ||
      String(searchValue).trim() === ''
    ) {
      this.message = 'Veuillez entrer un code produit valide.';
      this.toastr.warning(this.message);
      return;
    }

    const code = Number(searchValue);
    if (!Number.isFinite(code)) {
      this.message = 'Le code produit doit être numérique.';
      this.toastr.warning(this.message);
      return;
    }

    this.isLoading = true; // Indique que la recherche est en cours

    this.produitService.getByCode(code).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: ProduitsResponse) => {
        this.isLoading = false; // Fin du chargement

        if (response && response.produits && response.produits.length > 0) {
          this.produits = response.produits;
          this.page = 1;
          this.toastr.success('Produits trouvés avec succès !');
        } else {
          this.produits = [];
          this.message = 'Aucun produit trouvé pour ce code.';
          this.toastr.info(this.message);
        }
      },
      (error) => {
        this.isLoading = false; // Fin du chargement en cas d'erreur
        this.message =
          'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.';
        this.toastr.error(this.message);
        console.error('Erreur lors de la recherche de produits :', error);
      }
    );
  }
}

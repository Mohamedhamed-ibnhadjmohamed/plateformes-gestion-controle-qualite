import { Component, OnInit } from '@angular/core';
import { AQL } from '../../../models/AQL';
import { Order } from '../../../models/Order';
import { Produit } from '../../../models/Produit';
import { AqlsService } from '../../../services/aqls.service';
import { OrdersService } from '../../../services/orders.service';
import { ProduitsService } from '../../../services/produits.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrls: ['../../shared/styles/style.css'], // Correction du nom de la clé
})
export class ProduitsComponent implements OnInit {
  name = 'Produits';
  produits: Produit[] = [];
  aqls: AQL[] = [];
  produit: Produit = new Produit();
  orders: Order[] = [];
  order = new Order();
  isLoading = false;
  message: string = '';

  constructor(
    private produitService: ProduitsService,
    private aqlservice: AqlsService,
    private orderservice: OrdersService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.reloadData();
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

  resetForm() {
    this.produitForm.reset();
  }

  getAllOrdersFabrication(): void {
    this.orderservice.getAllordersFabrication().subscribe(
      (response: any) => {
        if (response.orders && Array.isArray(response.orders)) {
          this.orders = response.orders;
          console.log('Orders de fabrication récupérés avec succès!');
        } else {
          console.log(
            "La réponse du service ne contient pas de tableau 'orders' valide.",
            response
          );
        }
      },
      (error: any) => {
        console.log(
          'Erreur lors de la récupération des orders de fabrication.',
          error
        );
      }
    );
  }

  getAllProduits(): void {
    this.produitService.getAllProduits().subscribe(
      (response: any) => {
        if (response.produits && Array.isArray(response.produits)) {
          this.produits = response.produits;
          this.toastr.success('Produits récupérés avec succès!');
        } else {
          console.log(
            "La réponse du service ne contient pas de tableau 'produits' valide."
          );
        }
      },
      (error: any) => {
        console.log('Erreur lors de la récupération des produits.');
      }
    );
  }

  getAllAql(): void {
    this.aqlservice.getAllAql().subscribe(
      (response: any) => {
        if (response.aqls && Array.isArray(response.aqls)) {
          this.aqls = response.aqls;
          console.log('AQLs récupérés avec succès!', response);
        } else {
          console.log(
            "La réponse du service ne contient pas de tableau 'aqls' valide.",
            response
          );
        }
      },
      (error: any) => {
        console.log('Erreur lors de la récupération des AQLs.', error);
      }
    );
  }

  ajouter() {
    if (this.produitForm.valid) {
      this.produitService.createProduit(this.produitForm.value).subscribe(
        (response: any) => {
          this.produits.push(response);
          this.toastr.success('Produit ajouté avec succès!');
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

  modifier() {
    if (this.produitForm.valid) {
      const updatedProduit = {
        ...this.produit, // Conserve l'identifiant et autres propriétés non modifiables
        ...this.produitForm.value, // Remplace les valeurs par celles du formulaire
      };

      this.produitService
        .updateProduit(this.produit.id_produit, updatedProduit)
        .subscribe(
          (response: any) => {
            this.toastr.success('Produit modifié avec succès!');
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

  supprimer(produit: Produit) {
    this.produitService.deleteProduit(produit.id_produit).subscribe(
      (response: any) => {
        this.produits = this.produits.filter(
          (item) => item.id_produit !== produit.id_produit
        );
        this.toastr.success('Produit supprimé avec succès!');
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

    // Vérification que searchValue est une chaîne non vide
    if (
      !searchValue ||
      typeof searchValue !== 'string' ||
      searchValue.trim() === ''
    ) {
      this.message = 'Veuillez entrer un libellé valide.';
      this.toastr.warning(this.message);
      return;
    }

    this.isLoading = true; // Indique que la recherche est en cours

    this.orderservice.getOrderByLibelle(searchValue.trim()).subscribe(
      (response: { orders: any[] }) => {
        this.isLoading = false; // Fin du chargement

        if (response && response.orders && response.orders.length > 0) {
          this.orders = response.orders;
          this.toastr.success('Orders trouvés avec succès!');
        } else {
          this.orders = [];
          this.message = 'Aucun order trouvé pour ce libellé.';
          this.toastr.info(this.message);
        }
      },
      (error) => {
        this.isLoading = false; // Fin du chargement en cas d'erreur
        this.message =
          'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.';
        this.toastr.error(this.message);
        console.error("Erreur lors de la recherche d'orders:", error); // Log de l'erreur pour plus de détails
      }
    );
  }
}

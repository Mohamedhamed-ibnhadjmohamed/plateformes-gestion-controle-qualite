import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AQL } from '../../../../models/AQL';
import { Order } from '../../../../models/Order';
import { Produit } from '../../../../models/Produit';
import { AqlsService } from '../../../../services/aqls.service';
import { OrdersService } from '../../../../services/orders.service';
import { ProduitsService } from '../../../../services/produits.service';

@Component({
  selector: 'app-ajouter-produit',
  templateUrl: './ajouter-produit.component.html',
  styleUrl: './ajouter-produit.component.css'
})
export class AjouterProduitComponent  implements OnInit {
  produits: Produit[] = [];
  aqls: AQL[] = [];
  orders: Order[] = [];

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

  
}

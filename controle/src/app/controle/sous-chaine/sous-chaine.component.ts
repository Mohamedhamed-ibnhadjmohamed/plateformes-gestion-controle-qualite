import { Component, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AQL } from '../../models/AQL';
import { Produit } from '../../models/Produit';
import { ProduitsService } from '../../services/produits.service';
import { InspectionsService } from '../../services/inspections.service';
import { DefautsService } from '../../services/defauts.service';
import { AllProduit } from '../../models/AllProduit';
import { ToastrService } from 'ngx-toastr';
import { Default } from '../../models/Default';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sous-chaine',

  templateUrl: './sous-chaine.component.html',
  styleUrl: '../shared/style/style.css',
})
export class SousChaineComponent {
  produitVisible = false;
  DefaultVisible = false;
  formVisible = true;
  default: Default = new Default();
  defaullistes: Default[] = [];
  produits: Produit[] = [];
  produit: Produit = new Produit();
  allproduit: any;
  idUtilisateur: any;
  email = '';
  motDePasse = '';
  nom = '';
  prenom = '';
  currentDate = new Date();

  idForm = new FormGroup({
    idproduit: new FormControl('', [Validators.required]),
  });

  inspectionForm = new FormGroup({
    date: new FormControl(this.currentDate, [Validators.required]),
    observations: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
    type_categorie: new FormControl('sous chaine', [Validators.required]),
    designation: new FormControl('', [Validators.required]),
    id_produit: new FormControl([Validators.required]),
    id_utilisateur: new FormControl([Validators.required]),
    resultat: new FormControl('', [Validators.required]),
  });

  constructor(
    private produitService: ProduitsService,
    private inspectionService: InspectionsService,
    private defautsService: DefautsService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllProduits();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser).utilisateur;
      this.idUtilisateur = user.id_utilisateur;
      this.email = user.email;
      this.motDePasse = user.mot_de_passe;
      this.nom = user.nom;
      this.prenom = user.prenom;
    } else {
      this.redirectToLogin();
    }
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  get idproduit() {
    return this.idForm.get('idproduit');
  }

  get observations() {
    return this.inspectionForm.get('observations');
  }

  get designation() {
    return this.inspectionForm.get('designation');
  }

  get resultat() {
    return this.inspectionForm.get('resultat');
  }

  getAllProduits(): void {
    this.produitService.getAllProduits().subscribe(
      (response: any) => {
        if (response.produits && Array.isArray(response.produits)) {
          this.produits = response.produits;
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'produits' valide :",
            response
          );
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
      }
    );
  }

  getProduit(): void {
    this.produitVisible = true;
    this.DefaultVisible = true;
    this.formVisible = false;
    this.produitService.getAllById(this.idForm.value.idproduit).subscribe(
      (response: AllProduit[]) => {
        this.allproduit = response;
      },
      (error: any) => {
        console.error('Erreur lors de la sélection du produit :', error);
      }
    );
  }

  EnregistrerInspection(): void {
    const produitController = this.allproduit[0].id_produit;
    this.inspectionForm.patchValue({
      id_utilisateur: this.idUtilisateur,
      id_produit: produitController,
    });

    if (this.inspectionForm.valid) {
      this.inspectionService
        .createinspection(this.inspectionForm.value)
        .subscribe(
          (response) => {
            this.toastr.success('Inspection créée avec succès');
            this.defautsService.updateIdInspection().subscribe(
              (updateResponse) => {
                console.log('Mise à jour réussie', updateResponse);
                this.router.navigate(['/home/consulter']);
              },
              (updateError) => {
                console.error('Erreur lors de la mise à jour', updateError);
              }
            );
          },
          (error) => {
            console.error("Erreur lors de la création de l'inspection", error);
            this.toastr.error("Erreur lors de la création de l'inspection");
          }
        );
    } else {
      console.error('Le formulaire est invalide');
    }
  }
}

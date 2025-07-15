import { Component } from "@angular/core";
import { Inspection } from "../../../models/Inspection";
import { Produit } from "../../../models/Produit";
import { Utilisateur } from "../../../models/Utilisateur";
import { InspectionsService } from "../../../services/inspections.service";
import { ProduitsService } from "../../../services/produits.service";
import { UtilisateursService } from "../../../services/utilisateurs.service";
import { Toast, ToastrService } from "ngx-toastr";
import { FormControl, FormGroup, Validators } from "@angular/forms";


@Component({
  selector: 'app-inspections',
  templateUrl: './inspections.component.html',
  styleUrl: '../../shared/styles/style.css',
})
export class InspectionsComponent {
  name: string = 'Inspection';
  inspection: Inspection = new Inspection();

  // Déclaration du tableau de Inspection
  Inspections: Inspection[] = [];
  utilisateurs: Utilisateur[] = []; // Array of DetailAql objects (type safety)
  produits: Produit[] = [];

  constructor(
    private inspectionservice: InspectionsService,
    private produitservice: ProduitsService,
    private utilisateurservice: UtilisateursService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.reloadData();
  }

  reloadData(): void {
    this.getAllinspection();
    this.getAllUtilisateurs();
    this.getAllProduits();
  }
  getAllinspection(): void {
    this.inspectionservice.getAllinspection().subscribe(
      (response: any) => {
        if (response.inspections && Array.isArray(response.inspections)) {
          // Vérifier si la réponse contient la clé 'aqls' et si elle est un tableau
          this.Inspections = response.inspections;
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'inspection' valide :",
            response
          );
          // Traiter les cas d'erreur appropriés ici
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
        // Traiter les erreurs de requête ici
      }
    );
  }

  getAllUtilisateurs(): void {
    this.utilisateurservice.getAllUtilisateurs().subscribe(
      (response: any) => {
        if (response.utilisateurs && Array.isArray(response.utilisateurs)) {
          this.utilisateurs = response.utilisateurs;
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
        // Traiter les erreurs de requête ici
      }
    );
  }

  getAllProduits(): void {
    this.produitservice.getAllProduits().subscribe(
      (response: any) => {
        if (response.produits && Array.isArray(response.produits)) {
          this.produits = response.produits;
          console.log('Produits:', this.produits);
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'produits' valide :",
            response
          );
          // Traiter les cas d'erreur appropriés ici
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
        // Traiter les erreurs de requête ici
      }
    );
  }

  inspectionForm = new FormGroup({
    date: new FormControl('', [Validators.required]),
    observations: new FormControl('', [Validators.required]),
    type_categorie: new FormControl('', [Validators.required]),
    designation: new FormControl('', [Validators.required]),
    id_produit: new FormControl('', [Validators.required]),
    id_utilisateur: new FormControl('', [Validators.required]),
    resultat: new FormControl('', [Validators.required]),
  });

  // Getters pour accéder facilement aux champs du formulaire
  get date() {
    return this.inspectionForm.get('date');
  }

  get observations() {
    return this.inspectionForm.get('observations');
  }

  get type_categorie() {
    return this.inspectionForm.get('type_categorie');
  }

  get designation() {
    return this.inspectionForm.get('designation');
  }

  get id_produit() {
    return this.inspectionForm.get('id_produit');
  }

  get id_utilisateur() {
    return this.inspectionForm.get('id_utilisateur');
  }

  get resultat() {
    return this.inspectionForm.get('resultat');
  }

  // Méthode pour réinitialiser le formulaire
  resetForm() {
    this.inspectionForm.reset();
    this.inspectionForm.markAsPristine();
    this.inspectionForm.markAsUntouched();
  }

  ajout(): void {

    // Appeler la méthode createAql du service pour ajouter le nouvel AQL
    this.inspectionservice.createinspection(this.inspectionForm.value).subscribe(
      (response: any) => {
        // Si la création réussit, ajouter la réponse à la liste des AQL
        this.Inspections.push(response);
        this.toastr.success('Ajouter inspection avec success');
        this.reloadData();
      },
      (error: any) => {
        // En cas d'erreur, afficher un message d'erreur dans la console
        console.error("Erreur lors de l'ajout d inspection :", error);
        this.toastr.error("Erreur lors de l'ajout d inspection :");
      }
    );
  }

  modifier() {
    this.inspectionservice
      .updateinspection(this.inspection.id_inspection, this.inspectionForm.value)
      .subscribe(
        (response: any) => {
          console.log("L'élément a été mis à jour avec succès :", response);
          this.toastr.success('Mise à jour inspection avec success');
          this.reloadData();
        },
        (error: any) => {
          console.error("Erreur lors de la mise à jour de l'élément :", error);
          this.toastr.error("Erreur lors de la mise à jour de l'inspection :");
          // Traiter les erreurs de mise à jour ici
        }
      );
  }
  confirmer(inspection: Inspection) {
    this.inspection = inspection;
  }
  supprimer(inspection: Inspection): void {
    this.inspectionservice.deleteinspection(inspection.id_inspection).subscribe(
      (response: any) => {
        // Supprimer l'élément de la liste aqls une fois qu'il a été supprimé avec succès
        this.Inspections = this.Inspections.filter(
          (item) => item.id_inspection !== inspection.id_inspection
        );
        console.log("L'élément a été supprimé avec succès :", response);
        this.toastr.success('Suppression inspection avec success');
        this.reloadData();
      },
      (error: any) => {
        console.error("Erreur lors de la suppression de l'élément :", error);
        this.toastr.error("Erreur lors de la suppression de l'inspection :");
        // Traiter les erreurs de suppression ici
      }
    );
  }

  isLoading = false;
  message: string = '';

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

    this.inspectionservice.rechercher(searchValue.trim()).subscribe(
      (response: { Inspections: any[] }) => {
        this.isLoading = false; // Fin du chargement

        if (
          response &&
          response.Inspections &&
          response.Inspections.length > 0
        ) {
          this.Inspections = response.Inspections;
          this.toastr.success('Inspections trouvés avec succès!');
        } else {
          this.Inspections = [];
          this.message = 'Aucun order trouvé pour ce libellé.';
          this.toastr.info(this.message);
        }
      },
      (error) => {
        this.isLoading = false; // Fin du chargement en cas d'erreur
        this.message =
          'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.';
        this.toastr.error(this.message);
        console.error("Erreur lors de la recherche d'Inspections:", error); // Log de l'erreur pour plus de détails
      }
    );
  }
}

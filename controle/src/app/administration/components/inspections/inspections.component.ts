import { Component } from "@angular/core";
import { Inspection } from "../../../models/Inspection";
import { Produit } from "../../../models/Produit";
import { Utilisateur } from "../../../models/Utilisateur";
import { InspectionsResponse } from '../../../models/api';
import { InspectionsService } from "../../../services/inspections.service";
import { ProduitsService } from "../../../services/produits.service";
import { UtilisateursService } from "../../../services/utilisateurs.service";
import { ToastrService } from "ngx-toastr";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, OnInit, inject } from '@angular/core';


@Component({
    selector: 'app-inspections',
    templateUrl: './inspections.component.html',
    styleUrl: '../../shared/styles/style.css',
    standalone: false
})
export class InspectionsComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
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
    this.inspectionservice.getAllinspection().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.chargement = false;
        if (response.inspections && Array.isArray(response.inspections)) {
          // Vérifier si la réponse contient la clé 'aqls' et si elle est un tableau
          this.Inspections = response.inspections;
          this.page = 1;
          this.toastr.success('Inspections récupérées avec succès.');
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'inspection' valide :",
            response
          );
          this.toastr.error('Données invalides reçues du service.');
          // Traiter les cas d'erreur appropriés ici
        }
      },
      (error: any) => {
        this.chargement = false;
        console.error('Erreur lors de la récupération des données.', error);
        this.toastr.error('Erreur lors de la récupération des inspections.');
        // Traiter les erreurs de requête ici
      }
    );
  }

  getAllUtilisateurs(): void {
    this.utilisateurservice.getAllUtilisateurs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        if (response.utilisateurs && Array.isArray(response.utilisateurs)) {
          this.utilisateurs = response.utilisateurs;
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données.', error);
        // Traiter les erreurs de requête ici
      }
    );
  }

  getAllProduits(): void {
    this.produitservice.getAllProduits().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        if (response.produits && Array.isArray(response.produits)) {
          this.produits = response.produits;
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'produits' valide :",
            response
          );
          // Traiter les cas d'erreur appropriés ici
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données.', error);
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
    if (this.inspectionForm.invalid) {
      this.toastr.error(
        'Veuillez remplir correctement le formulaire.',
        'Erreur de validation'
      );
      return;
    }

    // Appeler la méthode createinspection du service pour ajouter la nouvelle inspection
    this.inspectionservice.createinspection(this.inspectionForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      () => {
        this.toastr.success('Inspection ajoutée avec succès.');
        this.resetForm();
        this.reloadData();
      },
      (error: any) => {
        // En cas d'erreur, afficher un message d'erreur dans la console
        console.error("Erreur lors de l'ajout de l'inspection.", error);
        this.toastr.error("Erreur lors de l'ajout de l'inspection.");
      }
    );
  }

  modifier() {
    if (this.inspectionForm.invalid || this.inspection.id_inspection === undefined) {
      this.toastr.error(
        'Veuillez vérifier le formulaire avant de valider.',
        'Erreur de validation'
      );
      return;
    }

    this.inspectionservice
      .updateinspection(this.inspection.id_inspection, this.inspectionForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        () => {
          this.toastr.success('Inspection mise à jour avec succès.');
          this.reloadData();
        },
        (error: any) => {
          console.error("Erreur lors de la mise à jour de l'élément :", error);
          this.toastr.error("Erreur lors de la mise à jour de l'inspection.");
          // Traiter les erreurs de mise à jour ici
        }
      );
  }
  confirmer(inspection: Inspection) {
    this.inspection = inspection;
  }

  /** Sélectionne l'inspection et pré-remplit le formulaire de modification. */
  ouvrirModifier(inspection: Inspection): void {
    this.inspection = inspection;
    this.inspectionForm.patchValue({
      date: this.versDateInput(inspection.date),
      observations: inspection.observations ?? '',
      type_categorie: inspection.type_categorie ?? '',
      designation: inspection.designation ?? '',
      id_produit: inspection.id_produit != null ? String(inspection.id_produit) : null,
      id_utilisateur: inspection.id_utilisateur != null ? String(inspection.id_utilisateur) : null,
      resultat: inspection.resultat ?? '',
    } as any);
  }

  /** Convertit une date (Date ou chaîne) au format attendu par `<input type="date">`. */
  private versDateInput(value: Date | string | undefined | null): string {
    if (!value) {
      return '';
    }
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) {
      return '';
    }
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const jour = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mois}-${jour}`;
  }
  supprimer(inspection: Inspection): void {
    this.inspectionservice.deleteinspection(inspection.id_inspection).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        // Supprimer l'élément de la liste aqls une fois qu'il a été supprimé avec succès
        this.Inspections = this.Inspections.filter(
          (item) => item.id_inspection !== inspection.id_inspection
        );
        this.toastr.success('Inspection supprimée avec succès.');
        this.reloadData();
      },
      (error: any) => {
        console.error("Erreur lors de la suppression de l'utilisateur.", error);
        this.toastr.error("Erreur lors de la suppression de l'inspection.");
        // Traiter les erreurs de suppression ici
      }
    );
  }

  isLoading = false;
  message: string = '';

  // Chargement initial (affiché avant les données) et pagination.
  chargement = true;
  page = 1;
  pageSize = 10;

  get inspectionsPage(): Inspection[] {
    const debut = (this.page - 1) * this.pageSize;
    return this.Inspections.slice(debut, debut + this.pageSize);
  }

  changerPage(page: number): void {
    this.page = page;
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

    this.inspectionservice.rechercher(searchValue.trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: InspectionsResponse) => {
        this.isLoading = false; // Fin du chargement

        if (
          response &&
          response.inspections &&
          response.inspections.length > 0
        ) {
          this.Inspections = response.inspections;
          this.page = 1;
          this.toastr.success('Inspections trouvées avec succès !');
        } else {
          this.Inspections = [];
          this.message = 'Aucune inspection trouvée pour ce libellé.';
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

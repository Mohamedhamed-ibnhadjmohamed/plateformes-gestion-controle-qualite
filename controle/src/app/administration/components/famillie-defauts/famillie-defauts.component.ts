import { Component } from '@angular/core';
import { FamilleDefault } from '../../../models/FamillieDefaults';
import { FamilliedefaultService } from '../../../services/familliedefault.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-famillie-defauts',
  templateUrl: './famillie-defauts.component.html',
  styleUrls: ['../../shared/styles/style.css'], // Fixed styleUrls
})
export class FamillieDefautsComponent {
  name: string = 'Famille Default';
  familledefaults: FamilleDefault[] = []; // Array of FamilleDefault objects (type safety)
  familledefault: FamilleDefault = new FamilleDefault(); // Selected FamilleDefault (optional, type safety)

  constructor(
    private famillesdefaultservice: FamilliedefaultService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.reloadData(); // Load data when the component initializes
  }

  reloadData(): void {
    this.getAllfamilledefault();
  }

  getAllfamilledefault(): void {
    this.famillesdefaultservice.getAllfamilledefault().subscribe(
      (response: any) => {
        if (response && response.familles && Array.isArray(response.familles)) {
          this.familledefaults = response.familles;
        } else {
          console.error(
            'La réponse du service ne contient pas de tableau familledefaults valide :',
            response
          );
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
        this.toastr.error('Erreur lors de la récupération des données.');
      }
    );
  }

  familleForm = new FormGroup({
    code: new FormControl('', Validators.required), // Form control for 'code' with a required validator
    description: new FormControl(''), // Form control for 'description', no validation rules
    nom: new FormControl('', Validators.required), // Form control for 'nom' with a required validator
  });

  // Getters for easier access to form controls
  get code() {
    return this.familleForm.get('code');
  }

  get description() {
    return this.familleForm.get('description');
  }

  get nom() {
    return this.familleForm.get('nom');
  }

  ajout(): void {
    this.famillesdefaultservice
      .createfamilledefault(this.familleForm.value)
      .subscribe(
        (response: any) => {
          // Si la création réussit, ajouter la réponse à la liste des FamilleDefaults
          this.familledefaults.push(response);
          this.toastr.success('Famille Default ajoutée avec succès !');
          this.familleForm.reset(); // Reset the form after successful submission
        },
        (error: any) => {
          // En cas d'erreur, afficher un message d'erreur dans la console
          console.error("Erreur lors de l'ajout du familledefault :", error);
          this.toastr.error("Erreur lors de l'ajout du Famille Default.");
        }
      );
    this.reloadData();
  }

  modifier() {
    this.famillesdefaultservice
      .updatefamilledefault(
        this.familledefault.id_famille,
        this.familleForm.value
      )
      .subscribe(
        (response: any) => {
          console.log("L'élément a été mis à jour avec succès :", response);
          this.toastr.success('Famille Default mise à jour avec succès !');
        },
        (error: any) => {
          console.error("Erreur lors de la mise à jour de l'élément :", error);
          this.toastr.error(
            'Erreur lors de la mise à jour de la Famille Default.'
          );
        }
      );

    this.reloadData();
  }

  confirmer(a: FamilleDefault) {
    this.familledefault = a;
  }

  supprimer(familledefault: FamilleDefault): void {
    this.famillesdefaultservice
      .deletefamilledefault(familledefault.id_famille)
      .subscribe(
        (response: any) => {
          // Supprimer l'élément de la liste une fois qu'il a été supprimé avec succès
          this.familledefaults = this.familledefaults.filter(
            (item) => item.id_famille !== familledefault.id_famille
          );
          console.log("L'élément a été supprimé avec succès :", response);
          this.toastr.success('Famille Default supprimée avec succès !');
        },
        (error: any) => {
          console.error("Erreur lors de la suppression de l'élément :", error);
          this.toastr.error(
            'Erreur lors de la suppression de la Famille Default.'
          );
        }
      );
    this.reloadData();
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

    this.famillesdefaultservice.rechercher(searchValue.trim()).subscribe(
      (response: { familledefaults: any[] }) => {
        this.isLoading = false; // Fin du chargement

        if (
          response &&
          response.familledefaults &&
          response.familledefaults.length > 0
        ) {
          this.familledefaults = response.familledefaults;
          this.toastr.success('Famille Defaults trouvés avec succès !');
        } else {
          this.familledefaults = [];
          this.message = 'Aucun Famille Default trouvé pour ce libellé.';
          this.toastr.info(this.message);
        }
      },
      (error) => {
        this.isLoading = false; // Fin du chargement en cas d'erreur
        this.message =
          'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.';
        this.toastr.error(this.message);
        console.error("Erreur lors de la recherche d'familledefaults:", error); // Log de l'erreur pour plus de détails
      }
    );
  }
}

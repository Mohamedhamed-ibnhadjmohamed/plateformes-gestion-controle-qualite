import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FamilleDefault } from '../../../models/FamillieDefaults';
import { FamillesResponse } from '../../../models/api';
import { FamilliedefaultService } from '../../../services/familliedefault.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-famillie-defauts',
    templateUrl: './famillie-defauts.component.html',
    styleUrls: ['../../shared/styles/style.css'],
    standalone: false
})
export class FamillieDefautsComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  name: string = 'Famille défaut';
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
    this.famillesdefaultservice.getAllfamilledefault().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.chargement = false;
        if (response && response.familles && Array.isArray(response.familles)) {
          this.familledefaults = response.familles;
          this.page = 1;
          this.toastr.success('Familles défaut récupérées avec succès.');
        } else {
          console.error(
            'La réponse du service ne contient pas de tableau familledefaults valide :',
            response
          );
          this.toastr.error('Données invalides reçues du service.');
        }
      },
      (error: any) => {
        this.chargement = false;
        console.error('Erreur lors de la récupération des données.', error);
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
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        () => {
          this.toastr.success('Famille défaut ajoutée avec succès.');
          this.familleForm.reset(); // Reset the form after successful submission
          this.reloadData();
        },
        (error: any) => {
          // En cas d'erreur, afficher un message d'erreur dans la console
          console.error("Erreur lors de l'ajout du familledefault :", error);
          this.toastr.error("Erreur lors de l'ajout de la famille défaut.");
        }
      );
  }

  modifier() {
    if (this.familleForm.invalid || this.familledefault.id_famille === undefined) {
      this.toastr.error(
        'Veuillez vérifier le formulaire avant de valider.',
        'Erreur de validation'
      );
      return;
    }

    this.famillesdefaultservice
      .updatefamilledefault(
        this.familledefault.id_famille,
        this.familleForm.value
      )
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        () => {
          this.toastr.success('Famille défaut mise à jour avec succès.');
          this.reloadData();
        },
        (error: any) => {
          console.error("Erreur lors de la mise à jour de l'élément :", error);
          this.toastr.error(
            'Erreur lors de la mise à jour de la famille défaut.'
          );
        }
      );
  }

  confirmer(a: FamilleDefault) {
    this.familledefault = a;
  }

  /** Sélectionne la famille et pré-remplit le formulaire de modification. */
  ouvrirModifier(a: FamilleDefault): void {
    this.familledefault = a;
    this.familleForm.patchValue({
      code: a.code ?? '',
      description: a.description ?? '',
      nom: a.nom ?? '',
    });
  }

  supprimer(familledefault: FamilleDefault): void {
    this.famillesdefaultservice
      .deletefamilledefault(familledefault.id_famille)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        () => {
          this.toastr.success('Famille défaut supprimée avec succès.');
          this.reloadData();
        },
        (error: any) => {
          console.error("Erreur lors de la suppression de l'utilisateur.", error);
          this.toastr.error(
            'Erreur lors de la suppression de la famille défaut.'
          );
        }
      );
  }

  isLoading = false;
  message: string = '';

  // Chargement initial (affiché avant les données) et pagination.
  chargement = true;
  page = 1;
  pageSize = 10;

  get familledefaultsPage(): FamilleDefault[] {
    const debut = (this.page - 1) * this.pageSize;
    return this.familledefaults.slice(debut, debut + this.pageSize);
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

    this.famillesdefaultservice.rechercher(searchValue.trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: FamillesResponse) => {
        this.isLoading = false; // Fin du chargement

        if (
          response &&
          response.familles &&
          response.familles.length > 0
        ) {
          this.familledefaults = response.familles;
          this.page = 1;
          this.toastr.success('Familles défaut trouvées avec succès !');
        } else {
          this.familledefaults = [];
          this.message = 'Aucune famille défaut trouvée pour ce libellé.';
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

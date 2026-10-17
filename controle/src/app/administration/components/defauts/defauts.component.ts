import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Default } from '../../../models/Default';
import { DefaultsResponse } from '../../../models/api';
import { Employee } from '../../../models/Employee';
import { FamilleDefault } from '../../../models/FamillieDefaults';
import { Inspection } from '../../../models/Inspection';
import { DefautsService } from '../../../services/defauts.service';
import { EmployeesService } from '../../../services/employees.service';
import { FamilliedefaultService } from '../../../services/familliedefault.service';
import { InspectionsService } from '../../../services/inspections.service';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-defauts',
    templateUrl: './defauts.component.html',
    styleUrl: '../../shared/styles/style.css',
    standalone: false
})
export class DefautsComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  required: any;
  constructor(
    private http: HttpClient,
    private defaultservice: DefautsService,
    private employeeservice: EmployeesService,
    private inspectionservice: InspectionsService,
    private familledeafultservice: FamilliedefaultService,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.reloadData();
  }

  reloadData(): void {
    this.getAlldefault();
    this.getAllEmployees();
    this.getAllfamilledefault();
    this.getAllinspection();
  }
  // Var
  name: string = 'Défaut';
  default: Default = new Default();
  defaults: Default[] = [];
  employees: Employee[] = [];
  familledefaults: FamilleDefault[] = []; // Array of Aql objects (type safety)
  Inspections?: Inspection[] = [];
  selectedImage: File | null = null;
  /** Nom du fichier image actuellement sélectionné (pour affichage). */
  nomFichierSelectionne: string | null = null;
  uploadUrl = environment.apiUrl + 'upload/';
  // Debut Form group defaultForm
  defaultForm = new FormGroup({
    description: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
    image: new FormControl(''),
    id_famille: new FormControl('', Validators.required),
    id_inspection: new FormControl('', Validators.required),
    nombre: new FormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(100),
    ]),
    type: new FormControl('', Validators.required),
    id_employee: new FormControl('', Validators.required),
  });

  // Méthode pour réinitialiser le formulaire
  resetForm() {
    this.defaultForm.reset();
    this.selectedImage = null;
    this.nomFichierSelectionne = null;
  }

  get description() {
    return this.defaultForm.get('description');
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
      this.nomFichierSelectionne = input.files[0].name;
    } else {
      this.selectedImage = null;
      this.nomFichierSelectionne = null;
    }
  }

  /** Retire l'image choisie et vide le champ fichier associé. */
  effacerImage(input: HTMLInputElement): void {
    input.value = '';
    this.selectedImage = null;
    this.nomFichierSelectionne = null;
  }

  get image() {
    return this.defaultForm.get('image');
  }

  uploadImage(image: File) {
    const formData = new FormData();
    formData.append('image', image);

    // Envoyer la demande POST pour télécharger l'image
    return this.http.post<any>(`${environment.apiUrl}defaults/upload`, formData);
  }

  get id_famille() {
    return this.defaultForm.get('id_famille');
  }
  get id_inspection() {
    return this.defaultForm.get('id_inspection');
  }
  get nombre() {
    return this.defaultForm.get('nombre');
  }
  get type() {
    return this.defaultForm.get('type');
  }
  get id_employee() {
    return this.defaultForm.get('id_employee');
  }
  // Fin Form group defaultForm
  // Debut crub defaut
  modifierDefault() {
    if (this.defaultForm.valid) {
      if (this.selectedImage) {
        this.uploadImage(this.selectedImage).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
          (imageResponse: any) => {
            const formData = { ...this.defaultForm.value };
            formData.image = imageResponse.filename || imageResponse.path;
            this.defaultservice
              .updatedefault(this.default.id_defaults, formData)
              .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
                (response: any) => {
                  this.toastr.success(
                    `Défaut avec l'ID ${this.default.id_defaults} a été mis à jour.`
                  );
                  this.reloadData();
                  this.selectedImage = null;
                  this.nomFichierSelectionne = null;
                },
                (error: any) => {
                  console.error('Erreur lors de la mise à jour du défaut.', error);
                  this.toastr.error('Erreur lors de la mise à jour du défaut.');
                }
              );
          },
          (error: any) => {
            console.error("Erreur lors du téléchargement de l'image :", error);
            this.toastr.error("Erreur lors du téléchargement de l'image.");
          }
        );
      } else {
        const formData = this.defaultForm.value;
        this.defaultservice
          .updatedefault(this.default.id_defaults, formData)
          .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
            (response: any) => {
              this.toastr.success(
                `Défaut avec l'ID ${this.default.id_defaults} a été mis à jour.`
              );
              this.reloadData();
            },
            (error: any) => {
              console.error('Erreur lors de la mise à jour du défaut.', error);
              this.toastr.error('Erreur lors de la mise à jour du défaut.');
            }
          );
      }
    } else {
      this.toastr.error('Formulaire invalide.');
    }
  }

  extraireNomFichier(cheminComplet: string) {
    if (!cheminComplet) return '';
    const nomFichier = cheminComplet.split(/[/\\]/).pop();
    return nomFichier || cheminComplet;
  }

  ajoutDefault(): void {
    // Vérifiez si le formulaire est valide
    if (this.defaultForm.valid) {
      if (this.selectedImage) {
        this.uploadImage(this.selectedImage).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
          (imageResponse: any) => {
            const formData = { ...this.defaultForm.value };
            formData.image = imageResponse.filename || imageResponse.path;
            this.defaultservice.createdefault(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
              (response: any) => {
                this.toastr.success('Défaut ajouté avec succès.');
                this.reloadData();
                this.selectedImage = null;
                this.nomFichierSelectionne = null;
              },
              (error: any) => {
                console.error("Erreur lors de l'ajout du défaut.", error);
                this.toastr.error("Erreur lors de l'ajout.");
              }
            );
          },
          (error: any) => {
            console.error("Erreur lors du téléchargement de l'image :", error);
            this.toastr.error("Erreur lors du téléchargement de l'image.");
          }
        );
      } else {
        const formData = this.defaultForm.value;
        this.defaultservice.createdefault(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
          (response: any) => {
            this.toastr.success('Défaut ajouté avec succès.');
            this.reloadData();
          },
          (error: any) => {
            console.error("Erreur lors de l'ajout du défaut.", error);
            this.toastr.error("Erreur lors de l'ajout.");
          }
        );
      }
    } else {
      this.toastr.error('Formulaire invalide.');
    }
  }

  getAlldefault(): void {
    this.defaultservice.getAlldefault().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.chargement = false;
        if (response.defaults && Array.isArray(response.defaults)) {
          this.defaults = response.defaults;
          this.page = 1;
          this.toastr.success('Défauts récupérés avec succès.');
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'defaults' valide :",
            response
          );
          this.toastr.error('Données invalides reçues du service.');
          // Traiter les cas d'erreur appropriés ici
        }
      },
      (error: any) => {
        this.chargement = false;
        console.error('Erreur lors de la récupération des données.', error);
        this.toastr.error('Erreur lors de la récupération des défauts.');
        // Traiter les erreurs de requête ici
      }
    );
  }

  getAllEmployees(): void {
    this.employeeservice.getAllEmployees().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        if (response.employees && Array.isArray(response.employees)) {
          this.employees = response.employees;
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'employees' valide :",
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

  getAllfamilledefault(): void {
    this.familledeafultservice.getAllfamilledefault().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        if (response && response.familles && Array.isArray(response.familles)) {
          // Utiliser la clé 'familles' au lieu de 'familledefault'
          this.familledefaults = response.familles; // Utiliser 'familles' au lieu de 'familledefault'
        } else {
          console.error(
            'La réponse du service ne contient pas de tableau familledefaults valide :',
            response
          );
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données.', error);
      }
    );
  }

  getAllinspection(): void {
    this.inspectionservice.getAllinspection().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
        console.error('Erreur lors de la récupération des données.', error);
        // Traiter les erreurs de requête ici
      }
    );
  }

  confirmer(def: Default) {
    this.default = def;
  }

  /** Sélectionne le défaut et pré-remplit le formulaire de modification. */
  ouvrirModifier(def: Default): void {
    this.default = def;
    this.selectedImage = null;
    this.nomFichierSelectionne = null;
    this.defaultForm.patchValue({
      description: def.description ?? '',
      image: def.image ?? '',
      id_famille: def.id_famille != null ? String(def.id_famille) : null,
      id_inspection:
        def.id_inspection != null ? String(def.id_inspection) : null,
      nombre: def.nombre ?? null,
      type: def.type ?? '',
      id_employee: def.id_employee != null ? String(def.id_employee) : null,
    } as any);
  }

  supprimer(def: Default) {
    this.defaultservice.deletedefault(def.id_defaults).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.defaults = this.defaults.filter(
          (d) => d.id_defaults !== def.id_defaults
        );
        this.toastr.success(
          `Défaut avec l'ID ${def.id_defaults} a été supprimé avec succès.`
        );
      },
      (error: any) => {
        console.error('Erreur lors de la suppression du défaut.', error);
        this.toastr.error('Erreur lors de la suppression du défaut.');
      }
    );
  }

  //rechercher
  isLoading = false;
  message: string = '';

  // Chargement initial (affiché avant les données) et pagination.
  chargement = true;
  page = 1;
  pageSize = 10;

  get defaultsPage(): Default[] {
    const debut = (this.page - 1) * this.pageSize;
    return this.defaults.slice(debut, debut + this.pageSize);
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

    this.defaultservice.rechercher(searchValue.trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: DefaultsResponse) => {
        this.isLoading = false; // Fin du chargement

        // Correction ici: vérification de 'response.defaults' au lieu de 'response.utilisateur'
        if (
          response &&
          response.defaults &&
          response.defaults.length > 0
        ) {
          this.defaults = response.defaults;
          this.page = 1;
          this.toastr.success('Défauts trouvés avec succès !');
        } else {
          this.defaults = [];
          this.message = 'Aucun défaut trouvé pour ce libellé.'; // Correction du message
          this.toastr.info(this.message);
        }
      },
      (error) => {
        this.isLoading = false; // Fin du chargement en cas d'erreur
        this.message =
          'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.';
        this.toastr.error(this.message);
        console.error("Erreur lors de la recherche d'defaults:", error); // Log de l'erreur pour plus de détails
      }
    );
  }
}

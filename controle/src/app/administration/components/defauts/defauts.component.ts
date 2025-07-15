import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Default } from '../../../models/Default';
import { Employee } from '../../../models/Employee';
import { FamilleDefault } from '../../../models/FamillieDefaults';
import { Inspection } from '../../../models/Inspection';
import { DefautsService } from '../../../services/defauts.service';
import { EmployeesService } from '../../../services/employees.service';
import { FamilliedefaultService } from '../../../services/familliedefault.service';
import { InspectionsService } from '../../../services/inspections.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-defauts',
  templateUrl: './defauts.component.html',
  styleUrl: '../../shared/styles/style.css',
})
export class DefautsComponent {
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
  name: string = 'Default';
  default: Default = new Default();
  defaults: Default[] = [];
  employees: Employee[] = [];
  familledefaults: FamilleDefault[] = []; // Array of Aql objects (type safety)
  Inspections?: Inspection[] = [];
  selectedImage: File | null = null;
  path = 'http://localhost:3000/upload/ ';
  // Debut Form group defaultForm
  defaultForm = new FormGroup({
    description: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
    image: new FormControl('', Validators.required),
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

  // Méthode pour soumettre le formulaire
  submitForm() {
    if (this.defaultForm.valid) {
      console.log(this.defaultForm.value);
      // Logique pour soumettre les données...
    } else {
      console.log("Le formulaire n'est pas valide");
    }
  }

  // Méthode pour réinitialiser le formulaire
  resetForm() {
    this.defaultForm.reset();
  }

  get description() {
    return this.defaultForm.get('description');
  }
  get image() {
    // Récupérer la valeur actuelle du champ "image" dans le formulaire
    const currentImageValue = this.defaultForm.get('image')?.value;

    // Vérifier si une image est déjà présente dans le formulaire
    if (currentImageValue) {
      // Si une image est déjà présente, retourner directement sa valeur
      return currentImageValue;
    } else {
      // Si aucune image n'est présente, vérifier si une image est sélectionnée
      if (this.selectedImage !== null && this.selectedImage instanceof File) {
        // Si une image est sélectionnée, télécharger cette image
        return new Promise<string>((resolve, reject) => {
          this.uploadImage(this.selectedImage!).subscribe(
            (imageResponse: any) => {
              // Une fois l'image téléchargée, mettre à jour la valeur du champ "image" dans le formulaire
              const imagePath = imageResponse.path;
              this.defaultForm.get('image')?.setValue(imagePath);
              // Renvoyer le chemin de l'image
              resolve(imagePath);
            },
            (error: any) => {
              // En cas d'erreur lors du téléchargement de l'image, rejeter la promesse avec l'erreur
              reject("Erreur lors du téléchargement de l'image :" + error);
            }
          );
        });
      } else {
        // Si aucune image n'est sélectionnée ou si elle n'est pas un fichier, retourner null ou une valeur par défaut selon vos besoins
        return null;
      }
    }
  }

  uploadImage(image: File) {
    const formData = new FormData();
    formData.append('image', image);

    // Envoyer la demande POST pour télécharger l'image
    return this.http.post<any>('defaults/upload', formData);
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
      const formData = this.defaultForm.value;
      //alert(JSON.stringify(formData));
      // alert(JSON.stringify(this.default.id_defaults));
      this.defaultservice
        .updatedefault(this.default.id_defaults, formData)
        .subscribe(
          (response: any) => {
            console.log(
              `Default avec l'ID ${this.default.id_defaults} a été mis à jour.`
            );
            this.toastr.success(
              `Default avec l'ID ${this.default.id_defaults} a été mis à jour.`
            );
            this.reloadData();
          },
          (error: any) => {
            console.error('Erreur lors de la mise à jour du défaut :', error);
            this.toastr.error('Erreur lors de la mise à jour du défaut :');
          }
        );
    } else {
      console.log('Form is invalid');
    }
  }

  extraireNomFichier(cheminComplet: string) {
    const derniereBarreObliqueIndex = cheminComplet.lastIndexOf('\\');
    const nomFichier = cheminComplet.substring(derniereBarreObliqueIndex + 1);
    return nomFichier;
  }

  ajoutDefault(): void {
    // Vérifiez si le formulaire est valide
    if (this.defaultForm.valid) {
      // Si le formulaire est valide, extrayez les valeurs du formulaire
      const formData = this.defaultForm.value;

      // Appeler la méthode createdefault du service pour ajouter le nouvel AQL
      this.defaultservice.createdefault(formData).subscribe(
        (response: any) => {
          // Si la création réussit, ajouter la réponse à la liste des AQL
          this.defaults.push(response);
          this.toastr.success('defaut ajouter  ');
          this.reloadData();
        },
        (error: any) => {
          // En cas d'erreur, afficher un message d'erreur dans la console
          console.error("Erreur lors de l'ajout de default :", error);
          this.toastr.error('Erreur lors de l ajout ');
        }
      );
    } else {
      console.log('Form is invalid');
      this.toastr.error('form invalid');
    }
  }

  getAlldefault(): void {
    this.defaultservice.getAlldefault().subscribe(
      (response: any) => {
        if (response.defaults && Array.isArray(response.defaults)) {
          this.defaults = response.defaults;
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'defaults' valide :",
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

  getAllEmployees(): void {
    this.employeeservice.getAllEmployees().subscribe(
      (response: any) => {
        if (response.employés && Array.isArray(response.employés)) {
          this.employees = response.employés;
          console.log('Employés:', this.employees);
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'employés' valide :",
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

  getAllfamilledefault(): void {
    this.familledeafultservice.getAllfamilledefault().subscribe(
      (response: any) => {
        if (response && response.familles && Array.isArray(response.familles)) {
          // Utiliser la clé 'familles' au lieu de 'familledefault'
          this.familledefaults = response.familles; // Utiliser 'familles' au lieu de 'familledefault'
          //alert(JSON.stringify(this.familledefaults));
        } else {
          console.error(
            'La réponse du service ne contient pas de tableau familledefaults valide :',
            response
          );
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
      }
    );
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

  confirmer(def: Default) {
    this.default = def;
  }

  supprimer(def: Default) {
    this.defaultservice.deletedefault(def.id_defaults).subscribe(
      (response: any) => {
        this.defaults = this.defaults.filter(
          (d) => d.id_defaults !== def.id_defaults
        );
        console.log(`Default avec l'ID ${def.id_defaults} a été supprimé.`);
        this.toastr.success(
          'Default avec l ID ${def.id_defaults} a été supprimé.'
        );
      },
      (error: any) => {
        console.error('Erreur lors de la suppression du défaut :', error);
        this.toastr.error('Erreur lors de la suppression du défaut :');
      }
    );
  }

  modifier(): void {
    if (this.defaultForm.valid) {
      const formData = this.defaultForm.value;
      this.defaultservice
        .updatedefault(this.default.id_defaults, formData)
        .subscribe(
          (response: any) => {
            console.log(
              `Default avec l'ID ${this.default.id_defaults} a été mis à jour.`
            );
            this.toastr.success(
              `Default avec l'ID ${this.default.id_defaults} a été mis à jour.`
            );
          },
          (error: any) => {
            console.error('Erreur lors de la mise à jour du défaut :', error);
            this.toastr.error('Erreur lors de la mise à jour du défaut :');
          }
        );
    } else {
      console.log('Form is invalid');
    }
  }

  //rechercher
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

    this.defaultservice.rechercher(searchValue.trim()).subscribe(
      (response: { defaults: any[] }) => {
        this.isLoading = false; // Fin du chargement

        // Correction ici: vérification de 'response.defaults' au lieu de 'response.utilisateur'
        if (
          response &&
          response.defaults &&
          response.defaults.length > 0
        ) {
          console.log(JSON.stringify(response));
          this.defaults = response.defaults;
          this.toastr.success('defaults trouvés avec succès!');
        } else {
          this.defaults = [];
          this.message = 'Aucun utilisateur trouvé pour ce libellé.'; // Correction du message
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

import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Default } from '../../../models/Default';
import { HttpClient } from '@angular/common/http';
import { Employee } from '../../../models/Employee';
import { FamilleDefault } from '../../../models/FamillieDefaults';
import { Inspection } from '../../../models/Inspection';
import { DefautsService } from '../../../services/defauts.service';
import { EmployeesService } from '../../../services/employees.service';
import { FamilliedefaultService } from '../../../services/familliedefault.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-controle',
  templateUrl: './controle.component.html',
  styleUrl: './controle.component.css',
})
export class ControleComponent {
  constructor(
    private http: HttpClient,
    private defaultservice: DefautsService,
    private employeeservice: EmployeesService,
    private familledeafultservice: FamilliedefaultService,
    private toastr: ToastrService,
    
  ) {}
  ngOnInit(): void {
    this.reloadData();
  }
  reloadData(): void {
    this.getAllEmployees();
    this.getAllfamilledefault();
    this.getDefaultsByIdInspection();
    this.calculer(this.defaults);
  }
  resetForm() {
    throw new Error('Method not implemented.');
  }
  name: string = 'Default';
  default: Default = new Default();
  defaults: Default[] = [];
  employees: Employee[] = [];
  familledefaults: FamilleDefault[] = []; // Array of Aql objects (type safety)
  Inspections?: Inspection[] = [];
  selectedImage: File | null = null;
  path = 'http://localhost:3000/upload/ ';
  mineur: any;
  majeur: any;
  critique: any;
  couleurmineur: any;
  couleurmajeur: any;
  couleurcritique: any;

  calculer(defaults: Default[]) {
    // Initialisation des compteurs
    this.mineur = 0;
    this.majeur = 0;
    this.critique = 0;
    this.couleurmineur = '';
    this.couleurmajeur = '';
    this.couleurcritique = '';

    if (defaults && defaults.length > 0) {
      for (let def of defaults) {
        if (def.type === 'mineur') {
          this.mineur = this.mineur + 1;
        } else if (def.type === 'majeur') {
          this.majeur = this.majeur + 1;
        } else if (def.type === 'critique') {
          this.critique = this.critique + 1;
        }

        //couleur mineur
        if (this.mineur === 0) {
          this.couleurmineur = '';
        } else if (this.mineur > 0 && this.mineur === 1) {
          this.couleurmineur = 'text-success';
        } else if (this.mineur === 2 && this.mineur < 3) {
          this.couleurmineur = 'text-warning';
        } else {
          this.couleurmineur = 'text-danger';
        }
        //couleur majeur
        if (this.majeur === 0) {
          this.couleurmajeur = '';
        } else if (this.majeur === 1) {
          this.couleurmajeur = 'text-success';
        } else if (this.majeur === 2) {
          this.couleurmajeur = 'text-warning';
        } else {
          this.couleurmajeur = 'text-danger';
        }
        //couleur critique
        if (this.critique === 0) {
          this.couleurcritique = '';
        } else if (this.critique == 1) {
          this.couleurcritique = 'text-success';
        } else if (this.critique == 2) {
          this.couleurcritique = 'text-warning';
        } else {
          this.couleurcritique = 'text-danger';
        }
      }
    }
  }

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
              `Default avec l'ID ${this.default.id_defaults} a été mis à jour avec succès.`,
              'Succès'
            );
            this.reloadData();
          },
          (error: any) => {
            console.error('Erreur lors de la mise à jour du défaut :', error);
            this.toastr.error(
              'Une erreur est survenue lors de la mise à jour du défaut.',
              'Erreur'
            );
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
    // return this.path+nomFichier;
  }

  // crud default
  defaultForm = new FormGroup({
    description: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
    image: new FormControl('', Validators.required),
    id_famille: new FormControl('', Validators.required),
    id_inspection: new FormControl(''),
    nombre: new FormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(100),
    ]),
    type: new FormControl('', Validators.required),
    id_employee: new FormControl('', Validators.required),
  });

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
    return this.defaultForm.get('1');
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

  ajoutDefault(): void {
    // Vérifiez si le formulaire est valide
    if (this.defaultForm.valid) {
      this.defaultForm.patchValue({ id_inspection: '1' });
      //alert(JSON.stringify(this.defaultForm.value));

      // Si le formulaire est valide, extrayez les valeurs du formulaire
      const formData = this.defaultForm.value;

      // Appeler la méthode createdefault du service pour ajouter le nouvel AQL
      this.defaultservice.createdefault(formData).subscribe(
        (response: any) => {
          // Si la création réussit, ajouter la réponse à la liste des AQL
          this.defaults.push(response);
          this.toastr.success('ajouter reussit');
          this.reloadData();
        },
        (error: any) => {
          // En cas d'erreur, afficher un message d'erreur dans la console
          console.error("Erreur lors de l'ajout de default :", error);
          this.toastr.error("Erreur lors de l'ajout de default :");
        }
      );
    } else {
      console.log('Form is invalid');
      this.toastr.error('form vide');
    }
  }

  getDefaultsByIdInspection(): void {
    const id = 1;
    this.defaultservice.getDefaultsByIdInspection(id).subscribe(
      (response: any) => {
        if (response && Array.isArray(response)) {
          this.defaults = response;
          console.log('Defaults:', this.defaults);
          this.calculer(this.defaults);
        } else {
          console.error(
            'La réponse du service ne contient pas de tableau valide :',
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

  confirmer(def: Default) {
    this.default = def;
  }

  supprimer(def: Default) {
    this.defaultservice.deletedefault(def.id_defaults).subscribe(
      (response: any) => {
        this.defaults = this.defaults.filter(
          (d) => d.id_defaults !== def.id_defaults
        );
        this.toastr.success(
          `Default avec l'ID ${def.id_defaults} a été supprimé avec succès.`,
          'Succès'
        );
        this.reloadData();
      },
      (error: any) => {
        console.error('Erreur lors de la suppression du défaut :', error);
        this.toastr.error('Erreur lors de la suppression du défaut :');
      }
    );
  }
}

import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Utilisateur } from '../../../models/Utilisateur';
import { UtilisateursResponse, MessageResponse } from '../../../models/api';
import { UtilisateursService } from '../../../services/utilisateurs.service';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
    selector: 'app-utilisateurs',
    templateUrl: './utilisateurs.component.html',
    styleUrl: '../../shared/styles/style.css',
    standalone: false
})
export class UtilisateursComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);

  name = 'Utilisateur';
  utilisateurs: Utilisateur[] = []; // Array of DetailAql objects (type safety)
  utilisateur: Utilisateur = new Utilisateur();
  rechercheForm!: FormGroup;

  constructor(
    private utilisateurService: UtilisateursService,
    private toastr: ToastrService
  ) {}
  registerForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(3)]),
    prenom: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    ]),
    mot_de_passe: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  get email() {
    return this.registerForm.get('email');
  }

  get mot_de_passe() {
    return this.registerForm.get('mot_de_passe');
  }

  get nom() {
    return this.registerForm.get('nom');
  }

  get prenom() {
    return this.registerForm.get('prenom');
  }
  register() {
    if (this.registerForm.invalid) {
      this.toastr.error(
        'Le formulaire est invalide. Veuillez vérifier les champs.'
      );
      return;
    }
    this.utilisateurService
      .createUtilisateur(this.registerForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        (response: MessageResponse<Utilisateur>) => {
          // Recharger la liste pour refléter le nouvel utilisateur
          this.getAllUtilisateurs();
          this.toastr.success("L'utilisateur a été ajouté avec succès.");
          this.openAdd();
        },
        (error: HttpErrorResponse) => {
          console.error("Erreur lors de l'ajout de l'utilisateur :", error);
          this.toastr.error(
            error.error?.error ?? "Erreur lors de l'ajout de l'utilisateur."
          );
        }
      );
  }

  // Prépare le formulaire pour l'ajout (mot de passe obligatoire).
  openAdd(): void {
    this.registerForm.reset();
    this.setPasswordRequired(true);
  }

  // Prépare le formulaire pour la modification (mot de passe facultatif :
  // s'il est laissé vide, le mot de passe actuel est conservé).
  openEdit(utilisateur: Utilisateur): void {
    this.utilisateur = utilisateur;
    this.setPasswordRequired(false);
    this.registerForm.patchValue({
      nom: utilisateur.nom ?? '',
      prenom: utilisateur.prenom ?? '',
      email: utilisateur.email ?? '',
      mot_de_passe: '',
    });
  }

  private setPasswordRequired(required: boolean): void {
    const control = this.registerForm.get('mot_de_passe');
    control?.setValidators(
      required
        ? [Validators.required, Validators.minLength(8)]
        : [Validators.minLength(8)]
    );
    control?.updateValueAndValidity();
  }

  modifier() {
    if (this.registerForm.invalid) {
      console.error(
        "Le formulaire n'est pas valide. Veuillez le corriger avant de le soumettre."
      );
      this.toastr.error(
        "Le formulaire n'est pas valide. Veuillez le corriger avant de le soumettre."
      );
      return;
    }

    const idUtilisateurAModifier = this.utilisateur.id_utilisateur;
    if (idUtilisateurAModifier === undefined) {
      this.toastr.error("Aucun utilisateur sélectionné à modifier.");
      return;
    }

    // On n'envoie le mot de passe que s'il a été saisi.
    const { mot_de_passe, nom, prenom, email } = this.registerForm.value;
    const payload: {
      nom: string | null;
      prenom: string | null;
      email: string | null;
      mot_de_passe?: string;
    } = { nom: nom ?? '', prenom: prenom ?? '', email: email ?? '' };
    if (mot_de_passe) {
      payload.mot_de_passe = mot_de_passe;
    }

    this.utilisateurService
      .updateUtilisateur(idUtilisateurAModifier, payload)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        (response) => {
          this.toastr.success('Utilisateur mis à jour avec succès.');
          this.getAllUtilisateurs();
        },
        (error: HttpErrorResponse) => {
          console.error(
            "Erreur lors de la mise à jour de l'utilisateur :",
            error
          );
          this.toastr.error(
            error.error?.error ??
              "Erreur lors de la mise à jour de l'utilisateur."
          );
        }
      );
  }

  supprimer(utilisateur: Utilisateur) {
    this.utilisateurService
      .deleteUtilisateur(utilisateur.id_utilisateur)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        (response: any) => {
          // Supprimer l'élément de la liste utilisateurs une fois qu'il a été supprimé avec succès
          this.utilisateurs = this.utilisateurs.filter(
            (item) => item.id_utilisateur !== utilisateur.id_utilisateur
          );
          this.toastr.success("L'utilisateur a été supprimé avec succès.");
        },
        (error: any) => {
          console.error("Erreur lors de la suppression de l'utilisateur.", error);
          this.toastr.error("Erreur lors de la suppression de l'utilisateur.");
        }
      );
  }

  // Variables

  ngOnInit(): void {
    this.getAllUtilisateurs();
  }

  getAllUtilisateurs(): void {
    this.utilisateurService.getAllUtilisateurs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: UtilisateursResponse) => {
        this.chargement = false;
        if (response.utilisateurs && Array.isArray(response.utilisateurs)) {
          this.utilisateurs = response.utilisateurs;
          this.page = 1;
          this.toastr.success('Utilisateurs récupérés avec succès.');
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'utilisateurs' valide :",
            response
          );
          this.toastr.error('Données invalides reçues du service.');
        }
      },
      (error: any) => {
        this.chargement = false;
        console.error('Erreur lors de la récupération des données.', error);
        this.toastr.error('Erreur lors de la récupération des données.');
        // Traiter les erreurs de requête ici
      }
    );
  }

  confirmer(a: Utilisateur) {
    this.utilisateur = a;
  }

  //rechercher
  isLoading = false;
  message: string = '';

  // Chargement initial (affiché avant les données) et pagination.
  chargement = true;
  page = 1;
  pageSize = 10;

  get utilisateursPage(): Utilisateur[] {
    const debut = (this.page - 1) * this.pageSize;
    return this.utilisateurs.slice(debut, debut + this.pageSize);
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

 this.utilisateurService.rechercher(searchValue.trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
   (response: UtilisateursResponse) => {
     this.isLoading = false; // Fin du chargement

     // Correction ici: vérification de 'response.utilisateurs' au lieu de 'response.utilisateur'
     if (
       response &&
       response.utilisateurs &&
       response.utilisateurs.length > 0
     ) {
       this.utilisateurs = response.utilisateurs;
       this.page = 1;
       this.toastr.success('Utilisateurs trouvés avec succès !');
     } else {
       this.utilisateurs = [];
       this.message = 'Aucun utilisateur trouvé pour ce libellé.'; // Correction du message
       this.toastr.info(this.message);
     }
   },
   (error) => {
     this.isLoading = false; // Fin du chargement en cas d'erreur
     this.message =
       'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.';
     this.toastr.error(this.message);
     console.error("Erreur lors de la recherche d'utilisateurs:", error); // Log de l'erreur pour plus de détails
   }
 );

  }
}


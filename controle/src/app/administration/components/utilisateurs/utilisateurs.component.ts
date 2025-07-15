import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Utilisateur } from '../../../models/Utilisateur';
import { UtilisateursService } from '../../../services/utilisateurs.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrl: '../../shared/styles/style.css',
})
export class UtilisateursComponent implements OnInit {

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
    console.log(this.registerForm.value);
    this.utilisateurService
      .createUtilisateur(this.registerForm.value)
      .subscribe(
        (response: any) => {
          // Ajouter le nouvel utilisateur à la liste existante
          this.utilisateurs.push(response.utilisateur);
          console.log("L'utilisateur a été ajouté avec succès :", response);
          this.toastr.success("L'utilisateur a été ajouté avec succès ");
        },
        (error: any) => {
          console.error("Erreur lors de l'ajout de l'utilisateur :", error);
          this.toastr.error("Erreur lors de l'ajout de l'utilisateur :");
          // Traiter les erreurs d'ajout ici
        }
      );
  }

  modifier() {
    if (this.registerForm.valid) {
      const idUtilisateurAModifier = this.utilisateur.id_utilisateur;
      if (idUtilisateurAModifier !== undefined) {
        this.utilisateurService
          .updateUtilisateur(idUtilisateurAModifier, this.registerForm.value)
          .subscribe(
            (response) => {
              console.log('Utilisateur mis à jour avec succès :', response);
              this.toastr.success('Utilisateur mis à jour avec succès :');
            },
            (error) => {
              console.error(
                "Erreur lors de la mise à jour de l'utilisateur :",
                error
              );
              this.toastr.error(
                "Erreur lors de la mise à jour de l'utilisateur :"
              );
            }
          );
      }
    } else {
      console.error(
        "Le formulaire n'est pas valide. Veuillez le corriger avant de le soumettre."
      );
    }
  }

  supprimer(utilisateur: Utilisateur) {
    this.utilisateurService
      .deleteUtilisateur(utilisateur.id_utilisateur)
      .subscribe(
        (response: any) => {
          // Supprimer l'élément de la liste utilisateurs une fois qu'il a été supprimé avec succès
          this.utilisateurs = this.utilisateurs.filter(
            (item) => item.id_utilisateur !== this.utilisateur.id_utilisateur
          );
          console.log("L'élément a été supprimé avec succès :", response);
          this.toastr.success("L'utilisateur a été supprimé avec succès :");
        },
        (error: any) => {
          console.error("Erreur lors de la suppression de l'élément :", error);
          this.toastr.error("Erreur lors de la suppression de l'élément :");
        }
      );
  }

  // Variables

  ngOnInit(): void {
    this.getAllUtilisateurs();
  }

  getAllUtilisateurs(): void {
    this.utilisateurService.getAllUtilisateurs().subscribe(
      (response: any) => {
        if (response.utilisateurs && Array.isArray(response.utilisateurs)) {
          this.utilisateurs = response.utilisateurs;
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
        this.toastr.error('Erreur lors de la récupération des données :');
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

 this.utilisateurService.rechercher(searchValue.trim()).subscribe(
   (response: { utilisateurs: any[] }) => {
     this.isLoading = false; // Fin du chargement

     // Correction ici: vérification de 'response.utilisateurs' au lieu de 'response.utilisateur'
     if (
       response &&
       response.utilisateurs &&
       response.utilisateurs.length > 0
     ) {
       console.log(JSON.stringify(response));
       this.utilisateurs = response.utilisateurs;
       this.toastr.success('Utilisateurs trouvés avec succès!');
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


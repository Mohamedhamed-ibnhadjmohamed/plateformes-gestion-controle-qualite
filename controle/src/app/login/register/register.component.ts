import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Utilisateur } from '../../models/Utilisateur';
import { UtilisateursService } from '../../services/utilisateurs.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr'; // Importer ToastrService
import { AuthService } from '../../services/login/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    standalone: false
})
export class RegisterComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    if (this.authService.getUser()) {
      this.router.navigate(['/home']);
    }
  }
  errorMessage: string = '';
  utilisateurs: Utilisateur[] = [];
  isLoading = false;

  // Définition du formulaire d'inscription
  registerForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(3)]),
    prenom: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [
      Validators.required,
      Validators.email, // Utilisation de Validators.email pour validation des emails
    ]),
    mot_de_passe: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  // Getters pour accéder aux contrôles du formulaire
  get nom() {
    return this.registerForm.get('nom');
  }

  get prenom() {
    return this.registerForm.get('prenom');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get mot_de_passe() {
    return this.registerForm.get('mot_de_passe');
  }

  constructor(
    private toastr: ToastrService,
    private utilisateurService: UtilisateursService,
    private router: Router,
    private authService: AuthService
  ) {}

  // Méthode d'inscription
  register() {
    if (this.registerForm.invalid) {
      this.toastr.error(
        'Veuillez remplir correctement tous les champs.',
        'Erreur'
      );
      return;
    }

    this.isLoading = true; // Début du chargement

    this.utilisateurService
      .createUtilisateur(this.registerForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        (response) => {
          this.success();
          this.isLoading = false;
          this.router.navigate(['/login']);
        },
        (error: HttpErrorResponse) => {
          console.error("Erreur lors de l'inscription:", error);
          if (error.status === 409) {
            this.errorMessage =
              error.error?.error ?? 'Cette adresse e-mail est déjà utilisée.';
          } else if (error.status === 400) {
            this.errorMessage =
              error.error?.error ?? 'Les données fournies sont invalides.';
          } else {
            this.errorMessage =
              "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
          }
          this.toastr.error(this.errorMessage, 'Erreur');

          this.isLoading = false;
        }
      );
  }

  // Méthode de redirection vers la page de connexion
  redirectToLogin() {
    this.router.navigate(['/login']);
  }
  success() {
    this.toastr.success("L'utilisateur a été ajouté avec succès.");
  }

  isPasswordVisible: boolean = false;

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}

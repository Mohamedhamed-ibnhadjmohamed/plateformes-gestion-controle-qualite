import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Utilisateur } from '../../models/Utilisateur';
import { UtilisateursService } from '../../services/utilisateurs.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/login/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  utilisateur?: Utilisateur;
  utilisateurs: Utilisateur[] = [];
  errorMessage: string = '';

  loginForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
  login() {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value; 
      // Appel au service pour trouver l'utilisateur par email et mot de passe
      this.utilisateurService
        .findByEmailAndPassword({
          email: email as string,
          password: password as string,
        })
        .subscribe(
          (res) => {
            // Si l'utilisateur est trouvé
            if (res) {
              // Si l'utilisateur est administrateur
              if (email === 'admin@admin.com' && password === 'admin.admin') {
                this.router.navigate(['/admin']);
              } else {
                // Si l'utilisateur est normal
                this.router.navigate(['/home']);
              }
              // Stocker les informations de l'utilisateur dans le localStorage
              localStorage.setItem('user', JSON.stringify(res));
            } else {
              console.error('Utilisateur non trouvé');
              this.errorMessage = 'Utilisateur non trouvé.';
            }
          },
          (error) => {
            // Gestion des erreurs d'authentification
            console.error('Erreur de connexion:', error);
            if (error.status === 401) {
              // Si l'erreur est due à des informations d'identification invalides, afficher un message d'erreur
              this.errorMessage = 'Adresse e-mail ou mot de passe incorrect.';
            } else {
              // Pour d'autres erreurs, afficher un message générique
              this.errorMessage = 'Une erreur est survenue lors de la tentative de connexion. Veuillez réessayer.';
            }
          }
        );
    } else {
      // Si le formulaire est invalide
      console.log('Formulaire invalide');
    }
  }
  
  

  constructor(
    private utilisateurService: UtilisateursService,
    private router: Router
  ) {}
  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
     
      this.router.navigate(['/home']);
    }
  }

  redirectToRegister() {
    this.router.navigate(['/register']);
  }
}

import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UtilisateursService } from '../../services/utilisateurs.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/login/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    standalone: false
})
export class LoginComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
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

  constructor(
    private utilisateurService: UtilisateursService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.authService.isAdmin() ? '/admin' : '/home']);
    }
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }

    const email = this.loginForm.get('username')?.value as string;
    const password = this.loginForm.get('password')?.value as string;

    this.utilisateurService.login({ email, password }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (res) => {
        if (!res?.utilisateur || !res.token) {
          this.errorMessage = 'Utilisateur non trouvé.';
          return;
        }

        // Enregistre l'utilisateur et le token, puis redirige selon le rôle.
        this.authService.setSession(res.utilisateur, res.token);
        this.router.navigate([
          res.utilisateur.role === 'admin' ? '/admin' : '/home',
        ]);
      },
      (error) => {
        console.error('Erreur de connexion:', error);
        this.errorMessage =
          error.status === 401
            ? 'Adresse e-mail ou mot de passe incorrect.'
            : 'Une erreur est survenue lors de la tentative de connexion. Veuillez réessayer.';
      }
    );
  }

  redirectToRegister() {
    this.router.navigate(['/register']);
  }
}

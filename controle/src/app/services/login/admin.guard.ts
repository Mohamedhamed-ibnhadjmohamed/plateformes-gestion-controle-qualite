import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../login/auth.service';

/**
 * Réserve l'espace « Administration » aux utilisateurs ayant le rôle admin.
 * Empêche l'accès direct par URL pour un utilisateur connecté mais non admin.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }
    this.router.navigate([this.authService.isLoggedIn() ? '/home/accueil' : '/login']);
    return false;
  }
}

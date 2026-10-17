import { Injectable } from '@angular/core';
import { Utilisateur } from '../../models/Utilisateur';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  /**
   * Enregistre la session complète (utilisateur + token) après connexion.
   * L'objet utilisateur est stocké au format `{ utilisateur: {...} }` pour
   * rester compatible avec les composants existants qui lisent le localStorage.
   */
  setSession(utilisateur: Utilisateur, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify({ utilisateur }));
  }

  setUser(utilisateur: Utilisateur): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify({ utilisateur }));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): Utilisateur | null {
    const stored = localStorage.getItem(this.USER_KEY);
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored).utilisateur ?? null;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    // Un token présent mais expiré ne doit pas être considéré comme connecté :
    // cela évite des appels API systématiquement rejetés en 401.
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isAdmin(): boolean {
    return this.getUser()?.role === 'admin';
  }

  /**
   * Décode le payload JWT (base64) sans vérifier la signature — la
   * vérification d'intégrité reste du ressort du serveur. Sert uniquement à
   * détecter côté client une expiration afin de déconnecter proprement.
   */
  decodeToken(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }

  /** Date d'expiration du token, ou null si indéchiffrable. */
  getTokenExpiration(token: string = this.getToken() ?? ''): Date | null {
    const payload = this.decodeToken(token);
    const exp = payload?.['exp'];
    if (typeof exp !== 'number') {
      return null;
    }
    return new Date(exp * 1000);
  }

  isTokenExpired(token: string = this.getToken() ?? ''): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      // Token non déchiffrable : on laisse le serveur statuer (401).
      return false;
    }
    return expiration.getTime() <= Date.now();
  }

  /** Nombre de secondes restantes avant expiration, ou null. */
  getSecondesRestantes(): number | null {
    const expiration = this.getTokenExpiration();
    if (!expiration) {
      return null;
    }
    return Math.max(0, Math.floor((expiration.getTime() - Date.now()) / 1000));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

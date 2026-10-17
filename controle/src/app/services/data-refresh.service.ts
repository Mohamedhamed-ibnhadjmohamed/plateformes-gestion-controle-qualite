import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/** Ressources de l'API susceptibles d'être modifiées par l'utilisateur. */
export type RessourceDonnees =
  | 'produit'
  | 'aql'
  | 'order'
  | 'inspection'
  | 'defaults'
  | 'familledefault'
  | 'employee'
  | 'utilisateur'
  | 'contact';

/** Émission du bus : une ressource précise, ou « * » pour tout recharger. */
export type EvenementDonnees = RessourceDonnees | '*';

/** Segments d'URL permettant de rattacher une requête à une ressource. */
const SEGMENTS: { segment: string; ressource: RessourceDonnees }[] = [
  { segment: 'produit', ressource: 'produit' },
  { segment: 'aql', ressource: 'aql' },
  { segment: 'order', ressource: 'order' },
  { segment: 'inspection', ressource: 'inspection' },
  { segment: 'defaults', ressource: 'defaults' },
  { segment: 'familledefault', ressource: 'familledefault' },
  { segment: 'employee', ressource: 'employee' },
  { segment: 'utilisateur', ressource: 'utilisateur' },
  { segment: 'contact', ressource: 'contact' },
];

/**
 * Bus d'événements applicatif.
 *
 * Les composants de gestion (ajout / modification / suppression) n'ont rien à
 * modifier : `DataRefreshInterceptor` détecte automatiquement les écritures
 * réussies et notifie les consommateurs, ce qui garantit des statistiques
 * toujours à jour sans couplage entre les écrans.
 */
@Injectable({ providedIn: 'root' })
export class DataRefreshService {
  private readonly modifications = new Subject<EvenementDonnees>();

  /** Émis après chaque modification réussie d'une ressource. */
  readonly modifications$: Observable<EvenementDonnees> =
    this.modifications.asObservable();

  /** Notifie les consommateurs qu'une ressource a changé. */
  notifier(ressource: EvenementDonnees): void {
    this.modifications.next(ressource);
  }

  /** Déduit la ressource concernée à partir d'une URL d'API. */
  static ressourceDepuisUrl(url: string): RessourceDonnees | null {
    if (!url || url.includes('/login')) {
      return null;
    }
    const chemin = url.split('?')[0].toLowerCase();
    return (
      SEGMENTS.find(
        ({ segment }) =>
          chemin.includes(`/${segment}/`) || chemin.endsWith(`/${segment}`)
      )?.ressource ?? null
    );
  }
}

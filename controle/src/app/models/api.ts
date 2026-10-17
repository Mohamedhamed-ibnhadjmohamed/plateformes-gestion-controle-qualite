import { AQL } from './AQL';
import { Contact } from './Contact';
import { Default } from './Default';
import { Employee } from './Employee';
import { FamilleDefault } from './FamillieDefaults';
import { Inspection } from './Inspection';
import { Order } from './Order';
import { Produit } from './Produit';
import { Utilisateur } from './Utilisateur';

/**
 * Types de réponse renvoyés par l'API backend.
 * Centralisés ici pour typer les services HTTP et éviter les `any`.
 */

/** Réponse générique des opérations d'écriture (création, mise à jour, suppression). */
export interface MessageResponse<T = unknown> {
  message: string;
  data?: T;
}

/** Réponse de `POST /utilisateur/login`. */
export interface LoginResponse {
  utilisateur: Utilisateur;
  token: string;
}

/** Réponse de `POST /defaults/upload`. */
export interface UploadResponse {
  filename: string;
}

export interface ProduitsResponse {
  produits: Produit[];
}

export interface AqlsResponse {
  aqls: AQL[];
}

export interface AqlResponse {
  aql: AQL;
}

export interface InspectionsResponse {
  inspections: Inspection[];
}

export interface EmployeesResponse {
  employees: Employee[];
}

export interface DefaultsResponse {
  defaults: Default[];
}

export interface ContactsResponse {
  contacts: Contact[];
}

export interface FamillesResponse {
  familles: FamilleDefault[];
}

export interface OrdersResponse {
  orders: Order[];
}

/** Ligne du rapport de rapprochement des quantités par OF. */
export interface LigneRapprochement {
  id_order: number;
  libelle_order: string;
  designation_order: string;
  qte_demandee: number;
  qte_enregistree: number;
  /** qte_demandee - qte_enregistree (>0 : sous-quantité, <0 : sur-enregistrement). */
  ecart: number;
  nb_produits: number;
  nb_inspections: number;
  nb_defauts: number;
  date?: string;
  couleur?: string;
  taille?: string;
  niveau?: number;
}

export interface RapprochementResponse {
  rapprochement: LigneRapprochement[];
}

/** Réponse de `GET /order/:id/suivi-quantite`. */
export interface SuiviQuantiteResponse {
  id_order: number;
  libelle_order: string;
  qte_demandee: number;
  qte_enregistree: number;
  qte_restante: number;
}

export interface UtilisateursResponse {
  utilisateurs: Utilisateur[];
}

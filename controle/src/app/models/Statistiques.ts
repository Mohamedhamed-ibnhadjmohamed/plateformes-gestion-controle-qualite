/**
 * Modèles de données du tableau de bord statistique.
 *
 * Toutes les valeurs sont calculées côté client par `StatistiquesService`
 * à partir des collections déjà exposées par l'API : aucune requête
 * spécifique n'est ajoutée et aucune donnée n'est dupliquée.
 */

import { AQL } from './AQL';
import { Default } from './Default';
import { Employee } from './Employee';
import { FamilleDefault } from './FamillieDefaults';
import { Inspection } from './Inspection';
import { Order } from './Order';
import { Produit } from './Produit';
import { Utilisateur } from './Utilisateur';

/** Ton visuel d'une carte, aligné sur les couleurs du design system. */
export type TonStatistique = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

/** Carte d'indicateur clé (KPI) affichée en haut du tableau de bord. */
export interface CarteStatistique {
  id: string;
  libelle: string;
  valeur: number;
  /** Suffixe affiché après la valeur (ex. « % »). */
  suffixe?: string;
  /** Ligne d'information secondaire (ex. « 3 ce mois-ci »). */
  legende: string;
  /** Classe FontAwesome (ex. « fas fa-box »). */
  icone: string;
  ton: TonStatistique;
  /** Barre de progression discrète, entre 0 et 100 (indicateurs de taux). */
  progression?: number;
  /** Route d'administration vers la page détaillée, si elle existe. */
  lien?: string;
}

/** Part d'un graphique en anneau. */
export interface PartAnneau {
  libelle: string;
  valeur: number;
  /** Couleur hexadécimale (miroir des jetons de `styles.css`). */
  couleur?: string;
}

/** Barre d'un graphique vertical. */
export interface BarreSerie {
  libelle: string;
  valeur: number;
  /** Information complémentaire affichée dans l'infobulle. */
  info?: string;
}

/** Point d'une courbe d'évolution. */
export interface PointSerie {
  libelle: string;
  valeur: number;
}

/** Données brutes consolidées servant au calcul des statistiques. */
export interface DonneesDashboard {
  produits: Produit[];
  aqls: AQL[];
  orders: Order[];
  inspections: Inspection[];
  defaults: Default[];
  familles: FamilleDefault[];
  employees: Employee[];
  utilisateurs: Utilisateur[];
}

/** Statistiques prêtes à être affichées par le tableau de bord. */
export interface StatistiquesDashboard {
  cartes: CarteStatistique[];
  /** Défauts regroupés par gravité (critique / majeure / mineure). */
  defautsParGravite: PartAnneau[];
  /** Nombre d'inspections par chaîne de contrôle. */
  inspectionsParCategorie: BarreSerie[];
  /** Évolution mensuelle des inspections sur les 12 derniers mois. */
  inspectionsParMois: PointSerie[];
  /** Répartition des évaluations saisies lors des inspections. */
  resultatsInspection: PartAnneau[];
  /** Les 5 familles de défauts les plus fréquentes. */
  topFamillesDefauts: BarreSerie[];
  /** Volumétrie des collections de référence. */
  ressources: BarreSerie[];
  /** Score global de qualité, entre 0 et 100. */
  indiceQualite: number;
  /** Part des inspections non refusées, entre 0 et 100. */
  tauxConformite: number;
  totalDefauts: number;
  totalInspections: number;
  inspectionsDuMois: number;
  inspectionsRefusees: number;
  quantiteDemandee: number;
  quantiteProduite: number;
  /** Vrai lorsqu'aucune donnée n'est encore enregistrée. */
  aucuneDonnee: boolean;
}

/** Périmètre d'analyse affiché dans l'espace de contrôle. */
export type PorteeAnalyses = 'moi' | 'tous';

/** Données brutes nécessaires aux analyses d'un opérateur. */
export interface DonneesAnalyses {
  inspections: Inspection[];
  defaults: Default[];
  familles: FamilleDefault[];
}

/**
 * Analyses de l'espace de contrôle.
 *
 * Même structure de graphiques que le tableau de bord administrateur, mais
 * restreinte à un périmètre : les contrôles saisis par l'utilisateur connecté
 * (« moi ») ou l'ensemble des contrôles de l'application (« tous »).
 */
export interface AnalysesUtilisateur {
  cartes: CarteStatistique[];
  /** Défauts regroupés par gravité (critique / majeure / mineure). */
  defautsParGravite: PartAnneau[];
  /** Nombre d'inspections par chaîne de contrôle. */
  inspectionsParCategorie: BarreSerie[];
  /** Évolution mensuelle des inspections sur les 12 derniers mois. */
  inspectionsParMois: PointSerie[];
  /** Répartition des évaluations saisies lors des inspections. */
  resultatsInspection: PartAnneau[];
  /** Les 5 familles de défauts les plus fréquentes. */
  topFamillesDefauts: BarreSerie[];
  totalInspections: number;
  inspectionsDuMois: number;
  inspectionsRefusees: number;
  /** Part des inspections non refusées, entre 0 et 100. */
  tauxConformite: number;
  totalDefauts: number;
  /** Inspections sans utilisateur rattaché, exclues du périmètre « moi ». */
  inspectionsNonAttribuees: number;
  /** Vrai lorsqu'aucune inspection n'entre dans le périmètre. */
  aucuneDonnee: boolean;
}

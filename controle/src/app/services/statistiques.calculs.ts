import {
  BarreSerie,
  CarteStatistique,
  DonneesDashboard,
  PartAnneau,
  PointSerie,
  StatistiquesDashboard,
  TonStatistique,
} from '../models/Statistiques';
import { Default } from '../models/Default';
import { Inspection } from '../models/Inspection';

/** Mois abrégés, alignés sur le format de date français de l'application. */
const MOIS_COURTS = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

/** Gravités d'un défaut et couleur associée (miroir des jetons du design). */
const GRAVITES = {
  critique: { libelle: 'Critique', couleur: '#d92d20' },
  majeure: { libelle: 'Majeure', couleur: '#c77708' },
  mineure: { libelle: 'Mineure', couleur: '#2864dc' },
} as const;

type Gravite = keyof typeof GRAVITES;

/** Évaluations possibles d'une inspection (voir formulaires de contrôle). */
const RESULTATS = [
  { cle: 'excellente', libelle: 'Excellente', couleur: '#159a68' },
  { cle: 'acceptable', libelle: 'Acceptable', couleur: '#2864dc' },
  { cle: 'passable', libelle: 'Passable', couleur: '#c77708' },
  { cle: 'refusee', libelle: 'Refusée', couleur: '#d92d20' },
];

/** Instantané vide, utilisé avant le premier chargement. */
export function donneesVides(): DonneesDashboard {
  return {
    produits: [],
    aqls: [],
    orders: [],
    inspections: [],
    defaults: [],
    familles: [],
    employees: [],
    utilisateurs: [],
  };
}

/** Champ de date renvoyé par l'API (ISO) ou déjà typé `Date`. */
type ChampDate = Date | string | null | undefined;

/** Annule accents, casse et séparateurs pour comparer des libellés métier. */
function normaliser(texte: unknown): string {
  return String(texte ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Extrait année / mois sans dépendre du fuseau horaire du navigateur. */
function partiesDate(valeur: ChampDate): { annee: number; mois: number } | null {
  if (valeur instanceof Date) {
    return isNaN(valeur.getTime())
      ? null
      : { annee: valeur.getFullYear(), mois: valeur.getMonth() };
  }
  if (typeof valeur === 'string') {
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(valeur);
    if (iso) {
      return { annee: Number(iso[1]), mois: Number(iso[2]) - 1 };
    }
    const date = new Date(valeur);
    return isNaN(date.getTime())
      ? null
      : { annee: date.getFullYear(), mois: date.getMonth() };
  }
  return null;
}

/** Nombre de pièces défectueuses ; une ligne sans quantité compte pour 1. */
export function quantiteDefaut(defaut: Default): number {
  const nombre = Number(defaut.nombre);
  return Number.isFinite(nombre) && nombre > 0 ? nombre : 1;
}

/** Rattache un type de défaut saisi librement à une gravité connue. */
export function graviteDefaut(type: unknown): Gravite {
  const valeur = normaliser(type);
  if (valeur.includes('criti')) return 'critique';
  if (valeur.startsWith('majeure') || valeur.startsWith('majeur')) return 'majeure';
  return 'mineure';
}

/** Une inspection est refusée si son évaluation contient « refus » ou « rejet ». */
export function estRefusee(resultat: unknown): boolean {
  const valeur = normaliser(resultat);
  return valeur.includes('refus') || valeur.includes('rejet') || valeur.includes('nonconforme');
}

/** Vrai si l'inspection porte une évaluation exploitable. */
export function aUneEvaluation(resultat: unknown): boolean {
  return normaliser(resultat).length > 0;
}

/** Teinte de la carte « taux de conformité » selon les seuils qualité. */
export function tonConformite(taux: number): TonStatistique {
  if (taux >= 90) return 'success';
  if (taux >= 70) return 'primary';
  return 'danger';
}

/** Teinte de la carte « indice de qualité » selon les seuils qualité. */
export function tonIndice(indice: number): TonStatistique {
  if (indice >= 75) return 'success';
  if (indice >= 50) return 'primary';
  return 'warning';
}

export function arrondi(valeur: number): number {
  return Math.round(valeur);
}

/** Somme d'un champ numérique, en ignorant les valeurs invalides. */
export function somme<T>(elements: T[], lecture: (element: T) => unknown): number {
  return elements.reduce((total, element) => {
    const valeur = Number(lecture(element));
    return Number.isFinite(valeur) && valeur > 0 ? total + valeur : total;
  }, 0);
}

/** Compte les inspections des `nbMois` derniers mois. */
export function serieMensuelle(inspections: Inspection[], nbMois: number): PointSerie[] {
  const aujourdhui = new Date();
  const points: PointSerie[] = [];

  for (let recul = nbMois - 1; recul >= 0; recul--) {
    const date = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() - recul, 1);
    const annee = date.getFullYear();
    const mois = date.getMonth();
    const libelle =
      mois === 0
        ? `${MOIS_COURTS[0]} ${String(annee).slice(-2)}`
        : MOIS_COURTS[mois];

    points.push({
      libelle,
      valeur: inspections.filter((inspection) => {
        const parties = partiesDate(inspection.date);
        return parties?.annee === annee && parties?.mois === mois;
      }).length,
    });
  }

  return points;
}

/** Nombre d'inspections par chaîne de contrôle, avec le détail des refus. */
export function inspectionsParCategorie(inspections: Inspection[]): BarreSerie[] {
  const categories: { libelle: string; valeur: number; refus: number }[] = [
    { libelle: 'Sous-chaîne', valeur: 0, refus: 0 },
    { libelle: 'Fin de chaîne', valeur: 0, refus: 0 },
    { libelle: 'Audit', valeur: 0, refus: 0 },
    { libelle: 'Autre', valeur: 0, refus: 0 },
  ];

  inspections.forEach((inspection) => {
    const valeur = normaliser(inspection.type_categorie);
    const index = valeur.includes('sous')
      ? 0
      : valeur.includes('fin')
        ? 1
        : valeur.includes('audit')
          ? 2
          : 3;
    const categorie = categories[index];
    categorie.valeur += 1;
    if (estRefusee(inspection.resultat)) {
      categorie.refus += 1;
    }
  });

  return categories
    .filter((categorie) => categorie.libelle !== 'Autre' || categorie.valeur > 0)
    .map(({ libelle, valeur, refus }) => ({
      libelle,
      valeur,
      info: refus ? `${refus} refus` : 'Aucun refus',
    }));
}

/** Répartition des évaluations saisies lors des inspections. */
export function resultatsInspection(inspections: Inspection[]): PartAnneau[] {
  const compteurs = new Map<string, number>();
  inspections.forEach((inspection) => {
    const valeur = normaliser(inspection.resultat);
    if (!valeur) return;
    const connu = RESULTATS.find((resultat) => valeur.startsWith(resultat.cle));
    const cle = connu ? connu.cle : 'autre';
    compteurs.set(cle, (compteurs.get(cle) ?? 0) + 1);
  });

  const parts: PartAnneau[] = RESULTATS.filter((resultat) =>
    compteurs.has(resultat.cle)
  ).map(({ cle, libelle, couleur }) => ({
    libelle,
    valeur: compteurs.get(cle) ?? 0,
    couleur,
  }));

  if (compteurs.has('autre')) {
    parts.push({ libelle: 'Autre', valeur: compteurs.get('autre') ?? 0, couleur: '#64748b' });
  }

  return parts;
}

/** Cinq familles de défauts concentrant le plus de pièces défectueuses. */
export function topFamillesDefauts(defauts: Default[], familles: DonneesDashboard['familles']): BarreSerie[] {
  const noms = new Map<number, string>();
  familles.forEach((famille) => {
    if (famille.id_famille != null) {
      noms.set(
        Number(famille.id_famille),
        famille.nom ?? famille.code ?? `Famille ${famille.id_famille}`
      );
    }
  });

  const cumul = new Map<string, { valeur: number; lignes: number }>();
  defauts.forEach((defaut) => {
    const id = defaut.id_famille;
    const libelle =
      id != null ? noms.get(Number(id)) ?? `Famille ${id}` : 'Non classée';
    const actuel = cumul.get(libelle) ?? { valeur: 0, lignes: 0 };
    cumul.set(libelle, {
      valeur: actuel.valeur + quantiteDefaut(defaut),
      lignes: actuel.lignes + 1,
    });
  });

  return [...cumul.entries()]
    .map(([libelle, { valeur, lignes }]) => ({
      libelle,
      valeur,
      info: `${lignes} constat${lignes > 1 ? 's' : ''}`,
    }))
    .sort((a, b) => b.valeur - a.valeur)
    .slice(0, 5);
}

/**
 * Répartit les pièces défectueuses par gravité.
 * Mutualisé par le tableau de bord administrateur et les analyses de contrôle.
 */
export function repartitionGravite(defauts: Default[]): PartAnneau[] {
  const parGravite: Record<Gravite, number> = { critique: 0, majeure: 0, mineure: 0 };
  defauts.forEach((defaut) => {
    parGravite[graviteDefaut(defaut.type)] += quantiteDefaut(defaut);
  });

  return (Object.keys(GRAVITES) as Gravite[]).map((gravite) => ({
    libelle: GRAVITES[gravite].libelle,
    valeur: parGravite[gravite],
    couleur: GRAVITES[gravite].couleur,
  }));
}

/**
 * Calcule l'ensemble des statistiques du tableau de bord.
 *
 * Le score global combine le taux d'acceptation des inspections (60 %) et la
 * gravité des défauts constatés (40 %) : plus la part de défauts critiques et
 * majeurs est faible, plus l'indice se rapproche de 100.
 */
export function calculerStatistiques(donnees: DonneesDashboard): StatistiquesDashboard {
  const {
    produits,
    aqls,
    orders,
    inspections,
    defaults,
    familles,
    employees,
    utilisateurs,
  } = donnees;

  const totalInspections = inspections.length;
  const totalDefauts = somme(defaults, (defaut) => quantiteDefaut(defaut));

  const parGravite: Record<Gravite, number> = { critique: 0, majeure: 0, mineure: 0 };
  defaults.forEach((defaut) => {
    parGravite[graviteDefaut(defaut.type)] += quantiteDefaut(defaut);
  });

  const defautsParGravite = repartitionGravite(defaults);

  const inspectionsRefusees = inspections.filter((inspection) =>
    estRefusee(inspection.resultat)
  ).length;
  const inspectionsEvaluees = inspections.filter((inspection) =>
    aUneEvaluation(inspection.resultat)
  ).length;
  const tauxConformite = inspectionsEvaluees
    ? ((inspectionsEvaluees - inspectionsRefusees) / inspectionsEvaluees) * 100
    : 0;

  const partDefautsGraves = totalDefauts
    ? (parGravite.critique + parGravite.majeure) / totalDefauts
    : 0;
  const indiceQualite =
    totalInspections || totalDefauts
      ? arrondi(tauxConformite * 0.6 + (100 - partDefautsGraves * 100) * 0.4)
      : 0;

  const maintenant = new Date();
  const inspectionsDuMois = inspections.filter((inspection) => {
    const parties = partiesDate(inspection.date);
    return (
      parties?.annee === maintenant.getFullYear() &&
      parties?.mois === maintenant.getMonth()
    );
  }).length;

  const quantiteDemandee = somme(orders, (order) => order.qte_demandee);
  const quantiteProduite = somme(produits, (produit) => produit.quantite);

  const cartes: CarteStatistique[] = [
    {
      id: 'inspections',
      libelle: 'Inspections réalisées',
      valeur: totalInspections,
      legende: `${inspectionsDuMois} ce mois-ci`,
      icone: 'fas fa-clipboard-check',
      ton: 'primary',
      lien: '/admin/inspection',
    },
    {
      id: 'conformite',
      libelle: 'Taux de conformité',
      valeur: arrondi(tauxConformite),
      suffixe: '%',
      legende: `${inspectionsRefusees} inspection${inspectionsRefusees > 1 ? 's' : ''} refusée${inspectionsRefusees > 1 ? 's' : ''}`,
      icone: 'fas fa-circle-check',
      ton: tonConformite(tauxConformite),
      lien: '/admin/inspection',
      progression: arrondi(tauxConformite),
    },
    {
      id: 'defauts',
      libelle: 'Défauts détectés',
      valeur: totalDefauts,
      legende: `${parGravite.critique} critique${parGravite.critique > 1 ? 's' : ''} · ${parGravite.majeure} majeure${parGravite.majeure > 1 ? 's' : ''}`,
      icone: 'fas fa-triangle-exclamation',
      ton: 'danger',
      lien: '/admin/default',
    },
    {
      id: 'indice',
      libelle: 'Indice de qualité',
      valeur: indiceQualite,
      suffixe: '/100',
      legende: 'Score global pondéré',
      icone: 'fas fa-gauge-high',
      ton: tonIndice(indiceQualite),
      progression: indiceQualite,
    },
    {
      id: 'orders',
      libelle: 'Ordres de fabrication',
      valeur: orders.length,
      legende: `${quantiteDemandee} unités demandées`,
      icone: 'fas fa-industry',
      ton: 'warning',
      lien: '/admin/order',
    },
    {
      id: 'produits',
      libelle: 'Produits suivis',
      valeur: produits.length,
      legende: `${quantiteProduite} unités produites`,
      icone: 'fas fa-box',
      ton: 'success',
      lien: '/admin/produit',
    },
    {
      id: 'employees',
      libelle: 'Employés',
      valeur: employees.length,
      legende: 'Contrôleurs enregistrés',
      icone: 'fas fa-user-tie',
      ton: 'neutral',
      lien: '/admin/employee',
    },
    {
      id: 'utilisateurs',
      libelle: 'Utilisateurs',
      valeur: utilisateurs.length,
      legende: 'Comptes applicatifs',
      icone: 'fas fa-users',
      ton: 'neutral',
      lien: '/admin/utilisateur',
    },
  ];

  const ressources: BarreSerie[] = [
    { libelle: 'Familles de défauts', valeur: familles.length },
    { libelle: 'Normes AQL', valeur: aqls.length },
    { libelle: 'Employés', valeur: employees.length },
    { libelle: 'Utilisateurs', valeur: utilisateurs.length },
  ];

  return {
    cartes,
    defautsParGravite,
    inspectionsParCategorie: inspectionsParCategorie(inspections),
    inspectionsParMois: serieMensuelle(inspections, 12),
    resultatsInspection: resultatsInspection(inspections),
    topFamillesDefauts: topFamillesDefauts(defaults, familles),
    ressources,
    indiceQualite,
    tauxConformite,
    totalDefauts,
    totalInspections,
    inspectionsDuMois,
    inspectionsRefusees,
    quantiteDemandee,
    quantiteProduite,
    aucuneDonnee:
      !totalInspections &&
      !totalDefauts &&
      !produits.length &&
      !orders.length &&
      !familles.length,
  };
}

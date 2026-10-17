import {
  AnalysesUtilisateur,
  BarreSerie,
  CarteStatistique,
  DonneesAnalyses,
  PorteeAnalyses,
} from '../models/Statistiques';
import {
  aUneEvaluation,
  arrondi,
  estRefusee,
  inspectionsParCategorie,
  quantiteDefaut,
  repartitionGravite,
  resultatsInspection,
  serieMensuelle,
  somme,
  tonConformite,
  tonIndice,
  topFamillesDefauts,
} from './statistiques.calculs';

/** Identifiant comparable, ou `null` si la valeur est absente ou invalide. */
function identifiant(valeur: unknown): number | null {
  // `Number(null)` vaut 0 : les valeurs vides doivent rester « non rattachées ».
  if (valeur === null || valeur === undefined || valeur === '') {
    return null;
  }
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
}

/** Applique le périmètre demandé aux collections chargées. */
function restreindre(
  donnees: DonneesAnalyses,
  portee: PorteeAnalyses,
  idUtilisateur: number | null
) {
  const inspections = donnees.inspections ?? [];

  if (portee === 'tous') {
    return {
      inspections,
      defauts: donnees.defaults ?? [],
      nonAttribuees: 0,
    };
  }

  const miennes = inspections.filter(
    (inspection) => identifiant(inspection.id_utilisateur) === idUtilisateur
  );
  const identifiants = new Set(
    miennes
      .map((inspection) => identifiant(inspection.id_inspection))
      .filter((id): id is number => id !== null)
  );

  return {
    inspections: miennes,
    // Un défaut revient à l'utilisateur s'il découle d'une de ses inspections.
    defauts: (donnees.defaults ?? []).filter((defaut) => {
      const id = identifiant(defaut.id_inspection);
      return id !== null && identifiants.has(id);
    }),
    nonAttribuees: inspections.filter(
      (inspection) => identifiant(inspection.id_utilisateur) === null
    ).length,
  };
}

/** Nombre de pièces d'une gravité donnée. */
function compter(parts: { libelle: string; valeur: number }[], libelle: string): number {
  return parts.find((part) => part.libelle === libelle)?.valeur ?? 0;
}

/** Vrai si l'inspection appartient au mois et à l'année fournis. */
function estDuMois(valeur: DonneesAnalyses['inspections'][number]['date'], annee: number, mois: number): boolean {
  if (!valeur) {
    return false;
  }
  const jour = valeur instanceof Date ? valeur : new Date(valeur);
  return !isNaN(jour.getTime()) && jour.getFullYear() === annee && jour.getMonth() === mois;
}

/**
 * Calcule les analyses d'un opérateur à partir des collections brutes.
 *
 * Les règles de lecture (refus, gravité, familles, score) sont celles du
 * tableau de bord administrateur : les deux écrans racontent la même réalité
 * métier, simplement restreinte à un périmètre.
 */
export function calculerAnalysesUtilisateur(
  donnees: DonneesAnalyses,
  portee: PorteeAnalyses,
  idUtilisateur: number | null
): AnalysesUtilisateur {
  const { inspections, defauts, nonAttribuees } = restreindre(
    donnees,
    portee,
    idUtilisateur
  );

  const totalInspections = inspections.length;
  const totalDefauts = somme(defauts, (defaut) => quantiteDefaut(defaut));

  const gravites = repartitionGravite(defauts);
  const critiques = compter(gravites, 'Critique');
  const majeures = compter(gravites, 'Majeure');
  const mineures = compter(gravites, 'Mineure');

  const inspectionsRefusees = inspections.filter((inspection) =>
    estRefusee(inspection.resultat)
  ).length;
  const inspectionsEvaluees = inspections.filter((inspection) =>
    aUneEvaluation(inspection.resultat)
  ).length;
  const tauxConformite = inspectionsEvaluees
    ? ((inspectionsEvaluees - inspectionsRefusees) / inspectionsEvaluees) * 100
    : 0;

  const partDefautsGraves = totalDefauts ? (critiques + majeures) / totalDefauts : 0;
  const indiceQualite =
    totalInspections || totalDefauts
      ? arrondi(tauxConformite * 0.6 + (100 - partDefautsGraves * 100) * 0.4)
      : 0;

  const maintenant = new Date();
  const inspectionsDuMois = inspections.filter((inspection) =>
    estDuMois(inspection.date, maintenant.getFullYear(), maintenant.getMonth())
  ).length;

  const collectif = portee === 'tous';
  const cartes: CarteStatistique[] = [
    {
      id: 'inspections',
      libelle: collectif ? 'Inspections réalisées' : 'Mes inspections',
      valeur: totalInspections,
      legende: `${inspectionsDuMois} ce mois-ci`,
      icone: 'fas fa-clipboard-check',
      ton: 'primary',
      lien: '/home/consulter',
    },
    {
      id: 'conformite',
      libelle: collectif ? 'Taux de conformité' : 'Mon taux de conformité',
      valeur: arrondi(tauxConformite),
      suffixe: '%',
      legende: `${inspectionsRefusees} inspection${inspectionsRefusees > 1 ? 's' : ''} refusée${inspectionsRefusees > 1 ? 's' : ''}`,
      icone: 'fas fa-circle-check',
      ton: tonConformite(tauxConformite),
      progression: arrondi(tauxConformite),
    },
    {
      id: 'defauts',
      libelle: collectif ? 'Défauts détectés' : 'Défauts que j\'ai constatés',
      valeur: totalDefauts,
      legende: `${critiques} critique${critiques > 1 ? 's' : ''} · ${majeures} majeure${majeures > 1 ? 's' : ''}`,
      icone: 'fas fa-triangle-exclamation',
      ton: 'danger',
    },
    {
      id: 'indice',
      libelle: 'Indice de qualité',
      valeur: indiceQualite,
      suffixe: '/100',
      legende: collectif ? 'Score global pondéré' : 'Score de mes contrôles',
      icone: 'fas fa-gauge-high',
      ton: tonIndice(indiceQualite),
      progression: indiceQualite,
    },
    {
      id: 'defauts-par-inspection',
      libelle: 'Défauts par inspection',
      valeur: totalInspections
        ? Number((totalDefauts / totalInspections).toFixed(2))
        : 0,
      legende: `${mineures} défaut${mineures > 1 ? 's' : ''} mineur${mineures > 1 ? 's' : ''}`,
      icone: 'fas fa-divide',
      ton: 'neutral',
    },
  ];

  return {
    cartes,
    defautsParGravite: gravites,
    inspectionsParCategorie: inspectionsParCategorie(inspections),
    inspectionsParMois: serieMensuelle(inspections, 12),
    resultatsInspection: resultatsInspection(inspections),
    // Le classement des familles est mutualisé avec le tableau de bord
    // administrateur : mêmes libellés, mêmes règles de secours.
    topFamillesDefauts: topFamillesDefauts(defauts, donnees.familles ?? []),
    totalInspections,
    inspectionsDuMois,
    inspectionsRefusees,
    tauxConformite,
    totalDefauts,
    inspectionsNonAttribuees: nonAttribuees,
    aucuneDonnee: !totalInspections && !totalDefauts,
  };
}

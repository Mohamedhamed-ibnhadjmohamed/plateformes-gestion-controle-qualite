import {
  DonneesAnalyses,
} from '../models/Statistiques';
import { calculerAnalysesUtilisateur } from './analyses-utilisateur.calculs';

/**
 * Données de base : quatre inspections, dont deux de l'utilisateur #1.
 * L'inspection #4 n'a pas d'utilisateur rattaché (`null` renvoyé par l'API).
 */
function donnees(): DonneesAnalyses {
  return {
    inspections: [
      {
        id_inspection: 1,
        date: new Date(2026, 0, 15),
        type_categorie: 'sous chaine',
        id_utilisateur: 1,
        resultat: 'excellente',
      },
      {
        id_inspection: 2,
        date: new Date(2026, 1, 10),
        type_categorie: 'fin chaine',
        id_utilisateur: 1,
        resultat: 'refusee',
      },
      {
        id_inspection: 3,
        date: new Date(2026, 1, 12),
        type_categorie: 'audit',
        id_utilisateur: 2,
        resultat: 'acceptable',
      },
      {
        id_inspection: 4,
        date: new Date(2026, 1, 20),
        type_categorie: 'sous chaine',
        // Le modèle ne déclare pas `null`, mais l'API le renvoie : on teste la
        // donnée réelle pour vérifier qu'elle est bien considérée comme orpheline.
        id_utilisateur: null as unknown as number,
        resultat: 'acceptable',
      },
    ],
    defaults: [
      { id_defaults: 1, id_inspection: 1, id_famille: 1, type: 'critique', nombre: 2 },
      { id_defaults: 2, id_inspection: 2, id_famille: 2, type: 'majeur', nombre: 1 },
      { id_defaults: 3, id_inspection: 3, id_famille: 1, type: 'mineur', nombre: 3 },
      { id_defaults: 4, id_inspection: 4, id_famille: 2, type: 'mineur', nombre: 4 },
    ],
    familles: [
      { id_famille: 1, nom: 'Couture', code: 'C1' },
      { id_famille: 2, nom: 'Coloris', code: 'C2' },
    ],
  };
}

describe('calculerAnalysesUtilisateur', () => {
  it('limite les indicateurs aux inspections de l\'utilisateur', () => {
    const analyses = calculerAnalysesUtilisateur(donnees(), 'moi', 1);

    // Inspections #1 et #2 uniquement, la #3 appartenant à l'utilisateur #2.
    expect(analyses.totalInspections).toBe(2);
    // Défauts rattachés à ces deux inspections : 2 (critiques) + 1 (majeur).
    expect(analyses.totalDefauts).toBe(3);
    expect(analyses.inspectionsRefusees).toBe(1);
    expect(analyses.tauxConformite).toBe(50);
    // L'inspection #4 n'a pas d'utilisateur : elle est signalée à part.
    expect(analyses.inspectionsNonAttribuees).toBe(1);
    expect(analyses.aucuneDonnee).toBeFalse();
  });

  it('répartit les défauts par gravité et par famille', () => {
    const analyses = calculerAnalysesUtilisateur(donnees(), 'moi', 1);

    expect(analyses.defautsParGravite).toEqual([
      { libelle: 'Critique', valeur: 2, couleur: '#d92d20' },
      { libelle: 'Majeure', valeur: 1, couleur: '#c77708' },
      { libelle: 'Mineure', valeur: 0, couleur: '#2864dc' },
    ]);
    expect(analyses.topFamillesDefauts[0]).toEqual({
      libelle: 'Couture',
      valeur: 2,
      info: '1 constat',
    });
  });

  it('couvre l\'ensemble des inspections en périmètre « tous »', () => {
    const analyses = calculerAnalysesUtilisateur(donnees(), 'tous', 1);

    expect(analyses.totalInspections).toBe(4);
    expect(analyses.totalDefauts).toBe(10);
    expect(analyses.inspectionsRefusees).toBe(1);
    expect(analyses.inspectionsNonAttribuees).toBe(0);
  });

  it('regroupe les inspections par chaîne de contrôle', () => {
    const analyses = calculerAnalysesUtilisateur(donnees(), 'moi', 1);

    expect(analyses.inspectionsParCategorie).toEqual([
      { libelle: 'Sous-chaîne', valeur: 1, info: 'Aucun refus' },
      { libelle: 'Fin de chaîne', valeur: 1, info: '1 refus' },
      { libelle: 'Audit', valeur: 0, info: 'Aucun refus' },
    ]);
  });

  it('décrit une situation sans aucune donnée', () => {
    const analyses = calculerAnalysesUtilisateur(
      { inspections: [], defaults: [], familles: [] },
      'moi',
      1
    );

    expect(analyses.aucuneDonnee).toBeTrue();
    expect(analyses.cartes[0].valeur).toBe(0);
    expect(analyses.tauxConformite).toBe(0);
  });

  it('adapte les libellés au périmètre affiché', () => {
    const miennes = calculerAnalysesUtilisateur(donnees(), 'moi', 1);
    const equipe = calculerAnalysesUtilisateur(donnees(), 'tous', 1);

    expect(miennes.cartes[0].libelle).toBe('Mes inspections');
    expect(miennes.cartes[1].libelle).toBe('Mon taux de conformité');
    expect(equipe.cartes[0].libelle).toBe('Inspections réalisées');
    expect(equipe.cartes[1].libelle).toBe('Taux de conformité');
  });
});

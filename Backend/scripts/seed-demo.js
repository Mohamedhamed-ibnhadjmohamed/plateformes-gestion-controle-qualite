'use strict';

// Remplit la base avec un jeu de données de démonstration cohérent.
//
// Idempotent : chaque enregistrement est recherché par sa clé naturelle avant
// insertion, le script peut donc être relancé sans créer de doublons.
//
// Usage (depuis le dossier Backend) :
//   npm run seed

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcrypt');
const { query, pool } = require('../config/database');

// ---------------------------------------------------------------------------
// Données de démonstration
// ---------------------------------------------------------------------------

// Comptes utilisateurs de démonstration : [email, motDePasse, nom, prénom]
const UTILISATEURS = [
  ['demo@exemple.com', 'demo.demo', 'Demo', 'Utilisateur'],
];

// [matricule, nom, prenom, notes]
const EMPLOYES = [
  [1001, 'Dupont', 'Jean', 12],
  [1002, 'Martin', 'Sophie', 9],
  [1003, 'Benali', 'Karim', 7],
  [1004, 'Garcia', 'Lucia', 10],
];

// [code, nom, description]
const FAMILLES = [
  ['FAM-COUL', 'Défaut de couleur', 'Écarts de teinte ou de coloration par rapport au standard'],
  ['FAM-COUT', 'Défaut de couture', 'Points manquants, coutures décousues ou irrégulières'],
  ['FAM-TISS', 'Défaut de tissu', 'Trous, taches ou défauts de tissage'],
  ['FAM-DIM', 'Défaut de dimensions', 'Écarts par rapport aux mesures attendues'],
];

// [nom, description, id_detail_aql, qte_min, qte_max, qte_critique, qte_mineure, qte_majeure]
const AQLS = [
  ['AQL 0.65', 'Contrôle renforcé - lots critiques', null, 1, 500, 0, 2, 3],
  ['AQL 1.0', 'Contrôle standard - lots courants', null, 501, 1200, 1, 4, 6],
  ['AQL 1.5', 'Contrôle allégé - gros volumes', null, 1201, 5000, 2, 7, 10],
];

// [libelle_order, designation_order, qte_demandee, date, couleur, taille, niveau]
const ORDRES = [
  ['OF-2026-001', 'T-shirt coton bio', 1000, '2026-10-20', 'Blanc', 'M', 2],
  ['OF-2026-002', 'Chemise en lin', 600, '2026-10-25', 'Bleu ciel', 'L', 1],
  ['OF-2026-003', 'Pantalon en jean', 800, '2026-11-02', 'Noir', '42', 2],
];

// [code, designation, libelle_produit, niveau, quantite, nomAql, libelleOrder]
const PRODUITS = [
  ['PRD-001', 'T-shirt coton bio manches courtes', 'T-shirt coton', 2, 1000, 'AQL 1.0', 'OF-2026-001'],
  ['PRD-002', 'Chemise en lin col italien', 'Chemise en lin', 1, 600, 'AQL 0.65', 'OF-2026-002'],
  ['PRD-003', 'Pantalon en jean coupe droite', 'Pantalon en jean', 2, 800, 'AQL 1.0', 'OF-2026-003'],
  ['PRD-004', 'Sweat à capuche molleton', 'Sweat à capuche', 1, 400, 'AQL 0.65', 'OF-2026-001'],
  ['PRD-005', 'Robe en viscose imprimée', 'Robe en viscose', 2, 300, 'AQL 1.5', 'OF-2026-002'],
];

// [date, observations, type_categorie, designation, codeProduit, emailUtilisateur, resultat]
const INSPECTIONS = [
  ['2026-10-05', 'Contrôle visuel et mesures sur un échantillon du lot.', 'Sous-chaîne', 'Contrôle du lot PRD-001', 'PRD-001', 'admin@admin.com', 'passable'],
  ['2026-10-07', 'Vérification à 100 % des produits finis.', 'Fin de chaîne', 'Contrôle du lot PRD-003', 'PRD-003', 'test_1791798452399@x.com', 'acceptable'],
  ['2026-10-09', 'Audit fournisseur sur échantillons selon les critères AQL.', 'Audit', 'Contrôle du lot PRD-002', 'PRD-002', 'mohamedhamed.ibnhadjmohamed@polytechnicien.tn', 'refusee'],
];

// [description, nombre, codeFamille, designationInspection, type, matriculeEmploye]
const DEFAUTS = [
  ['Nuance de blanc non conforme', 5, 'FAM-COUL', 'Contrôle du lot PRD-001', 'mineure', 1001],
  ["Couture d'épaule décousue", 2, 'FAM-COUT', 'Contrôle du lot PRD-001', 'majeure', 1001],
  ['Trou au niveau du col', 1, 'FAM-TISS', 'Contrôle du lot PRD-001', 'critique', 1002],
  ['Longueur de manche hors tolérance', 3, 'FAM-DIM', 'Contrôle du lot PRD-003', 'mineure', 1002],
  ['Ourlet décousu', 4, 'FAM-COUT', 'Contrôle du lot PRD-003', 'majeure', 1003],
  ["Tache d'encre sur le devant", 2, 'FAM-TISS', 'Contrôle du lot PRD-002', 'critique', 1004],
  ['Teinte différente du lot de référence', 6, 'FAM-COUL', 'Contrôle du lot PRD-002', 'majeure', 1004],
];

// [non_utilisateur, email, message]
const CONTACTS = [
  ['Jean Dupont', 'jean.dupont@exemple.com', "Demande d'information sur les délais de contrôle."],
  ['Société TextilePro', 'contact@textilepro.tn', 'Souhaite un audit qualité de sa production.'],
  ['Sophie Martin', 'sophie.martin@exemple.com', 'Question sur les critères AQL utilisés.'],
];

// ---------------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------------

const inserted = {};
const existing = {};

function bump(store, key) {
  store[key] = (store[key] || 0) + 1;
}

// Renvoie la première colonne de la première ligne, ou null.
async function findId(sql, params) {
  const rows = await query(sql, params);
  if (!rows || rows.length === 0) {
    return null;
  }
  return Object.values(rows[0])[0];
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seedUtilisateurs() {
  for (const [email, motDePasse, nom, prenom] of UTILISATEURS) {
    const id = await findId('SELECT id_utilisateur FROM utilisateur WHERE email = ?', [email]);
    if (id) {
      bump(existing, 'utilisateur');
      continue;
    }
    const hash = await bcrypt.hash(motDePasse, 10);
    await query(
      'INSERT INTO utilisateur (email, mot_de_passe, nom, prenom, role) VALUES (?, ?, ?, ?, ?)',
      [email, hash, nom, prenom, 'user']
    );
    bump(inserted, 'utilisateur');
  }
}

async function seedEmployes() {
  for (const [matricule, nom, prenom, notes] of EMPLOYES) {
    const id = await query('SELECT id_employee FROM employee WHERE matricule = ?', [matricule]);
    if (id.length) {
      bump(existing, 'employee');
      continue;
    }
    await query('INSERT INTO employee (matricule, nom, prenom, notes) VALUES (?, ?, ?, ?)', [
      matricule,
      nom,
      prenom,
      notes,
    ]);
    bump(inserted, 'employee');
  }
}

async function seedFamilles() {
  for (const [code, nom, description] of FAMILLES) {
    const id = await query('SELECT id_famille FROM famille_default WHERE code = ?', [code]);
    if (id.length) {
      bump(existing, 'famille');
      continue;
    }
    await query('INSERT INTO famille_default (code, nom, description) VALUES (?, ?, ?)', [
      code,
      nom,
      description,
    ]);
    bump(inserted, 'famille');
  }
}

async function seedAqls() {
  for (const [nom, description, idDetail, qteMin, qteMax, qteCritique, qteMineure, qteMajeure] of AQLS) {
    const id = await query('SELECT id_aql FROM aql WHERE nom = ?', [nom]);
    if (id.length) {
      bump(existing, 'aql');
      continue;
    }
    await query(
      `INSERT INTO aql (nom, description, id_detail_aql, qte_min, qte_max, qte_critique, qte_mineure, qte_majeure)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, description, idDetail, qteMin, qteMax, qteCritique, qteMineure, qteMajeure]
    );
    bump(inserted, 'aql');
  }
}

async function seedOrdres() {
  for (const [libelle, designation, qte, date, couleur, taille, niveau] of ORDRES) {
    const id = await query('SELECT id_order FROM orderFabrication WHERE libelle_order = ?', [libelle]);
    if (id.length) {
      bump(existing, 'ordre');
      continue;
    }
    await query(
      `INSERT INTO orderFabrication (libelle_order, designation_order, qte_demandee, date, couleur, taille, niveau)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [libelle, designation, qte, date, couleur, taille, niveau]
    );
    bump(inserted, 'ordre');
  }
}

async function seedProduits() {
  for (const [code, designation, libelle, niveau, quantite, nomAql, libelleOrder] of PRODUITS) {
    const id = await query('SELECT id_produit FROM produit WHERE code = ?', [code]);
    if (id.length) {
      bump(existing, 'produit');
      continue;
    }
    const idAql = await findId('SELECT id_aql FROM aql WHERE nom = ?', [nomAql]);
    const idOrder = await findId('SELECT id_order FROM orderFabrication WHERE libelle_order = ?', [libelleOrder]);
    await query(
      `INSERT INTO produit (code, designation, libelle_produit, niveau, quantite, id_aql, id_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, designation, libelle, niveau, quantite, idAql, idOrder]
    );
    bump(inserted, 'produit');
  }
}

async function seedInspections() {
  for (const [date, observations, typeCategorie, designation, codeProduit, emailUtilisateur, resultat] of INSPECTIONS) {
    const id = await query('SELECT id_inspection FROM inspection WHERE designation = ?', [designation]);
    if (id.length) {
      bump(existing, 'inspection');
      continue;
    }
    const idProduit = await findId('SELECT id_produit FROM produit WHERE code = ?', [codeProduit]);
    const idUtilisateur = await findId('SELECT id_utilisateur FROM utilisateur WHERE email = ?', [emailUtilisateur]);
    await query(
      `INSERT INTO inspection (date, observations, type_categorie, designation, id_produit, id_utilisateur, resultat)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, observations, typeCategorie, designation, idProduit, idUtilisateur, resultat]
    );
    bump(inserted, 'inspection');
  }
}

async function seedDefauts() {
  for (const [description, nombre, codeFamille, designationInspection, type, matricule] of DEFAUTS) {
    const idInspection = await findId('SELECT id_inspection FROM inspection WHERE designation = ?', [designationInspection]);
    const existingDefaut = idInspection
      ? await query('SELECT id_defaults FROM defaults WHERE description = ? AND id_inspection = ?', [description, idInspection])
      : [];
    if (existingDefaut.length) {
      bump(existing, 'defaut');
      continue;
    }
    const idFamille = await findId('SELECT id_famille FROM famille_default WHERE code = ?', [codeFamille]);
    const idEmployee = await findId('SELECT id_employee FROM employee WHERE matricule = ?', [matricule]);
    await query(
      `INSERT INTO defaults (description, image, nombre, id_famille, id_inspection, type, id_employee)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [description, null, nombre, idFamille, idInspection, type, idEmployee]
    );
    bump(inserted, 'defaut');
  }
}

async function seedContacts() {
  for (const [nom, email, message] of CONTACTS) {
    const id = await query('SELECT id_contact FROM contacter WHERE email = ? AND message = ?', [email, message]);
    if (id.length) {
      bump(existing, 'contact');
      continue;
    }
    await query('INSERT INTO contacter (non_utilisateur, email, message) VALUES (?, ?, ?)', [nom, email, message]);
    bump(inserted, 'contact');
  }
}

function report() {
  console.log('\nInsertions :');
  for (const [k, v] of Object.entries(inserted)) console.log(`  + ${v}  ${k}`);
  console.log('Déjà présents (ignorés) :');
  for (const [k, v] of Object.entries(existing)) console.log(`  = ${v}  ${k}`);
}

async function counts() {
  const tables = [
    'utilisateur',
    'employee',
    'famille_default',
    'aql',
    'orderFabrication',
    'produit',
    'inspection',
    'defaults',
    'contacter',
  ];
  console.log('\nContenu actuel de la base :');
  for (const t of tables) {
    const r = await query(`SELECT COUNT(*) AS c FROM \`${t}\``);
    console.log(`  ${t.padEnd(18)} ${r[0].c}`);
  }
}

(async () => {
  try {
    await seedUtilisateurs();
    await seedEmployes();
    await seedFamilles();
    await seedAqls();
    await seedOrdres();
    await seedProduits();
    await seedInspections();
    await seedDefauts();
    await seedContacts();

    report();
    await counts();
    console.log('\nSeed terminé.');
  } catch (error) {
    console.error('Erreur pendant le seed :', error.message);
    process.exitCode = 1;
  } finally {
    pool.end();
  }
})();

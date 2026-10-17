'use strict';

// Initialisation du schéma de base de données.
// Ce module est importé pour ses effets de bord au démarrage du serveur :
// il crée les tables manquantes si elles n'existent pas.
require('dotenv').config();

const bcrypt = require('bcrypt');
const { query } = require('./database');

// Crée une table si elle n'existe pas encore.
async function createTable(sql, successMessage) {
  try {
    await query(sql);
    console.log(successMessage);
  } catch (error) {
    console.error('Erreur lors de la création de la table :', error.message);
  }
}

// Ajoute une colonne si elle n'existe pas déjà (compatible MySQL 8 / MariaDB).
async function ensureColumn(table, column, definition) {
  const rows = await query(
    `SELECT COUNT(*) AS count FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  if (rows[0].count === 0) {
    await query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
    console.log(`Colonne ${column} ajoutée à la table ${table}`);
  }
}

// Convertit les mots de passe encore stockés en clair en hachages bcrypt.
// Permet de ne pas casser les comptes créés avant la mise en place du hachage.
async function migratePlaintextPasswords() {
  const utilisateurs = await query('SELECT id_utilisateur, mot_de_passe FROM utilisateur');
  for (const utilisateur of utilisateurs) {
    const motDePasse = utilisateur.mot_de_passe;
    if (motDePasse && !motDePasse.startsWith('$2')) {
      const hashedPassword = await bcrypt.hash(motDePasse, 10);
      await query('UPDATE utilisateur SET mot_de_passe = ? WHERE id_utilisateur = ?', [
        hashedPassword,
        utilisateur.id_utilisateur,
      ]);
      console.log(`Mot de passe de l'utilisateur #${utilisateur.id_utilisateur} haché`);
    }
  }
}

async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
    const motDePasse = process.env.ADMIN_PASSWORD || 'admin.admin';
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    await query(
      `INSERT IGNORE INTO utilisateur (id_utilisateur, email, mot_de_passe, nom, prenom, role)
       VALUES (1, ?, ?, 'admin', 'admin', 'admin')`,
      [adminEmail, hashedPassword]
    );
    // Garantit que le compte admin a bien le rôle 'admin' (même s'il existait déjà).
    await query("UPDATE utilisateur SET role = 'admin' WHERE email = ?", [adminEmail]);
    console.log('Administrateur par défaut vérifié avec succès');
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur :', error.message);
  }
}

async function initDatabase() {
  const createTableQueries = [
    {
      query: `CREATE TABLE IF NOT EXISTS orderFabrication (
        id_order INT PRIMARY KEY AUTO_INCREMENT,
        libelle_order VARCHAR(50) NOT NULL,
        designation_order VARCHAR(50) NOT NULL,
        qte_demandee INT NOT NULL,
        date DATE,
        couleur VARCHAR(50),
        taille VARCHAR(50),
        niveau INT
      )`,
      successMessage: 'Table orderFabrication créée avec succès',
    },
    {
      query: `CREATE TABLE IF NOT EXISTS utilisateur (
        id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        mot_de_passe VARCHAR(255),
        nom VARCHAR(255),
        prenom VARCHAR(255),
        role VARCHAR(20) NOT NULL DEFAULT 'user'
      )`,
      successMessage: 'Table utilisateur créée avec succès',
    },
    {
      query: `CREATE TABLE IF NOT EXISTS employee (
        id_employee INT AUTO_INCREMENT PRIMARY KEY,
        matricule INT,
        nom VARCHAR(255),
        prenom VARCHAR(255),
        notes INT
      )`,
      successMessage: 'Table employee créée avec succès',
    },
    {
      query: `CREATE TABLE IF NOT EXISTS famille_default (
        id_famille INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(255),
        description VARCHAR(255),
        nom VARCHAR(255)
      )`,
      successMessage: 'Table famille_default créée avec succès',
    },
    {
      query: `CREATE TABLE IF NOT EXISTS aql (
        id_aql INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255),
        description TEXT,
        id_detail_aql INT,
        qte_min INT,
        qte_max INT,
        qte_critique INT,
        qte_mineure INT,
        qte_majeure INT
      )`,
      successMessage: 'Table aql créée avec succès',
    },
    {
      query: `CREATE TABLE IF NOT EXISTS produit (
        id_produit INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(255),
        designation VARCHAR(255),
        libelle_produit VARCHAR(255),
        niveau INT,
        quantite INT,
        id_aql INT,
        id_order INT,
        FOREIGN KEY (id_aql) REFERENCES aql(id_aql) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_order) REFERENCES orderFabrication(id_order) ON DELETE CASCADE ON UPDATE CASCADE
      )`,
      successMessage: 'Table produit créée avec succès',
    },
    {
      query: `CREATE TABLE IF NOT EXISTS inspection (
        id_inspection INT AUTO_INCREMENT PRIMARY KEY,
        date DATE,
        observations TEXT,
        type_categorie VARCHAR(255),
        designation VARCHAR(255),
        id_produit INT,
        id_utilisateur INT,
        resultat VARCHAR(255),
        FOREIGN KEY (id_produit) REFERENCES produit(id_produit) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE
      )`,
      successMessage: 'Table inspection créée avec succès',
    },
    {
      query: `CREATE TABLE IF NOT EXISTS defaults (
        id_defaults INT AUTO_INCREMENT PRIMARY KEY,
        description TEXT,
        image VARCHAR(255),
        nombre INT,
        id_famille INT,
        id_inspection INT,
        type VARCHAR(255),
        id_employee INT,
        FOREIGN KEY (id_famille) REFERENCES famille_default(id_famille) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_inspection) REFERENCES inspection(id_inspection) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_employee) REFERENCES employee(id_employee) ON DELETE CASCADE ON UPDATE CASCADE
      )`,
      successMessage: 'Table defaults créée avec succès',
    },
    {
      query: `INSERT IGNORE INTO inspection (id_inspection, date, observations, type_categorie, designation, id_produit, id_utilisateur, resultat)
              VALUES (1, '2024-08-29', 'par défaut', 'par défaut', 'par défaut', NULL, NULL, NULL)`,
      successMessage: 'Inspection par défaut vérifiée avec succès',
    },
    {
      query: `CREATE TABLE IF NOT EXISTS contacter (
        id_contact INT AUTO_INCREMENT PRIMARY KEY,
        non_utilisateur VARCHAR(255),
        email VARCHAR(255),
        message VARCHAR(255)
      )`,
      successMessage: 'Table contacter créée avec succès',
    },
  ];

  try {
    for (const { query: sql, successMessage } of createTableQueries) {
      await createTable(sql, successMessage);
    }
    await ensureColumn('utilisateur', 'role', "role VARCHAR(20) NOT NULL DEFAULT 'user'");
    await migratePlaintextPasswords();
    await seedAdmin();
    console.log('Initialisation de la base de données terminée.');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données :', error.message);
  }
}

initDatabase();

module.exports = { initDatabase };

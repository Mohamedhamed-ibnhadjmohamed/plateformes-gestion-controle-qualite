const mysql = require('mysql');

// Configuration de la connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pfe'
});

// Fonction pour exécuter une requête SQL avec gestion des erreurs
function executeQuery(query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Fonction pour créer une table si elle n'existe pas
async function createTable(query, successMessage) {
  try {
    await executeQuery(query);
    console.log(successMessage);
  } catch (error) {
    console.error('Erreur lors de la création de la table:', error);
  }
}

// Connexion à la base de données
connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion :', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');

  // Liste des requêtes de création de tables
   // Liste des requêtes de création de tables
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
      successMessage: 'Table orderFabrication creée avec succès'
    },
    {
      query: `
        CREATE TABLE IF NOT EXISTS utilisateur (
          id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) unique ,
          mot_de_passe VARCHAR(255),
          nom VARCHAR(255),
          prenom VARCHAR(255)
        )`,
      successMessage: 'Table utilisateur créée avec succès'
     },
     {
       "query": "INSERT IGNORE INTO utilisateur (id_utilisateur, email, mot_de_passe, nom, prenom) VALUES ('1', 'admin@admin.com', 'admin.admin', 'admin', 'admin');",
       "successMessage": "Ajouter admin  avec succès"
    },
    {
      query: `
        CREATE TABLE IF NOT EXISTS employee (
          id_employee INT AUTO_INCREMENT PRIMARY KEY,
          matricule INT,
          nom VARCHAR(255),
          prenom VARCHAR(255),
          notes INT
        )`,
      successMessage: 'Table employee créée avec succès'
    },

    {
      query: `
        CREATE TABLE IF NOT EXISTS famille_default (
          id_famille INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(255),
          description VARCHAR(255),
          nom VARCHAR(255)
        )`,
      successMessage: 'Table famille_default créée avec succès'
    },
    {
      query: `
        CREATE TABLE IF NOT EXISTS aql (
          id_aql INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(255),
          description TEXT,
          id_detail_aql INT,
          qte_min INT,
          qte_max INT,
          qte_critique INT ,
          qte_mineure INT,
          qte_majeure INT
        )`,
      successMessage: 'Table aql créée avec succès'
    },
    {
      query: `
        CREATE TABLE IF NOT EXISTS produit (
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
      successMessage: 'Table produit créée avec succès'
    },
    {
      query: `
        CREATE TABLE IF NOT EXISTS inspection (
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
      successMessage: 'Table inspection créée avec succès'
    },
    {
      query: `
        CREATE TABLE IF NOT EXISTS defaults (
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
      successMessage: 'Table defaults créée avec succès'
    },
    {
      "query": "INSERT IGNORE INTO inspection (id_inspection, date, observations, type_categorie, designation, id_produit, id_utilisateur, resultat) VALUES ('1', '2024-08-29', 'par défaut', 'par défaut', 'par défaut', NULL, NULL, NULL);",
      "successMessage": "Ajouter avec succès"
     },
     {
       query: `
        CREATE TABLE IF NOT EXISTS contacter (
          id_contact INT AUTO_INCREMENT PRIMARY KEY,
          non_utilisateur VARCHAR(255),
          email VARCHAR(255),
          message VARCHAR(255)
        )`,
       successMessage: 'Table contacter créée avec succès'
     }
    
  ];

  // Exécution des requêtes de création de tables
  createTableQueries.reduce((promise, { query, successMessage }) => {
    return promise.then(() => createTable(query, successMessage));
  }, Promise.resolve())
    .then(() => {
      // Toutes les tables ont été créées avec succès
      console.log('Toutes les tables ont été créées avec succès');
      // Fermeture de la connexion à la base de données
      connection.end();
    })
    .catch((error) => {
      console.error('Une erreur s\'est produite lors de la création des tables:', error);
      // Fermeture de la connexion à la base de données en cas d'erreur
      connection.end();
    });
});
'use strict';
// Assurez-vous d'importer correctement le module MySQL
const mysql = require('mysql');

// Assurez-vous que dbConn est initialisé avec une connexion MySQL valide
const dbConn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pfe'
});

// Connectez-vous à la base de données
dbConn.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données : ' + err.stack);
    return;
  }
  console.log('Connecté à la base de données MySQL.');
});

// Inspection object create
var Inspection = function (inspection) {
    this.id_inspection = inspection.id_inspection;
    this.date = inspection.date;
    this.observations = inspection.observations;
    this.type_categorie = inspection.type_categorie;
    this.designation = inspection.designation;
    this.id_produit = inspection.id_produit;
    this.id_utilisateur = inspection.id_utilisateur;
    this.resultat = inspection.resultat;
};

Inspection.create = function (newInspection, result) {
    dbConn.query("INSERT INTO inspection SET ?", newInspection, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            console.log(res.insertId);
            result(null, res.insertId);
        }
    });
};

Inspection.findById = function (id, result) {
    dbConn.query("SELECT * FROM inspection WHERE id_inspection = ?", id, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

Inspection.findAll = function (result) {
    dbConn.query("SELECT * FROM inspection WHERE id_inspection > 1 order by date desc; ", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            console.log('inspections : ', res);
            result(null, res);
        }
    });
};

Inspection.update = function (id, inspection, result) {
    dbConn.query("UPDATE inspection SET date=?, observations=?, type_categorie=?, designation=?, id_produit=?, id_utilisateur=? , resultat=? WHERE id_inspection = ?", 
    [inspection.date, inspection.observations, inspection.type_categorie, inspection.designation, inspection.id_produit, inspection.id_utilisateur, inspection.resultat,id], 
    function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        } else {
            result(null, res);
        }
    });
};

Inspection.delete = function (id, result) {
    dbConn.query("DELETE FROM inspection WHERE id_inspection = ? ", id, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            result(null, res);
        }
    });
};

Inspection.findMaxId = function (result) {
    dbConn.query("SELECT MAX(id_inspection) AS maxId FROM inspection", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            result(null, res[0].maxId);
        }
    });
};

Inspection.findconsultation = function (id_inspection, result) {
    dbConn.query(`
        SELECT 
            inspection.*,
            produit.*,
            utilisateur.*,
            aql.nom AS aql_nom,
            aql.description AS aql_description,
            aql.qte_min AS detail_aql_qte_min,
            aql.qte_max AS detail_aql_qte_max,
            aql.qte_critique AS detail_aql_qte_critique,
            aql.qte_mineure AS detail_aql_qte_mineure,
            aql.qte_majeure AS detail_aql_qte_majeure,
            orderfabrication.libelle_order AS orderfabrication_libelle,
            orderfabrication.designation_order AS orderfabrication_designation,
            orderfabrication.qte_demandee AS orderfabrication_qte_demandee,
            orderfabrication.couleur AS orderfabrication_couleur,
            orderfabrication.taille AS orderfabrication_taille,
            orderfabrication.niveau AS orderfabrication_niveau
        FROM 
            inspection
        LEFT JOIN 
            produit ON inspection.id_produit = produit.id_produit
        LEFT JOIN 
            utilisateur ON inspection.id_utilisateur = utilisateur.id_utilisateur
        LEFT JOIN 
            aql ON produit.id_aql = aql.id_aql
        LEFT JOIN  
            orderfabrication ON produit.id_order = orderfabrication.id_order
        WHERE 
            inspection.id_inspection = ?
    `, [id_inspection], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        } else {
            console.log('inspections : ', res);
            result(null, res);
        }
    });
};
Inspection.recherche = function (rech, result) {
    const query = "SELECT * FROM inspection WHERE observations LIKE ?";
    const formattedRecherche = `%${rech}%`;

    dbConn.query(query, [formattedRecherche], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

module.exports = Inspection;

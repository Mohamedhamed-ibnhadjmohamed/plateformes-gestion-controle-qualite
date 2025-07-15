'use strict';
const mysql = require('mysql');

const dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pfe'
});

dbConn.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données : ' + err.stack);
        return;
    }
    console.log('Connecté à la base de données MySQL.');
});

// Define the Aql model
var Aql = function (aql) {
    this.nom = aql.nom;
    this.description = aql.description;
    this.id_detail_aql = aql.id_detail_aql;
    this.qte_min = aql.qte_min;
    this.qte_max = aql.qte_max;
    this.qte_critique = aql.qte_critique;
    this.qte_mineure = aql.qte_mineure;
    this.qte_majeure = aql.qte_majeure;
};

// Create a new Aql record
Aql.create = function (newAql, result) {
    dbConn.query("INSERT INTO aql SET ?", newAql, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            console.log(res.insertId);
            result(null, res.insertId);
        }
    });
};

// Find an Aql record by its ID
Aql.findById = function (id, result) {
    dbConn.query("SELECT * FROM aql WHERE id_aql = ?", id, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

// Get all Aql records
Aql.findAll = function (result) {
    dbConn.query("SELECT * FROM aql", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        } else {
            console.log('AQL : ', res);
            result(null, res);
        }
    });
};

// Update an Aql record by its ID
Aql.update = function (id, aql, result) {
    dbConn.query(
        "UPDATE aql SET nom=?, description=?, id_detail_aql=?, qte_min=?, qte_max=?, qte_critique=?, qte_mineure=?, qte_majeure=? WHERE id_aql = ?",
        [aql.nom, aql.description, aql.id_detail_aql, aql.qte_min, aql.qte_max, aql.qte_critique, aql.qte_mineure, aql.qte_majeure, id],
        function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(null, err);
            } else {
                result(null, res);
            }
        }
    );
};

// Delete an Aql record by its ID
Aql.delete = function (id, result) {
    dbConn.query("DELETE FROM aql WHERE id_aql = ?", [id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        } else {
            result(null, res);
        }
    });
};

// Find Aql records by name with partial match
Aql.findByName = function (nom, result) {
    const query = "SELECT * FROM aql WHERE nom LIKE ?";
    const formattedNom = `%${nom}%`;

    dbConn.query(query, [formattedNom], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

module.exports = Aql;

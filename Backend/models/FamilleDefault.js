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

var FamilleDefault = function (famille) {
    this.code = famille.code;
    this.description = famille.description;
    this.nom = famille.nom;
};

FamilleDefault.create = function (newFamille, result) {
    dbConn.query("INSERT INTO famille_default SET ?", newFamille, function (err, res) {
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

FamilleDefault.findById = function (id, result) {
    dbConn.query("SELECT * FROM famille_default WHERE id_famille = ?", id, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

FamilleDefault.findAll = function (result) {
    dbConn.query("SELECT * FROM famille_default", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            console.log('familles par défaut : ', res);
            result(null, res);
        }
    });
};

FamilleDefault.update = function (id, famille, result) {
    dbConn.query("UPDATE famille_default SET code=?, description=?, nom=? WHERE id_famille = ?", 
    [famille.code, famille.description, famille.nom, id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        } else {
            result(null, res);
        }
    });
};

FamilleDefault.delete = function (id, result) {
    dbConn.query("DELETE FROM famille_default WHERE id_famille = ?", [id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            result(null, res);
        }
    });
};


FamilleDefault.recherche = function (rech, result) {
    const query = "SELECT * FROM famille_default WHERE nom LIKE ?";
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
module.exports = FamilleDefault;

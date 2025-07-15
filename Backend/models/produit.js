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

// Produit object create
var Produit = function (produit) {
    this.code = produit.code;
    this.designation = produit.designation;
    this.libelle_produit = produit.libelle_produit;
    this.niveau = produit.niveau;
    this.quantite = produit.quantite;
    this.id_aql = produit.id_aql;
    this.id_order = produit.id_order;
};

Produit.create = function (newProduit, result) {
    dbConn.query("INSERT INTO produit SET ?", newProduit, function (err, res) {
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


Produit.findAll = function (result) {
    dbConn.query("SELECT * FROM produit", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            console.log('produits : ', res);
            result(null, res);
        }
    });
};

Produit.update = function (id, produit, result) {
    dbConn.query("UPDATE produit SET code=?, designation=?, libelle_produit=?, niveau=?, quantite=?, id_aql=?, id_order=? WHERE id_produit = ?",
        [produit.code, produit.designation, produit.libelle_produit, produit.niveau, produit.quantite, produit.id_aql, produit.id_order, id], function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(null, err);
            } else {
                result(null, res);
            }
        });
};


Produit.delete = function (id, result) {
    dbConn.query("DELETE FROM produit WHERE id_produit = ?", [id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            result(null, res);
        }
    });
};

Produit.findById = function (id, result) {
    dbConn.query("SELECT * FROM produit WHERE id_produit = ?", [id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

Produit.findAllById = function (id, result) {
    dbConn.query(
        `SELECT * 
            FROM orderfabrication 
            JOIN produit ON orderfabrication.id_order = produit.id_order 
            JOIN aql ON produit.id_aql = aql.id_aql 
            WHERE produit.id_produit = ?`,
        [id],
        function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            } else {
                result(null, res);
            }
        }
    );
};

Produit.findByCode = function (code, result) {
    const query = "SELECT * FROM produit WHERE code LIKE ?";
    const formattedCode = `%${code}%`;

    dbConn.query(query, [formattedCode], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};


module.exports = Produit;

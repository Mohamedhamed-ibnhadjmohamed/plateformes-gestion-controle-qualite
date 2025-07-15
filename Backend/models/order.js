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

var orderFabrication = function (order) {
    this.libelle_order = order.libelle_order;
    this.designation_order = order.designation_order;
    this.qte_demandee = order.qte_demandee;
    this.date = order.date;
    this.couleur = order.couleur;
    this.taille = order.taille;
    this.niveau = order.niveau;
};

orderFabrication.create = function (neworder, result) {
    dbConn.query("INSERT INTO orderFabrication SET ?", neworder, function (err, res) {
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

orderFabrication.findById = function (id, result) {
    dbConn.query("SELECT * FROM orderFabrication WHERE id_order = ?", id, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

orderFabrication.findAll = function (result) {
    dbConn.query("SELECT * FROM orderFabrication", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            console.log('orders de fabrication : ', res);
            result(null, res);
        }
    });
};

orderFabrication.update = function (id, order, result) {
    dbConn.query(
        "UPDATE orderFabrication SET libelle_order=?, designation_order=?, qte_demandee=?, date=?, couleur=?, taille=?, niveau=? WHERE id_order = ?",
        [order.libelle_order, order.designation_order, order.qte_demandee, order.date, order.couleur, order.taille, order.niveau, id],
        function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            } else {
                console.log(res.affectedRows + " record(s) updated");
                result(null, res);
            }
        }
    );
};


orderFabrication.delete = function (id, result) {
    dbConn.query("DELETE FROM orderFabrication WHERE id_order = ?", [id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            result(null, res);
        }
    });
};

orderFabrication.getByLibelle = function (libelle, result) {
    // Utilisation de 'LIKE' avec des caractères de remplacement pour la recherche partielle
    const query = "SELECT * FROM orderFabrication WHERE libelle_order LIKE ?";
    const formattedLibelle = `%${libelle}%`;

    dbConn.query(query, [formattedLibelle], function (err, res) {
        if (err) {
            console.error("Erreur lors de la récupération des ordres de fabrication : ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};


module.exports = orderFabrication;

'use strict';
const mysql = require('mysql');

// Connexion à la base de données MySQL
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

// Constructeur contact
var Contact = function (contact) {
    this.non_utilisateur = contact.non_utilisateur;
    this.email = contact.email;
    this.message = contact.message;
};

// Créer un nouveau contact
Contact.create = function (newContact, result) {
    dbConn.query("INSERT INTO contacter SET ?", newContact, function (err, res) {
        if (err) {
            console.error("Erreur lors de la création du contact : ", err);
            result(err, null);
        } else {
            console.log('ID du contact inséré : ', res.insertId);
            result(null, res.insertId);
        }
    });
};

// Trouver un contact par son id


// Trouver tous les contacts
Contact.findAll = function (result) {
    dbConn.query("SELECT * FROM contacter", function (err, res) {
        if (err) {
            console.error("Erreur lors de la récupération des contacts : ", err);
            result(err, null);  
        } else {
            console.log('Liste des contacts : ', res);
            result(null, res); 
        }
    });
};


// Mettre à jour un contact
Contact.update = function (id, contact, result) {
    dbConn.query("UPDATE contacter SET non_utilisateur=?, email=?, message=? WHERE id_contact = ?",
        [contact.non_utilisateur, contact.email, contact.message, id],
        function (err, res) {
            if (err) {
                console.error("Erreur lors de la mise à jour du contact : ", err);
                result(null, err);
            } else if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
            } else {
                result(null, res);
            }
        });
};

// Supprimer un contact
Contact.delete = function (id, result) {
    // Exécution de la requête SQL pour supprimer le contact
    dbConn.query("DELETE FROM contacter WHERE id_contact = ?", [id], (err, res) => {
        if (err) {
            console.error("Erreur lors de la suppression du contact : ", err);
            result(err, null);
            return;
        }

        // Vérifier si un contact a été supprimé
        if (res.affectedRows === 0) {
            // Aucun contact trouvé avec l'ID donné
            result({ kind: "not_found" }, null);
            return;
        }

        console.log('Contact supprimé avec ID : ', id);
        result(null, res);
    });
};


Contact.recherche = function (rech, result) {
    const query = "SELECT * FROM contacter WHERE email LIKE ?";
    const formattedrecherche = `%${rech}%`;

    dbConn.query(query, [formattedrecherche], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

module.exports = Contact;

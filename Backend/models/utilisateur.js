'use strict';

const bcrypt = require('bcrypt');

const { pool: dbConn } = require('../config/database');

// Utilisateur object create
var Utilisateur = function (utilisateur) {
    this.email = utilisateur.email;
    this.mot_de_passe = utilisateur.mot_de_passe;
    this.nom = utilisateur.nom;
    this.prenom = utilisateur.prenom;
    this.role = utilisateur.role || 'user';
};
//ajouter un novel utilisateur
Utilisateur.Ajouter = function (newUser, result) {
    dbConn.query("INSERT INTO utilisateur set ?", newUser, function (err, res) {
        if (err) {
            console.error("error: ", err);
            result(err, null);
        }
        else {
            result(null, res.insertId);
        }
    });
};
Utilisateur.findByEmailAndPassword = function (email, mot_de_passe, result) {
    dbConn.query("SELECT * FROM utilisateur WHERE email = ? LIMIT 1", [email], async function (err, res) {
        if (err) {
            console.error("error: ", err);
            result(err, null);
        } else {
            if (res.length > 0) {
                const utilisateur = res[0];
                // Comparer le mot de passe fourni avec le mot de passe haché stocké
                const isMatch = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
                if (isMatch) {
                    result(null, utilisateur);
                } else {
                    result(null, null);
                }
            } else {
                result(null, null);
            }
        }
    });
};

//
Utilisateur.findById = function (id, result) {
    dbConn.query("SELECT id_utilisateur, email, nom, prenom, role FROM utilisateur WHERE id_utilisateur = ?", [id], function (err, res) {
        if (err) {
            console.error("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};





Utilisateur.findAll = function (result) {
    dbConn.query("SELECT id_utilisateur, email, nom, prenom, role FROM utilisateur ", function (err, res) {
        if (err) {
            console.error("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};
Utilisateur.update = function (id, utilisateur, result) {
    dbConn.query(
        "UPDATE utilisateur SET email=?, mot_de_passe=COALESCE(?, mot_de_passe), nom=?, prenom=? WHERE id_utilisateur = ?",
        [utilisateur.email, utilisateur.mot_de_passe ?? null, utilisateur.nom, utilisateur.prenom, id],
        function (err, res) {
        if (err) {
            console.error("error: ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};
Utilisateur.delete = function (id, result) {
    dbConn.query("DELETE FROM utilisateur WHERE id_utilisateur = ?", [id], function (err, res) {
        if (err) {
            console.error("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

Utilisateur.recherche = function (rech, result) {
    const query = "SELECT id_utilisateur, email, nom, prenom, role FROM utilisateur WHERE email LIKE ?";
    const formattedrecherche = `%${rech}%`;

    dbConn.query(query, [formattedrecherche], function (err, res) {
        if (err) {
            console.error("error: ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

Utilisateur.findByName = function (nom, result) {
    const query = "SELECT id_utilisateur, email, nom, prenom, role FROM utilisateur WHERE nom LIKE ?";
    const formattedNom = `%${nom}%`;

    dbConn.query(query, [formattedNom], function (err, res) {
        if (err) {
            console.error("error: ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

module.exports = Utilisateur;

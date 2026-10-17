'use strict';

const { pool: dbConn } = require('../config/database');

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
            result(err, null);
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
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

/**
 * Rapprochement des quantités par ordre de fabrication.
 *
 * Compare la quantité commandée (qte_demandee) à la somme des quantités
 * réellement enregistrées sur les produits rattachés à l'OF, et agrège les
 * inspections/défauts associés. Les sous-requêtes agrégées évitent tout
 * effet cartésien entre produits, inspections et défauts.
 */
orderFabrication.rapprochement = function (result) {
    const query = `
        SELECT
            o.id_order,
            o.libelle_order,
            o.designation_order,
            o.qte_demandee,
            o.date,
            o.couleur,
            o.taille,
            o.niveau,
            COALESCE(pr.qte_enregistree, 0)          AS qte_enregistree,
            o.qte_demandee - COALESCE(pr.qte_enregistree, 0) AS ecart,
            COALESCE(pr.nb_produits, 0)              AS nb_produits,
            COALESCE(ins.nb_inspections, 0)          AS nb_inspections,
            COALESCE(def.nb_defauts, 0)              AS nb_defauts
        FROM orderfabrication o
        LEFT JOIN (
            SELECT id_order, SUM(quantite) AS qte_enregistree, COUNT(*) AS nb_produits
            FROM produit
            GROUP BY id_order
        ) pr ON pr.id_order = o.id_order
        LEFT JOIN (
            SELECT p.id_order, COUNT(i.id_inspection) AS nb_inspections
            FROM produit p
            JOIN inspection i ON i.id_produit = p.id_produit
            GROUP BY p.id_order
        ) ins ON ins.id_order = o.id_order
        LEFT JOIN (
            SELECT p.id_order, SUM(d.nombre) AS nb_defauts
            FROM produit p
            JOIN inspection i ON i.id_produit = p.id_produit
            JOIN defaults d ON d.id_inspection = i.id_inspection
            GROUP BY p.id_order
        ) def ON def.id_order = o.id_order
        ORDER BY o.date DESC, o.id_order DESC
    `;
    dbConn.query(query, function (err, res) {
        if (err) {
            console.error('error: ', err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

/**
 * Quantité commandée et quantité déjà enregistrée pour un OF.
 * `exclureIdProduit` permet d'ignorer un produit existant (mise à jour).
 */
orderFabrication.suiviQuantite = function (idOrder, exclureIdProduit, result) {
    const query = `
        SELECT
            o.id_order,
            o.libelle_order,
            o.qte_demandee,
            COALESCE((SELECT SUM(quantite) FROM produit
                      WHERE id_order = ? ${exclureIdProduit ? 'AND id_produit != ?' : ''}), 0) AS qte_enregistree
        FROM orderfabrication o
        WHERE o.id_order = ?
    `;
    // La première occurrence de '?' est celle de la sous-requête ; la
    // dernière correspond au WHERE principal.
    const queryParams = exclureIdProduit
        ? [idOrder, exclureIdProduit, idOrder]
        : [idOrder, idOrder];
    dbConn.query(query, queryParams, function (err, res) {
        if (err) {
            console.error('error: ', err);
            result(err, null);
        } else {
            result(null, res && res.length > 0 ? res[0] : null);
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

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

var Defaults = function (defaults) {
    this.description = defaults.description;
    this.image = defaults.image;
    this.nombre = defaults.nombre;
    this.id_famille = defaults.id_famille;
    this.id_inspection = defaults.id_inspection;
    this.type = defaults.type;
    this.id_employee = defaults.id_employee;
};

Defaults.create = function (newDefaults, result) {
    dbConn.query("INSERT INTO defaults SET ?", newDefaults, function (err, res) {
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

Defaults.findById = function (id, result) {
    dbConn.query("SELECT * FROM defaults WHERE id_defaults = ?", id, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

Defaults.findAll = function (result) {
    dbConn.query("SELECT * FROM defaults", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            console.log('Defaults : ', res);
            result(null, res);
        }
    });
};

Defaults.update = function (id, defaults, result) {
    dbConn.query("UPDATE defaults SET description=?, image=?, nombre=?, id_famille=?, id_inspection=?, type=?, id_employee=? WHERE id_defaults = ?",
        [defaults.description, defaults.image, defaults.nombre, defaults.id_famille, defaults.id_inspection, defaults.type, defaults.id_employee, id], function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(null, err);
            } else {
                result(null, res);
            }
        });
};

Defaults.delete = function (id, result) {
    dbConn.query("DELETE FROM defaults WHERE id_defaults = ?", [id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            result(null, res);
        }
    });
};

Defaults.findByIdInspection = function (id, result) {
    dbConn.query("SELECT * FROM defaults WHERE id_inspection = ?", id, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

Defaults.updateIdInspection = function (result) {
    const query = `
        UPDATE defaults 
        SET id_inspection = (SELECT MAX(id_inspection) FROM inspection) 
        WHERE id_inspection = 1
    `;

    dbConn.query(query, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        } else {
            result(null, res);
        }
    });
};

Defaults.deleteInspection = function (result) {
    dbConn.query("DELETE FROM defaults WHERE id_inspection = 1", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        } else {
            result(null, res);
        }
    });
};


Defaults.recherche = function (rech, result) {
    const query = "SELECT * FROM defaults WHERE description LIKE ?";
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


module.exports = Defaults;

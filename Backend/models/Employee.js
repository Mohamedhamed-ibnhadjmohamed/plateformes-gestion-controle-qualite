'use strict';

const { pool: dbConn } = require('../config/database');

var Employee = function (employee) {
    this.matricule = employee.matricule;
    this.nom = employee.nom;
    this.prenom = employee.prenom;
    this.notes = employee.notes;
};

Employee.create = function (newEmployee, result) {
    dbConn.query("INSERT INTO employee SET ?", newEmployee, function (err, res) {
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

Employee.findById = function (id, result) {
    dbConn.query("SELECT * FROM employee WHERE id_employee = ?", id, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

Employee.findAll = function (result) {
    dbConn.query("SELECT * FROM employee", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            console.log('employees : ', res);
            result(null, res);
        }
    });
};

Employee.update = function (id, employee, result) {
    dbConn.query("UPDATE employee SET matricule=?, nom=?, prenom=?, notes=? WHERE id_employee = ?", 
    [employee.matricule, employee.nom, employee.prenom, employee.notes, id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

Employee.delete = function (id, result) {
    dbConn.query("DELETE FROM employee WHERE id_employee = ?", [id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            result(null, res);
        }
    });
};

Employee.recherche = function (rech, result) {
    const query = "SELECT * FROM employee WHERE prenom LIKE ?";
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

module.exports = Employee;

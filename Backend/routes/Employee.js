const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Ajouter un employé
router.post('/add', (req, res) => {
    const { matricule, nom, prenom, notes } = req.body;

    // Créez un nouvel employé
    const newEmployee = new Employee({
        matricule: matricule,
        nom: nom,
        prenom: prenom,
        notes: notes
    });

    // Enregistrez le nouvel employé dans la base de données MySQL
    Employee.create(newEmployee, (error, result) => {
        if (error) {
            console.error('Erreur lors de l\'insertion de l\'employé :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si l'insertion réussit, retournez une réponse avec le nouvel employé créé
        res.status(201).json({ message: 'Employé créé avec succès', data: result });
    });
});

// Récupérer tous les employés
router.get('/all', (req, res) => {
    // Utilisez la méthode findAll du modèle Employee pour récupérer tous les employés
    Employee.findAll((error, employees) => {
        if (error) {
            console.error('Erreur lors de la récupération des employés :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec la liste des employés
        res.status(200).json({ employés: employees });
    });
});

// Mettre à jour un employé
router.put('/update/:id', (req, res) => {
    const employeeId = req.params.id;
    const { matricule, nom, prenom, notes } = req.body;

    // Créer un objet contenant les mises à jour des champs de l'employé
    const updateEmployee = {
        matricule: matricule,
        nom: nom,
        prenom: prenom,
        notes: notes
    };

    // Utiliser la méthode update du modèle Employee pour mettre à jour l'employé dans la base de données
    Employee.update(employeeId, updateEmployee, (error, result) => {
        if (error) {
            console.error('Erreur lors de la mise à jour de l\'employé :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la mise à jour réussit, retourner une réponse avec l'employé mis à jour
        res.status(200).json({ message: 'Employé mis à jour avec succès', data: result });
    });
});

// Supprimer un employé
router.delete('/delete/:id', (req, res) => {
    const employeeId = req.params.id;

    // Utiliser la méthode delete du modèle Employee pour supprimer l'employé de la base de données
    Employee.delete(employeeId, (error, result) => {
        if (error) {
            console.error('Erreur lors de la suppression de l\'employé :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la suppression réussit, retourner une réponse avec un message de succès
        res.status(200).json({ message: 'Employé supprimé avec succès' });
    });
});


router.get('/rechercher/:rech', (req, res) => {
    const rech = req.params.rech;

    Employee.recherche(rech, (error, employees) => { // Renamed employee to employees
        if (error) {
            console.error('Erreur lors de la récupération :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        if (!employees || employees.length === 0) {
            return res.status(404).json({ error: 'Aucun employé trouvé' }); // Improved error message
        }

        res.status(200).json({ employees: employees }); // Corrected variable
    });
});
module.exports = router;

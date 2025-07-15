'use strict';
const express = require('express');
const router = express.Router();
const Inspection = require('../models/inspection');

// Ajouter une inspection
router.post('/add', (req, res) => {
    const { id_inspection,date, observations, type_categorie, designation, id_produit, id_utilisateur ,resultat } = req.body;

    // Créez une nouvelle inspection
    const newInspection = new Inspection({
        id_inspection:id_inspection,
        date: date,
        observations: observations,
        type_categorie: type_categorie,
        designation: designation,
        id_produit: id_produit,
        id_utilisateur: id_utilisateur,
        resultat: resultat,

    });

    // Enregistrez la nouvelle inspection dans la base de données MySQL
    Inspection.create(newInspection, (error, result) => {
        if (error) {
            console.error('Erreur lors de l\'insertion de l\'inspection :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si l'insertion réussit, retournez une réponse avec la nouvelle inspection créée
        res.status(201).json({ message: 'Inspection créée avec succès', data: result });
    });
});

// Récupérer toutes les inspections
router.get('/all', (req, res) => {
    // Utilisez la méthode findAll du modèle Inspection pour récupérer toutes les inspections
    Inspection.findAll((error, inspections) => {
        if (error) {
            console.error('Erreur lors de la récupération des inspections :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec la liste des inspections
        res.status(200).json({ inspections: inspections });
    });
});

// Mettre à jour une inspection
router.put('/update/:id', (req, res) => {
    const inspectionId = req.params.id;
    const {date, observations, type_categorie, designation, id_produit, id_utilisateur, resultat } = req.body;

    // Créer un objet contenant les mises à jour des champs de l'inspection
    const updateInspection = {
        date: date,
        observations: observations,
        type_categorie: type_categorie,
        designation: designation,
        id_produit: id_produit,
        id_utilisateur: id_utilisateur,
        resultat: resultat
    };

    // Utiliser la méthode update du modèle Inspection pour mettre à jour l'inspection dans la base de données
    Inspection.update(inspectionId, updateInspection, (error, result) => {
        if (error) {
            console.error('Erreur lors de la mise à jour de l\'inspection :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la mise à jour réussit, retourner une réponse avec l'inspection mise à jour
        res.status(200).json({ message: 'Inspection mise à jour avec succès', data: result });
    });
});

// Supprimer une inspection
router.delete('/delete/:id', (req, res) => {
    const inspectionId = req.params.id;

    // Utiliser la méthode delete du modèle Inspection pour supprimer l'inspection de la base de données
    Inspection.delete(inspectionId, (error, result) => {
        if (error) {
            console.error('Erreur lors de la suppression de l\'inspection :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la suppression réussit, retourner une réponse avec un message de succès
        res.status(200).json({ message: 'Inspection supprimée avec succès' });
    });
});

router.get('/max', (req, res) => {
    // Utilisez la méthode findAll du modèle Inspection pour récupérer toutes les inspections
    Inspection.findMaxId((error, inspections) => {
        if (error) {
            console.error('Erreur lors de la récupération des max id d inspections :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec la liste des inspections
        res.status(200).json({ inspections: inspections });
    });
});
router.get('/consultation/:id', (req, res) => {
    // Récupérez l'ID de l'inspection à partir des paramètres de la requête
    const id_inspection = req.params.id;

    // Utilisez la méthode findconsultation du modèle Inspection pour récupérer l'inspection
    Inspection.findconsultation(id_inspection, (error, inspections) => {
        if (error) {
            console.error('Erreur lors de la récupération de l\'inspection :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec la liste des inspections
        res.status(200).json({ inspections: inspections });
    });
});


router.get('/rechercher/:rech', (req, res) => {
    const rech = req.params.rech;

    Inspection.recherche(rech, (error, inspection) => {
        if (error) {
            console.error('Erreur lors de la récupération :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Utilisation correcte de la variable inspection pour la réponse
        if (!inspection || inspection.length === 0) {
            return res.status(404).json({ error: 'Inspection non trouvée' });
        }

        res.status(200).json({ inspections: inspection });
    });
});

module.exports = router;

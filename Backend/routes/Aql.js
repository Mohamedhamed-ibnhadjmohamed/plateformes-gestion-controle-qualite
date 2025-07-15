const express = require('express');
const router = express.Router();
const Aql = require('../models/Aql');

// Ajouter un critère AQL
router.post('/add', (req, res) => {
    const { nom, description, id_detail_aql, qte_min, qte_max, qte_critique, qte_mineure, qte_majeure } = req.body;

    // Créez un nouveau critère AQL
    const newAql = new Aql({
        nom: nom,
        description: description,
        id_detail_aql: id_detail_aql,
        qte_min: qte_min,
        qte_max: qte_max,
        qte_critique: qte_critique,
        qte_mineure: qte_mineure,
        qte_majeure: qte_majeure
    });

    // Enregistrez le nouveau critère AQL dans la base de données MySQL
    Aql.create(newAql, (error, result) => {
        if (error) {
            console.error('Erreur lors de l\'insertion du critère AQL :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si l'insertion réussit, retournez une réponse avec le nouveau critère AQL créé
        res.status(201).json({ message: 'Critère AQL créé avec succès', data: result });
    });
});

// Récupérer tous les critères AQL
router.get('/all', (req, res) => {
    // Utilisez la méthode findAll du modèle Aql pour récupérer tous les critères AQL
    Aql.findAll((error, aqls) => {
        if (error) {
            console.error('Erreur lors de la récupération des critères AQL :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec la liste des critères AQL
        res.status(200).json({ aqls: aqls });
    });
});

// Mettre à jour un critère AQL
router.put('/update/:id', (req, res) => {
    const aqlId = req.params.id;
    const { nom, description, id_detail_aql, qte_min, qte_max, qte_critique, qte_mineure, qte_majeure } = req.body;

    // Créer un objet contenant les mises à jour des champs du critère AQL
    const updateAql = {
        nom: nom,
        description: description,
        id_detail_aql: id_detail_aql,
        qte_min: qte_min,
        qte_max: qte_max,
        qte_critique: qte_critique,
        qte_mineure: qte_mineure,
        qte_majeure: qte_majeure
    };

    // Utiliser la méthode update du modèle Aql pour mettre à jour le critère AQL dans la base de données
    Aql.update(aqlId, updateAql, (error, result) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du critère AQL :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la mise à jour réussit, retourner une réponse avec le critère AQL mis à jour
        res.status(200).json({ message: 'Critère AQL mis à jour avec succès', data: result });
    });
});

// Supprimer un critère AQL
router.delete('/delete/:id', (req, res) => {
    const aqlId = req.params.id;

    // Utiliser la méthode delete du modèle Aql pour supprimer le critère AQL de la base de données
    Aql.delete(aqlId, (error, result) => {
        if (error) {
            console.error('Erreur lors de la suppression du critère AQL :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la suppression réussit, retourner une réponse avec un message de succès
        res.status(200).json({ message: 'Critère AQL supprimé avec succès' });
    });
});

// Récupérer un critère AQL par son ID
router.get('/getid/:id', (req, res) => {
    const aqlId = req.params.id;

    // Utiliser la méthode findById du modèle Aql pour récupérer le critère AQL par son ID
    Aql.findById(aqlId, (error, aql) => {
        if (error) {
            console.error('Erreur lors de la récupération du critère AQL :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        if (!aql) {
            return res.status(404).json({ error: 'Critère AQL non trouvé' });
        }
        // Si la récupération réussit, retourner une réponse avec le critère AQL trouvé
        res.status(200).json({ aql: aql });
    });
});

// Récupérer un critère AQL par son nom
router.get('/getbynom/:nom', (req, res) => {
    const nom = req.params.nom; // Utiliser 'nom' au lieu de 'id'

    // Utiliser la méthode findByName du modèle Aql pour récupérer le critère AQL par son nom
    Aql.findByName(nom, (error, aql) => {
        if (error) {
            console.error('Erreur lors de la récupération du critère AQL :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        if (!aql || aql.length === 0) { // Vérifier si aql est vide ou non
            return res.status(404).json({ error: 'Critère AQL non trouvé' });
        }
        // Si la récupération réussit, retourner une réponse avec le critère AQL trouvé
        res.status(200).json({ aqls: aql });
    });
});

module.exports = router;

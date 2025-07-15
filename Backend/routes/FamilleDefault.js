const express = require('express');
const router = express.Router();
const FamilleDefault = require('../models/FamilleDefault');

// Ajouter une famille par défaut
router.post('/add', (req, res) => {
    const { code, description, nom } = req.body;

    // Créez une nouvelle famille par défaut
    const newFamille = new FamilleDefault({
        code: code,
        description: description,
        nom: nom
    });

    // Enregistrez la nouvelle famille par défaut dans la base de données MySQL
    FamilleDefault.create(newFamille, (error, result) => {
        if (error) {
            console.error('Erreur lors de l\'insertion de la famille par défaut :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si l'insertion réussit, retournez une réponse avec la nouvelle famille par défaut créée
        res.status(201).json({ message: 'Famille par défaut créée avec succès', data: result });
    });
});

router.get('/all', (req, res) => {
    // Utilisez la méthode findAll du modèle FamilleDefault pour récupérer toutes les familles par défaut
    FamilleDefault.findAll((error, familles) => {
        if (error) {
            console.error('Erreur lors de la récupération des familles par défaut :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec la liste des familles par défaut
        res.status(200).json({ familles: familles });
    });
});
// Mettre à jour une famille par défaut
router.put('/update/:id', (req, res) => {
    const familleId = req.params.id;
    const { code, description, nom } = req.body;

    // Créer un objet contenant les mises à jour des champs de la famille par défaut
    const updateFamille = {
        code: code,
        description: description,
        nom: nom
    };

    // Utiliser la méthode update du modèle FamilleDefault pour mettre à jour la famille par défaut dans la base de données
    FamilleDefault.update(familleId, updateFamille, (error, result) => {
        if (error) {
            console.error('Erreur lors de la mise à jour de la famille par défaut :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la mise à jour réussit, retourner une réponse avec la famille par défaut mise à jour
        res.status(200).json({ message: 'Famille par défaut mise à jour avec succès', data: result });
    });
});

// Supprimer une famille par défaut
router.delete('/delete/:id', (req, res) => {
    const familleId = req.params.id;

    // Utiliser la méthode delete du modèle FamilleDefault pour supprimer la famille par défaut de la base de données
    FamilleDefault.delete(familleId, (error, result) => {
        if (error) {
            console.error('Erreur lors de la suppression de la famille par défaut :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la suppression réussit, retourner une réponse avec un message de succès
        res.status(200).json({ message: 'Famille par défaut supprimée avec succès' });
    });
});


router.get('/rechercher/:rech', (req, res) => {
    const rech = req.params.rech;

    FamilleDefault.recherche(rech, (error, familles) => {  // Changed to 'defaults' for consistency
        if (error) {
            console.error('Erreur lors de la récupération :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        if (!familles || familles.length === 0) {
            return res.status(404).json({ error: 'Aucun familles trouvé' }); // Consistent error message
        }

        res.status(200).json({ familles: familles });
    });
});


module.exports = router;

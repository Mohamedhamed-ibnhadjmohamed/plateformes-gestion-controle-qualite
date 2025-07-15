const express = require('express');
const router = express.Router();
const Produit = require('../models/produit');

// Ajouter un produit
router.post('/add', (req, res) => {
    const { code, designation, libelle_produit, niveau, quantite, id_aql, id_order } = req.body;

    // Créez un nouveau produit
    const newProduit = new Produit({
        code: code,
        designation: designation,
        libelle_produit: libelle_produit,
        niveau: niveau,
        quantite: quantite,
        id_aql: id_aql,
        id_order: id_order
    });

    // Enregistrez le nouveau produit dans la base de données MySQL
    Produit.create(newProduit, (error, result) => {
        if (error) {
            console.error('Erreur lors de l\'insertion du produit :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si l'insertion réussit, retournez une réponse avec le nouveau produit créé
        res.status(201).json({ message: 'Produit créé avec succès', data: result });
    });
});

// Récupérer tous les produits
router.get('/all', (req, res) => {
    // Utilisez la méthode findAll du modèle Produit pour récupérer tous les produits
    Produit.findAll((error, produits) => {
        if (error) {
            console.error('Erreur lors de la récupération des produits :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec la liste des produits
        res.status(200).json({ produits: produits });
    });
});

// Mettre à jour un produit
router.put('/update/:id', (req, res) => {
    const produitId = req.params.id;
    const { code, designation, libelle_produit, niveau, quantite, id_aql, id_order } = req.body;

    // Créer un objet contenant les mises à jour des champs du produit
    const updateProduit = {
        code: code,
        designation: designation,
        libelle_produit: libelle_produit,
        niveau: niveau,
        quantite: quantite,
        id_aql: id_aql,
        id_order: id_order
    };

    // Utiliser la méthode update du modèle Produit pour mettre à jour le produit dans la base de données
    Produit.update(produitId, updateProduit, (error, result) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du produit :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la mise à jour réussit, retourner une réponse avec le produit mis à jour
        res.status(200).json({ message: 'Produit mis à jour avec succès', data: result });
    });
});

// Supprimer un produit
router.delete('/delete/:id', (req, res) => {
    const produitId = req.params.id;

    // Utiliser la méthode delete du modèle Produit pour supprimer le produit de la base de données
    Produit.delete(produitId, (error, result) => {
        if (error) {
            console.error('Erreur lors de la suppression du produit :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la suppression réussit, retourner une réponse avec un message de succès
        res.status(200).json({ message: 'Produit supprimé avec succès' });
    });
}); 7
router.get('/getid/:id', (req, res) => {
    const id = req.params.id;

    Produit.findById(id, (err, produit) => {
        if (err) {
            res.status(500).json({ error: 'Erreur serveur lors de la recherche du produit' });
        } else if (!produit) {
            res.status(404).json({ error: 'Produit non trouvé' });
        } else {
            res.status(200).json(produit);
        }
    });
});

router.get('/getallid/:id', (req, res) => {
    const id = req.params.id;

    Produit.findAllById(id, (err, produit) => {
        if (err) {
            res.status(500).json({ error: 'Erreur serveur lors de la recherche du produit' });
        } else if (!produit) {
            res.status(404).json({ error: 'Produit non trouvé' });
        } else {
            res.status(200).json(produit);
        }
    });
});

// Rechercher un produit par code
router.get('/getbycode/:code', (req, res) => {
    const code = req.params.code;

    Produit.findByCode(code, (error, produits) => {
        if (error) {
            console.error('Erreur lors de la récupération des produits :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec la liste des produits
        res.status(200).json({ produits: produits });
    });
});


module.exports = router;

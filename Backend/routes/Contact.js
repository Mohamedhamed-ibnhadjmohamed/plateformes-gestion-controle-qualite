const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Correctement importer le modèle Contact

// Ajouter un contact
router.post('/add', (req, res) => {
    const { non_utilisateur, email, message } = req.body;

    if (!non_utilisateur || !email || !message) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Créez un nouvel objet contact
    const newContact = { non_utilisateur, email, message };

    // Enregistrez le nouveau contact dans la base de données MySQL
    Contact.create(newContact, (error, result) => {
        if (error) {
            console.error('Erreur lors de l\'insertion du contact :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si l'insertion réussit, retournez une réponse avec le nouvel ID du contact créé
        res.status(201).json({ message: 'Contact créé avec succès', data: { id_contact: result } });
    });
});

// Récupérer tous les contacts
router.get('/all', (req, res) => {
    // Utilisez la méthode findAll du modèle Contact pour récupérer tous les contacts
    Contact.findAll((error, contacts) => {
        if (error) {
            console.error('Erreur lors de la récupération des contacts :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        if (contacts.length === 0) {
            return res.status(404).json({ message: 'Aucun contact trouvé' });
        }
        // Si la récupération réussit, retournez une réponse avec la liste des contacts
        res.status(200).json({ contacts: contacts });
    });
});

// Mettre à jour un contact
router.put('/update/:id', (req, res) => {
    const contactId = req.params.id;
    const { non_utilisateur, email, message } = req.body;

    if (!non_utilisateur || !email || !message) {
        return res.status(400).json({ error: 'Tous les champs sont requis pour la mise à jour' });
    }

    // Créer un objet contenant les mises à jour des champs du contact
    const updatedContact = { non_utilisateur, email, message };

    // Utiliser la méthode update du modèle Contact pour mettre à jour le contact dans la base de données
    Contact.update(contactId, updatedContact, (error, result) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du contact :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        // Vérification si le contact a été trouvé et mis à jour
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contact non trouvé' });
        }

        // Si la mise à jour réussit, retourner une réponse avec le contact mis à jour
        res.status(200).json({ message: 'Contact mis à jour avec succès' });
    });
});

// Supprimer un contact

router.delete('/delete/:id', (req, res) => {
    const contactId = req.params.id;

    // Utiliser la méthode delete du modèle Contact pour supprimer le contact
    Contact.delete(contactId, (error, result) => {
        if (error) {
            // Gestion des différents types d'erreurs
            if (error.kind === "not_found") {
                return res.status(404).json({ message: 'Contact non trouvé' });
            }
            console.error('Erreur lors de la suppression du contact :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        // Si la suppression réussit, retourner un message de succès
        res.status(200).json({ message: 'Contact supprimé avec succès' });
    });
});

router.get('/rechercher/:rech', (req, res) => {
    const rech = req.params.rech;

    Contact.recherche(rech, (error, contacts) => {
        if (error) {
            console.error('Erreur lors de la récupération :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        if (!contacts || contacts.length === 0) {
            return res.status(404).json({ error: 'contacts non trouvé' });
        }
        res.status(200).json({ contacts: contacts });
    });
});


module.exports = router;

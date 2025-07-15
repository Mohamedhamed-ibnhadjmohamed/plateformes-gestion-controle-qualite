const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Utilisateur = require('../models/utilisateur');

// Ajouter un utilisateur
router.post('/add', async (req, res) => {
    const { email, mot_de_passe, nom, prenom } = req.body;

    try {
        // Générer un sel et hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

        // Créez un nouvel utilisateur avec le mot de passe haché
        const newUser = new Utilisateur({
            email: email,
            mot_de_passe: hashedPassword,
            nom: nom,
            prenom: prenom
        });

        // Enregistrez le nouvel utilisateur dans la base de données
        Utilisateur.Ajouter(newUser, (error, result) => {
            if (error) {
                console.error('Erreur lors de l\'insertion de l\'utilisateur :', error);
                return res.status(500).json({ error: 'Erreur interne du serveur' });
            }
            // Si l'insertion réussit, retournez une réponse avec le nouvel utilisateur créé
            res.status(201).json({ message: 'Utilisateur créé avec succès', data: result });
        });
    } catch (error) {
        console.error('Erreur lors du hachage du mot de passe :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// 
router.get('/all', (req, res) => {
   
    Utilisateur.findAll((error, utilisateurs) => {
        if (error) {
            console.error('Erreur lors de la récupération des utilisateurs :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec la liste des utilisateurs
        res.status(200).json({ utilisateurs: utilisateurs });
    });
});

// Mettre à jour un utilisateur
router.put('/update/:id', async (req, res) => {
    const userId = req.params.id;
    const { email, mot_de_passe, nom, prenom } = req.body;

    // Créer un objet contenant les mises à jour des champs de l'utilisateur
    const updateUser = {
        email: email,
        nom: nom,
        prenom: prenom
    };

    try {
        if (mot_de_passe) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(mot_de_passe, salt);
            updateUser.mot_de_passe = hashedPassword;
        }

        Utilisateur.update(userId, updateUser, (error, result) => {
            if (error) {
                console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
                return res.status(500).json({ error: 'Erreur interne du serveur' });
            }
            res.status(200).json({ message: 'Utilisateur mis à jour avec succès', data: result });
        });
    } catch (error) {
        console.error('Erreur lors du hachage du mot de passe :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Supprimer un utilisateur
router.delete('/delete/:id', (req, res) => {
    const userId = req.params.id;

    // Utiliser la méthode delete du modèle Utilisateur pour supprimer l'utilisateur de la base de données
    Utilisateur.delete(userId, (error, result) => {
        if (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la suppression réussit, retourner une réponse avec un message de succès
        res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    });
});

router.get('/get/:id', (req, res) => {
    const userId = req.params.id;
    Utilisateur.findById(userId, (error, utilisateur) => {
        if (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec l'utilisateur trouvé
        res.status(200).json({ utilisateur: utilisateur });
    });
});

router.get('/getname/:name', (req, res) => {
    const username = req.params.name;
    Utilisateur.findByName(username, (error, utilisateur) => {
        if (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec l'utilisateur trouvé
        res.status(200).json({ utilisateur: utilisateur });
    });
});

router.get('/login/:email/:password', async (req, res) => {
    const email = req.params.email;
    const mot_de_passe = req.params.password;

    Utilisateur.findByEmailAndPassword(email, mot_de_passe, (error, utilisateur) => {
        if (error) {
            console.error('Erreur lors de la vérification des informations de connexion :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        if (!utilisateur) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        res.status(200).json({ utilisateur: utilisateur });
    });
});


router.get('/rechercher/:rech', (req, res) => {
    const rech = req.params.rech;

    Utilisateur.recherche(rech, (error, utilisateurs) => {
        if (error) {
            console.error('Erreur lors de la récupération :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        if (!utilisateurs || utilisateurs.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.status(200).json({ utilisateurs: utilisateurs });
    });
});




module.exports = router;

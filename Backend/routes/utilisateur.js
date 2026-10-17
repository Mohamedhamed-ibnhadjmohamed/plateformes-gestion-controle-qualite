const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Utilisateur = require('../models/utilisateur');
const { signToken } = require('../config/jwt');
const { requireAuth, requireRole } = require('../middleware/auth');

// Ne jamais exposer le mot de passe (même haché) dans une réponse API.
function toPublicUser(utilisateur) {
  if (!utilisateur) {
    return utilisateur;
  }
  const { mot_de_passe, ...publicUser } = utilisateur;
  return publicUser;
}

// Détecte une violation de contrainte d'unicité (email déjà utilisé).
function isDuplicateEntry(error) {
  return Boolean(error && error.code === 'ER_DUP_ENTRY');
}

// Authentification : renvoie l'utilisateur (sans mot de passe) et un token JWT.
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  Utilisateur.findByEmailAndPassword(email, password, (error, utilisateur) => {
    if (error) {
      console.error('Erreur lors de la vérification des informations de connexion :', error);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
    if (!utilisateur) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const publicUser = toPublicUser(utilisateur);
    const token = signToken(publicUser);
    res.status(200).json({ utilisateur: publicUser, token });
  });
});

// Ajouter un utilisateur
router.post('/add', async (req, res) => {
  const { email, mot_de_passe, nom, prenom } = req.body;

  if (!email || !mot_de_passe || !nom || !prenom) {
    return res
      .status(400)
      .json({ error: 'Email, mot de passe, nom et prénom sont requis' });
  }

  try {
    // Générer un sel et hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

    // Le rôle est imposé côté serveur pour éviter toute élévation de privilèges.
    const newUser = new Utilisateur({
      email: email,
      mot_de_passe: hashedPassword,
      nom: nom,
      prenom: prenom,
      role: 'user',
    });

    Utilisateur.Ajouter(newUser, (error, result) => {
      if (error) {
        if (isDuplicateEntry(error)) {
          return res.status(409).json({ error: 'Cet email est déjà utilisé' });
        }
        console.error('Erreur lors de l\'insertion de l\'utilisateur :', error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }
      res.status(201).json({ message: 'Utilisateur créé avec succès', data: result });
    });
  } catch (error) {
    console.error('Erreur lors du hachage du mot de passe :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

//
router.get('/all', requireAuth, requireRole('admin'), (req, res) => {
  Utilisateur.findAll((error, utilisateurs) => {
    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
    res.status(200).json({ utilisateurs: (utilisateurs || []).map(toPublicUser) });
  });
});

// Mettre à jour un utilisateur
router.put('/update/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const userId = req.params.id;
  const { email, mot_de_passe, nom, prenom } = req.body;

  const updateUser = {
    email: email,
    nom: nom,
    prenom: prenom,
  };

  try {
    if (mot_de_passe) {
      const salt = await bcrypt.genSalt(10);
      updateUser.mot_de_passe = await bcrypt.hash(mot_de_passe, salt);
    }

    Utilisateur.update(userId, updateUser, (error, result) => {
      if (error) {
        if (isDuplicateEntry(error)) {
          return res.status(409).json({ error: 'Cet email est déjà utilisé' });
        }
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
router.delete('/delete/:id', requireAuth, requireRole('admin'), (req, res) => {
  const userId = req.params.id;

  Utilisateur.delete(userId, (error, result) => {
    if (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur :', error);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  });
});

router.get('/get/:id', requireAuth, requireRole('admin'), (req, res) => {
  const userId = req.params.id;
  Utilisateur.findById(userId, (error, utilisateur) => {
    if (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur :', error);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
    res.status(200).json({ utilisateur: (utilisateur || []).map(toPublicUser) });
  });
});

router.get('/getname/:name', requireAuth, requireRole('admin'), (req, res) => {
  const username = req.params.name;
  Utilisateur.findByName(username, (error, utilisateur) => {
    if (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur :', error);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
    res.status(200).json({ utilisateur: (utilisateur || []).map(toPublicUser) });
  });
});

router.get('/rechercher/:rech', requireAuth, requireRole('admin'), (req, res) => {
  const rech = req.params.rech;

  Utilisateur.recherche(rech, (error, utilisateurs) => {
    if (error) {
      console.error('Erreur lors de la récupération :', error);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
    if (!utilisateurs || utilisateurs.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ utilisateurs: utilisateurs.map(toPublicUser) });
  });
});

module.exports = router;

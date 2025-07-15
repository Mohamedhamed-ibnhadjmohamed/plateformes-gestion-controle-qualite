const express = require('express');
const router = express.Router();
const Defaults = require('../models/Defaults');
const multer  = require('multer');
const path = require('path');



// Ajouter un default
router.post('/add', (req, res) => {
    const { description, image, nombre, id_famille, id_inspection, type, id_employee } = req.body;

    // Créez un nouveau default
    const newDefault = new Defaults({
        description: description,
        image: image,
        nombre: nombre,
        id_famille: id_famille,
        id_inspection: id_inspection,
        type: type,
        id_employee: id_employee
    });

    // Enregistrez le nouveau default dans la base de données MySQL
    Defaults.create(newDefault, (error, result) => {
        if (error) {
            console.error('Erreur lors de l\'insertion du default :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si l'insertion réussit, retournez une réponse avec le nouveau default créé
        res.status(201).json({ message: 'default créé avec succès', data: result });
    });
});

// Récupérer tous les critères AQL
router.get('/all', (req, res) => {
    // Utilisez la méthode findAll du modèle Defaults pour récupérer tous les critères AQL
    Defaults.findAll((error, defaults) => {
        if (error) {
            console.error('Erreur lors de la récupération de defaults :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la récupération réussit, retournez une réponse avec la liste des critères AQL
        res.status(200).json({ defaults: defaults });
    });
});

// Mettre à jour un default
router.put('/update/:id', (req, res) => {
    const defaultId = req.params.id;
    const { description, image, nombre, id_famille, id_inspection, type, id_employee } = req.body;

    // Créer un objet contenant les mises à jour des champs du default
    const updateDefault = {
        description: description,
        image: image,
        nombre: nombre,
        id_famille: id_famille,
        id_inspection: id_inspection,
        type: type,
        id_employee: id_employee
    };

    // Utiliser la méthode update du modèle Defaults pour mettre à jour le default dans la base de données
    Defaults.update(defaultId, updateDefault, (error, result) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du default :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la mise à jour réussit, retourner une réponse avec le default mis à jour
        res.status(200).json({ message: 'default mis à jour avec succès', data: result });
    });
});

// Supprimer un default
router.delete('/delete/:id', (req, res) => {
    const defaultId = req.params.id;

    // Utiliser la méthode delete du modèle Defaults pour supprimer le default de la base de données
    Defaults.delete(defaultId, (error, result) => {
        if (error) {
            console.error('Erreur lors de la suppression du default :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        // Si la suppression réussit, retourner une réponse avec un message de succès
        res.status(200).json({ message: 'default supprimé avec succès' });
    });
});

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(__dirname, '../../backend/upload')); // Utiliser le chemin absolu pour le dossier de destination
    },
    filename: function (req, file, cb) {
        // Ajouter la date au nom du fichier original
        const date = new Date().toISOString().replace(/:/g, '-'); // Formater la date
        const filename = `${date}-${file.originalname}`;
        cb(null, filename);
}});

const upload = multer({ storage: storage });

// Configurer Express pour servir les fichiers statiques depuis le dossier upload

router.post('/upload', upload.single('image'), (req, res) => {
    // Si le fichier est téléchargé avec succès, renvoyer le nom du fichier dans la réponse
    if (req.file) {
        const filename = req.file.originalname;
        res.json({ filename: filename });
    } else {
        // Si aucun fichier n'est téléchargé, renvoyer un message d'erreur
        res.status(400).send('Aucun fichier téléchargé.');
    }
});

router.get('/allidinspection/:id_inspection', (req, res) => {
    const id = req.params.id_inspection;
    Defaults.findByIdInspection(id, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Une erreur s'est produite lors de la récupération des données."
            });
        } else {
            res.send(data);
        }
    });
});


router.put('/update-id-inspection', (req, res) => {
    Defaults.updateIdInspection((err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Erreur lors de la mise à jour.',
                error: err
            });
        }
        res.status(200).json({
            message: 'Mise à jour réussie.',
            result: result
        });
    });
});

router.delete('/deletedefauts', (req, res) => {
    Defaults.deleteInspection((error, result) => {
        if (error) {
            console.error('Erreur lors de la suppression du default :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        res.status(200).json({ message: 'Default supprimé avec succès' });
    });
});


router.get('/rechercher/:rech', (req, res) => {
    const rech = req.params.rech;

    Defaults.recherche(rech, (error, defaults) => {  
        if (error) {
            console.error('Erreur lors de la récupération :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        if (!defaults || defaults.length === 0) {
            return res.status(404).json({ error: 'Aucun défaut trouvé' }); // Consistent error message
        }

        res.status(200).json({ defaults }); // Now consistent with 'defaults'
    });
});


module.exports = router;

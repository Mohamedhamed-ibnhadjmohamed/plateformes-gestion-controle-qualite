'use strict';
const express = require('express');
const router = express.Router();
const orderFabrication = require('../models/order');
const { requireRole, requireAuth } = require('../middleware/auth');

// Ajouter un order de fabrication
router.post('/add', (req, res) => {
    const { libelle_order, designation_order, qte_demandee, date, couleur, taille, niveau } = req.body;

    const neworder = new orderFabrication({
        libelle_order: libelle_order,
        designation_order: designation_order,
        qte_demandee: qte_demandee,
        date: date,
        couleur: couleur,
        taille: taille,
        niveau: niveau
    });

    orderFabrication.create(neworder, (error, result) => {
        if (error) {
            console.error('Erreur lors de l\'insertion de l\'order de fabrication :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        res.status(201).json({ message: 'order de fabrication créé avec succès', data: result });
    });
});

// Récupérer tous les orders de fabrication
router.get('/all', (req, res) => {
    orderFabrication.findAll((error, orders) => {
        if (error) {
            console.error('Erreur lors de la récupération des orders de fabrication :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        res.status(200).json({ orders: orders });
    });
});

// Mettre à jour un order de fabrication
router.put('/update/:id', requireRole('admin'), (req, res) => {
    const orderId = req.params.id;
    const { libelle_order, designation_order, qte_demandee,date, couleur, taille, niveau } = req.body;

    const updateorder = {
        libelle_order: libelle_order,
        designation_order: designation_order,
        qte_demandee: qte_demandee,
        date: date,
        couleur: couleur,
        taille: taille,
        niveau: niveau
    };

    orderFabrication.update(orderId, updateorder, (error, result) => {
        if (error) {
            console.error('Erreur lors de la mise à jour de l\'order de fabrication :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        res.status(200).json({ message: 'order de fabrication mis à jour avec succès', data: result });
    });
});

// Supprimer un order de fabrication
router.delete('/delete/:id', requireRole('admin'), (req, res) => {
    const orderId = req.params.id;

    orderFabrication.delete(orderId, (error, result) => {
        if (error) {
            console.error('Erreur lors de la suppression de l\'order de fabrication :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        res.status(200).json({ message: 'order de fabrication supprimé avec succès' });
    });
});

router.get('/getbylibelle/:libelle', (req, res) => {
    const libelle = req.params.libelle;

    orderFabrication.getByLibelle(libelle, (error, result) => {
        if (error) {
            console.error('Erreur lors de la récupération de l\'ordre de fabrication :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        res.status(200).json({ orders: result });
    });
});

// Rapport de rapprochement : quantité commandée vs quantité enregistrée,
// avec inspections et défauts agrégés par OF (réservé à l'administration).
router.get('/rapprochement', requireAuth, requireRole('admin'), (req, res) => {
    orderFabrication.rapprochement((error, lignes) => {
        if (error) {
            console.error('Erreur lors du rapprochement des quantités :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        res.status(200).json({ rapprochement: lignes || [] });
    });
});

// Contrôle à la saisie : quantité commandée et quantité déjà enregistrée
// pour un OF. `?exclure=<id_produit>` ignore un produit existant lors d'une
// mise à jour. Utilisé par les formulaires produit pour avertir d'un dépassement.
router.get('/:id/suivi-quantite', requireAuth, (req, res) => {
    const idOrder = req.params.id;
    const exclureIdProduit = req.query.exclure ? Number(req.query.exclure) : null;

    orderFabrication.suiviQuantite(idOrder, exclureIdProduit, (error, suivi) => {
        if (error) {
            console.error('Erreur lors du suivi de quantité :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        if (!suivi) {
            return res.status(404).json({ error: 'Ordre de fabrication non trouvé' });
        }
        const qteDemandee = Number(suivi.qte_demandee) || 0;
        const qteEnregistree = Number(suivi.qte_enregistree) || 0;
        res.status(200).json({
            id_order: suivi.id_order,
            libelle_order: suivi.libelle_order,
            qte_demandee: qteDemandee,
            qte_enregistree: qteEnregistree,
            qte_restante: qteDemandee - qteEnregistree,
        });
    });
});



module.exports = router;

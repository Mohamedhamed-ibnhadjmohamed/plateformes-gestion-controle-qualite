'use strict';
const express = require('express');
const router = express.Router();
const orderFabrication = require('../models/order');

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
router.put('/update/:id', (req, res) => {
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
router.delete('/delete/:id', (req, res) => {
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



module.exports = router;

'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const utilisateur = require('./routes/utilisateur');
const employee = require('./routes/Employee');
const familledefault = require('./routes/FamilleDefault');
const aql = require('./routes/Aql');
const produit = require('./routes/produit');
const inspection = require('./routes/inspection');
const defaults = require('./routes/Defaults');
const order = require('./routes/order');
const contact = require('./routes/Contact');
const { requireAuth } = require('./middleware/auth');

// Initialise la base de données (création des tables manquantes).
require('./config/connect');

const app = express();

// En-têtes HTTP de sécurité (masque aussi « X-Powered-By »).
// `crossOriginResourcePolicy` doit rester « cross-origin » : le front, servi
// depuis un autre port, affiche les images hébergées dans /upload.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Origines autorisées (séparées par des virgules dans CORS_ORIGIN).
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: corsOrigins, credentials: true }));

// Freine les attaques par force brute sur la connexion (10 essais / 15 min / IP).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
});
app.use('/utilisateur/login', loginLimiter);

app.use('/utilisateur', utilisateur);
app.use('/employee', requireAuth, employee);
app.use('/contact', requireAuth, contact);
app.use('/familledefault', requireAuth, familledefault);
app.use('/aql', requireAuth, aql);
app.use('/produit', requireAuth, produit);
app.use('/inspection', requireAuth, inspection);
app.use('/defaults', requireAuth, defaults);
app.use('/order', requireAuth, order);
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// Gestionnaire d'erreurs centralisé.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erreur interne du serveur' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

const express = require('express');
const utilisateur = require('./routes/utilisateur');
const employee = require('./routes/Employee');
const familledefault = require('./routes/FamilleDefault');
const aql = require('./routes/Aql');
const produit = require('./routes/produit');
const inspection = require('./routes/inspection');
const defaults = require('./routes/Defaults');
const order = require('./routes/order');
const contact = require('./routes/Contact');
const mysql = require('./config/connect');
const path = require("path");
const session = require('express-session');

const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
//http://127.0.0.1:3000

app.use('/utilisateur', utilisateur);
app.use('/employee', employee);
app.use('/contact', contact);
app.use('/familledefault', familledefault);
app.use('/aql', aql);
app.use('/produit', produit);
app.use('/inspection', inspection);
app.use('/defaults', defaults);
app.use('/order', order);
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
  }));





app.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});
    

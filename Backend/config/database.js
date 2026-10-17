'use strict';

// Point d'entrée unique pour la configuration et la connexion MySQL.
// Toutes les variables sensibles viennent du fichier .env (voir .env.example).
require('dotenv').config();

const mysql = require('mysql');

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'pfe',
  DB_CONNECTION_LIMIT = '10',
} = process.env;

// Pool de connexions partagé : évite de recréer une connexion par fichier
// et gère automatiquement la libération des connexions.
const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectionLimit: Number(DB_CONNECTION_LIMIT),
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
});

/**
 * Exécute une requête SQL et renvoie une Promise.
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {Promise<any>}
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = { pool, query };

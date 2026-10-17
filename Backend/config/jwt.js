'use strict';

// Génération et vérification de tokens JWT (HS256) avec le module natif `crypto`.
// Implémentation volontairement sans dépendance externe : la dépendance
// `jsonwebtoken` n'est plus compatible avec les versions récentes de Node.
require('dotenv').config();

const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-a-remplacer';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

function base64urlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(input) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf8');
}

function sign(data) {
  return crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Convertit une durée type "1d", "2h", "30m", "60s" (ou un nombre de secondes) en secondes.
function parseExpiresIn(value) {
  if (typeof value === 'number') {
    return value;
  }
  const match = /^(\d+)([smhd])?$/.exec(String(value).trim());
  if (!match) {
    return 86400; // 1 jour par défaut
  }
  const amount = Number(match[1]);
  const unit = match[2] || 's';
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * multipliers[unit];
}

/**
 * Signe un token pour un utilisateur.
 * @param {{ id_utilisateur: number, email: string, role?: string }} utilisateur
 * @returns {string}
 */
function signToken(utilisateur) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    id_utilisateur: utilisateur.id_utilisateur,
    email: utilisateur.email,
    role: utilisateur.role || 'user',
    iat: now,
    exp: now + parseExpiresIn(JWT_EXPIRES_IN),
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;

  return `${unsigned}.${sign(unsigned)}`;
}

/**
 * Vérifie un token et renvoie son contenu, ou null si invalide/expiré.
 * @param {string} token
 * @returns {object|null}
 */
function verifyToken(token) {
  try {
    const parts = String(token).split('.');
    if (parts.length !== 3) {
      return null;
    }
    const [encodedHeader, encodedPayload, signature] = parts;
    const expected = sign(`${encodedHeader}.${encodedPayload}`);

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(base64urlDecode(encodedPayload));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

module.exports = { signToken, verifyToken };

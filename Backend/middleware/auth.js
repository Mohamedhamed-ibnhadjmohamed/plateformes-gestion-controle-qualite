'use strict';

// Middleware d'authentification JWT.
// Protège une route : `router.get('/x', requireAuth, handler)`.
// `requireRole` restreint en plus l'accès à certains rôles (ex. « admin »).
const { verifyToken } = require('../config/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token manquant ou mal formé' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }

  req.user = payload;
  next();
}

// Restreint l'accès à un ou plusieurs rôles, ex : requireRole('admin').
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };

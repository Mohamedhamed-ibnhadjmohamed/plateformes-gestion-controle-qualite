# Plateforme de gestion du contrôle qualité

Application web de gestion du contrôle qualité en production : saisie d'inspections
et de défauts aux différents postes de contrôle, administration des données de
référence (produits, AQL, employés, familles de défauts…) et édition de fiches
d'évaluation.

## Architecture

| Dossier     | Rôle                        | Stack                              |
| ----------- | --------------------------- | ---------------------------------- |
| `Backend/`  | API REST                    | Node.js, Express, MySQL            |
| `controle/` | Interface web               | Angular 20, Bootstrap, ngx-toastr  |

## Prérequis

- Node.js 20.19+ (ou 22.12 / 24)
- MySQL 8+ (avec une base nommée `pfe`, créée automatiquement au premier démarrage)

## Installation

### 1. Backend

```bash
cd Backend
npm install
cp .env.example .env      # puis ajustez les valeurs si nécessaire
npm start
```

Le serveur démarre sur `http://localhost:3000` et crée automatiquement les tables
manquantes ainsi qu'un compte administrateur par défaut.

### 2. Frontend

```bash
cd controle
npm install
npm start
```

L'application est disponible sur `http://localhost:4200`.

## Configuration

Toute la configuration sensible se trouve dans `Backend/.env` (non versionné).
Voir `Backend/.env.example` pour la liste des variables :

- `DB_*` : connexion MySQL
- `PORT` : port du serveur
- `JWT_SECRET` / `JWT_EXPIRES_IN` : signature et durée de vie du token JWT (à changer en production)
- `CORS_ORIGIN` : origine(s) autorisée(s) pour le front
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` : compte administrateur créé au démarrage

## Compte administrateur par défaut

- **Email** : `admin@admin.com`
- **Mot de passe** : `admin.admin`
- **Rôle** : `admin`

> ⚠️ À changer impérativement après la première connexion (ou via les variables
> `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Authentification

- La connexion se fait via `POST /utilisateur/login` avec un corps
  `{ "email": "…", "password": "…" }`. La réponse contient l'utilisateur
  (sans mot de passe) et un **token JWT** : `{ "utilisateur": {…}, "token": "…" }`.
- Les mots de passe sont hachés avec **bcrypt**. Un script de migration hache
  automatiquement les mots de passe encore stockés en clair au démarrage.
- Chaque utilisateur possède un `role` (`admin` ou `user`).
- Le front stocke le token et l'ajoute automatiquement aux requêtes via un
  intercepteur HTTP (`Authorization: Bearer <token>`). En cas de réponse `401`
  (token expiré ou invalide), le front purge la session et redirige vers `/login`.

### Routes protégées

Le middleware (`Backend/middleware/auth.js`) est **appliqué à l'API** :

- **Publiques** : `POST /utilisateur/login` (connexion) et
  `POST /utilisateur/add` (inscription).
- **Réservées aux administrateurs** (`requireRole('admin')`) : gestion des
  utilisateurs (`/utilisateur/all|update|delete|get|getname|rechercher`), gestion
  des contacts (`/contact/all|update|delete|rechercher`) et les opérations de
  **modification/suppression** sur produits, employés, AQL, familles par défaut,
  ordres de fabrication et inspections. Les lectures et les créations restent
  accessibles à tout utilisateur authentifié (l'espace Contrôle ajoute et
  supprime des défauts, et supprime des inspections).
- **Protégées** (`requireAuth`, en-tête `Authorization: Bearer <token>` requis) :
  toutes les autres — `/employee`, `/contact`, `/familledefault`, `/aql`,
  `/produit`, `/inspection`, `/defaults`, `/order`, ainsi que les routes de
  `/utilisateur` (`/all`, `/get`, `/getname`, `/rechercher`, `/update`, `/delete`).

Pour restreindre une route aux administrateurs :
`router.get('/x', requireRole('admin'), handler)`.


## Frontend

- L'URL de l'API est centralisée dans `controle/src/environments/environment.ts`
  (développement) et `environment.prod.ts` (production, via les `fileReplacements`
  d'`angular.json`).
- L'authentification est gérée par `AuthService` (seul point d'accès au
  `localStorage`), un `TokenInterceptor` (ajout du Bearer, purge de la session et
  redirection sur `401`).
- Les gardes de route réservent `/home` aux utilisateurs connectés (`AuthGuard`)
  et `/admin` aux administrateurs (`AdminGuard`).
- Les abonnements RxJS sont libérés automatiquement à la destruction des
  composants (`takeUntilDestroyed`).
- Les réponses de l'API sont typées dans `controle/src/app/models/api.ts`.


## Sécurité

- En-têtes HTTP de sécurité via **Helmet** (masque `X-Powered-By`, ajoute
  `X-Content-Type-Options`, `Referrer-Policy`…). La politique
  `Cross-Origin-Resource-Policy: cross-origin` est conservée pour que le front
  affiche les images de `/upload` servies par l'API.
- **Limitation des tentatives de connexion** (`express-rate-limit`) : 10 essais
  par IP et par tranche de 15 minutes sur `POST /utilisateur/login`.
- **Uploads filtrés** : seules les images (JPEG, PNG, GIF, WEBP, BMP) de 5 Mo
  maximum sont acceptées sur `POST /defaults/upload`.
- Corps JSON limité à 1 Mo.
- Mots de passe hachés (bcrypt) et **autorisations vérifiées côté serveur** :
  masquer un bouton dans l'interface ne suffit pas, l'API contrôle le rôle.

## Fonctionnalités

- Authentification (connexion / inscription)
- Espace **Administration** : CRUD produits, employés, AQL, familles et défauts,
  utilisateurs, inspections, ordres de fabrication, messages de contact
- Espace **Contrôle** : contrôles *sous-chaîne*, *fin de chaîne* et *audit qualité*,
  consultation et impression de fiches d'évaluation PDF

## Structure du dépôt

```
Backend/
  config/       configuration (DB, JWT, initialisation du schéma)
  middleware/   authentification JWT
  models/       accès aux données (requêtes SQL)
  routes/       points d'entrée de l'API REST
  upload/       fichiers envoyés (images de défauts, PDF)
controle/
  src/app/
    administration/   écrans d'administration
    controle/         écrans de contrôle qualité
    services/         appels HTTP vers l'API
    models/           types TypeScript (dont réponses API)
  src/environments/   URL de l'API (dev / prod)
```

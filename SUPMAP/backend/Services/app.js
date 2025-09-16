
// A SUPPRIMER DEFINITIVEMENT.


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');

// Import custom passport configuration
require('../middlewares/passport');

// Importer les routes
const authRoutes = require('../routes/authRoutes');
const incidentRoutes = require('../routes/incidentRoutes');
const routeRoutes = require('../routes/routeRoutes');

// Initialiser l'application Express
const app = express();

// Configuration CORS - doit être avant les autres middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:8100', 'https://localhost:3443'], // L'origine de votre frontend Angular/Ionic
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Pour permettre les cookies et l'authentification
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Gérer explicitement les requêtes OPTIONS pour éviter les redirections
app.options('*', cors());

// Autres Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/routes', routeRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur interne est survenue' });
});

module.exports = app;

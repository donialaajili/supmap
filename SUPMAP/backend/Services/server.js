require('dotenv').config({ path: __dirname + '/../.env' });

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const morgan = require('morgan');
const setupSwaggerDocs = require('../utils/swagger');


// 🔐 Vérif .env
if (!process.env.MONGO_URI) {
  console.error("❌ ERREUR : MONGO_URI manquant dans .env");
  process.exit(1);
}

// 🔌 Initialisation app
const app = express();

// 🌐 CORS pour le frontend (Ionic)
app.use(cors({
  origin: 'http://localhost:8100',
  credentials: true,
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Rediriger avec le token JWT dans l'URL
    res.redirect(`http://localhost:8100/apres-connexion?token=${req.user.token}`);
  }
);


// Facebook callback
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`http://localhost:8100/apres-connexion?token=${req.user.token}`);
  }
);
app.options('*', cors());

// 🧱 Middleware de base
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 💾 Sessions & Auth
app.use(session({
  secret: process.env.SESSION_SECRET || 'mySecretKey',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
require('../middlewares/passport'); // Chargement de Passport strategies

// 📦 Routes API
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const statsRoutes = require('../routes/statsRoutes');
const incidentRoutes = require('../routes/incidentRoutes');
const routeRoutes = require('../routes/routeRoutes');
const trafficRoutes = require('../routes/trafficRoutes');
const positionRoutes = require('../routes/positionRoutes');
const notificationRoutes = require('../routes/notificationRoutes');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use('/stats', statsRoutes);
app.use('/incidents', incidentRoutes);
app.use('/routes', routeRoutes);
app.use('/traffic', trafficRoutes);
app.use('/positions', positionRoutes);
app.use('/notification', notificationRoutes);

// 📚 Swagger
setupSwaggerDocs(app);

// 🧯 Gestion d'erreurs
const errorHandler = require('../middlewares/errorHandler');
app.use(errorHandler);

// ✅ Route de test
app.get('/', (req, res) => {
  res.send('🚀 Bienvenue sur l\'API Trafine !');
});

// 🔌 Connexion DB + Démarrage
const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connexion MongoDB réussie");
    app.listen(PORT, () => {
      console.log(`🚀 Serveur en ligne : http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Erreur MongoDB :", err.message);
    process.exit(1);
  });

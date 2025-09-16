/**
 * @swagger
 * tags:
 *   name: Routes
 *   description: Gestion des itinéraires de navigation
 */




/**
 * @swagger
 * /routes:
 *   post:
 *     summary: Créer un itinéraire personnalisé
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startPoint:
 *                 type: object
 *                 properties:
 *                   lat: { type: number, example: 48.8566 }
 *                   lon: { type: number, example: 2.3522 }
 *               endPoint:
 *                 type: object
 *                 properties:
 *                   lat: { type: number, example: 45.7640 }
 *                   lon: { type: number, example: 4.8357 }
 *               waypoints:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     lat: { type: number }
 *                     lon: { type: number }
 *               includeTollRoads:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Itinéraire créé
 *       400:
 *         description: Données invalides
 */



/**
 * @swagger
 * /routes:
 *   get:
 *     summary: Récupérer les itinéraires de l'utilisateur connecté
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des itinéraires
 *       401:
 *         description: Non autorisé
 */



/**
 * @swagger
 * /routes/{id}:
 *   get:
 *     summary: Récupérer un itinéraire par ID
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: ID de l'itinéraire
 *     responses:
 *       200:
 *         description: Détails de l'itinéraire
 *       404:
 *         description: Itinéraire introuvable
 */





/**
 * @swagger
 * /routes/{id}:
 *   patch:
 *     summary: Modifier un itinéraire
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: ID de l'itinéraire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               includeTollRoads:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Itinéraire mis à jour
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Itinéraire introuvable
 */






/**
 * @swagger
 * /routes/{id}:
 *   delete:
 *     summary: Supprimer un itinéraire
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: ID de l'itinéraire
 *     responses:
 *       200:
 *         description: Itinéraire supprimé
 *       404:
 *         description: Itinéraire introuvable
 */






/**
 * @swagger
 * /routes/optimize:
 *   post:
 *     summary: Optimiser un itinéraire via le microservice Python
 *     tags: [Routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [start, end]
 *             properties:
 *               start:
 *                 type: string
 *                 example: A
 *               end:
 *                 type: string
 *                 example: F
 *               waypoints:
 *                 type: array
 *                 items: { type: string }
 *               includeTollRoads:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Itinéraire optimisé
 *       400:
 *         description: Requête invalide
 */










const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const authMiddleware = require('../middlewares/authMiddleware');
const routeOptimizerService = require('../services/routeOptimizerService');
const axios = require('axios');

// 🔍 Autocomplétion des villes depuis TomTom (proxy backend)
router.get('/cities', async (req, res) => {
  const query = req.query.query;
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Paramètre "query" requis' });
  }

  try {
    console.log("🔎 Requête vers TomTom avec :", query);

    const response = await axios.get(`https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json`, {
      params: {
        key: process.env.TOMTOM_API_KEY,
        typeahead: false, // désactivé pour des recherches plus précises (rues)
        limit: 10,
        countrySet: 'FR'
      }
    });

    const rawResults = response.data.results || [];

    const suggestions = rawResults
      .filter(r => r.address?.freeformAddress && r.address?.countryCode === 'FR')
      .map(r => r.address.freeformAddress);

    const uniqueSuggestions = [...new Set(suggestions)];

    res.json({ suggestions: uniqueSuggestions });

  } catch (err) {
    console.error('❌ Erreur TomTom :', err.message);
    res.status(500).json({ error: 'Erreur lors de la recherche de villes' });
  }
});

// Routes publiques (debug / test)
router.get('/test-ors', async (req, res) => {
  try {
    const start = req.query.start || '2.3508,48.8566'; // Paris
    const end = req.query.end || '4.8357,45.7640';     // Lyon
    const data = await routeOptimizerService.optimizeRoute(start, end);
    res.status(200).json({ message: ' Itinéraire ORS OK', data });
  } catch (err) {
    res.status(500).json({ error: 'Erreur ORS', details: err.message });
  }
});

// Routes publiques (non protégées)
router.get('/geocode', routeController.geocodeCity); // Géocodage de ville (ex: Paris, Lyon, Marseille)

router.use(authMiddleware.protectRoute); // Middleware d'authentification pour toutes les routes suivantes

// Routes protégées
router.get('/routes/user',authMiddleware.protectRoute, routeController.getRoutesByUser);
router.post('/', authMiddleware.protectRoute, routeController.createRoute);
router.get('/', authMiddleware.protectRoute, routeController.getAllRoutes);
router.get('/:id', authMiddleware.protectRoute, routeController.getRouteById);
router.put('/:id', authMiddleware.protectRoute, routeController.updateRoute);
router.delete('/:id', authMiddleware.protectRoute, routeController.deleteRoute);
router.delete('/routes/:id',authMiddleware.protectRoute, routeController.deleteRoute);

// Services supplémentaires
router.post('/optimize', authMiddleware.protectRoute, routeController.optimizeRoute);
router.post('/estimate-cost', authMiddleware.protectRoute, routeController.estimateCost);
router.post('/suggest-routes', authMiddleware.protectRoute, routeController.suggestRoutes);
router.get('/:id/generate-qr', authMiddleware.protectRoute, routeController.generateQR);

router.get('/geocode', routeController.geocodeCity);



module.exports = router;
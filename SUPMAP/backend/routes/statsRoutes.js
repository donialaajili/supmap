/**
 * @swagger
 * tags:
 *   name: Statistiques
 *   description: Statistiques de trafic et données communautaires
 */

/**
 * @swagger
 * /stats/incidents:
 *   get:
 *     summary: Obtenir des statistiques sur les incidents signalés
 *     tags: [Statistiques]
 *     responses:
 *       200:
 *         description: Statistiques retournées avec succès
 *       500:
 *         description: Erreur interne du serveur
 */

/**
 * @swagger
 * /stats/traffic:
 *   get:
 *     summary: Obtenir la prédiction de trafic actuelle (via TomTom)
 *     tags: [Statistiques]
 *     responses:
 *       200:
 *         description: Données de trafic retournées avec succès
 *       500:
 *         description: Erreur lors de la récupération du trafic
 */



const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/incidents', statsController.getIncidentStats);
router.get('/traffic', statsController.getTrafficPrediction);

module.exports = router;

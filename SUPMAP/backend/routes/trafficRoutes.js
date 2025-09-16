/**
 * @swagger
 * tags:
 *   name: Trafic
 *   description: Données de trafic et prédiction via TomTom
 */


/**
 * @swagger
 * /traffic/predict:
 *   get:
 *     summary: Obtenir une prédiction de trafic à une position donnée
 *     tags: [Trafic]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: false
 *         description: Latitude (par défaut Paris)
 *       - in: query
 *         name: lon
 *         schema:
 *           type: number
 *         required: false
 *         description: Longitude (par défaut Paris)
 *     responses:
 *       200:
 *         description: Données de trafic renvoyées
 *       500:
 *         description: Erreur lors de la récupération des données
 */







const express = require('express');
const router = express.Router();
const TrafficPredictionService = require('../services/trafficPredictionService');

const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

// Fonction pour générer des points autour du point central
function generatePointsAround(lat, lon, kmRadius = 10, points = 8) {
  const R = 6371; // Rayon de la Terre
  const coords = [];

  for (let i = 0; i < points; i++) {
    const angle = (2 * Math.PI * i) / points;
    const dLat = (kmRadius / R) * Math.cos(angle);
    const dLon = (kmRadius / R) * Math.sin(angle) / Math.cos(lat * Math.PI / 180);

    coords.push({
      lat: lat + dLat * (180 / Math.PI),
      lon: lon + dLon * (180 / Math.PI),
    });
  }

  return coords;
}

router.get('/', async (req, res) => {
  try {
    const point = req.query.point;

    if (!point) {
      return res.status(400).json({ error: 'Coordonnées GPS manquantes (utiliser ?point=lat,lon)' });
    }

    const [lat, lon] = point.split(',').map(Number);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Coordonnées invalides' });
    }

    const nearbyPoints = generatePointsAround(lat, lon);
    const results = [];

    for (const coord of nearbyPoints) {
      const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${coord.lat},${coord.lon}&key=${TOMTOM_API_KEY}`;
      const response = await axios.get(url);
      results.push({
        point: coord,
        currentSpeed: response.data.flowSegmentData.currentSpeed,
        freeFlowSpeed: response.data.flowSegmentData.freeFlowSpeed,
        trafficSpeed: response.data.flowSegmentData.currentSpeed,
        speedRatio: response.data.flowSegmentData.currentSpeed / response.data.flowSegmentData.freeFlowSpeed,
        trafficState: response.data.flowSegmentData.trafficState,
      });
    }

    res.json({ traffic: results });

  } catch (err) {
    console.error('Erreur TomTom Traffic:', err.message || err);
    res.status(500).json({ error: 'Erreur API TomTom', details: err.message });
  }
});


module.exports = router;

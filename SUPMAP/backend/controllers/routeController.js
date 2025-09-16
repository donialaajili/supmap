const Route = require('../models/Route');
const axios = require('axios');
const QRCode = require('qrcode');

// Créer un itinéraire
const createRoute = async (req, res) => {
  try {
    const { name, startPoint, endPoint, waypoints, includeTollRoads } = req.body;

    if (!name || !startPoint || !endPoint) {
      return res.status(400).json({ error: 'Le nom, le point de départ et d’arrivée sont requis.' });
    }

    const start = `${startPoint.lat},${startPoint.lon}`;
    const end = `${endPoint.lat},${endPoint.lon}`;

    const response = await axios.get(`https://api.tomtom.com/routing/1/calculateRoute/${start}:${end}/json`, {
      params: {
        key: process.env.TOMTOM_API_KEY,
        avoid: includeTollRoads === false ? 'tollRoads' : undefined,
        routeType: 'fastest',
        traffic: true
      }
    });

    const routeData = response.data.routes[0].summary;
    const distance = (routeData.lengthInMeters / 1000).toFixed(1);
    const estimatedTime = (routeData.travelTimeInSeconds / 60).toFixed(1);
    const costEstimate = ((routeData.lengthInMeters / 1000) * 1.8).toFixed(2);

    const routePoints = response.data.routes[0].legs[0].points;

    const coordinates = routePoints.map(p => ({
      lat: p.latitude,
      lng: p.longitude
    }));

    const newRoute = new Route({
      name,
      startPoint,
      endPoint,
      waypoints: Array.isArray(waypoints) ? waypoints : [],
      createdBy: req.user ? req.user._id : null,

      includeTollRoads: includeTollRoads || false,
      distance: Number(distance),
      estimatedTime: Number(estimatedTime),
      costEstimate: Number(costEstimate),
      optimized: false,
      coordinates // 🔥 ici on stocke le tracé complet
    });

    await newRoute.save();
    res.status(201).json({ message: 'Itinéraire créé', route: newRoute });

  } catch (err) {
    console.error("Erreur dans createRoute :", err.response?.data || err.message);
    res.status(500).json({ error: 'Erreur lors de la création de l’itinéraire', details: err.message });
  }
};

// Suggérer plusieurs itinéraires
const suggestRoutes = async (req, res) => {
  try {
    const { start, end, includeTollRoads } = req.body;

    if (!start || !end) {
      return res.status(400).json({ error: 'Départ et arrivée requis' });
    }

    const apiKey = process.env.TOMTOM_API_KEY;
    const startCoords = `${start.lat},${start.lon}`;
    const endCoords = `${end.lat},${end.lon}`;
    const endpoint = `https://api.tomtom.com/routing/1/calculateRoute/${startCoords}:${endCoords}/json`;

    const response = await axios.get(endpoint, {
      params: {
        key: apiKey,
        computeBestOrder: true,
        avoid: includeTollRoads === false ? 'tollRoads' : undefined,
        routeType: 'fastest',
        traffic: true
      }
    });

    const routes = response.data.routes.map((route, i) => ({
      option: i + 1,
      summary: route.summary,
      distanceKm: (route.summary.lengthInMeters / 1000).toFixed(1),
      durationMin: (route.summary.travelTimeInSeconds / 60).toFixed(1),
      estimatedCost: ((route.summary.lengthInMeters / 1000) * 1.8).toFixed(2) + "€"
    }));

    res.status(200).json({ message: 'Itinéraires suggérés', routes });

  } catch (err) {
    console.error("❌ Erreur dans suggestRoutes :", err.response?.data || err.message, err.stack);
    res.status(500).json({ error: 'Erreur lors de la récupération des itinéraires' });
  }
};

//  Génération d'un QR code
const generateQR = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.findById(id);
    if (!route) return res.status(404).json({ error: 'Itinéraire introuvable' });

    const url = `https://trafine.app/route/${route._id}`;
    const qr = await QRCode.toDataURL(url);

    res.status(200).json({ message: 'QR généré', qrCode: qr });
  } catch (err) {
    console.error("Erreur dans generateQR :", err);
    res.status(500).json({ error: 'Erreur lors de la génération du QR code' });
  }
};

// Liste des itinéraires
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.status(200).json(routes);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des itinéraires' });
  }
};

//  Récupérer un itinéraire par ID
const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.findById(id);
    if (!route) return res.status(404).json({ error: 'Itinéraire non trouvé' });
    res.status(200).json(route);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Modifier un itinéraire
const updateRoute = async (req, res) => {
  try {
    const updatedRoute = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRoute) return res.status(404).json({ error: 'Itinéraire non trouvé' });
    res.status(200).json({ message: 'Mis à jour', route: updatedRoute });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprimer un itinéraire
const deleteRoute = async (req, res) => {
  try {
    const deletedRoute = await Route.findByIdAndDelete(req.params.id);
    if (!deletedRoute) return res.status(404).json({ error: 'Itinéraire non trouvé' });
    res.status(200).json({ message: 'Supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Optimiser un itinéraire (simulation avec serveur Python)
const optimizeRoute = async (req, res) => {
  try {
    const { start, end, waypoints, includeTollRoads } = req.body;

    const graph = [
      { from: "A", to: "B", weight: 5 },
      { from: "B", to: "C", weight: 7 },
      { from: "A", to: "C", weight: 10 }
    ];

    const response = await axios.post('http://localhost:5000/optimize-route', {
      graph,
      start,
      end,
      includeTollRoads
    });

    res.status(200).json({ message: 'Itinéraire optimisé', optimizedRoute: response.data });
  } catch (err) {
    console.error("Erreur dans optimizeRoute :", err.message);
    res.status(500).json({ error: 'Erreur d’optimisation', details: err.message });
  }
};

// Estimation du coût d’un trajet
const estimateCost = async (req, res) => {
  try {
    const { distance, fuelPrice, tolls } = req.body;
    const cost = (Number(distance) * Number(fuelPrice)) + (Number(tolls) || 0);
    res.status(200).json({ message: 'Coût estimé', cost });
  } catch (err) {
    res.status(500).json({ error: 'Erreur estimation' });
  }
};

// ✅ Fonction pour géocoder une ville
const geocodeCity = async (req, res) => {
  try {
    const city = req.query.city;
    console.log("🔍 Requête reçue pour /routes/geocode avec :", req.query.city);
    if (!city) {
      return res.status(400).json({ error: "Paramètre 'city' manquant dans la requête" });
    }

    console.log("🔍 Requête reçue pour /routes/geocode avec :", city);

    const apiKey = process.env.TOMTOM_API_KEY;
    if (!apiKey) {
      console.error("❌ Clé API TomTom manquante dans les variables d'environnement.");
      return res.status(500).json({ error: "Clé API TomTom manquante" });
    }

    const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(city)}.json`;

    const response = await axios.get(url, {
      params: {
        key: apiKey,
        limit: 1
      }
    });

    const result = response.data.results?.[0];

    if (!result) {
      return res.status(404).json({ error: "Aucune position trouvée pour cette ville." });
    }

    const position = result.position; // { lat, lon }
    res.status(200).json({ city, position });

  } catch (error) {
    console.error("❌ Erreur dans geocodeCity:", error.message);
    res.status(500).json({ error: "Erreur lors du géocodage", details: error.message });
  }
};

const getRoutesByUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Utilisateur non authentifié" });

    const routes = await Route.find({ createdBy: userId }).sort({ createdAt: -1 });
    res.status(200).json(routes);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des itinéraires de l'utilisateur" });
  }
};


module.exports = {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
  optimizeRoute,
  estimateCost,
  suggestRoutes,
  generateQR,
  geocodeCity,
  getRoutesByUser
};

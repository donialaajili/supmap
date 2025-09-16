
const Incident = require('../models/Incident');
const axios = require('axios');
const geolib = require('geolib');
// Liste des types autorisés
const VALID_TYPES = ['accident', 'bouchon', 'danger', 'police', 'route_fermee', 'obstacle', 'autre'];

// Signaler un incident
exports.createIncident = async (req, res) => {
  try {
    console.log('Reçu:', req.body);
    const { type, location, description } = req.body;

    if (!type || !location || !description) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `Type d'incident invalide. Types valides : ${VALID_TYPES.join(', ')}` });
    }

    // ✅ Transformation du format location si lat/lon sont présents
    if (typeof location !== 'object' || location.lat === undefined || location.lon === undefined) {
      return res.status(400).json({ error: 'La localisation doit être un objet contenant lat et lon.' });
    }

    const geoLocation = {
      type: 'Point',
      coordinates: [location.lon, location.lat]  // ⬅️ ordre important : [longitude, latitude]
    };

    const newIncident = new Incident({
      type,
      location: geoLocation, // ⬅️ utilisé ici
      description,
      status: 'signalé',
      reportedBy: req.user.id,
      confirmedBy: [],
      rejectedBy: []
    });

    

    await newIncident.save();
    res.status(201).json({ message: 'Incident signalé avec succès', incident: newIncident });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du signalement', details: err.message });
  }
};


//  Confirmer un incident
exports.confirmIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) return res.status(404).json({ error: 'Incident non trouvé' });

    if (!incident.confirmedBy.includes(req.user.id)) {
      incident.confirmedBy.push(req.user.id);
      // Retirer l'utilisateur de rejectedBy s'il y est
      incident.rejectedBy = incident.rejectedBy.filter(uid => uid.toString() !== req.user.id);
      await incident.save();
    }
    if (incident.confirmedBy.length > 5) { // Par exemple, si 5 utilisateurs ont confirmé
      incident.status = 'terminé';
    }
    await incident.save();

    res.status(200).json({ message: 'Incident confirmé avec succès', incident });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la confirmation', details: err.message });
  }
};

// Rejeter un incident
exports.rejectIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) return res.status(404).json({ error: 'Incident non trouvé' });

    if (!incident.rejectedBy.includes(req.user.id)) {
      incident.rejectedBy.push(req.user.id);
      // Retirer l'utilisateur de confirmedBy s'il y est
      incident.confirmedBy = incident.confirmedBy.filter(uid => uid.toString() !== req.user.id);
      await incident.save();
    }

    res.status(200).json({ message: 'Incident rejeté avec succès', incident });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du rejet', details: err.message });
  }
};

// Récupérer tous les incidents
exports.getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.status(200).json({ incidents });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des incidents', details: err.message });
  }
};

// Récupérer un incident par son ID
exports.getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) return res.status(404).json({ error: 'Incident non trouvé' });

    res.status(200).json({ incident });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération', details: err.message });
  }
};

// Mettre à jour un incident (statut uniquement)
exports.updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) return res.status(404).json({ error: 'Incident non trouvé' });

    if (incident.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier cet incident" });
    }

    incident.status = status;
    await incident.save();

    res.status(200).json({ message: 'Incident mis à jour', incident });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour', details: err.message });
  }
};

// Supprimer un incident
exports.deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) return res.status(404).json({ error: 'Incident non trouvé' });

    if (incident.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer cet incident" });
    }

    await incident.deleteOne();
    res.status(200).json({ message: 'Incident supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression', details: err.message });
  }
};

exports.getNearbyIncidentsAndTraffic = async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const offset = 0.05; // ~5 km
    const minLat = latitude - offset;
    const maxLat = latitude + offset;
    const minLon = longitude - offset;
    const maxLon = longitude + offset;

    // 1. Récupérer les incidents
    const incidentsResponse = await axios.get('https://api.tomtom.com/traffic/services/5/incidentDetails.json', {
      params: {
        bbox: `${minLon},${minLat},${maxLon},${maxLat}`,
        key: process.env.TOMTOM_API_KEY,
        fields: 'id,geometry,properties',
        language: 'fr-FR',
        
      }
    });
    console.log('Réponse TomTom :', response.data);

    const tomtomIncidents = incidentsResponse.data?.incidents || [];

    // 2. Enrichir chaque incident avec la distance
    const enrichedIncidents = tomtomIncidents.map(incident => {
      const coords = incident.geometry?.coordinates?.[0];
      if (!coords || coords.length !== 2) return null;

      const [lon, lat] = coords; // Important : TomTom donne [longitude, latitude]

      const distance = geolib.getDistance(
        { latitude, longitude },
        { latitude: lat, longitude: lon } // On corrige l'ordre ici
      );

      return {
        ...incident,
        distanceMeters: distance
      };
    }).filter(incident => incident !== null);

    // 3. Trier par distance (plus proche -> plus loin)
    enrichedIncidents.sort((a, b) => a.distanceMeters - b.distanceMeters);

    // 4. Récupérer les données de trafic
    const trafficResponse = await axios.get('https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json', {
      params: {
        point: `${latitude},${longitude}`,
        key: process.env.TOMTOM_API_KEY
      }
    });

    const trafficData = trafficResponse.data?.flowSegmentData;

    const roadStatus = trafficData.currentSpeed < trafficData.freeFlowSpeed ? 'Congestion' : 'Fluide';

    const trafficPrediction = {
      roadStatus,
      currentSpeed: trafficData.currentSpeed,
      freeFlowSpeed: trafficData.freeFlowSpeed,
      confidence: trafficData.confidence,
      timestamp: Date.now()
    };

    // 5. Réponse finale
    res.status(200).json({
      incidents: enrichedIncidents,
      traffic: trafficPrediction
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
// Récupérer les incidents proches d'un itinéraire
exports.getUserIncidentsNearRoute = async (req, res) => {
  try {
    const { routeCoordinates } = req.body; // tableau [{ lat, lon }, ...]
    const maxDistanceMeters = 500; // rayon de détection autour de la route

    if (!Array.isArray(routeCoordinates) || routeCoordinates.length === 0) {
      return res.status(400).json({ error: 'Itinéraire invalide ou vide' });
    }

    const allIncidents = await Incident.find({ status: { $ne: 'terminé' } });

    const nearbyIncidents = [];

    for (const incident of allIncidents) {
      const [incidentLon, incidentLat] = incident.location.coordinates;

      // Vérifie la distance avec CHAQUE point de l'itinéraire
      const isNear = routeCoordinates.some(point => {
        const dist = geolib.getDistance(
          { latitude: point.lat, longitude: point.lon },
          { latitude: incidentLat, longitude: incidentLon }
        );
        return dist <= maxDistanceMeters;
      });

      if (isNear) {
        nearbyIncidents.push(incident);
      }
    }

    res.status(200).json({ nearbyIncidents });
  } catch (err) {
    console.error('Erreur détection incidents proches :', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};
// Récupérer les 5 derniers incidents signalés
exports.getLastFiveIncidents = async (req, res) => {
  try {
    const lastIncidents = await Incident.find()
      .sort({ createdAt: -1 }) // Trie par date décroissante
      .limit(5); // Limite à 5 résultats

    res.status(200).json({ incidents: lastIncidents });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des derniers incidents', details: err.message });
  }
};



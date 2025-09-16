const Incident = require('../models/Incident');
const User = require('../models/User');
const axios = require('axios');

// Prédiction trafic depuis une API TomTom
exports.getTrafficPrediction = async (req, res) => {
  try {
    const { location } = req.query; // Exemple : "48.8566,2.3522"

    if (!location) {
      return res.status(400).json({ error: 'Paramètre "location" requis (lat,lon)' });
    }

    const [lat, lon] = location.split(',');

    const response = await axios.get('https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json', {
      params: {
        point: `${lat},${lon}`,
        key: process.env.TOMTOM_API_KEY
      }
    });

    const data = response.data;

    const prediction = {
      roadStatus: data.flowSegmentData.currentSpeed < data.flowSegmentData.freeFlowSpeed ? 'Congestion' : 'Fluide',
      currentSpeed: data.flowSegmentData.currentSpeed,
      freeFlowSpeed: data.flowSegmentData.freeFlowSpeed,
      confidence: data.flowSegmentData.confidence,
      timestamp: data.flowSegmentData.timestamp
    };

    res.status(200).json({ prediction });
  } catch (err) {
    console.error("Erreur depuis l'API TomTom :", err.message);
    res.status(500).json({ error: "Impossible d'obtenir la prédiction de trafic." });
  }
};

// Statistiques sur les incidents
exports.getIncidentStats = async (req, res) => {
  try {
    const stats = await Incident.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const topUsers = await Incident.aggregate([
      {
        $group: {
          _id: '$reportedBy',
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          total: 1
        }
      }
    ]);

    res.status(200).json({
      incidentsByType: stats,
      topContributors: topUsers
    });
  } catch (err) {
    console.error('Erreur dans getIncidentStats :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const axios = require('axios');

class TrafficPredictionService {
  static async getTrafficConditions({ lat, lon }) {
    try {
      const response = await axios.get(
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point=${lat},${lon}&key=${process.env.TOMTOM_API_KEY}`
      );

      if (!response.data || !response.data.flowSegmentData) {
        return { message: 'Données trafic indisponibles pour cet emplacement' };
      }

      const data = response.data.flowSegmentData;
      return {
        currentSpeed: data.currentSpeed,
        freeFlowSpeed: data.freeFlowSpeed,
        confidence: data.confidence,
        roadClosure: data.roadClosure,
        coordinates: data.coordinates,
        description: data.frc
      };
    } catch (err) {
      console.error('[TrafficPredictionService ERROR]', err.message);
      throw new Error('Erreur lors de la récupération des conditions de trafic');
    }
  }
}

module.exports = TrafficPredictionService;

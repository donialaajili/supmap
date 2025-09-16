const axios = require('axios');

class RouteOptimizerService {
  static async optimizeRoute({ start, end, waypoints = [], includeTollRoads = true }) {
    try {
      const response = await axios.post('http://localhost:5000/optimize-route', {
        start,
        end,
        waypoints,
        includeTollRoads
      });

      return response.data;
    } catch (err) {
      console.error('[RouteOptimizerService ERROR]', err.message);
      throw new Error('Erreur lors de l’optimisation de l’itinéraire');
    }
  }
}

module.exports = RouteOptimizerService;

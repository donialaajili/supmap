import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class RouteOptimizerService {
  private apiUrl = 'https://localhost:3443'; // URL de votre backend HTTPS

  constructor() {}
  // Optimiser un itinéraire
  async optimizeRoute(start: string, end: string, waypoints: string[]) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/routes/optimize`, {
        start,
        end,
        waypoints,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'optimisation de l'itinéraire:", error);
      throw error;
    }
  }
  // Estimer le coût du trajet
  async estimateCost(distance: number, fuelPrice: number, tolls: number) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/routes/estimate-cost`, {
        distance,
        fuelPrice,
        tolls,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'estimation du coût:", error);
      throw error;
    }
  }
}

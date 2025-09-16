import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TrafficIncidentService {
  private apiUrl = 'http://localhost:4000'; // Mets ton URL API ici

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer tous les incidents
  getAllIncidents() {
    return this.http.get(`${this.apiUrl}/incidents`);
  }

  // Méthode pour récupérer les incidents proches de la position de l'utilisateur
  //getTrafficAndIncidents(lat: number, lon: number) {
  //  return this.http.post(`${this.apiUrl}/incidents`, {
  //    latitude: lat,
  //    longitude: lon
  //  });
  //}

  // Méthode pour confirmer un incident
  confirmIncident(incidentId: string) {
    return this.http.patch(`${this.apiUrl}/incidents/${incidentId}/confirm`, {});
  }

  // Méthode pour rejeter un incident
  rejectIncident(incidentId: string) {
    return this.http.patch(`${this.apiUrl}/incidents/${incidentId}/reject`, {});
  }
  mettreAJourIncident(id: string, status: string) {
    return this.http.patch(`${this.apiUrl}/incidents/${id}`, { status });
  }

  supprimerIncident(id: string) {
    return this.http.delete(`${this.apiUrl}/incidents/${id}`);
  }
  getIncidentById(id: string) {
    return this.http.get(`${this.apiUrl}/incidents/${id}`);
  }
  getTrafficFlow(lat: number, lon: number) {
    return this.http.get(`${this.apiUrl}/traffic?point=${lat},${lon}`);
  }
  // ✅ Récupérer les incidents proches de la position utilisateur (/around)
  getIncidentsAround(lat: number, lon: number) {
    return this.http.post(`${this.apiUrl}/incidents/around`, { lat, lon });
  }

  // latLngs = tableau de points GPS : [{ lat: number, lon: number }, ...]
getUserIncidentsNearRoute(latLngs: { lat: number; lon: number }[]) {
  return this.http.post(`${this.apiUrl}/incidents/near-route`, { route: latLngs });
}

// ✅ Récupérer les 5 derniers incidents
getLastIncidents() {
  return this.http.get(`${this.apiUrl}/incidents/last`);
}






  // ✅ Récupérer incidents + trafic automatiquement (/Incidentauto)
  //getIncidentsAndTrafficAuto(lat: number, lon: number) {
  //  return this.http.post(`${this.apiUrl}/incidents/Incidentauto`, { lat, lon });
  //}

}

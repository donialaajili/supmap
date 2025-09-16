import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  incidents: any[] = [];
  traffics: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.refresh(); // Appel initial pour récupérer les données
  }

  async refresh() {
    try {
      // Récupérer position GPS
      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;

      // Appeler l'API backend avec la position
      this.http.post<any>('http://localhost:4000/incidents/nearby-incidents-traffic', { latitude, longitude })
        .subscribe(response => {
          // Vérification de la réponse de l'API
          console.log('Réponse de l\'API', response);

          // Trafic : S'assurer que 'traffic' est un tableau
          this.traffics = response.traffic ? [response.traffic] : []; // Si traffic existe, on le met dans un tableau

          // Incidents : Si incident est vide, afficher un message approprié
          this.incidents = response.incidents && response.incidents.length > 0 ? response.incidents : [];

        }, error => {
          console.error('Erreur lors de la récupération des données', error);
        });
    } catch (error) {
      console.error('Erreur de géolocalisation', error);
    }
  }
}


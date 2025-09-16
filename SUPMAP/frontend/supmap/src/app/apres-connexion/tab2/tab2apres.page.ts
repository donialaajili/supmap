import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2apres.page.html',
  styleUrls: ['tab2apres.page.scss'],
  standalone: false,
})
export class Tab2apresPage implements OnInit {
  traffics: any[] = [];
  incidents: any[] = [];
  userLocation!: { lat: number; lon: number };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.userLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };

      await Promise.all([
        this.loadTraffic(),
        this.loadIncidents()
      ]);
    } catch (error) {
      console.error('Erreur lors de la récupération de la position', error);
    }
  }

  async loadTraffic() {
    try {
      const url = `http://localhost:4000/traffic?point=${this.userLocation.lat},${this.userLocation.lon}`;
      const response = await this.http.get<any>(url).toPromise();

      if (response && response.flow) {
        this.traffics = [
          {
            route: 'Trafic actuel',
            status: this.getTrafficStatus(response.flow.jamFactor),
            jamFactor: response.flow.jamFactor,
            speed: response.flow.currentSpeed,
            freeFlowSpeed: response.flow.freeFlowSpeed
          }
        ];
      }
    } catch (error) {
      console.error('Erreur récupération du trafic', error);
    }
  }

  async loadIncidents() {
    try {
      const response = await this.http.post<any>(
        'http://localhost:4000/incidents/Incidentauto',
        {
          lat: this.userLocation.lat,
          lon: this.userLocation.lon
        }
      ).toPromise();

      if (response && response.incidents) {
        this.incidents = response.incidents;
      }
    } catch (error) {
      console.error('Erreur récupération des incidents', error);
    }
  }

  getTrafficStatus(jamFactor: number): string {
    if (jamFactor < 4) return 'Fluide';
    if (jamFactor < 7) return 'Ralentissements';
    return 'Fortement congestionné';
  }

  refresh() {
    this.loadData();
  }
}


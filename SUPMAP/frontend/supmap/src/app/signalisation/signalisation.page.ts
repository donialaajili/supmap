import { Component, AfterViewInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';  // Si tu veux rediriger l'utilisateur

@Component({
  selector: 'app-signalisation',
  templateUrl: './signalisation.page.html',
  styleUrls: ['./signalisation.page.scss'],
  standalone: false,
})
export class SignalisationPage implements AfterViewInit {
  problemType: string = '';
  description: string = '';
  location: string = '';
  latitude: number | null = null;
  longitude: number | null = null;
  map: any;
  marker: any;


  constructor(private http: HttpClient, private router: Router) {}

  ngAfterViewInit() {
    this.loadMap();
  }

  loadMap() {
    this.map = L.map('map').setView([48.8566, 2.3522], 12); // Paris par défaut

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
      this.location = `Lat: ${this.latitude}, Lng: ${this.longitude}`;

      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      this.marker = L.marker([this.latitude, this.longitude]).addTo(this.map)
        .bindPopup('Vous êtes ici')
        .openPopup();

      this.map.setView([this.latitude, this.longitude], 15);
    } catch (error) {
      console.error('Erreur localisation', error);
      alert('Impossible d\'obtenir la localisation.');
    }
  }

  submitReport() {
    // Vérifier si tous les champs sont remplis
    if (!this.problemType || !this.description || this.latitude == null || this.longitude == null) {
      alert('Veuillez remplir tous les champs et obtenir votre position.');
      return;
    }

    const incident = {
  type: this.problemType,
  description: this.description,
  location: {
    lat: this.latitude,
    lon: this.longitude
  }
};

const rawToken = localStorage.getItem('token');
const token = rawToken?.trim().replace(/^"|"$/g, '');

if (!token) {
  alert('Vous devez être connecté pour soumettre un signalement.');
  this.router.navigate(['/login']);
  return;
}

const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Envoi du signalement avec la requête HTTP
    this.http.post('http://localhost:4000/incidents', incident, { headers })
      .subscribe({
        next: () => {
          alert('Votre signalement a bien été envoyé !');
          // Réinitialiser les champs après envoi
          this.problemType = '';
          this.description = '';
          this.location = '';
          this.latitude = null;
          this.longitude = null;
          if (this.marker) this.map.removeLayer(this.marker);
        },
        error: (error) => {
          console.error('Erreur lors de l\'envoi du signalement :', error);
          alert('Erreur lors de l\'envoi du signalement.');
        }
      });
  }
}

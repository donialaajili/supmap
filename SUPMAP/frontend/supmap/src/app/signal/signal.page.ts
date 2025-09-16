import { Component, AfterViewInit } from '@angular/core';
import { TrafficIncidentService } from '../services/traffic-incident.service';
import { io } from 'socket.io-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signal',
  templateUrl: './signal.page.html',
  styleUrls: ['./signal.page.scss'],
  standalone: false,
})
export class SignalPage implements AfterViewInit {
  socket: any;

  alertes: {
distance: number;
status: any;
    type: string;
    description: string;
    position: [number, number];
    id: string;
    confirmedCount: number;
    rejectedCount: number;
    userVote: 'confirmed' | 'rejected' | null;
  }[] = [];


  constructor(private trafficIncidentService: TrafficIncidentService, private router: Router) {
    //this.socket = io('http://localhost:4000');
  }

  ngAfterViewInit() {
    this.setupSocketListeners();
    this.loadIncidents();
  }

  setupSocketListeners() {
    console.log('WebSocket listeners ready');
    // Ajoute ici les listeners socket si besoin
  }

  voirDetails(alerte: {
    type: string;
    description: string;
    position: [number, number];
    id: string;
    distance: number
  }) {
    console.log('Détails de l’alerte :', alerte);

    // Redirection vers la carte (tab1) avec les coordonnées en paramètre
    this.router.navigate(['/apres-connexion/tab1'], {
      queryParams: {
        lat: alerte.position[0],
        lng: alerte.position[1],
        type: alerte.type,
        desc: alerte.description
      }
    });
  }





  loadIncidents() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        

        this.trafficIncidentService.getAllIncidents().subscribe(
          (response: any) => {
            const incidents = response.incidents || response;
            const userId = this.getUserIdFromToken();

            this.alertes = incidents.map((incident: any) => {
              const [lon, lat] = incident.location.coordinates;

              let status = 'en cours';
              if (incident.confirmedBy.length >= 5) {
                status = 'terminé';
              } else if (incident.rejectedBy.length > 0) {
                status = 'réglé';
              }

              const distance = this.getDistanceFromLatLonInKm(userLat, userLon, lat, lon);

              return {
                id: incident._id,
                type: incident.type,
                description: incident.description,
                position: [lat, lon] as [number, number],
                status,
                confirmedCount: incident.confirmedBy?.length || 0,
                rejectedCount: incident.rejectedBy?.length || 0,
                userVote: incident.confirmedBy.includes(userId)
                  ? 'confirmed'
                  : incident.rejectedBy.includes(userId)
                  ? 'rejected'
                  : null,
                distance,
              };
            });
          },
          (error) => {
            console.error('Erreur lors du chargement des incidents', error);
          }
        );
      },
      (error) => {
        console.error('Erreur de géolocalisation', error);
      }
    );
  }

  getUserIdFromToken(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || '';
    } catch (err) {
      console.error('Token invalide', err);
      return '';
    }
  }



  confirmIncident(incidentId: string) {
    this.trafficIncidentService.confirmIncident(incidentId).subscribe(
      () => {
        console.log('Incident confirmé');
        this.loadIncidents();
      },
      (error) => {
        console.error('Erreur lors de la confirmation', error);
      }
    );
  }

  rejectIncident(incidentId: string) {
    this.trafficIncidentService.rejectIncident(incidentId).subscribe(
      () => {
        console.log('Incident rejeté');
        this.loadIncidents();
      },
      (error) => {
        console.error('Erreur lors du rejet', error);
      }
    );
  }
  getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

}




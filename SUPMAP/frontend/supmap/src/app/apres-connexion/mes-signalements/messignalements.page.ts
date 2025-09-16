import { Component, OnInit } from '@angular/core';
import { TrafficIncidentService } from '../../services/traffic-incident.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-messignalements',
  templateUrl: './messignalements.page.html',
  styleUrls: ['./messignalement.page.scss'],
  standalone: false,
})
export class messignalementsPage implements OnInit {
  mesIncidents: any[] = [];

  constructor(
    private trafficService: TrafficIncidentService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.chargerMesSignalements();
    this.mesIncidents = [
      { type: 'Incendie', description: 'Incendie dans la forêt', status: 'En cours' },
      { type: 'Accident', description: 'Accident de voiture', status: 'Résolu' }
    ];
  }

  chargerMesSignalements() {
    const userId = this.getUserIdFromToken();

    this.trafficService.getAllIncidents().subscribe(
      (response: any) => {
        const incidents = response.incidents || response;

        console.log('Token :', localStorage.getItem('token'));
        console.log('User ID extrait :', userId);
        console.log('Réponse API incidents :', incidents);

        this.mesIncidents = incidents
          .filter((incident: any) => {
            const reporter = incident.reportedBy;
            const reporterId = typeof reporter === 'string' ? reporter : reporter?._id;
            const match = String(reporterId) === String(userId);
            console.log(`Incident ID ${incident._id} - Reporter: ${reporterId} - Match: ${match}`);
            return match;
          })
          .map((incident: any) => {
            const [lon, lat] = incident.location.coordinates;
            return {
              id: incident._id,
              type: incident.type,
              description: incident.description,
              position: [lat, lon],
              status: incident.status,
            };
          });
      },
      (error: any) => console.error('Erreur chargement', error)
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

  async confirmerSuppression(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer ce signalement ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          handler: () => this.supprimerIncident(id),
        },
      ],
    });
    await alert.present();
  }

  supprimerIncident(id: string) {
    this.trafficService.supprimerIncident(id).subscribe(
      () => {
        this.mesIncidents = this.mesIncidents.filter((i) => i.id !== id);
      },
      (err: any) => console.error('Erreur suppression', err)
    );
  }

  async modifierIncident(incident: any) {
    const alert = await this.alertCtrl.create({
      header: 'Modifier le statut',
      inputs: [
        {
          name: 'status',
          type: 'text',
          placeholder: 'en cours, réglé, terminé',
          value: incident.status || '',
        },
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Enregistrer',
          handler: (data) => {
            this.trafficService
              .mettreAJourIncident(incident.id, data.status)
              .subscribe(
                () => this.chargerMesSignalements(),
                (err: any) => console.error('Erreur maj', err)
              );
          },
        },
      ],
    });
    await alert.present();
  }
}




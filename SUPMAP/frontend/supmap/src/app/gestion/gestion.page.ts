import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api.services'; // <-- Ajoute ton service
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.page.html',
  styleUrls: ['./gestion.page.scss'],
  standalone: false,
})
export class GestionPage implements OnInit {

  itineraries: any[] = [];

  constructor(
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private route: Router,
    private toastController: ToastController)
   {}

  ngOnInit(): void {
     // Remplace par la logique appropriée pour obtenir le `routeId`
    this.loadUserRoutes();
  }

  // 🔄 Charger les itinéraires de l'utilisateur
  loadUserRoutes() {
    const userId = this.getUserIdFromToken(); // récupère l'ID utilisateur à partir du token ou du localStorage
    if (!userId) {
      console.error('ID utilisateur introuvable.');
      return;
    }

    this.apiService.getAllRoutes().subscribe({
      next: (response: any) => {
        const routes = response.routes || response; // ou directement les routes retournées
        console.log('User ID extrait :', userId);
        console.log('Réponse API routes :', routes);

        this.itineraries = routes
          .filter((route: any) => {
            const creator = route.createdBy; // Assumons que l'itinéraire a un champ `createdBy` qui stocke l'ID de l'utilisateur
            const creatorId = typeof creator === 'string' ? creator : creator?._id;
            const match = String(creatorId) === String(userId);
            console.log(`Itinéraire ID ${route._id} - Creator: ${creatorId} - Match: ${match}`);
            return match;
          })
          .map((route: any) => {
            return {
              id: route._id,
              name: route.name,
              start: route.start,
              end: route.end,
              // Autres propriétés d'itinéraire à mapper
            };
          });

        console.log('Itinéraires filtrés :', this.itineraries);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des itinéraires :', err);
      }
    });
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

  // 🔍 Voir un itinéraire
  async viewItinerary(itinerary: any) {
    const alert = await this.alertCtrl.create({
      header: itinerary.name,
      message: `Départ : ${itinerary.start}<br>Arrivée : ${itinerary.end}`,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // 📝 Modifier un itinéraire
  async editItinerary(itinerary: any, event: Event) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Modifier Itinéraire',
      inputs: [
        { name: 'name', type: 'text', value: itinerary.name, placeholder: 'Nom' },
        { name: 'start', type: 'text', value: itinerary.start, placeholder: 'Départ' },
        { name: 'end', type: 'text', value: itinerary.end, placeholder: 'Arrivée' },
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Sauvegarder',
          handler: (data: { name: any; start: any; end: any; }) => {
            itinerary.name = data.name;
            itinerary.start = data.start;
            itinerary.end = data.end;
            // Tu peux appeler ici une méthode de mise à jour via l'API si elle existe
          },
        },
      ],
    });
    await alert.present();
  }

  // 🗑 Supprimer un itinéraire (backend + local)
  async deleteItinerary(id: string, event: Event) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Supprimer ?',
      message: 'Es-tu sûr de vouloir supprimer cet itinéraire ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          handler: () => {
            this.apiService.deleteRoute(id).subscribe({
              next: () => {
                this.itineraries = this.itineraries.filter(it => it.id !== id);
              },
              error: (err) => {
                console.error('Erreur lors de la suppression de l’itinéraire :', err);
              }
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async openAddItineraryModal() {
    const alert = await this.alertCtrl.create({
      header: 'Nouvel Itinéraire',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nom' },
        { name: 'start', type: 'text', placeholder: 'Point de départ' },
        { name: 'end', type: 'text', placeholder: 'Destination' },
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Ajouter',
          handler: (data: { name: any; start: any; end: any; }) => {
            if (data.name && data.start && data.end) {
              // Abonnement à l'Observable retourné par createRoute
              this.apiService.createRoute(data).subscribe(
                response => {
                  if (response && response.route) {
                    // Si la réponse contient un itinéraire, l'ajouter à la liste
                    this.itineraries.push(response.route);
                    // Confirmer l'ajout
                    this.showToast('Itinéraire ajouté avec succès !');
                  } else {
                    this.showToast('Erreur lors de l\'ajout de l\'itinéraire.');
                  }
                },
                error => {
                  // Gestion des erreurs si l'API échoue
                  console.error('Erreur lors de la création de l\'itinéraire', error);
                  this.showToast('Impossible de créer l\'itinéraire.');
                }
              );
            } else {
              this.showToast('Veuillez remplir tous les champs.');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // Méthode pour afficher un toast (optionnel)
  showToast(message: string) {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
    }).then(toast => toast.present());
  }

}

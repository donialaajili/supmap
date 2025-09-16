import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.services';
import { LoadingController, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-testprofil',
  templateUrl: './testprofil.page.html',
  styleUrls: ['./testprofil.page.scss'],
  standalone: false,
})
export class TestprofilPage  {
  user = {
    username: '',  // Renommé de name à username pour correspondre au backend
    email: '',
    telephone: '', // Utilise "telephone" au lieu de "phone" pour correspondre au modèle backend
  };
  isLoading = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.loadUserProfile();
  }

  // Méthode pour charger le profil utilisateur depuis l'API
  async loadUserProfile() {
    const loading = await this.loadingController.create({
      message: 'Chargement du profil...',
      spinner: 'crescent'
    });
    await loading.present();

    this.apiService.getUserProfile().subscribe({
      next: (data: any) => {
        console.log('getUserProfile OK', data); 
        console.log('Profil récupéré:', data);
        // Mise à jour des données utilisateur
        this.user.username = data.username || ''; // Renommé de name à username
        this.user.email = data.email || '';
        this.user.telephone = data.telephone || ''; // Utilise "telephone" au lieu de "phone"
        loading.dismiss();
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération du profil:', error);
        this.presentToast('Impossible de charger votre profil. Veuillez réessayer.');
        loading.dismiss();
      }
    });
  }
  // Fonction pour sauvegarder les informations de l'utilisateur
  async saveProfile() {
    try {
      // Log au début de la fonction
      console.log('Fonction saveProfile() appelée');

      // Afficher les données avant envoi pour débogage
      console.log('Données à envoyer au serveur:', this.user);

      const loading = await this.loadingController.create({
        message: 'Enregistrement des modifications...',
        spinner: 'crescent'
      });
      await loading.present();

      // Création de l'objet à envoyer à l'API
      const profileData = {
        username: this.user.username,
        email: this.user.email,
        telephone: this.user.telephone // Utilise "telephone" au lieu de "phone"
      };
      console.log('Objet profileData créé:', profileData);

      // Vérifier le token avant d'envoyer
      const token = localStorage.getItem('token');
      console.log('Token trouvé:', token ? 'Oui' : 'Non');
      if (!token) {
        console.error('Token non trouvé, authentification impossible');
        this.presentToast('Erreur d\'authentification. Veuillez vous reconnecter.');
        loading.dismiss();
        return;
      }

      console.log('Avant appel à updateUserProfile');
      this.apiService.updateUserProfile(profileData).subscribe({
        next: (response: any) => {
          console.log('Réponse du serveur:', response);
          this.presentToast('Profil mis à jour avec succès!');
          // Recharger les données du profil pour confirmer la mise à jour
          this.loadUserProfile();
          loading.dismiss();
          // Redirige vers la page d'accueil ou la page précédente
          this.router.navigate(['/apres-connexion/tabs1/tab1apres']);
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour du profil:', error);
          this.presentToast('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
          loading.dismiss();
        }
      });
      console.log('Après appel à updateUserProfile');
    } catch (err) {
      console.error('Erreur dans saveProfile():', err);
    }
  }
  // Méthode utilitaire pour afficher des messages toast
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }

  // Méthode de test pour vérifier si les événements click fonctionnent
  testButtonClick() {
    console.log('Bouton de test cliqué!');
    this.presentToast('Bouton de test cliqué!');
  }
}


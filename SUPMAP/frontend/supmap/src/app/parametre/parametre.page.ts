import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { UserService } from '../services/user.services';
import { ApiService } from '../services/api.services';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-parametre',
  templateUrl: './parametre.page.html',
  styleUrls: ['./parametre.page.scss'],
  standalone: false,
})


export class ParametrePage implements OnInit {



  user: any = {};  // ✅ Initialisation de l'utilisateur
  newPassword: string = '';
  confirmPassword: string = '';
  oldPassword: string = '';
  isLightMode: boolean = true;
  loginMethod: 'google' | 'facebook' | null = null;



  constructor(
    private userService: UserService,
    private navCtrl: NavController,
    private router: Router,
    private apiService: ApiService,
    private http: HttpClient,
    private toastController: ToastController,
    
  ) {}

  ngOnInit() {
    this.apiService.getUserProfile().subscribe({
      next: (data) => {
        this.loginMethod = data.loginMethod || '';
        this.user = data;
      },
      error: (err) => {
        console.error('Erreur récupération profil :', err);
      }
    });

  }

  unlink() {
    let url = '';

    // Vérifie si l'utilisateur utilise Google ou Facebook pour se connecter
    if (this.loginMethod === 'google') {
      url = 'http://localhost:4000/users/unlink-google'; // Assure-toi que l'URL est correcte
    } else if (this.loginMethod === 'facebook') {
      url = 'http://localhost:4000/users/unlink-facebook'; // Assure-toi que l'URL est correcte
    }



    // Envoie une requête DELETE au backend pour délier le compte
    this.http.post(url, {}).subscribe(
      async (response: any) => {
        // Afficher un message de succès
        const toast = await this.toastController.create({
          message: response.message,
          duration: 2000,
          color: 'success',
        });
        await toast.present();

        // Après déliement, on peut aussi mettre à jour la méthode de connexion ou rediriger l'utilisateur
        this.loginMethod = null;  // Par exemple, réinitialiser la méthode de connexion
      },
      async (error) => {
        // Si erreur, affiche un message d'erreur
        const toast = await this.toastController.create({
          message: 'Erreur lors du déliement du compte.',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      }
    );
  }



  updateProfile() {
    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    // ✅ Mise à jour du profil (nom, prénom, email, etc.)
    this.userService.updateProfile(this.user).subscribe(
      (response) => {
        alert('Profil mis à jour avec succès !');
      },
      (error) => {
        alert('Erreur lors de la mise à jour du profil.');
        console.error(error);
      }
    );

    // ✅ Mise à jour du mot de passe uniquement s’il y en a un
    if (this.newPassword) {
      this.userService.changePassword(this.oldPassword, this.newPassword).subscribe(
        (response) => {
          alert('Mot de passe mis à jour !');
        },
        (error) => {
          alert('Erreur lors du changement de mot de passe.');
          console.error(error);
        }
      );
    }
  }

  toggleLightMode() {
    this.userService.updateTheme(this.isLightMode).subscribe(
      (response) => {
        alert('Mode clair/dark mis à jour.');
      },
      (error) => {
        alert('Erreur lors de la mise à jour du thème.');
        console.error(error);
      }
    );
  }

  deactivateAccount() {
    this.userService.deactivateAccount().subscribe(
      (response) => {
        alert('Compte désactivé.');
        this.navCtrl.navigateBack('/connexion');
      },
      (error) => {
        alert('Erreur lors de la désactivation du compte.');
        console.error(error);
      }
    );
  }

  deleteAccount() {
    this.userService.deleteAccount().subscribe(
      (response) => {
        alert('Compte supprimé.');
        this.navCtrl.navigateBack('/connexion');
      },
      (error) => {
        alert('Erreur lors de la suppression du compte.');
        console.error(error);
      }
    );
  }
}


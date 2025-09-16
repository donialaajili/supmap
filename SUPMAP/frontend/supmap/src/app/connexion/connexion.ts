import { Component } from '@angular/core';
import { ApiService } from '../services/api.services';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from '../services/user.services';
@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.html',
  styleUrls: ['./connexion.scss'],
  standalone: false,
})
export class PageConnexion {
  email = '';
  password = '';
  errorMessage = ''; // Pour afficher les erreurs




  constructor(private apiService: ApiService, private userService: UserService, private router: Router, private alertController: AlertController,) { }

  ngOnInit() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    localStorage.setItem('token', token);
    this.router.navigate(['/apres-connexion/tab1']); // Redirect to the desired route
  }
}

  // Modifie la méthode pour accepter l'argument `event: Event`
  login(event: Event) {
    event.preventDefault();

    this.apiService.loginUser({ email: this.email, password: this.password })
      .subscribe({
        next: (response: any) => {
          console.log('Connexion réussie :', response);
          localStorage.setItem('token', response.token);
          this.router.navigate(['/apres-connexion/tab1']);
        },
        error: (error: any) => {
          console.error('Erreur de connexion :', error);

          const msg = error?.error?.error;

          if (msg && msg.includes('vérifier votre adresse e-mail') && this.email && this.password) {
            this.router.navigate(['/verify-email'], { queryParams: { email: this.email } });
            this.errorMessage = '❌ Veuillez vérifier votre e-mail avant de vous connecter.';
          } else if (msg && msg.includes('désactivé')) {
            this.presentReactivationAlert(this.email);
          } else {
            this.errorMessage = msg || 'Identifiants incorrects. Veuillez réessayer.';
          }
        }
      });
  }
  loginWithGoogle() {
    window.location.href = 'http://localhost:4000/auth/google';
  }

  loginWithFacebook() {
    window.location.href = 'http://localhost:4000/auth/facebook';
  }



  async presentReactivationAlert(email: string) {
    const alert = await this.alertController.create({
      header: 'Compte désactivé',
      message: 'Votre compte est désactivé. Voulez-vous le réactiver ?',
      buttons: [
        {
          text: 'Non',
          role: 'cancel'
        },
        {
          text: 'Oui, réactiver',
          handler: () => {
            this.userService.reactivate(email, this.password).subscribe({
              next: (res: any) => {
                localStorage.setItem('token', res.token);
                this.router.navigate(['/apres-connexion/tab1']);
              },
              error: (err) => {
                this.errorMessage = err.error?.error || "Erreur lors de la réactivation";
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

}
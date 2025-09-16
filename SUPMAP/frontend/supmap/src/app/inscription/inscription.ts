import { Component } from '@angular/core';
import { ApiService } from '../services/api.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.html',
  styleUrls: ['./inscription.scss'],
  standalone:false,
})
export class PageInscription {
  username = '';
  email = '';
  password = '';
  telephone= '';
  errorMessage = ''; // Pour afficher les erreurs

  constructor(private apiService: ApiService, private router: Router) {}

  // Méthode pour l'inscription
  register(event: Event) {
    event.preventDefault(); // Empêche la soumission classique du formulaire

    this.apiService.registerUser({ username: this.username, email: this.email, password: this.password, telephone: this.telephone,})
      .subscribe({
        next: (response: any) => {
          console.log('Inscription réussie :', response);
          localStorage.setItem('token', response.token);
          this.router.navigate(['/verify-email'], { queryParams: { email: this.email } }); // Rediriger vers la page de vérification du compte avec l'email
        },
        error: (error: any) => {
          console.error('Erreur d\'inscription :', error);
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      });
  }
}


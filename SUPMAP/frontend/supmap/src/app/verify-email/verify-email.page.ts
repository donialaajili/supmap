// 📁 src/app/verify-email/verify-email.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.services';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class VerifyEmailPage implements OnInit {
  email: string = '';
  code: string = '';
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
  }

  async verify() {
    if (!this.code || !this.email) return;

    this.isLoading = true;
    this.error = '';
    this.message = '';

    this.apiService.verifyEmailCode({ email: this.email, code: this.code }).subscribe({
      next: async (response) => {
        this.message = '✅ Email vérifié avec succès';
        this.isLoading = false;

        if (response.token) {
          localStorage.setItem('token', response.token); // stocker le JWT

          const toast = await this.toastController.create({
            message: 'Bienvenue sur SUPMAP 👋',
            duration: 2000,
            color: 'success'
          });
          await toast.present();

          this.router.navigate(['/apres-connexion/tab1']); // Rediriger vers l’accueil ou dashboard
        } else {
          // fallback si pas de token
          setTimeout(() => this.router.navigate(['/connexion']), 3000);
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur de vérification';
        this.isLoading = false;
      }
    });
  }

  resendCode() {
    if (!this.email) {
      this.error = 'Veuillez entrer votre adresse e-mail.';
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    this.message = '';

    this.apiService.resendVerificationCode(this.email).subscribe({
      next: (res) => {
        this.message = "📨 Nouveau code envoyé.";
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors du renvoi.';
        this.isLoading = false;
      }
    });
  }
}
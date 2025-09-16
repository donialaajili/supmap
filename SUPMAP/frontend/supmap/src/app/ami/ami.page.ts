import { Component, OnInit } from '@angular/core';
import { ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.services';

@Component({
  selector: 'app-ami',
  templateUrl: './ami.page.html',
  styleUrls: ['./ami.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AmiPage implements OnInit {
  amis: any[] = [];
  blocages: any[] = [];
  rechercheAmi: string = '';
  resultatsRecherche: any[] = [];
  demandes: any[] = [];

  constructor(
    private toastController: ToastController,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.chargerAmis();
    this.chargerDemandes();
  }

  // 🔄 Charger amis + bloqués, avec isBlocked
  chargerAmis(): void {
    this.apiService.getUserProfile().subscribe({
      next: (data: any) => {
        const blockedIds = data.blockedUsers?.map((u: any) => u._id) || [];
        const amis = data.friends || [];

        // On ajoute manuellement isBlocked pour chaque ami
        this.amis = amis
          .filter((ami: any) => !blockedIds.includes(ami._id))
          .map((ami: any) => ({ ...ami, isBlocked: false }));

        this.blocages = amis
          .filter((ami: any) => blockedIds.includes(ami._id))
          .map((ami: any) => ({ ...ami, isBlocked: true }));
      },
      error: () => this.showToast('Erreur chargement amis')
    });
  }

  // 🔁 Demandes reçues
  chargerDemandes(): void {
    this.apiService.getFriendRequests().subscribe({
      next: (res: any) => {
        this.demandes = res.requests || [];
      },
      error: () => this.showToast('Erreur chargement demandes')
    });
  }

  rechercherAmi(): void {
    if (!this.rechercheAmi.trim()) return;

    this.apiService.searchUser(this.rechercheAmi).subscribe({
      next: (res: any) => {
        const currentUsername = localStorage.getItem('username');
        this.resultatsRecherche = (res.users || []).filter((u: any) => u.username !== currentUsername);
      },
      error: () => this.showToast('Erreur de recherche')
    });
  }

  ajouterAmiDepuisRecherche(username: string): void {
    this.apiService.sendFriendRequest(username).subscribe({
      next: () => {
        this.showToast('Demande envoyée');
        this.rechercheAmi = '';
        this.resultatsRecherche = [];
      },
      error: () => this.showToast('Erreur envoi demande')
    });
  }

  acceptDemande(ami: any): void {
    this.apiService.acceptFriendRequest(ami.username).subscribe({
      next: () => {
        this.showToast(`${ami.username} accepté(e) !`);
        this.chargerAmis();
        this.chargerDemandes();
      },
      error: () => this.showToast('Erreur lors de l\'acceptation')
    });
  }

  supprimerAmi(ami: any): void {
    this.apiService.removeFriend(ami.username).subscribe({
      next: () => {
        this.showToast(`${ami.username} supprimé.`);
        this.chargerAmis();
      },
      error: () => this.showToast('Erreur suppression')
    });
  }

  toggleBlocage(ami: any): void {
    if (ami.isBlocked) {
      this.apiService.unblockUser(ami.username).subscribe({
        next: () => {
          this.showToast(`${ami.username} débloqué.`);
          this.chargerAmis();
        },
        error: () => this.showToast('Erreur lors du déblocage')
      });
    } else {
      this.apiService.blockUser(ami.username).subscribe({
        next: () => {
          this.showToast(`${ami.username} bloqué.`);
          this.chargerAmis();
        },
        error: () => this.showToast('Erreur lors du blocage')
      });
    }
  }

  refuserDemande(demande: any): void {
    this.apiService.refuseFriendRequest(demande.username).subscribe({
      next: () => {
        this.showToast(`Demande de ${demande.username} refusée.`);
        this.chargerDemandes();
      },
      error: () => this.showToast('Erreur lors du refus de la demande')
    });
  }

  async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }
}

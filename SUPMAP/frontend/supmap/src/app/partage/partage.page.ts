import { Component } from '@angular/core';
import { io } from 'socket.io-client';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-partage',
  templateUrl: './partage.page.html',
  styleUrls: ['./partage.page.scss'],
  standalone: false,
})
export class PartagePage {
  socket: any;
  userPosition: [number, number] | null = null;
  partageLink: string = '';
  qrData: string = '';
  showQR: boolean = false;
  amis = ['Alice', 'Bob', 'Charlie'];
  amiSelectionne: string | null = null;
  isSharingWithFriend = false;

  constructor(private toastController: ToastController) {
    this.socket = io('http://localhost:3000');
  }

  // Obtenir la position actuelle
  async getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.userPosition = [lat, lng];
        this.partageLink = `https://maps.google.com/?q=${lat},${lng}`;
      });
    } else {
      this.showToast("La géolocalisation n'est pas supportée.");
    }
  }

  // Copier le lien
  async copyLink() {
    if (this.partageLink) {
      try {
        await navigator.clipboard.writeText(this.partageLink);
        this.showToast('Lien copié dans le presse-papiers !');
      } catch (err) {
        this.showToast('Échec de la copie du lien.');
        console.error(err);
      }
    }
  }

  // Générer le QR code
  generateQRCode() {
    if (this.partageLink) {
      this.qrData = this.partageLink;
      this.showQR = true;
    } else {
      this.showToast('Aucun lien de partage disponible.');
    }
  }

  // Partage en temps réel via WebSocket
  startSharingWithFriend() {
    if (this.amiSelectionne) {
      this.isSharingWithFriend = true;
      navigator.geolocation.watchPosition((position) => {
        this.userPosition = [position.coords.latitude, position.coords.longitude];
        this.socket.emit('shareLocation', {
          ami: this.amiSelectionne,
          position: this.userPosition,
        });
      });
      this.showToast(`Partage activé avec ${this.amiSelectionne}`);
    }
  }

  stopSharing() {
    this.isSharingWithFriend = false;
    this.amiSelectionne = null;
    this.showToast("Partage d'itinéraire arrêté.");
  }

  // Toast Ionic
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }
}

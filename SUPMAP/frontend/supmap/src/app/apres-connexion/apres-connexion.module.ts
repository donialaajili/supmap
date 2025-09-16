import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApresConnexionRoutingModule } from './apres-connexion-routing.module';
import { FormsModule } from '@angular/forms';
// Importation du composant standalone
import { ApresConnexionPage } from './apres-connexion.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ApresConnexionRoutingModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ApresConnexionPage,  // Utilisation du composant standalone dans la route
      },
    ]),
  ],
})
export class ApresConnexionModule {}




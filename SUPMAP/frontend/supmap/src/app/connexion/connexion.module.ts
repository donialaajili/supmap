import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageConnexion } from './connexion';


import { PageConnexionRoutingModule } from './connexion-routing.module';
import { ExploreContainerComponentModule } from "../explore-container/explore-container.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PageConnexionRoutingModule,
    ExploreContainerComponentModule
],
  declarations: [PageConnexion]
})
export class PageConnexionModule {}

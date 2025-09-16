import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageInscription } from './inscription';


import { PageInscriptionRoutingModule } from './inscription-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PageInscriptionRoutingModule
  ],
  declarations: [PageInscription]
})
export class PageInscriptionModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignalisationPageRoutingModule } from './signalisation-routing.module';

import { SignalisationPage } from './signalisation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignalisationPageRoutingModule
  ],
  declarations: [SignalisationPage]
})
export class SignalisationPageModule {}

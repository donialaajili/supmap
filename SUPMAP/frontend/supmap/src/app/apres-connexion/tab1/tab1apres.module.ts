import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Tab1apresPageRoutingModule } from './tab1apres-routing.module';
import { Tab1apresPage } from './tab1apres.page';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    Tab1apresPageRoutingModule
  ],
  declarations: [Tab1apresPage]
})
export class Tab1apresPageModule{}  // Le nom du module doit aussi correspondre


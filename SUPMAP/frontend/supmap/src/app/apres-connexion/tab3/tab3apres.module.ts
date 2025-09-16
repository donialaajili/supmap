import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3apresPage } from './tab3apres.page';


import { Tab3apresPageRoutingModule } from './tab3apres-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,

    Tab3apresPageRoutingModule
  ],
  declarations: [Tab3apresPage]
})
export class Tab3apresPageModule {}

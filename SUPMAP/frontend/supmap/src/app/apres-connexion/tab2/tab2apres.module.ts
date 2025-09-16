import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2apresPage } from './tab2apres.page';


import { Tab2apresPageRoutingModule } from './tab2apres-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,

    Tab2apresPageRoutingModule
  ],
  declarations: [Tab2apresPage]
})
export class Tab2apresPageModule {}

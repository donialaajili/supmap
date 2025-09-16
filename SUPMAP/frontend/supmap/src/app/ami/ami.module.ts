import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AmiPageRoutingModule } from './ami-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AmiPageRoutingModule
  ]
  // ❌ PAS de `declarations` ici car AmiPage est standalone
})
export class AmiPageModule {}

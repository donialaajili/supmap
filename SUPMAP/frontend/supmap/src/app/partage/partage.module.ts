import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { PartagePage } from './partage.page';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    PartagePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: PartagePage }]), // ✅ virgule ici
    QRCodeModule
  ]
})
export class PartagePageModule {}

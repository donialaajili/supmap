import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageOuverture } from './page-ouverture';


import { PageOuvertureRoutingModule } from './page-ouverture-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PageOuvertureRoutingModule
  ],
  declarations: [PageOuverture]
})
export class PageOuvertureModule {}

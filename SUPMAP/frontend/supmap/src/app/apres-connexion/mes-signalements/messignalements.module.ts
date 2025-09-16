import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MessignalementsPageRoutingModule } from './messignalements-routing.module';
import { messignalementsPage } from './messignalements.page';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    MessignalementsPageRoutingModule
  ],
  declarations: [messignalementsPage]
})
export class messignalementsModule{}  // Le nom du module doit aussi correspondre


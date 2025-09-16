import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageWelcome } from './welcome';


import { PageWelcomeRoutingModule } from './welcome-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PageWelcomeRoutingModule
  ],
  declarations: [PageWelcome]
})
export class PageWelcomeModule {}

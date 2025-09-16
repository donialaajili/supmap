import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsapresPageRoutingModule } from './tabsapres-routing.module';

import { TabsapresPage } from './tabsapres.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsapresPageRoutingModule
  ],
  declarations: [TabsapresPage]
})
export class TabsapresPageModule {}

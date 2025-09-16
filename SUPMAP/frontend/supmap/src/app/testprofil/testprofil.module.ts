import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TestprofilPageRoutingModule } from './testprofil-routing.module';

import { TestprofilPage } from './testprofil.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TestprofilPageRoutingModule
  ],
  declarations: [TestprofilPage]
})
export class TestprofilPageModule {}

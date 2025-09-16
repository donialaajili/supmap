import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignalisationPage } from './signalisation.page';

const routes: Routes = [
  {
    path: '',
    component: SignalisationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignalisationPageRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { messignalementsPage } from './messignalements.page';

const routes: Routes = [
  {
    path: '',
    component: messignalementsPage,  // Le composant est bien modifié
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessignalementsPageRoutingModule{}  // Renomme le module ici aussi

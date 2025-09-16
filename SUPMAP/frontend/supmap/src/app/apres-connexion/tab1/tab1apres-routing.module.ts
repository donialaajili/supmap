import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab1apresPage } from './tab1apres.page';

const routes: Routes = [
  {
    path: '',
    component: Tab1apresPage,  // Le composant est bien modifié
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab1apresPageRoutingModule{}  // Renomme le module ici aussi


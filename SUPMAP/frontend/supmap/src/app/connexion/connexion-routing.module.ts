import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageConnexion } from './connexion';

const routes: Routes = [
  {
    path: '',
    component: PageConnexion,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageConnexionRoutingModule {}

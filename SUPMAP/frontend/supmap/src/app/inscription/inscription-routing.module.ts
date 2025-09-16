import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageInscription } from './inscription';

const routes: Routes = [
  {
    path: '',
    component: PageInscription,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageInscriptionRoutingModule {}

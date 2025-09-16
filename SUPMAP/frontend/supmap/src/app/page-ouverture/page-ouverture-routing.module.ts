import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageOuverture } from './page-ouverture';

const routes: Routes = [
  {
    path: '',
    component: PageOuverture,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageOuvertureRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab3apresPage } from './tab3apres.page';

const routes: Routes = [
  {
    path: '',
    component: Tab3apresPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab3apresPageRoutingModule {}

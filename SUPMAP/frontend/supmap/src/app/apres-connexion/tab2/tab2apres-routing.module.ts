import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab2apresPage } from './tab2apres.page';

const routes: Routes = [
  {
    path: '',
    component: Tab2apresPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab2apresPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AmiPage } from './ami.page';

const routes: Routes = [
  {
    path: '',
    component: AmiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AmiPageRoutingModule {}

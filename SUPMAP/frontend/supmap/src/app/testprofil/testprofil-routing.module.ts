import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestprofilPage } from './testprofil.page';

const routes: Routes = [
  {
    path: '',
    component: TestprofilPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestprofilPageRoutingModule {}

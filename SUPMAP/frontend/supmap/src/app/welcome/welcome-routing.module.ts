import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageWelcome } from './welcome';

const routes: Routes = [
  {
    path: '',
    component: PageWelcome,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageWelcomeRoutingModule {}

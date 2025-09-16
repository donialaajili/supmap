import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsapresPage } from './tabsapres.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsapresPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../tab1/tab1apres.module').then(m => m.Tab1apresPageModule),
      },
      {
        path: 'tab2',
        loadChildren: () => import('../tab2/tab2apres.module').then(m => m.Tab2apresPageModule),
      },
      {
        path: 'tab3',
        loadChildren: () => import('../tab3/tab3apres.module').then(m => m.Tab3apresPageModule),
      },
      {
        path: '',
        redirectTo: 'tab1', // Redirection par défaut pour 'tabs'
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsapresPageRoutingModule {}


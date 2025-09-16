import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from '../tabs/tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../apres-connexion/tab1/tab1apres.module').then(m => m.Tab1apresPageModule),
      },
      {
        path: 'tab2',
        loadChildren: () => import('../apres-connexion/tab2/tab2apres.module').then(m => m.Tab2apresPageModule),
      },
      {
        path: 'tab3',
        loadChildren: () => import('../apres-connexion/tab3/tab3apres.module').then(m => m.Tab3apresPageModule),
      },
      
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApresConnexionRoutingModule {}


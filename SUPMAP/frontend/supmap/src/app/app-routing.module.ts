import { messignalementsModule } from './apres-connexion/mes-signalements/messignalements.module';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard'; // Importer le AuthGuard

const routes: Routes = [
  {
    path: '',
    redirectTo: 'page-ouverture', // Par défaut, rediriger vers la page d'ouverture
    pathMatch: 'full',
  },
  {
    path: 'page-ouverture',
    loadChildren: () => import('./page-ouverture/page-ouverture.module').then(m => m.PageOuvertureModule),
  },
  {
    path: 'connexion',
    loadChildren: () => import('./connexion/connexion.module').then(m => m.PageConnexionModule),
  },
  {
    path: 'inscription',
    loadChildren: () => import('./inscription/inscription.module').then(m => m.PageInscriptionModule),
  },
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then(m => m.PageWelcomeModule),
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
  },
  {
    path: 'apres-connexion',
    loadChildren: () => import('./apres-connexion/apres-connexion.module').then(m => m.ApresConnexionModule),
    canActivate: [AuthGuard], // Protéger cette route avec AuthGuard
  },
  {
    path: 'mes-signalements',
    loadChildren: () => import('./apres-connexion/mes-signalements/messignalements.module').then(m => m.messignalementsModule),
    canActivate: [AuthGuard], // Protéger cette route avec AuthGuard
  },


  {
    path: 'testprofil',
    loadChildren: () => import('./testprofil/testprofil.module').then( m => m.TestprofilPageModule),
    canActivate: [AuthGuard], // Protéger cette route avec AuthGuard
  },
  {
    path: 'signalisation',
    loadChildren: () => import('./signalisation/signalisation.module').then( m => m.SignalisationPageModule),
  canActivate: [AuthGuard], // Protéger cette route avec AuthGuard
  },
  {
    path: 'gestion',
    loadChildren: () => import('./gestion/gestion.module').then( m => m.GestionPageModule),
    canActivate: [AuthGuard], // Protéger cette route avec AuthGuard
  },
  {
    path: 'parametre',
    loadChildren: () => import('./parametre/parametre.module').then( m => m.ParametrePageModule),
    canActivate: [AuthGuard], // Protéger cette route avec AuthGuard
  },
  {
    path: 'ami',
    loadChildren: () => import('./ami/ami.module').then( m => m.AmiPageModule),
    canActivate: [AuthGuard], // Protéger cette route avec AuthGuard
  },

  {
    path: 'signal',
    loadChildren: () => import('./signal/signal.module').then( m => m.SignalPageModule),
    canActivate: [AuthGuard], // Protéger cette route avec AuthGuard
  },
  {
    path: 'partage',
    loadChildren: () => import('./partage/partage.module').then( m => m.PartagePageModule),
    canActivate: [AuthGuard], // Protéger cette route avec AuthGuard
  },
  {
    path: 'verify-email',
    loadChildren: () => import('./verify-email/verify-email.module').then( m => m.VerifyEmailPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}


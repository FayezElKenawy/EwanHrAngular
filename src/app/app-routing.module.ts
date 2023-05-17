import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '@shared/components/page-not-found/page-not-found.component';
import { AuthGuard } from '@shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'finance/auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: '',
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'finance',
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'finance/home',
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'finance/receipts',
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./receipts/receipts.module').then(m => m.ReceiptsModule)
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

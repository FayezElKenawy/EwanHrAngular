import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CoreLayoutComponent } from '@shared/layouts/core-layout/core-layout.component';
import { SectorsComponent } from './sectors/sectors.component';

const routes: Routes = [
  {
    path: '', component: SectorsComponent
  },
  {
    path: 'dashboard',
    children: [
      { path: '', component: DashboardComponent },
      { path: '', redirectTo: '', pathMatch: 'full' }
    ],
    component: CoreLayoutComponent
  },
  {
    path: 'hrSectors', component: SectorsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}

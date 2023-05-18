import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './dashboard/dashboard.component';
import { CoreLayoutComponent } from '@shared/layouts/core-layout/core-layout.component';
import { SectorsComponent } from './sectors/sectors.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'home', component: AboutComponent },  
      { path: 'about', component: AboutComponent },
      { path: '', redirectTo: '', pathMatch: 'full' }
    ],
    component: CoreLayoutComponent
  },
  {
    path: 'financeSectors', component: SectorsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}

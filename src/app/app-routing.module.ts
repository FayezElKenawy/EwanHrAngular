import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '@shared/components/page-not-found/page-not-found.component';
import { AuthGuard } from '@shared/guards/auth.guard';

const routes: Routes = [
  {
    path:'',
    loadChildren:()=>import('./home/home.module').then(m=>m.HomeModule)
  },
  {
    path:'hr',
    loadChildren:()=>import('./home/home.module').then(m=>m.HomeModule)
  },
  {
    path:'hr/attendance',
    loadChildren:()=>import('./attendance/attendance.module').then(m=>m.AttendanceModule)
  },
  {
    path:'hr/payroll',
    loadChildren:()=>import('./attendance/attendance.module').then(m=>m.AttendanceModule)
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

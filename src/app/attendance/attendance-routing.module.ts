import { NgModule } from "@angular/core";
import { Route, RouterModule, Routes } from "@angular/router";
import { CoreLayoutComponent } from "@shared/layouts/core-layout/core-layout.component";
import { ListAttendanceComponent } from "./components/list-attendance/list-attendance.component";
import { ListPayrollComponent } from "./components/list-payroll/list-payroll.component";
import { MonthSettingsComponent } from "./components/month-settings/month-settings.component";

const routes :Routes =[{
path:'',
children:[
  { path: '', component: ListAttendanceComponent },
  { path:'attendance', component: ListAttendanceComponent },
  { path:'settings', component: MonthSettingsComponent },
  { path:'payroll', component: ListPayrollComponent }
],
component:CoreLayoutComponent,
}]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
  })
  export class AttendanceRoutingModule {}
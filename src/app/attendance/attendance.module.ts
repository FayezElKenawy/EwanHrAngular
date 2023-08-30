import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListAttendanceComponent } from './components/list-attendance/list-attendance.component';
import { AttendanceRoutingModule } from './attendance-routing.module';
import { SharedModule } from "../shared/shared.module";
import { ListPayrollComponent } from './components/list-payroll/list-payroll.component';
import { MonthSettingsComponent } from './components/month-settings/month-settings.component';
import {MultiSelectModule} from 'primeng/multiselect';


@NgModule({
    declarations: [
        ListAttendanceComponent,
        ListPayrollComponent,
        MonthSettingsComponent,
    ],
    imports: [
        CommonModule,
        AttendanceRoutingModule,
        SharedModule,
        MultiSelectModule
    ]
})
export class AttendanceModule { }

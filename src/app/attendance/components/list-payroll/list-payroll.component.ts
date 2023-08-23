import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';
import { ColumnPipeType } from '@shared/enum/column-pipe.enum';
import { ColumnPipeFormat } from '@shared/enum/columns-pipe-format.enum';
import { SearchType } from '@shared/enum/searchType.enum';
import { PageListConfig } from '@shared/models/page-list-config.model';
import { PayrollService } from '../../services/payroll.service';
import { DateFormatPipe } from 'angular2-moment';
import { from } from 'rxjs';
import { GlobalService, MessageType } from '@shared/services/global.service';

@Component({
  selector: 'app-list-payroll',
  templateUrl: './list-payroll.component.html',
  styleUrls: ['./list-payroll.component.scss']
})
export class ListPayrollComponent implements OnInit {
  pageListConfig: PageListConfig;
  from:string;
  to:string;
  month:string;

constructor(
  private _payrollService:PayrollService,
  private _globalService: GlobalService,
){}

onSelectFromDate(){
  this.createPageListConfig();
}

onClaculate(date:string){
  this._payrollService.calculate(this.month).subscribe((res)=>{
    if(res){
      this._globalService.messageAlert(MessageType.Info,"تم احتساب البيانات");
    }else{
      console.log(res);
      this._globalService.messageAlert(MessageType.Error ,"حدث خطأ ما")
    }
    
  });
}
  ngOnInit(): void {
    this.createPageListConfig();
  }
  createPageListConfig() {
    this.pageListConfig = {
      pageAuthorization: '',
      pageTitle: 'Attendance.Titles.PayRoll',
      createAuthorization: '',
      createButtonTitle: '',
      createLink: '',
      getDataAPIURL: `${environment.hrSectorAPIURL}/v1/PayRoll/GetAll`,
      searchFields: [
        {
          fieldName: 'from',
          operator: 'equal',
          value: this.from
        },
        {
          fieldName: '',
          operator: 'equal',
          value: ""
        },
      ],
      actions: [
      
      ],
       cols:[
        {
          field: "id",
          header: "Attendance.Titles.Id",
        },
        {
          field: 'month',
          header: 'Attendance.Titles.Month'
        },
        {
          field: 'year',
          header: 'Attendance.Titles.Year'
        },
        {
          field: 'employeeCode',
          header: 'Attendance.Titles.EmployeeId'
        },
        {
          field: 'employeeName',
          header: 'Attendance.Titles.EmployeeName'
        },
        {
          field: "idType",
          header: "Attendance.Titles.IdType"
        },
        {
          field: 'idNumber',
          header: 'Attendance.Titles.IdNumber',
        },
        {
          field: "bankName",
          header: "Attendance.Titles.BankName",
        },
        {
          field: "ibanNumber",
          header: "Attendance.Titles.IbanNumber",
        },
        {
          field: "workDate",
          header: "Attendance.Titles.WorkDate",
          pipe:ColumnPipeType.Date,
          pipeFormat: ColumnPipeFormat.DatePipeFormat,
        },
        {
          field: "monthDays",
          header: "Attendance.Titles.MonthDays",
        },
        {
          field: "directAbsent",
          header: "Attendance.Titles.DirectAbsent",
        },
        {
          field: "absentWithPermission",
          header: "Attendance.Titles.AbsentWithPermission",
        },
        {
          field: "absentWithouPermission",
          header: "Attendance.Titles.AbsentWithouPermission",
        },
        {
          field: "medicalAbsent",
          header: "Attendance.Titles.MedicalAbsent",
        },
        {
          field: "delayWithPermission",
          header: "Attendance.Titles.DelayWithPermission",
        },
        {
          field: "delayWithoutPermission",
          header: "Attendance.Titles.DelayWithoutPermission",
        },
        {
          field: "delayWithoutCutting",
          header: "Attendance.Titles.DelayWithoutCutting",
        },
      ],
      defaultOrder:'date',
      defaultOrderType:'desc'
    };
  }
}

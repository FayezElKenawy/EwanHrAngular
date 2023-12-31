import { Component, OnInit,  ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ColumnPipeType } from '@shared/enum/column-pipe.enum';
import { ColumnPipeFormat } from '@shared/enum/columns-pipe-format.enum';
import { SearchType } from '@shared/enum/searchType.enum';
import { PageListConfig } from '@shared/models/page-list-config.model';
import { DynamicSearchService } from '@shared/services/dynamic-search.service';
import { GlobalService } from '@shared/services/global.service';
import { attendnaceService } from '../../services/attendance.service';
import { Employees } from '../../models/emps-info.model';
import { GetAttendance } from '../../models/get-attendance.model';
import { PageListComponent } from '@shared/components/page-list/page-list.component';

@Component({
  selector: 'app-list-attendance',
  templateUrl: './list-attendance.component.html',
  styleUrls: ['./list-attendance.component.scss']
})
export class ListAttendanceComponent implements OnInit {
  from:string;
  to:string;
  id:string;
  pageListConfig: PageListConfig;
  employees!:Employees[];
  selectedEmps:Employees[];
  attendance!:GetAttendance[];
  minDate:Date;
  maxDate:Date;

  @ViewChild(PageListComponent) pagelist: PageListComponent;

  constructor(
    public _dynamicSearchService: DynamicSearchService,
    private globalService: GlobalService,
    private _router: Router,
    private _attendanceService:attendnaceService,
  ){}

  ngOnInit(): void {//debugger;
    this.createPageListConfig();
    this.onGetEmployeesData();
  }

  onGetEmployeesData(){//debugger;
    this._attendanceService.onGetEmployeesData().subscribe((res)=>{
      this.employees=res;
    });
  }

  onSelectFromDate(from:string){//debugger;
    this.minDate=new Date(from);
    this.createPageListConfig();
  }

  onSelectToDate(to:string){//debugger;
    this.maxDate=new Date(to);
    this.createPageListConfig();
  }

 onDownload(startTime:string,endTime:string,id:Employees[]){
  //debugger;
  this._attendanceService.downloadAttendanceList(startTime,endTime,id).subscribe((res) => {
    //debugger;
    let fileName=res.headers.get('content-disposition').split(';')[1].split('=')[1];
    let blob=res.body as Blob;
    let url=window.URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;
    a.href = url;
    a.download = fileName.substring(fileName.length-1,1);
    document.body.appendChild(a);
    a.click();
  });
}

onSelectItem(){
  this.createPageListConfig();
}
onAdvancedSearch(selectedemp:Employees[]) {debugger;
  this.selectedEmps=selectedemp;
  this.pagelist.getPagedList();
  //this.globalService.triggerEvent();
}

  createPageListConfig() {//debugger;
    this.pageListConfig = {
      pageAuthorization: '',
      pageTitle: 'Attendance.Titles.AttendanceListPage',
      createAuthorization: '',
      createButtonTitle: 'Receipts.Buttons.CreditNoteCreate',
      createLink: '',
      getDataAPIURL: `${environment.hrSectorAPIURL}/v1/Attendance/GetAllAttendance`,
      searchFields: [
        {
          fieldName: 'from',
          operator: 'equal',
          value: this.from
        },
        {
          fieldName: 'to',
          operator: 'equal',
          value: this.to
        },
        {
          fieldName: 'selectedEmps',
          operator: 'equal',
          value: JSON.stringify(this.selectedEmps)
        },
      ],
      actions: [
      
      ],
       cols:[
        {
          field: 'id',
          header: 'Attendance.Titles.id'
        },
        {
          field: 'employeeCode',
          header: 'Attendance.Titles.EmployeeId'
        },
        {
          field: "date",
          header: "Attendance.Titles.Date",
          searchType:SearchType.Date,
          pipe: ColumnPipeType.Date,
          pipeFormat: ColumnPipeFormat.DatePipeFormat,
        },
        {
          field: 'employeeName',
          header: 'Attendance.Titles.EmployeeName'
        },
        {
          field: "day",
          header: "Attendance.Titles.NameOfDay"
        },
        {
          field: 'clockIn',
          header: 'Attendance.Titles.ClockIn',
          pipe:ColumnPipeType.Date,
          pipeFormat: ColumnPipeFormat.TimePipeFromat,
        },
        {
          field: "clockOut",
          header: "Attendance.Titles.ClockOut",
          pipe:ColumnPipeType.Date,
          pipeFormat: ColumnPipeFormat.TimePipeFromat,
        },
        {
          field: "absentTime",
          header: "Attendance.Titles.AbsentTime",
        },
        {
          field: "overTime",
          header: "Attendance.Titles.OverTime",
        },
        {
          field: "changeTime",
          header: "Attendance.Titles.ChangeTime",
        },
      ],
      defaultOrder:'date',
      defaultOrderType:'desc'
    };
  }
}


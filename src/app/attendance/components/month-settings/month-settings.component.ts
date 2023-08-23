import { Component, OnInit } from '@angular/core';
import { attendnaceService } from '../../services/attendance.service';
import { MonthSettings } from '../../models/get-Month-Settings.model';
import { SelectItem } from 'primeng/api';
import { GlobalService, MessageType } from '@shared/services/global.service';

@Component({
  selector: 'app-month-settings',
  templateUrl: './month-settings.component.html',
  styleUrls: ['./month-settings.component.scss']
})
export class MonthSettingsComponent implements OnInit{
  months:MonthSettings[];
  from:string;
  to:string;
  month:MonthSettings;

  constructor(
    private _attendanceService:attendnaceService,
    private _globalService:GlobalService,
  ){}
  ngOnInit(): void {
    this.onGetMonthSettings();
  }

  onGetMonthSettings(){
    this._attendanceService.getMonthSettings().subscribe((res)=>{
    this.month=res;
    console.log(this.months);
    });
  }

  onSaveSettings(){
    debugger;
     this.month={from:this.month.from,to:this.month.to};
    this._attendanceService.onPostMonthSettings(this.month).subscribe((res)=>{
      if(res){
        this._globalService.messageAlert(MessageType.Info,"تم التعديل");
      }else{
        this._globalService.messageAlert(MessageType.Info,"حدث خطأ ما!");
      }
    });
  }
}

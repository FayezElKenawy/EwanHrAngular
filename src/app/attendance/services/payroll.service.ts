import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ColumnPipeFormat } from '@shared/enum/columns-pipe-format.enum';
import { GlobalService } from '@shared/services/global.service';
import { DateFormatPipe } from 'angular2-moment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  serviceUrl = `${environment.hrSectorAPIURL}/v1/PayRoll`;

  constructor(   
    private _http: HttpClient,
    private _globalService: GlobalService
    ) { }



  calculate(from:string):Observable<any>{
    //debugger;
    const[day,month,day1,year]=new Date(from).toDateString().split(' ');
    return this._http.get(`${this.serviceUrl}/Calculate`, {
      params:{fromDate:month+'/'+year}
    });
  }

  downloadPayroll(month:string,selectedEmps:[]){
    return this._http.get(`${this.serviceUrl}/DownloadPayrollSheet`, {
      params:{month:month ,emps:JSON.stringify(selectedEmps)},
      observe:"response",
      responseType:"blob"
    });
  }
}

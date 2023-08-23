import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { GlobalService } from '@shared/services/global.service';
import { Observable } from 'rxjs/internal/Observable';
import { MonthSettings } from '../models/get-Month-Settings.model';

@Injectable({
  providedIn: "root",
})
export class attendnaceService {

  serviceUrl = `${environment.hrSectorAPIURL}/v1/Attendance`;

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) { }


  getSelectListCostElementsBySectorId(searchTerm:string): Observable<any> {
    return this._http.get<any>(`${this.serviceUrl}/GetAllAttendance`, {
      params: { sectorId: this._globalService.getSectorType() , searchTerm: searchTerm },
    });
  }

  downloadAttendanceList(from:string,to:string,id:string){
    return this._http.get(`${this.serviceUrl}/DownloadAttendnace`, {
      params:{id:id,start:from.toString(),end:to.toString()},
      observe:"response",
      responseType:"blob"
    });

    }
    
  getMonthSettings(){
      return this._http.get<MonthSettings>(`${this.serviceUrl}/GetMonthSettings`);
  }

  onPostMonthSettings(GetSettings:any): Observable<any>{
    return this._http.post(`${this.serviceUrl}/InsertSettings`,GetSettings);
  }
}

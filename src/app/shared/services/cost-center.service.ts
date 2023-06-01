
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class CostCenterService {
  serviceUrl: string = environment.financeSectorAPIURL + '/v1/External';

  constructor(
    private _globalService: GlobalService,
    private _http: HttpClient
  ) {}

  getCostCenterSelectList(customerCode:string,searchTerm:string):Observable<any>{
    return this._http.get<any>(`${this.serviceUrl}/GetCostCenterSelectList`, {
      params: {sectorId:this._globalService.getSectorType() ,customerCode: customerCode, costCenterCode: searchTerm },
    });
  }


}


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesPeriodService {
  serviceUrl: string = environment.financeURL + '/v1/SalesPeriod';

  constructor(
    private _http: HttpClient
  ) {}

  getMinSelectedDate(sectorId:string):Observable<any>{
    return this._http.get<any>(`${this.serviceUrl}/GetMinSelectedDate`, {
      params: { sectorId: sectorId },
    });
  }
}


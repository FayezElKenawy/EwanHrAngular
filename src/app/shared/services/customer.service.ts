import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { GlobalService } from '@shared/services/global.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  serviceUrl: string = environment.financeSectorAPIURL + '/v1/Customer';

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) { }

  getAll(searchTerm: string): Observable<any> {
    return this._http.get<any>(`${this.serviceUrl}/GetSelectList`, {
      params: { searchTerm: searchTerm },
    });
  }

  getCustomersBySectorId(searchTerm: string): Observable<any> {
    return this._http.get<any>(`${this.serviceUrl}/GetSelectListCustomersBySectorId`, {
      params: { sectorId: this._globalService.getSectorType(), searchTerm: searchTerm },
    });
  }
}

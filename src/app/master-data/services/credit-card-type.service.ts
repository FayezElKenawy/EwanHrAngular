
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreditCardTypeService {
  serviceUrl: string = environment.financeSectorAPIURL + '/v1/CreditCardType';

  constructor(
    private _http: HttpClient
  ) {}

  getAll(searchTerm:string=''):Observable<any>{
    return this._http.get<any>(`${this.serviceUrl}/GetSelectList`, {
      params: { searchTerm: searchTerm },
    });
  }
}

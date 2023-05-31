import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { GlobalService, MessageType } from '@shared/services/global.service';
import { SearchModel } from '@shared/interfaces/search-model';
import { Observable } from 'rxjs';
import { IServiceResult, IResultVM } from '@shared/interfaces/results';
import { catchError, map } from 'rxjs/operators';
import { CustomerAccountModel } from '../models/customer-account/customer-account.model';
import { CustomerDetailsPageModel } from '../models/customer-account/customer-details-page.model';
import { GetMessageModel } from '../models/customer-account/get-Message.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerAccountService {
  serviceUrl = `${environment.financeSectorAPIURL}/v1/CustomerAccount`;
  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) { }


  sendCustomerAccountSMS(postedModel: any): Observable<any> {
    return this._http.post(`${this.serviceUrl}/SendCustomerAccountSMS`, postedModel)
  }


  getCustomerAccountLoggers(customerCode: string, costCenter: string): Observable<any> {
    return this._http.get(`${this.serviceUrl}/GetCustomerAccountLoggers?customerCode=${customerCode}&costCenterId=${costCenter}`);
  }

  details(id: number, entityCode: string, sectorTypeId: string): Observable<CustomerDetailsPageModel> {
    return this._http.get<CustomerDetailsPageModel>(`${this.serviceUrl}/Details?id=${id}&entityCode=${entityCode}&sectorTypeId=${sectorTypeId}`)
  }

  getNotificationMessage(getMessageModel:GetMessageModel):Observable<string>{
    return this._http.post<string>(`${this.serviceUrl}/GetNotificationMessage`,getMessageModel)
  }

  isCustomerBalanceDebit(customerId:number,entityCode:string):Observable<Boolean>{
    return this._http.get<Boolean>(`${this.serviceUrl}/IsCustomerBalanceDebit?customerId=${customerId}&entityCode=${entityCode}`)
  }



}

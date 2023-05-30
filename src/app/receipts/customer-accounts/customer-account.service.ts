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

@Injectable({
  providedIn: 'root'
})
export class CustomerAccountService {
  serviceUrl = `${environment.financeSectorAPIURL}/v1/CustomerAccount`;
  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}


  SendCustomerAccountSMS(postedModel: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http.post(`${this.serviceUrl}/SendCustomerAccountSMS`, postedModel).pipe(
      catchError(this._globalService.errorHandler),
      map((resultVM: IResultVM) => {
        serviceResult.isSuccess = (!resultVM)? false :resultVM.IsSuccess;
        if (resultVM.IsSuccess) {
          serviceResult.data = resultVM.Data;
          this._globalService.messageAlert(
            MessageType.Success,
            this._globalService.translateWordByKey(
              "App.Messages.SentSuccessFully"
            )
          );
          return serviceResult;
        }else if (resultVM.FailedReason === "invalid-credit") {
          this._globalService.messageAlert(
            MessageType.Error,
            "Receipts.Messages.invalidCredit",
            true
          );
      }
      else if (resultVM.FailedReason === "invalid-debit") {
        this._globalService.messageAlert(
          MessageType.Error,
          "Receipts.Messages.invalidDebit",
          true
        );
    }
    }
      )
    );
  }

  getDetails(id: number, contractId: number): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http
      .get(`${this.serviceUrl}/GetDetailsPage?contractId=${contractId}&id=${id}`)
      .pipe(
        catchError(this._globalService.errorHandler),
        map((resultVM: IResultVM) => {
          if (resultVM.IsSuccess) {
            serviceResult.data = resultVM.Data;
            serviceResult.isSuccess = resultVM.IsSuccess;
            return serviceResult;
          }
        })
      );
  }

  getCustomerAccountLoggers(id: number,contractId:number): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http
      .get(`${this.serviceUrl}/GetCustomerAccountLoggers?contractId=${contractId}&id=${id}`)
      .pipe(
        catchError(this._globalService.errorHandler),
        map((resultVM: IResultVM) => {
          if (resultVM.IsSuccess) {
            serviceResult.data = resultVM.Data;
            serviceResult.isSuccess = resultVM.IsSuccess;
            return serviceResult;
          }
        })
      );
  }

  details(id:number,entityCode:string,sectorTypeId:string):Observable<CustomerDetailsPageModel>{
    return this._http.get<CustomerDetailsPageModel>(`${this.serviceUrl}/Details?id=${id}&entityCode=${entityCode}&sectorTypeId=${sectorTypeId}`)
  }

}

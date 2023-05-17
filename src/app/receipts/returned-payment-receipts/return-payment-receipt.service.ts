import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { Observable } from "rxjs";
import { IServiceResult, IResultVM } from "@shared/interfaces/results";
import { catchError } from "rxjs/operators";
import { SearchModel } from "@shared/interfaces/search-model";
import { PagedList } from "@shared/interfaces/paged-list";
@Injectable({
  providedIn: "root",
})
export class ReturnPaymentReceiptService {
  serviceUrl = `${environment.financeURL}/v1/DebitPayment`;
  ContractUrl = `${environment.individualSectorApiUrl}/Sales/Contract`;
  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getAll(searchModel: SearchModel): Observable<PagedList> {

    return this._http.post<PagedList>(`${this.serviceUrl}/GetPagedList`, searchModel)
  }

  getCreate(): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetCreatePage`)
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
            } else {
            }
            serviceResult.isSuccess = resultVM.IsSuccess;
            observer.next(serviceResult);
            observer.complete();
            return observer;
          },
          () => {
            observer.complete();
            return observer;
          }
        );
    });
  }

  create(postedVM: any): Observable<any> {
    debugger
    return this._http.post(`${this.serviceUrl}/Create`, postedVM);
  }

  edit(postedVM: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .put(`${this.serviceUrl}/Edit`, postedVM)
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
              this._globalService.messageAlert(
                MessageType.Success,
                "App.Messages.UpdatedSuccessfully",
                true
              );
            } else {
              if (
                resultVM.FailedReason === "current-balance-less-than-totalpaid"
              ) {
              var translatedMessage = this._globalService
                                        .translateWordByKey("Receipts.Messages.CurrentBalanceLessThanTotalpaid")
                                        + resultVM.Data;
                this._globalService.messageAlert(
                  MessageType.Error,
                  translatedMessage
                );
              } else if (resultVM.FailedReason === "failed-in-segments") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "App.Messages.FailedInSegments",
                  true
                );
              } else if (resultVM.FailedReason === "period-no-not-exist") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "App.Messages.NoPeriodInSegments",
                  true
                );
              }else if(resultVM.Message){
                this._globalService.messageAlert(
                  MessageType.Error,
                  resultVM.Message
                );
              }
            }
            serviceResult.isSuccess = resultVM.IsSuccess;
            observer.next(serviceResult);
            observer.complete();
            return observer;
          },
          () => {
            observer.complete();
            return observer;
          }
        );
    });
  }
  getContractShortList(id: number): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.ContractUrl}/GetCustomrContracts?customerId=${id}`)
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
            } else {
            }
            serviceResult.isSuccess = resultVM.IsSuccess;
            observer.next(serviceResult);
            observer.complete();
            return observer;
          },
          () => {
            observer.complete();
            return observer;
          }
        );
    });
  }

  getVouchers(contractId: number): Observable<any> {
    return this._http.get<any>(`${this.serviceUrl}/GetVouchers?contractId=${contractId}`)
  }
  getEdit(paymentId: string): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetEditPage`, {
          params: { id: paymentId },
        })
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
            } else {
            }
            serviceResult.isSuccess = resultVM.IsSuccess;
            observer.next(serviceResult);
            observer.complete();
            return observer;
          },
          () => {
            observer.complete();
            return observer;
          }
        );
    });
  }
}

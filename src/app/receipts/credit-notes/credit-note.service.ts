import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { Observable } from "rxjs";
import { IServiceResult, IResultVM, IResult } from "@shared/interfaces/results";
import { catchError } from "rxjs/operators";
import { SearchModel } from "@shared/interfaces/search-model";
import { PagedList } from "@shared/interfaces/paged-list";

@Injectable({
  providedIn: "root",
})
export class CreditNoteService {
  //?api-version=1
  serviceUrl = `${environment.financeURL}`;
  customerUrl = `${environment.coreApiUrl}/MasterData/Customer`;
  ContractUrl = `${environment.individualSectorApiUrl}/Sales/Contract`;
  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getAll(searchModel: SearchModel): Observable<PagedList> {
    return this._http.post<PagedList>(`${this.serviceUrl}/CreditNote/GetPagedList`, searchModel)
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
      return this._http.post(`${this.serviceUrl}/CreditNote/Create`, postedVM)
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
                this._globalService.translateWordByKey(
                  "App.Messages.UpdatedSuccessfully"
                )
              );
            } else {
              if (resultVM.FailedReason === "missing-customer-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Messages.CustomerNotExist"
                  )
                );
              } else if (resultVM.FailedReason === "missing-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Messages.MissingContractId"
                  )
                );
              } else if (resultVM.FailedReason === "invalid-netval") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Messages.InvalidNetval"
                  )
                );
              } else if (resultVM.FailedReason === "invalid-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Messages.MissingContractId"
                  )
                );
              } else if (
                resultVM.FailedReason === "netval-less-than-totalpaid"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Messages.NetvalLessThanTotalpaid"
                  )
                );
              } else if (resultVM.FailedReason === "missing-creditNote-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Messages.InvalidNoteId"
                  )
                );
              } else if (resultVM.FailedReason === "failed-in-segments") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "App.Messages.FailedInSegments"
                  )
                );
              } else if (resultVM.FailedReason === "period-no-not-exist") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "App.Messages.NoPeriodInSegments"
                  )
                );
              } else if(resultVM.Message){
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

    return this._http.get(`${this.serviceUrl}/Voucher/GetVouchersById?entityCode=EIS020002186007`);

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

  // customer
  SearchCustomer(searchTerm: string) {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.customerUrl}/GetShortList`, {
          params: { searchTerm: searchTerm },
        })
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
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

  getCostElements():Observable<any>{
    return this._http.get(`${this.serviceUrl}/v1/CostElement/GetSelectList`)
  }
}

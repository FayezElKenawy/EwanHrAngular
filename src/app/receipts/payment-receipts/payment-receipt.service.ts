import { Injectable, ɵbypassSanitizationTrustStyle } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { Observable } from "rxjs";
import { IServiceResult, IResultVM } from "@shared/interfaces/results";
import { catchError } from "rxjs/operators";
import { SearchModel } from "@shared/interfaces/search-model";

@Injectable({
  providedIn: "root",
})
export class PaymentReceiptService {
  serviceUrl = `${environment.financeSector}/v1/PaymentReceipt`;
  ContractUrl = `${environment.individualSectorApiUrl}/Sales/Contract`;
  customerUrl = `${environment.coreApiUrl}/MasterData/Customer`;

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getPagedList(searchModel: SearchModel): Observable<IServiceResult> {
    return this._http.post<IServiceResult>(`${this.serviceUrl}/GetPagedList`, searchModel)
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

  create(postedVM: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .post(`${this.serviceUrl}/Create`, postedVM)
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
              this._globalService.messageAlert(
                MessageType.Success,
                "App.Messages.SavedSuccessfully",
                true
              );
            } else {
              if (resultVM.FailedReason === "missing-customer-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.CustomerNotExist",
                  true
                );
              } else if (resultVM.FailedReason === "missing-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.MissingContractId"
                );
              }else if (resultVM.FailedReason === "invalid-date") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "App.Messages.DocumentDateIsInvalid",
                  true
                );
              }
               else if (resultVM.FailedReason === "missing-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.ValueInCorrect",
                  true
                );
              } else if (resultVM.FailedReason === "invalid-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Sales.Messages.InvalidContractId",
                  true
                );
              } else if (resultVM.FailedReason === "failed-in-segments") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "App.Messages.FailedInSegments",
                  true
                );
              } else if (
                resultVM.FailedReason === "invalid-bank-deposit-amount"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.BankDepositMustMoreThanZero",
                  true
                );
              } else if (resultVM.FailedReason === "invalid-cashbox-amount") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.CashMoreThanZero",
                  true
                );
              } else if (
                resultVM.FailedReason === "netval-less-than-totalpaid"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.VoucherLessThanPaid",
                  true
                );
              } else if (
                resultVM.FailedReason === "current-balance-less-than-totalpaid"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.CurrentBalanceLessThanTotalpaid" +
                    resultVM.Data,
                  true
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
              if (resultVM.FailedReason === "missing-customer-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.CustomerNotExist",
                  true
                );
              } else if (resultVM.FailedReason === "missing-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Sales.Messages.InvalidContractId",
                  true
                );
              } else if (resultVM.FailedReason === "missing-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.ValueInCorrect",
                  true
                );
              } else if (resultVM.FailedReason === "invalid-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Sales.Messages.InvalidContractId",
                  true
                );
              } else if (resultVM.FailedReason === "failed-in-segments") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "App.Messages.FailedInSegments",
                  true
                );
              } else if (
                resultVM.FailedReason === "invalid-bank-deposit-amount"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.BankDepositMustMoreThanZero",
                  true
                );
              } else if (resultVM.FailedReason === "invalid-cashbox-amount") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.CashMoreThanZero",
                  true
                );
              } else if (resultVM.FailedReason === "missing-creditNote-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.VoucherNotFound",
                  true
                );
              } else if (
                resultVM.FailedReason === "netval-less-than-totalpaid"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.VoucherLessThanPaid",
                  true
                );
              } else if (
                resultVM.FailedReason === "current-balance-less-than-totalpaid"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Receipts.Messages.CurrentBalanceLessThanTotalpaid" +
                    resultVM.Data,
                  true
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

  getVouchers(contractId: number): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetVouchers?contractId=${contractId}`)
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
}

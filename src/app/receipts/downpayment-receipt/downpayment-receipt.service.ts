import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { Observable } from "rxjs";
import { IServiceResult, IResultVM } from "@shared/interfaces/results";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DownpaymentReceiptService {
  serviceUrl = `${environment.individualSectorApiUrl}/Receipts/DownpaymentReceipt`;
  contractserviceUrl = `${environment.individualSectorApiUrl}/Sales/Contract`;

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  create(downpaymentReciept: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .post(`${this.serviceUrl}/Create`, downpaymentReciept)
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
              this._globalService.messageAlert(
                MessageType.Success,
                this._globalService.translateWordByKey(
                  "App.Messages.SavedSuccessfully"
                )
              );
            } else {
              if (resultVM.FailedReason === "missing-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.InvalidContractId"
                  )
                );
              } else if (resultVM.FailedReason === "invalid-date") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "App.Messages.DocumentDateIsInvalid",
                  true
                );
              }else if (resultVM.FailedReason === "invalid-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.InvalidContractId"
                  )
                );
              } else if (resultVM.FailedReason === "missing-customer-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.MissingCustomerId"
                  )
                );
              } else if (resultVM.FailedReason === "date-not-valid") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Messages.DateNotValid"
                  )
                );
              } else if (
                resultVM.FailedReason === "invalid-bank-deposit-amount"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Messages.InvalidBankDepositAmount"
                  )
                );
              } else if (resultVM.FailedReason === "invalid-cashbox-amount") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Messages.InvalidCashboxAmount"
                  )
                );
              } else if (resultVM.FailedReason === "allready-paid") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Messages.AllreadyPaid"
                  )
                );
              } else if (resultVM.FailedReason === "invalid-calc-amount") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Messages.ValueLessThanPaid"
                  )
                );
              } else if (resultVM.FailedReason === "ReceiptValueMoreDownPayment") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Receipts.Fields.ReceiptValueMoreDownPayment"
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

  getCreate(): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetCreate`)
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

  getContract(id: string): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http.get(`${this.contractserviceUrl}/Get/${id}`).pipe(
      map((resultVM: IResultVM) => {
        if (resultVM.IsSuccess) {
          serviceResult.data = resultVM.Data;
        }
        serviceResult.isSuccess = resultVM.IsSuccess;
        return serviceResult;
      }),
      catchError(this._globalService.errorHandler)
    );
  }

  skipDownPayment(contractId: number): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http
      .get(`${this.serviceUrl}/skipDownPayment/${contractId}`)
      .pipe(
        map((resultVM: IResultVM) => {
          if (resultVM.IsSuccess) {
            serviceResult.data = resultVM.Data;
            this._globalService.messageAlert(
              MessageType.Success,
              this._globalService.translateWordByKey(
                "App.Messages.DownPaymentSkipped"
              )
            );
          } else if (resultVM.FailedReason === "invalid-contract-id") {
            this._globalService.messageAlert(
              MessageType.Error,
              this._globalService.translateWordByKey(
                "Receipts.Messages.MissingContractId"
              )
            );
          } else if (resultVM.FailedReason === "customer-not vip") {
            this._globalService.messageAlert(
              MessageType.Error,
              this._globalService.translateWordByKey("Receipts.Messages.NotVIP")
            );
          }
          serviceResult.isSuccess = resultVM.IsSuccess;
          return serviceResult;
        }),
        catchError(this._globalService.errorHandler)
      );
  }
}

import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { Observable } from "rxjs";
import { IServiceResult, IResultVM } from "@shared/interfaces/results";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ContractAttachmentsService {
  serviceUrl = `${environment.individualSectorApiUrl}/Sales/ContractAttachment`;

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getAttachments(id: number) {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetAttachments/${id}`)
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
            } else {
              if (resultVM.FailedReason === "invalid-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.InvalidContractId"
                  )
                );
              } else if (resultVM.FailedReason === "save-not-allowed") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ContractStatusNotAllowReceiveDocs"
                  )
                );
              } else {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey("App.Messages.Error")
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

  save(contractAttachmentsPostedVM: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .post(`${this.serviceUrl}/Save`, contractAttachmentsPostedVM)
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
              if (resultVM.FailedReason === "invalid-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.InvalidContractId"
                  )
                );
              } else if (resultVM.FailedReason === "save-not-allowed") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ContractStatus"
                  )
                );
              } else if (resultVM.FailedReason === "invalid-date") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ReceiptDate"
                  )
                );
              } else if (resultVM.FailedReason === "invalid-duedate") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.InvalidDueDate"
                  )
                );
              } else {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey("App.Messages.Error")
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
}

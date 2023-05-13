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
export class ContractPenalitiesService {
  serviceUrl = `${environment.individualSectorApiUrl}/Sales/ContractPenality`;
  laborerServiceUrl = `${environment.coreApiUrl}/MasterData/LaborerFile`;

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

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
              if (resultVM.FailedReason === "contract-not-terminated") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ContractNotTerminated"
                  )
                );
              } else if (resultVM.FailedReason === "invalid-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.InvalidContractId"
                  )
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

  create(postedVM: any, contractId: number): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .put(`${this.serviceUrl}/Edit?contractId=${contractId}`, postedVM)
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
              // this._globalService.successMessage('تم انشاء العقد بنجاح');
            } else {
              if (resultVM.FailedReason === "invalid-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.InvalidContractId"
                  )
                );
              } else {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.FailedToAddPenalities"
                  )
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

  getEdit(id: number): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetEdit?contractId=${id}`)
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

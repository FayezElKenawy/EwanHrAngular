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
export class ContractExtentionService {
  serviceUrl = `${environment.individualSectorApiUrl}/Sales/ContractExtension`;
  laborerServiceUrl = `${environment.coreApiUrl}/MasterData/LaborerFile`;

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getCreate(id: string): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetCreate?contractId=${id}`)
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

  create(contractPostedVM: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .post(`${this.serviceUrl}/Create`, contractPostedVM)
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
              this._globalService.messageAlert(
                MessageType.Success,
                this._globalService.translateWordByKey(
                  "ِApp.Messages.SavedSuccessfully"
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
              } else if (
                resultVM.FailedReason === "invalid-service-request-id"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.InvalidServiceRequestId"
                  )
                );
              } else if (resultVM.FailedReason === "create-not-allowed") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.CreateNotAllowed"
                  )
                );
              } else if (
                resultVM.FailedReason === "invalid-contract-reception-date"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.InvalidContractReceptionDate"
                  )
                );
              } else if (resultVM.FailedReason === "no-remaining-days") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.NoRemainingDays"
                  )
                );
              } else if (resultVM.FailedReason === "failed-in-segments") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "App.Messages.FailedInSegments"
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

  SearchLaborer(
    searchTerm: string,
    nationalityId: any,
    professionId: any,
    branchId: string
  ) {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.laborerServiceUrl}/GetShortList`, {
          params: {
            searchTerm: searchTerm,
            NationalityId: nationalityId,
            ProfessionId: professionId,
            Action: "create-service-request,",
            SectorTypeId: "01-02",
            BranchId: branchId,
          },
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

  GetLaborer(id: string) {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.laborerServiceUrl}/Get/${id}`)
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

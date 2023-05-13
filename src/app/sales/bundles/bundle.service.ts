import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { IResultVM, IServiceResult } from "@shared/interfaces/results";

import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { SearchModel } from "@shared/interfaces/search-model";

@Injectable({
  providedIn: "root",
})
export class BundleService {
  serviceUrl = `${environment.individualSectorApiUrl}/Sales/Bundle`;
  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getForEdit(id: string): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetEdit`, { params: { id: id } })
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

  getAll(): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetList`)
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

  create(bundle: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .post(`${this.serviceUrl}/Create`, bundle)
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
              if (resultVM.FailedReason === "missing-arabic-name") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.MissingArabicName"
                  )
                );
              } else if (resultVM.FailedReason === "arabic-name-exist") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ArabicNameExist"
                  )
                );
              } else if (
                resultVM.FailedReason === "missing-bundleCostElements"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.MissingBundleCostElements"
                  )
                );
              } else if (resultVM.FailedReason === "zero-monthly-cost") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ZeroMonthlyCost"
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

  edit(bundle: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .put(`${this.serviceUrl}/Edit`, bundle)
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
              if (resultVM.FailedReason === "missing-arabic-name") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.MissingArabicName"
                  )
                );
              } else if (resultVM.FailedReason === "arabic-name-exist") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ArabicNameExist"
                  )
                );
              } else if (
                resultVM.FailedReason === "missing-bundleCostElements"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ArabicNameExist"
                  )
                );
              } else if (resultVM.FailedReason === "zero-monthly-cost") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ZeroMonthlyCost"
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

  getForCreate(): Observable<IServiceResult> {
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

  getListPage(searchModel: SearchModel): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http.post(`${this.serviceUrl}/GetListPage`, searchModel).pipe(
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
}

import { Injectable } from "@angular/core";
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
export class ServiceRequestService {
  serviceUrl = `${environment.individualSectorApiUrl}/Sales/ServiceRequest`;
  customerUrl = `${environment.coreApiUrl}/MasterData/Customer`;
  bundleUrl = `${environment.individualSectorApiUrl}/Sales/Bundle`;
  laborerServiceUrl = `${environment.coreApiUrl}/MasterData/LaborerFile`;

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getEdit(id: string): Observable<IServiceResult> {
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

  getAll(searchModel: SearchModel): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .post(`${this.serviceUrl}/GetList`, searchModel)
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
              if (resultVM.FailedReason === "contract-expected-date-invalid") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ContractExpectedDateInvalid"
                  )
                );
              } else if (resultVM.FailedReason === "missing-customer-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.MissingCustomerId"
                  )
                );
              } else if (resultVM.FailedReason === "missing-bundle-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.MissingBundleId"
                  )
                );
              } else if (resultVM.FailedReason === "invalid-date") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "App.Messages.DocumentDateIsInvalid",
                  true
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
              if (resultVM.FailedReason === "contract-expected-date-invalid") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ContractExpectedDateInvalid"
                  )
                );
              } else if (resultVM.FailedReason === "missing-customer-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.MissingCustomerId"
                  )
                );
              } else if (resultVM.FailedReason === "missing-bundle-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.MissingBundleId"
                  )
                );
              } else if (resultVM.FailedReason === "unable-edit") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.CannotEditRequest" + " " + resultVM.Data
                  )
                );
              } else if (resultVM.FailedReason === "invalid-date") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "App.Messages.DocumentDateIsInvalid",
                  true
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
  assignLabor(postedVM: any,isCalledFromConractsPage=false): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .post(`${this.serviceUrl}/AssignLabor?isPostedFromContractsPage=${isCalledFromConractsPage}`, postedVM)
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
              this._globalService.messageAlert(
                MessageType.Error,
                resultVM.Message
              );
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

  GetCustomer(id: string) {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.customerUrl}/Get/${id}`)
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

  GetBundles(NationalityId: any, ProfessionId: any): any {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.bundleUrl}/GetAllItems`, {
          params: {
            NationalityId: NationalityId,
            ProfessionId: ProfessionId,
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

  // laborers

  SearchLaborer(
    searchTerm: string,
    pageNumber: string,
    nationalityId: any,
    professionId: any,
    branchId: string
  ) {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetLaboreFilesList`, {
          params: {
            searchTerm: searchTerm,
            pageNumber: pageNumber,
            NationalityId: nationalityId,
            ProfessionId: professionId,
            Action: "create-service-request,",
            SectorTypeId: "01-02",
            BranchId: branchId,
            AllLaborers: "true",
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

  getAllLaborers(searchTerm: string, nationalityId: any, professionId: any) {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.laborerServiceUrl}/GetSmallList`, {
          params: {
            searchTerm: searchTerm,
            NationalityId: nationalityId,
            ProfessionId: professionId,
            SectorTypeId: "01-02",
            Action: "create-service-request,",
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

  GetLaborers(NationalityId: any, ProfessionId: any): any {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.laborerServiceUrl}/GetList`, {
          params: {
            NationalityId: NationalityId,
            ProfessionId: ProfessionId,
            Action: "create-contract",
            SectorTypeId: "01-02",
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

}

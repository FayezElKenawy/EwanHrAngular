import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { Observable } from "rxjs";
import { IServiceResult, IResultVM } from "@shared/interfaces/results";
import { catchError, map } from "rxjs/operators";
import { SearchModel } from "@shared/interfaces/search-model";
declare let Swal: any;

@Injectable({
  providedIn: "root",
})
export class ContractService {
  serviceUrl = `${environment.individualSectorApiUrl}/Sales/Contract`;
  laborerServiceUrl = `${environment.coreApiUrl}/MasterData/LaborerFile`;

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) { }

  getList(searchModel: SearchModel): Observable<IServiceResult> {
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

  edit(contractPostedVM: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .put(`${this.serviceUrl}/Edit`, contractPostedVM)
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
              if (resultVM.FailedReason === "invalid-contract-id") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.InvalidContractId"
                  )
                );
              } else if (resultVM.FailedReason === "edit-not-allowed") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.EditNotAllowed"
                  )
                );
              } else if (resultVM.FailedReason === "invalid-date") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "App.Messages.DocumentDateIsInvalid",
                  true
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

  getEdit(id: number): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetEdit?id=${id}`)
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

  get(id: string): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http.get(`${this.serviceUrl}/Get/${id}`).pipe(
      map((resultVM: IResultVM) => {
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
        return serviceResult;
      }),
      catchError(this._globalService.errorHandler)
    );
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
                  "App.Messages.SavedSuccessfully"
                )
              );
            } else {
              if (resultVM.FailedReason === "service-request-assigned") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ServiceRequestAssigned"
                  )
                );
              } else if (resultVM.FailedReason === "invalid-date") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "App.Messages.DocumentDateIsInvalid",
                  true
                );
              } else if (resultVM.FailedReason === "invalid-contract-date") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.InvalidContractDate"
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
                    "Sales.Messages.CreateServiceRequestNotAllowed"
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

  getCreate(id: string): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetCreate`, { params: { id: id } })
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
            } else {
              if (resultVM.FailedReason === "create-not-allowed") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.CreateServiceRequestNotAllowed"
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

  searchLaborer(
    searchTerm: string,
    id: string,
    nationalityId: any,
    professionId: any
  ) {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.laborerServiceUrl}/GetShortList`, {
          params: {
            searchTerm: searchTerm,
            Id: id,
            NationalityId: nationalityId,
            ProfessionId: professionId,
            Action: "create-contract",
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

  getLaborer(id: string) {
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

  getLaborers(nationalityId: any, professionId: any): any {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.laborerServiceUrl}/GetList`, {
          params: {
            NationalityId: nationalityId,
            ProfessionId: professionId,
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

  receiveLaborer(monthlyContractCostPostedVM: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .post(`${this.serviceUrl}/ReceiveLaborer`, monthlyContractCostPostedVM)
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
              this._globalService.messageAlert(
                MessageType.Success,
                this._globalService.translateWordByKey(
                  "Sales.Messages.LaborerIsDelivered"
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
                    "Sales.Messages.SaveNotAllowed"
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

  getTerminateAndHoldContractPage(id: string): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetTerminationContractPage`, {
          params: { id: id },
        })
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



  stopContractForTermination(
    terminateContractPostedVM: any
  ): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
      .post(
        `${this.serviceUrl}/StopContractForTermination`,
          terminateContractPostedVM
        )
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            debugger
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
              this._globalService.messageAlert(
                MessageType.Success,
                this._globalService.translateWordByKey(
                  "Sales.Messages.TerminatedSuccess"
                )
              );
            } else {
              debugger;
              if (
                resultVM.FailedReason === "remaining-days-greater-than-zero"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ThisContractNotTerminated"
                  )
                );
              } else if (
                resultVM.FailedReason === "contract-stopped-date-invalid"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ContractStoppedDateInvalid"
                  )
                );
              } else if (resultVM.FailedReason === "terminationdate-befourLastInvoice") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.TerminationDatebefourLastInvoice"
                  )
                );
              }
              else if (resultVM.FailedReason === "terminationdate-befourPayAllCost") {
                debugger;

                serviceResult.data = resultVM.Data;
                serviceResult.isSuccess = resultVM.IsSuccess;
                serviceResult.failedReason = resultVM.FailedReason;


              }
              else {
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

  stopContractHold(holdContractPostedVM: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
      .post(
        `${this.serviceUrl}/ContractHolding`,
        holdContractPostedVM
        )
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            debugger
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
              this._globalService.messageAlert(
                MessageType.Success,
                this._globalService.translateWordByKey(
                  "Sales.Messages.HoldingSuccess"
                )
              );
            } else {
              if (
                resultVM.FailedReason === "contract-hold-date-invalid"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ContractHoldDateInvalid"
                  )
                );
              }
              else if (resultVM.FailedReason === "contract-has-pending-transactions") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey("Sales.Messages.pending-transactions")
                );
              }
             else if (
                resultVM.FailedReason === "contract-hold-date-befor-leave-date"
              ) {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ContractHoldDateBeforeLeaveDate"
                  )
                );
              } else if (resultVM.FailedReason === "hold-date-befour-Last-invoice") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.HoldDateBefourLastInvoice"
                  )
                );
              }
              else if (resultVM.FailedReason === "contract-has-debit") {
                if (resultVM.Data > 0) {//مدين
                  this._globalService.messageAlert(
                    MessageType.Error,
                    this._globalService.translateWordByKey(
                      "Sales.Messages.ContractHoldDebit"
                    ).replace('#debitValue', resultVM.Data).replace('#Date', new Date(holdContractPostedVM.ContractHoldDate).toDateString())

                  );
                } else {//دائن
                  this._globalService.messageAlert(
                    MessageType.Error,
                    this._globalService.translateWordByKey(
                      "Sales.Messages.ContractHoldCredit"
                    ).replace('#CreditValue', resultVM.Data * -1)
                     .replace('#Date', new Date(holdContractPostedVM.ContractHoldDate).toDateString())
                  );
                }
              }
              else {
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


  replaceLabor(EditedLaborVM: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .post(`${this.serviceUrl}/ReplaceLabor`, EditedLaborVM)
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
              if (resultVM.FailedReason === "service-request-assigned") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "Sales.Messages.ServiceRequestAssigned"
                  )
                );

              } else if (resultVM.FailedReason === "invalid-date") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "App.Messages.ReplacementDateIsInvalid",
                  true
                );
              } else if (resultVM.FailedReason === "invalid-expected-date") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  "Sales.Messages.invalid-expected-date",
                  true
                );
              }else if (resultVM.FailedReason === "contract-has-pending-transactions") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey("Sales.Messages.pending-transactions")
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

  getCustomerContracts(id: number): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .get(`${this.serviceUrl}/GetCustomrContracts?customerId=${id}`)
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

  getLaboerStatus(){
   return this._http.get(`${this.serviceUrl}/GetLaborerReplacementStatus`)
  }

  onSelectLaborForHolding(EditedLaborVM: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
        .post(`${this.serviceUrl}/onSelectLaborForHolding`, EditedLaborVM)
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
              if (resultVM.FailedReason === "invalid-model") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey("App.Messages.Error")
                );
              }
              else if (resultVM.FailedReason === "invalid-expected-leave-date") {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey("Sales.Messages.invalid-continue-date")
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

  stopHoldedContractForTermination(
    contractId: string
  ): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create((observer) => {
      this._http
      .post(
        `${this.serviceUrl}/StopHoldedContractForTermination/${contractId}`,
          null
        )
        .pipe(catchError(this._globalService.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              serviceResult.data = resultVM.Data;
              this._globalService.messageAlert(
                MessageType.Success,
                this._globalService.translateWordByKey(
                  "Sales.Messages.TerminatedSuccess"
                )
              );
            } else {
                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey("App.Messages.Error")
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

  reactivateHoldedContract(contractId:number): Observable<IResultVM> {
    return this._http.get<IResultVM>(`${this.serviceUrl}/Reactivate?contractId=${contractId}`)
  }
}

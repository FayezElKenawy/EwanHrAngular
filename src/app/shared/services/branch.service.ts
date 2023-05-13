import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { GlobalService, MessageType } from '@shared/services/global.service';
import { IResultVM, IServiceResult } from '@shared/interfaces/results';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  serviceUrl: string = environment.coreApiUrl + '/Security/Branch';

  constructor(
    private _http: HttpClient,
    private _globalHandler: GlobalService
  ) {}

  get(id: number): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create(observer => {
      this._http
        .get(`${this.serviceUrl}/Get/${id}`)
        .pipe(catchError(this._globalHandler.errorHandler))
        .subscribe((resultVM: IResultVM) => {
          serviceResult.isSuccess = resultVM.IsSuccess;
          serviceResult.data = resultVM.Data;
          observer.next(serviceResult);
          observer.complete();
          return observer;
        });
    });
  }

  getAll(): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create(observer => {
      this._http
        .get(`${this.serviceUrl}/GetAll`)
        .pipe(catchError(this._globalHandler.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            serviceResult.isSuccess = resultVM.IsSuccess;
            serviceResult.data = resultVM.Data;
            observer.next(serviceResult);
            observer.complete();
          },
          () => {
            observer.complete();
            return observer;
          }
        );
    });
  }

  create(branch: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create(observer => {
      this._http
        .post(`${this.serviceUrl}/Add`, branch)
        .pipe(catchError(this._globalHandler.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              this._globalHandler.messageAlert(
                MessageType.Success,
                'تم اضافة الفرع بنجاح'
              );
            } else {
              if (resultVM.FailedReason === 'arabic-name-exist') {
                this._globalHandler.messageAlert(
                  MessageType.Error,
                  'وصف الفرع  موجود بالفعل'
                );
              } else {
                this._globalHandler.messageAlert(
                  MessageType.Error,
                  'حدث خطأ ما ، من فضلك أعد المحاولة في وقت لاحق'
                );
              }
            }
            serviceResult.isSuccess = resultVM.IsSuccess;
            serviceResult.data = resultVM.Data;
            observer.next(serviceResult);
            observer.complete();
          },
          () => {
            observer.complete();
            return observer;
          }
        );
    });
  }

  edit(branch: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create(observer => {
      this._http
        .post(`${this.serviceUrl}/Edit`, branch)
        .pipe(catchError(this._globalHandler.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            if (resultVM.IsSuccess) {
              this._globalHandler.messageAlert(
                MessageType.Success,
                'تم التعديل الفرع بنجاح'
              );
            } else {
              if (resultVM.FailedReason === 'arabic-name-exist') {
                this._globalHandler.messageAlert(
                  MessageType.Error,
                  'وصف الفرع موجود بالفعل'
                );
              } else {
                this._globalHandler.messageAlert(
                  MessageType.Error,
                  'حدث خطأ ما ، من فضلك أعد المحاولة في وقت لاحق'
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

  getCreate() {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http.get(`${this.serviceUrl}/GetCreate`).pipe(
      map((resultVM: IResultVM) => {
        if (resultVM.IsSuccess) {
          serviceResult.data = resultVM.Data;
        }
        serviceResult.isSuccess = resultVM.IsSuccess;
        return serviceResult;
      }),
      catchError(this._globalHandler.errorHandler)
    );
  }
  getShortListBranches(searchModel: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create(observer => {
      this._http
        .post(`${this.serviceUrl}/GetShortListBranches`, searchModel)
        .pipe(catchError(this._globalHandler.errorHandler))
        .subscribe(
          (resultVM: IResultVM) => {
            serviceResult.isSuccess = resultVM.IsSuccess;
            serviceResult.data = resultVM.Data;
            observer.next(serviceResult);
            observer.complete();
          },
          () => {
            observer.complete();
            return observer;
          }
        );
    });
  }
}

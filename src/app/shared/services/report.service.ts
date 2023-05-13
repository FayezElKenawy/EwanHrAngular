import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { GlobalService, MessageType } from '@shared/services/global.service';
import { Observable } from 'rxjs';
import { IServiceResult, IResultVM } from '@shared/interfaces/results';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  serviceUrl = `${environment.reportingApiUrl}`;
  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getPaginationInfo(
    id: string,
    pageSize: number,
    queryString
  ): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create(observer => {
      this._http
        .get(
          `${this.serviceUrl}/Report/GetPaginationInfo?id=${id}&pagesize=${pageSize}${queryString}`
        )
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

  Export(
    id: string,
    exportType: string,
    pageSize: string
  ): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return Observable.create(observer => {
      this._http
        .get(`${this.serviceUrl}/Report/Export`, {
          params: { id: id, exportType: exportType, pageSize: pageSize }
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

import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { GlobalService, MessageType } from '@shared/services/global.service';
import { Observable } from 'rxjs';
import { IServiceResult, IResultVM } from '@shared/interfaces/results';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  serviceUrl = `${environment.individualSectorApiUrl}/home`;
  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getDashboard(): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http.get(`${this.serviceUrl}/dashboard`).pipe(
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
}

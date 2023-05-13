import { HttpClient } from "@angular/common/http";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { Injectable } from "@angular/core";

import { IServiceResult, IResultVM } from "@shared/interfaces/results";
import { map, catchError } from "rxjs/operators";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";

@Injectable({
  providedIn: "root",
})
export class ContractSettingService {
  constructor(
    private _globalService: GlobalService,
    private _http: HttpClient
  ) {}
  serviceUrl = `${environment.individualSectorApiUrl}/Sales/ContractSetting`;

  getEdit() {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };

    return this._http.get(`${this.serviceUrl}/GetEdit`).pipe(
      map((result: IResultVM) => {
        if (result.IsSuccess) {
          serviceResult.data = result.Data;
        }
        serviceResult.isSuccess = result.IsSuccess;
        return serviceResult;
      }),
      catchError(this._globalService.errorHandler)
    );
  }
  Edit(contractSetting: any) {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http.post(`${this.serviceUrl}/Edit`, contractSetting).pipe(
      map((result: IResultVM) => {
        if (result.IsSuccess) {
          serviceResult.data = result.Data;
          this._globalService.messageAlert(
            MessageType.Success,
            this._globalService.translateWordByKey(
              "App.Messages.SavedSuccessfully"
            )
          );
        }
        serviceResult.isSuccess = result.IsSuccess;
        return serviceResult;
      }),
      catchError(this._globalService.errorHandler)
    );
  }
}

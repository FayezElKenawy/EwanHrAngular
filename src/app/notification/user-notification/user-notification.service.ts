import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { GlobalService } from "@shared/services/global.service";
import { IServiceResult, IResultVM } from "@shared/interfaces/results";
import { map, catchError } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserNotificationService {
  userNotificationUrl = `${environment.coreApiUrl}/Notification/UserNotification`;
  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getUserNotifiations(readFilter: any, sectorId = null, typeId = "") {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http
      .get(`${this.userNotificationUrl}/GetUserNotifications`, {
        params: { readFilter, sectorId, typeId },
      })
      .pipe(
        map((resultVM: IResultVM) => {
          if (resultVM.IsSuccess) {
            serviceResult.data = resultVM.Data;
            serviceResult.isSuccess = resultVM.IsSuccess;
            return serviceResult;
          }
        }),
        catchError(this._globalService.errorHandler)
      );
  }

  markAsRead(notificationId: string): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http
      .post(`${this.userNotificationUrl}/MarkAsRead`, "", {
        params: { notificationId },
      })
      .pipe(
        map((resultVM: IResultVM) => {
          if (resultVM.IsSuccess) {
            serviceResult.data = resultVM.Data;
            serviceResult.isSuccess = resultVM.IsSuccess;
            return serviceResult;
          }
        }),
        catchError(this._globalService.errorHandler)
      );
  }
}

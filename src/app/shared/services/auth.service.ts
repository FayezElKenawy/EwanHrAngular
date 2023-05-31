import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { environment } from "@environments/environment";
import { IResultVM, IServiceResult } from "@shared/interfaces/results";
import { catchError, map } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { VerificationVM } from "@shared/models/verification.model";

const tokenKey = "Ewan_RMS-ERP-APP_UserToken";
const userNameKey = 'Ewan_RMS-ERP-APP_UserName';
const remeberMeKey = 'Ewan_RMS-ERP-APP_RemeberMeKey';
@Injectable({
  providedIn: "root",
})
export class AuthService {
  serviceUrl: string = environment.coreApiUrl + "/Security/Auth/";
  currentAuthUser: any;
  
  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService,
    private router: Router
  ) { }

  SetShowAllBranches(IsShowAllBranches:boolean): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http.get(`${this.serviceUrl}SetShowAllBranches/${IsShowAllBranches}`).pipe(
      catchError(this._globalService.errorHandler),
      map((resultVM: IResultVM) => {
        if (resultVM.IsSuccess) {
          serviceResult.data = resultVM.Data;
        } else {
          if (resultVM.FailedReason === 'fail-change-branch') {
            this._globalService.messageAlert(
              MessageType.Error,
              this._globalService.translateWordByKey(
                'Auth.Messages.ChangeBranchFailed'
              )
            );
          }
        }
        serviceResult.isSuccess = resultVM.IsSuccess;
        return serviceResult;
      })
    );
  }

  login(credentialVM: any): Observable<IResultVM> {
    return this._http.post<IResultVM>(this.serviceUrl + 'Login', credentialVM)
  }

  getAuthUser(): Observable<IServiceResult> {
    return this._http.get(this.serviceUrl + "GetAuthUser").pipe(
      map((result: IResultVM) => {
        const serviceResult: IServiceResult = {
          isSuccess: result.IsSuccess,
          data: result.Data,
        };

        if (result.IsSuccess) {
          console.log("GetAuthUser => " + result.Data);
          
          this.currentAuthUser = result.Data;
        }
        return serviceResult;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return throwError(error);
        }
        return this._globalService.errorHandler(error);
      })
    );
  }

  logOut(): void {
    localStorage.removeItem(tokenKey);
    sessionStorage.removeItem(tokenKey);
    this.router.navigateByUrl("/finance/auth/login")
  }

  changePassword(ChangePasswordVM: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http
      .post(this.serviceUrl + "ChangePassword", ChangePasswordVM)
      .pipe(
        map((resultVM: IResultVM) => {
          if (resultVM.IsSuccess === true) {
            this._globalService.messageAlert(
              MessageType.Success,
              "لقد تم تغير كلمة المرور بنجاح",
              true
            );
          } else {
            this._globalService.messageAlert(
              MessageType.Error,
              "كلمة المرور غير صحيحة"
            );
          }
          serviceResult.isSuccess = resultVM.IsSuccess;
          return serviceResult;
        }),
        catchError(this._globalService.errorHandler)
      );
  }

  getToken(): string {
    let userToken: string = null;
    if (sessionStorage.getItem(tokenKey) != null) {
      userToken = sessionStorage.getItem(tokenKey);
    }
    if (localStorage.getItem(tokenKey) != null) {
      userToken = localStorage.getItem(tokenKey);
    }
    if (userToken != null) {
      try {
        userToken = this.decodeToken(userToken);
      } catch (error) {
        userToken = null;
      }
    }
    return userToken;
  }

  getUserMenuItems(moduleId: number): Observable<IServiceResult> {
    return this._http
      .get(this.serviceUrl + `GetUserMenuItems/${moduleId}`)
      .pipe(
        map((result: IResultVM) => {
          const serviceResult: IServiceResult = {
            isSuccess: result.IsSuccess,
            data: result.Data,
          };
          return serviceResult;
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return throwError(error);
          }
          return this._globalService.errorHandler(error);
        })
      );
  }

  getModuels() {
    return this._http.get(this.serviceUrl + `GetUserModule`).pipe(
      map((result: IResultVM) => {
        const serviceResult: IServiceResult = {
          isSuccess: result.IsSuccess,
          data: result.Data,
        };
        return serviceResult;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return throwError(error);
        }
        return this._globalService.errorHandler(error);
      })
    );
  }

  sendLoginVerificationCode(userName:string):Observable<IResultVM>{
    return this._http.post<IResultVM>(this.serviceUrl + `SendVerificationCode?userName=${userName}`,'',{
        params: { phoneNumber:'', lang:'', sender: 'Ewan' },
      })
  }

  validateLoginCode(verificationVM: VerificationVM):Observable<IResultVM>{
    return this._http.post<IResultVM>(this.serviceUrl + `ValidateVerificationCode`,verificationVM)
  }
  
  setToken(UserToken: string, rememberMe: boolean): any {
    localStorage.removeItem(tokenKey);
    sessionStorage.removeItem(tokenKey);
    UserToken = this.encodeToken(UserToken);
    if (rememberMe) {
      localStorage.setItem(tokenKey, UserToken);
      return;
    }
    sessionStorage.setItem(tokenKey, UserToken);
  }

  private encodeToken(token) {
    token = this.reverseString(token);
    return window.btoa(token);
  }

  private decodeToken(token) {
    token = window.atob(token);
    return this.reverseString(token);
  }

  private reverseString(str) {
    return str.split("").reverse().join("");
  }

  changeBranch(newBranchId: any): Observable<IServiceResult> {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http.get(`${this.serviceUrl}ChangeBranch/${newBranchId}`).pipe(
      catchError(this._globalService.errorHandler),
      map((resultVM: IResultVM) => {
        if (resultVM.IsSuccess) {
          serviceResult.data = resultVM.Data;
        } else {
          if (resultVM.FailedReason === "fail-change-branch") {
            this._globalService.messageAlert(
              MessageType.Error,
              "فشل في تغيير الفرع"
            );
          }
        }
        serviceResult.isSuccess = resultVM.IsSuccess;
        return serviceResult;
      })
    );
  }
  getUserName(): string {
    const userName = localStorage.getItem(userNameKey);
    return userName ? userName : '';
  }
  getRememberMeState(): boolean {
    return localStorage.getItem(remeberMeKey) === 'true' ? true : false;
  }

  setUserName(userName) {
    localStorage.setItem(userNameKey, userName);
  }

  setRememberMe(remeberMe) {
    localStorage.setItem(remeberMeKey, remeberMe);
  }
}

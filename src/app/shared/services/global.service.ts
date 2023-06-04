import { Injectable } from "@angular/core";
import { HttpErrorResponse, HttpClient } from "@angular/common/http";
import * as toastr from "toastr";
import { throwError, BehaviorSubject } from "rxjs";
import { environment } from "@environments/environment";
import { TranslateService } from "@ngx-translate/core";
import { languages } from "@environments/languages";
import { IServiceResult, IResultVM } from "@shared/interfaces/results";
import { Setting } from "@shared/interfaces/setting-model";
import { catchError, map } from "rxjs/operators";
import { Router } from "@angular/router";

declare let $: any;

declare let Swal: any;

export enum MessageType {
  Success,
  Info,
  Warning,
  Error,
}

@Injectable({
  providedIn: "root",
})
export class GlobalService {
  private loadedStylesSheet = [];
  public documentLoaded = new BehaviorSubject<boolean>(false);
  public isSpinnerLoaded = new BehaviorSubject<boolean>(false);

  systemSettingsServiceUrl = `${environment.coreApiUrl}/Configuration/SystemSettings`;

  constructor(
    private _translatService: TranslateService,
    private _http: HttpClient,
    private _router: Router
  ) {
    toastr.options.closeButton = true;
    toastr.options.debug = false;
    toastr.options.newestOnTop = true;
    toastr.options.progressBar = true;
    toastr.options.positionClass = "toast-top-center";
    toastr.options.preventDuplicates = false;
    toastr.options.onclick = null;
    toastr.options.showDuration = 300;
    toastr.options.hideDuration = 1000;
    toastr.options.timeOut = 5000;
    toastr.options.extendedTimeOut = 1000;
    toastr.options.showEasing = "swing";
    toastr.options.hideEasing = "linear";
    toastr.options.showMethod = "fadeIn";
    toastr.options.hideMethod = "fadeOut";
  }

  getSectorType() {
    if (sessionStorage.getItem('SectorType') ) {
      return sessionStorage.getItem('SectorType');
    } else {
      this._router.navigate([
        '/financeSectors'
      ]);
    }
    return sessionStorage.getItem('SectorType');
  }

  checkSectorType():boolean{
    return sessionStorage.getItem('SectorType').length >1
  }

  //#region Messaging
  public messageAlert(
    messageType: MessageType,
    message: string,
    translate: boolean = false,
    messageParams?: { [key: string]: any }
  ) {
    if (translate) {
      this._translatService
        .get(message, messageParams)
        .subscribe((res: string) => {
          this._messageAlert(messageType, res);
        });
    } else {
      this._messageAlert(messageType, message);
    }
  }

  public messageSwal(
    messageType: MessageType,
    message: string,
    translate: boolean = false,
    messageParams?: { [key: string]: any }
  ) {
    if (translate) {
      this._translatService
        .get(message, messageParams)
        .subscribe((res: string) => {
          this._messageSwal(messageType, res);
        });
    } else {
      this._messageSwal(messageType, message);
    }
  }

  private _messageAlert(messageType: MessageType, message: string) {
    switch (messageType) {
      case MessageType.Success:
        toastr.success(message);
        break;
      case MessageType.Info:
        toastr.info(message);
        break;
      case MessageType.Warning:
        toastr.warning(message);
        break;
      case MessageType.Error:
        toastr.error(message);
        break;
    }
  }

  private _messageSwal(messageType: MessageType, message: string) {
    Swal({
      type: MessageType[messageType].toLowerCase(),
      title: message,
      confirmButtonText: this.languageGetCurrent === "ar" ? "اغلاق" : "Close",
    });
  }

  public messageConfirm(title: string, onDelete: Function) {
    Swal.fire({
      title: title,
      type: "warning",
      showCancelButton: true,
      confirmButtonText: this.languageGetCurrent === "ar" ? "موافق" : "Ok",
      cancelButtonText: this.languageGetCurrent === "ar" ? "اغلاق" : "Close",
    }).then((result) => {
      if (result.value) {
        onDelete();
      }
    });
  }

  //#endregion

  //#region System Settings
  public systemSettingsInit(onSettingLoad: any) {
    const serviceResult: IServiceResult = { isSuccess: null, data: null };
    return this._http
      .get(`${this.systemSettingsServiceUrl}/GetShortList`)
      .pipe(
        catchError(this.errorHandler),
        map((resultVM: IResultVM) => {
          if (resultVM.IsSuccess) {
            serviceResult.data = resultVM.Data;
            return serviceResult;
          }
        })
      )
      .subscribe((res: any) => {
        this.systemSettingsSetKeys(res.data);
        onSettingLoad();
      });
  }

  private systemSettingsSetKeys(settings: Setting[]) {
    const systemSettings = {};
    settings.forEach((s) => {
      systemSettings[s.Key] = {
        Value: s.Value,
        Value2: s.Value2,
        Value3: s.Value3,
      };
    });
    sessionStorage.setItem("systemSettings", JSON.stringify(systemSettings));
  }

  public systemSettingsGetValues(key: string): { [key: string]: string } {
    return JSON.parse(sessionStorage.getItem("systemSettings"))[key];
  }

  //#endregion

  //#region  Language
  public languageChanging(languageCode: string) {
    $("#globalLoader").css("display", "block");
    $("body").css("overflow", "hidden");
    this.loadedStylesSheet = [];
    this.documentLoaded.next(false);
    localStorage.setItem("lang", languageCode);
    this._translatService.use(languageCode);
    const otherLang = languageCode === "ar" ? "en" : "ar";
    languages.styleSheets[otherLang].cssIds.forEach((element) => {
      this.languageDisableStyle(element);
    });
    let counter = 0;
    languages.styleSheets[languageCode].stylesUrl.forEach((element) => {
      this.languageLoadStyleIfNotPresent(
        element,
        languages.styleSheets[languageCode].cssIds[counter]
      );
      counter++;
    });
  }

  public languageIntialization() {
    const lang =
      localStorage.getItem("lang") !== null
        ? localStorage.getItem("lang")
        : "ar";

    this._translatService.setDefaultLang(languages.default);
    this.languageChanging(lang);
  }

  public get languageGetCurrent() {
    return localStorage.getItem("lang") !== null
      ? localStorage.getItem("lang")
      : "ar";
  }

  translateWordByKey(key) {
    return this._translatService.instant(key);
  }

  private languageLoadStyleIfNotPresent(url, cssId) {
    if (!document.getElementById(cssId)) {
      const head = document.getElementsByTagName("head")[0];
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = url;
      link.disabled = false;
      link.media = "all";
      head.appendChild(link);
      link.onload = () => {
        this.loadedStylesSheet.push(url);
        if (
          this.loadedStylesSheet.length ===
          languages.styleSheets[localStorage.getItem("lang")].stylesUrl.length
        ) {
          $("#globalLoader").css("display", "none");
          $("body").css("overflow", "unset");
          this.documentLoaded.next(true);
          this.loadedStylesSheet = [];
        }
      };
    } else {
      (<HTMLInputElement>document.getElementById(cssId)).disabled = false;
      this.loadedStylesSheet.push(url);
      if (
        this.loadedStylesSheet.length ===
        languages.styleSheets[localStorage.getItem("lang")].stylesUrl.length
      ) {
        $("#globalLoader").css("display", "none");
        $("body").css("overflow", "unset");
        this.documentLoaded.next(true);

        this.loadedStylesSheet = [];
      }
    }
  }

  public languageOnChange() {
    return this._translatService.onLangChange;
  }

  translateWord(word: string) {
    return this._translatService.get(word);
  }
  private languageDisableStyle(cssid) {
    if (document.getElementById(cssid)) {
      (<HTMLInputElement>document.getElementById(cssid)).disabled = true;
    }
  }

  //#endregion

  //#region  ErrorHandler
  public errorHandler(error: HttpErrorResponse) {
    this.isSpinnerLoaded.next(false);

    let currentLang =
      localStorage.getItem("lang") !== null
        ? localStorage.getItem("lang")
        : "ar";
    if (error.status === 401) {
      Swal({
        type: "error",
        title:
          currentLang === "ar"
            ? "ليس لديك الصلاحية"
            : `You don't have permission`,
        confirmButtonText: currentLang === "ar" ? "اغلاق" : "Close",
      });
      document.location.href = environment.financeURL + "/finance/auth/login";
    }
    else if (error.status === 400) {

      this.messageAlert(MessageType.Error, error.error)
    } else if (error.status === 404) {

      this.messageAlert(MessageType.Error, error.error)
    } else if (error.status === 0) {
      Swal({
        type: "error",
        title:
          currentLang === "ar"
            ? "إنقطع الإتصال بالخادم"
            : `No Connection to Server`,
        confirmButtonText: currentLang === "ar" ? "اغلاق" : "Close",
      });
    } else if (error.status === 500) {
      if (error.error.ExceptionMessage === "666") {
        Swal({
          type: "error",
          title:
            currentLang === "ar"
              ? "الادخال معطل في الوقت الحالي"
              : `System is not available in this time`,
          confirmButtonText: currentLang === "ar" ? "اغلاق" : "Close",
        });
      } else {
        Swal({
          type: "error",
          title:
            currentLang === "ar"
              ? "حدث خطأ ما في النظام"
              : `Error ocurred in The System`,
          confirmButtonText: currentLang === "ar" ? "اغلاق" : "Close",
        });
      }
    }

    return throwError(error);
  }
  //#endregion

  //#region  helpers
  helperGetTimeAsString() {
    let hours = new Date().getHours();
    let minutes = new Date().getMinutes();
    let mode = hours < 12 ? "AM" : "PM";
    if (mode === "PM") {
      hours -= 12;
    }
    let timeString = hours + ":" + minutes + " " + mode;
    return timeString;
  }
  //#endregion
}

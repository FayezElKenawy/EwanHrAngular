import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "@shared/services/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { LangChangeEvent } from "@ngx-translate/core";
import { SignalrService } from "@shared/services/signalr.service";
import { IResultVM, IServiceResult } from "@shared/interfaces/results";
import { SessionTimeoutService } from "@shared/services/session-timeout.service";

@Component({
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  submitted = false;
  progressSpinner = false;
  form: FormGroup;
  returnUrl: string;
  lang: any = this._globalService.languageGetCurrent;
  changePassword: any;
  changePasswordForm: FormGroup;
  passwordPattern: string;
  isVerificationCodeSent: boolean = false;
  loginResult: any;
  credintials: any;
  verificationCodeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    public _globalService: GlobalService,
    private _signalrService: SignalrService,
    private _sessionTimeoutService: SessionTimeoutService
  ) {
    this.passwordPattern = [
      `(?=([^a-z]*[a-z])\{1,\})`,
      `(?=([^A-Z]*[A-Z])\{1,\})`,
      `(?=([^0-9]*[0-9])\{1,\})`,
      `[A-Za-z\\d\$\@\$\!\%\*\?\&\.]{8,}`,
    ]
      .map((item) => item.toString())
      .join("");
    this.form = this.fb.group({
      userName: ["", Validators.required],
      password: ["", Validators.required],
      rememberMe: [false],
    });
    this.changePasswordForm = this.fb.group({
      oldPassword: ["", Validators.required],
      newPassword: [
        "",
        [Validators.required, Validators.pattern(this.passwordPattern)],
      ],
      newPassword2: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.returnUrl = this._activatedRoute.snapshot.queryParams["returnUrl"];
    this._globalService
      .languageOnChange()
      .subscribe((event: LangChangeEvent) => {
        this.lang = event.lang;
      });

    this.initLoginForm();
    this.createverificationCodeForm();
  }

  navigateAfterLogin(){
    if (this.returnUrl) {
      this._router.navigateByUrl(this.returnUrl);
    } else {
      this._router.navigateByUrl("/");
    }
  }

  createverificationCodeForm() {
    this.verificationCodeForm = this.fb.group({
      code: [, Validators.required],
    });
  }

  changePasswordSubmit() {
    this.submitted = true;
    if (this.changePasswordForm.invalid) {
      return;
    }

    if (
      this.changePasswordForm.value.newPassword !==
      this.changePasswordForm.value.newPassword2
    ) {
      this._globalService.messageAlert(
        MessageType.Error,
        "App.validation.PasswordNotMatched",
        true
      );
      return;
    }
    this.progressSpinner = true;
    this.authService.changePassword(this.changePasswordForm.value).subscribe(
      (serviceResult: IServiceResult) => {
        if (serviceResult.isSuccess) {
          if (this.returnUrl) {
            this._router.navigateByUrl(this.returnUrl);
          } else {
            this._router.navigateByUrl("/");
          }
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }

  initLoginForm() {
    this.form = this.fb.group({
      userName: [this.authService.getUserName()],
      password: [],
      rememberMe: [this.authService.getRememberMeState()]
    });
  }

  sendLoginVerificationCode() {
    
    this.isVerificationCodeSent = false;
    if (this.form.invalid) {
      return;
    }

    this.authService
      .sendLoginVerificationCode(this.form.get("userName").value.toString())
      .subscribe((result: IResultVM) => {
        if (result.IsSuccess) {
          this.progressSpinner=false;
          this.isVerificationCodeSent = true;
        }
      });
  }

  onSubmitVerificationCode() {
    this.authService
      .validateLoginCode({
        UserName: this.form.get("userName").value,
        Code: this.verificationCodeForm.get("code").value,
      })
      .subscribe((result: IResultVM) => {
        if (result.IsSuccess) {
          this.saveUserData();
        } else{
          this._globalService.messageAlert(
            MessageType.Error,
            this._globalService.translateWordByKey(
              "Auth.Messages.InvalidCode"
            )
          );
        }
      });
  }

  login(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.progressSpinner = true;
    const credentials = this.form.value;
    credentials.ApplicationId = "RMS-ERP-APP";
    this.authService.login(credentials).subscribe(
      (result) => {
        
        if (result.IsSuccess === true) {
          
          this.submitted = false;
          this.loginResult = result;
          this.credintials = credentials;
          this.sendLoginVerificationCode();
        } else {
          this.progressSpinner = false;
          this._globalService.messageAlert(
            MessageType.Error,
            this._globalService.translateWordByKey(
              "Auth.Messages.InvalidUserNameOrPassword"
            )
          );
        }
      },
      () => (this.progressSpinner = false)
    );
  }

  saveUserData() {
    
    this.isVerificationCodeSent = false;
    // Save User Token
    this.authService.setToken(
      this.loginResult.Data,
      this.credintials.rememberMe
    );
    //store username , rememberMe status
    if (this.credintials.rememberMe) {
      this.authService.setUserName(this.credintials.userName);
      this.authService.setRememberMe(this.credintials.rememberMe);
    } else {
      this.authService.setUserName(
        this.authService.getUserName() === this.credintials.userName
          ? ""
          : this.authService.getUserName()
      );
      this.authService.setRememberMe(
        this.authService.getUserName() === ""
          ? this.credintials.rememberMe
          : this.authService.getRememberMeState()
      );
    }

    //=================================

    this._sessionTimeoutService.setSessionTimeOutWatcher();
    this.submitted = false;
    this.authService.getAuthUser().subscribe(
      (result) => {
        
        if (result.isSuccess && !result.data.MustChangePassword) {
          this.navigateAfterLogin();
        } else if (result.isSuccess && result.data.MustChangePassword) {
          this.changePassword = true;
          this.changePasswordForm.controls.oldPassword.setValue(
            this.credintials.password
          );
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );

    this._signalrService.initializeSignalRConnection();
  }
}

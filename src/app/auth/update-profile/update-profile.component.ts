import { Component, OnInit } from "@angular/core";
import { AuthService } from "@shared/services/auth.service";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IServiceResult } from "@shared/interfaces/results";
import { GlobalService, MessageType } from "@shared/services/global.service";

declare let Swal: any;

@Component({
  selector: "app-update-profile",
  templateUrl: "./update-profile.component.html",
  styleUrls: ["./update-profile.component.scss"],
})
export class UpdateProfileComponent implements OnInit {
  form: FormGroup;
  passwordPattern: string;
  submitted: boolean;
  progressSpinner: boolean;
  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    private _globalHandler: GlobalService
  ) {
    this.passwordPattern = [
      `(?=([^a-z]*[a-z])\{1,\})`,
      `(?=([^A-Z]*[A-Z])\{1,\})`,
      `(?=([^0-9]*[0-9])\{1,\})`,
      `[A-Za-z\\d\$\@\$\!\%\*\?\&\.]{8,}`,
    ]
      .map((item) => item.toString())
      .join("");
    this.form = this._fb.group({
      oldPassword: ["", Validators.required],
      newPassword: [
        "",
        [Validators.required, Validators.pattern(this.passwordPattern)],
      ],
      newPassword2: ["", Validators.required],
    });
  }

  ngOnInit() {}

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    if (this.form.value.newPassword !== this.form.value.newPassword2) {
      this._globalHandler.messageAlert(
        MessageType.Error,
        "App.validation.PasswordNotMatched",
        true
      );
      return;
    }
    this.progressSpinner = true;
    this._authService.changePassword(this.form.value).subscribe(
      (serviceResult: IServiceResult) => {
        if (serviceResult.isSuccess) {
          this._router.navigateByUrl("/auth/profile/user-profile");
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }
}

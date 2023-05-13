import { Component, OnInit } from "@angular/core";
import { UserNotificationService } from "../user-notification.service";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";

@Component({
  selector: "app-user-notification-list",
  templateUrl: "./user-notification-list.component.html",
  styleUrls: ["./user-notification-list.component.scss"],
})
export class UserNotificationListComponent implements OnInit {
  progressSpinner: boolean;
  userNotifications: any;
  environment = environment;
  constructor(
    private _userNotificationService: UserNotificationService,
    private _router: Router
  ) {}

  ngOnInit() {}
  getData() {
    this.progressSpinner = true;
    this._userNotificationService.getUserNotifiations("2").subscribe(
      (result) => {
        if (result.isSuccess) {
          this.userNotifications = result.data;
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }

  onClickNotification(notification: any) {
    let sectorUrl = environment.coreUrl;
    if (notification.ModuleId == 3) {
      sectorUrl = environment.individualSectorURL;
    } else if (notification.ModuleId == 4) {
      sectorUrl = environment.businessSectorURL;
    } else if (notification.ModuleId == 9) {
      sectorUrl = environment.houseLabourSectorUrl;
    }

    const url = sectorUrl + notification.UrlPath + notification.ItemId;
    this._userNotificationService
      .markAsRead(notification.NotificationId)
      .subscribe(
        (res) => {},
        () => {},
        () => (window.location.href = url)
      );
  }
}

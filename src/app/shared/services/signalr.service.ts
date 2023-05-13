import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { GlobalService } from "./global.service";
import { environment } from "@environments/environment";

declare let $: any;
@Injectable({
  providedIn: "root",
})
export class SignalrService {
  private connection: any;
  private proxy: any;
  public notificationCount = 0;
  constructor(
    private _authService: AuthService,
    private _globalService: GlobalService
  ) {}
  public initializeSignalRConnection(): void {
    const signalRServerEndPoint = `${environment.coreApiUrl}`;
    this.connection = $.hubConnection(signalRServerEndPoint);

    this.proxy = this.connection.createHubProxy("UserNotificationHub");

    this.proxy.on("messageReceived", (serverMessage) =>
      this.onMessageReceived(serverMessage)
    );

    this.connection.qs = `Token=${this._authService.getToken()}`;

    this.connection
      .start()
      .done((data: any) => {})
      .catch((error: any) => {});
  }

  onMessageReceived(serverMessage: any) {
    this.notificationCount = serverMessage;
  }
}

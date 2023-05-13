import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { environment } from '@environments/environment';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AuthService } from './auth.service';
import { GlobalService, MessageType } from './global.service';
declare let $;
@Injectable({
  providedIn: 'root',
})
export class SessionTimeoutService {
  timedOut = false;
  lastPing?: Date = null;
  timeoutObserv: any;
  timeoutObservEnd: any;
  onPing: any;
  constructor(
    private _globalService: GlobalService,
    private idle: Idle,
    private keepalive: Keepalive,
    private _authService: AuthService,
    private _ngZone: NgZone
  ) {}

  setSessionTimeOutWatcher() {
    if (this.timeoutObserv) {
      this.timeoutObserv.unsubscribe();
      this.timeoutObservEnd.unsubscribe();
      this.onPing.unsubscribe();
    }
    // sets an idle timeout of 1 seconds, for testing purposes.
    this.idle.setIdle(1);
    // sets a timeout period of 5 minutes.
    this.idle.setTimeout(environment.timeoutPeriod);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.timeoutObservEnd = this.idle.onIdleEnd.subscribe(() => {
      this.reset();
    });

    this.timeoutObserv = this.idle.onTimeout.subscribe(() => {
      this.timedOut = true;


      this._authService.logOut();
      $('.modal').modal('hide');
     this._globalService.messageSwal(
        MessageType.Info,
        'App.Messages.TimedOut',
        true
      );
    });

    // sets the ping interval to 15 seconds
    this.keepalive.interval(15);
    this.onPing = this.keepalive.onPing.subscribe(
      () => (this.lastPing = new Date())
    );

    let token = this._authService.getToken();
    if (token) {
      this.idle.watch();
      this.timedOut = false;
    } else {
      this.idle.stop();
    }
  }
  reset() {
    this.idle.watch();
    this.timedOut = false;
  }
}

import { Component, OnInit } from '@angular/core';
import { GlobalService, MessageType } from '@shared/services/global.service';
import { Router, NavigationEnd } from '@angular/router';
import { SignalrService } from '@shared/services/signalr.service';
import { SessionTimeoutService } from '@shared/services/session-timeout.service';
import { AuthService } from '@shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isSystemSettingsLoaded: boolean = false;
  isSpinnerLoaded : boolean = false;

  constructor(
    private _globalService: GlobalService,
    private router: Router,
    private _signalrService: SignalrService,
    private _authService: AuthService,
    private _sessionTimeoutService: SessionTimeoutService
  ) {
    let token = this._authService.getToken();
    if (token) {
      this._sessionTimeoutService.setSessionTimeOutWatcher();
      }
  }

  ngOnInit(): void {
    this.setSpinnerStatus();

    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.router.navigated = false;
        window.scrollTo(0, 0);
      }
    });
    this._globalService.languageIntialization();
    this._globalService.systemSettingsInit(
      () => (this.isSystemSettingsLoaded = true)
    );
    this._signalrService.initializeSignalRConnection();
  }

  setSpinnerStatus(){
    this._globalService.isSpinnerLoaded.subscribe(value=>{
      if(value)
       this.isSpinnerLoaded = true;
      else
       this.isSpinnerLoaded = false;
    });
  }
}

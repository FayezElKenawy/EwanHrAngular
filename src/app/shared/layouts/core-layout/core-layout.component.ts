import { Component, OnInit } from "@angular/core";
import { Event as RouterEvent } from "@angular/router";
import { Router } from "@angular/router";
import { RouteConfigLoadStart } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";
import { IServiceResult } from "@shared/interfaces/results";
import { environment } from "@environments/environment";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { LangChangeEvent } from "@ngx-translate/core";

declare let mLayout: any;
declare let $: any;

@Component({
  selector: "app-layout",
  templateUrl: "./core-layout.component.html",
  styleUrls: ["./core-layout.component.scss"],
})
export class CoreLayoutComponent implements OnInit {
  coreUrl: string;
  menus: any[] = [];
  mainmenus: any[] = [];
  isRouteLoadedStart: boolean;
  lang: any = this._globalService.languageGetCurrent;
  hideContent: boolean;
  constructor(
    private _router: Router,
    private _AuthService: AuthService,
    private _globalService: GlobalService
  ) {
    _router.events.subscribe((event: RouterEvent): void => {
      if (event instanceof RouteConfigLoadStart) {
        this.isRouteLoadedStart = true;
      }
    });
    this._globalService
      .languageOnChange()
      .subscribe((event: LangChangeEvent) => {
        this.lang = event.lang;
      });
  }

  ngOnInit() {
    this.coreUrl = environment.coreUrl;
    this.hideContent = true;

    this._AuthService.getUserMenuItems(3).subscribe(
      (serviceResult: IServiceResult) => {
        this.menus = serviceResult.data;
        this.mainmenus = Object.assign(
          [],
          this.menus.filter((m) => m.ParentId === null)
        );
      },
      () => {
        this.hideContent = false;
      },
      () => {
        this.hideContent = false;
      }
    );

    mLayout.init();

    $(".m-menu__link").on("click", function () {
      $("body").removeClass("m-aside-left--on");
    });
  }

  getChildMenus(id: number) {
    return this.menus.filter((m) => m.ParentId === id);
  }
}

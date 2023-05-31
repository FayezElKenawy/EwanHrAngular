import { SignalrService } from "@shared/services/signalr.service";
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { environment } from "@environments/environment";
import { AuthService } from "@shared/services/auth.service";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { languages } from "@environments/languages";
import { LangChangeEvent } from "@ngx-translate/core";
import { SearchModel } from "@shared/interfaces/search-model";
import { BranchService } from "@shared/services/branch.service";
import { IServiceResult } from "@shared/interfaces/results";
import { UserNotificationListComponent } from "src/app/notification/user-notification/user-notification-list/user-notification-list.component";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  showSearchAllBranch:boolean=false;
  IsSearchAllBranch:boolean;
  userInfoVM: any;
  coreUrl: string;
  authUserVM: any;
  envName: string;
  env: {};
  langList: any[];
  branches: any[] = [];
  modules: any[] = [];
  companyLogoText: string;
  currentLang: any = this._globalService.languageGetCurrent;
  @ViewChild("scrollMe") private myScrollContainer: ElementRef;
  searchModel: SearchModel;
  load = false;
  @ViewChild(UserNotificationListComponent)
  userNotificationListChild: UserNotificationListComponent;
  constructor(
    private authService: AuthService,
    private router: Router,
    private _route: ActivatedRoute,
    private _branchService: BranchService,
    public _globalService: GlobalService,
    public signalRService: SignalrService
  ) { }

  ngOnInit() {
    this.authUserVM = this._route.snapshot.firstChild.data["authUserVM"];
    this.getAuthUser();
    this.coreUrl = environment.coreUrl;
    this.envName = environment.name;
    this.env = environment;
    this.langList = languages.List;
    this._globalService
      .languageOnChange()
      .subscribe((event: LangChangeEvent) => {
        this.currentLang = event.lang;
      });
    this.companyLogoText = this._globalService.systemSettingsGetValues(
      "CompanyLogo"
    ).Value;

    this.authService.getModuels().subscribe((res: any) => {
      if (res.isSuccess) {
        this.modules = res.data;
      }
    });
  }

  getAuthUser() {
    console.log('header component');

    this.authService.getAuthUser().subscribe(
      (res) => {
        if (res.isSuccess) {
          this.authUserVM = res.data;
          this.IsSearchAllBranch = this.authUserVM.ShowAllBranches;
          if (this.authUserVM.RoleTypeId == '001') {
            this.showSearchAllBranch = true;
          }
        }
      },
      null,
      null
    );
  }

  logOut() {
    this.authService.logOut();
    this.router.navigateByUrl("/finance/auth/login");
  }


  getBranches() {
    this.load = true;
    this._branchService
      .getShortListBranches(this.searchModel)
      .subscribe((serviceResult: IServiceResult) => {
        this.branches = serviceResult.data;
        this.load = false;
      });
  }

  changeBranch(branchId: any) {
    this.authService.changeBranch(branchId).subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          const currentPath = decodeURI(this.router.url);
          this.router.navigate([currentPath]).then(() => { });
        }
      },
      null,
      null
    );
  }

  onScroll(event: any) {
    const element = this.myScrollContainer.nativeElement;
    const atBottom =
      element.scrollHeight - element.scrollTop === element.clientHeight;

    if (atBottom) {
      this.searchModel.pageNumber++;
      this.getBranches();
    }
  }
  showBranches() {
    if (this.branches.length === 0) {
      this.branches = [];
      this.searchModel = { pageNumber: 1, pageSize: 10 };
      this.getBranches();
    }
  }
  showNotifications() {
    this.userNotificationListChild.getData();
    // this.signalRService.notificationCount = 0;
  }
  IsSearchAllBranchChanged() {
    this.authService.SetShowAllBranches(this.IsSearchAllBranch).subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          const currentPath = decodeURI(this.router.url);
          this.router.navigate([currentPath]).then(() => { });
        }
      },
      null,
      null
    );
  }
}

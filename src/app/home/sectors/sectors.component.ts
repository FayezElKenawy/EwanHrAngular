import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';
import { AuthService } from '@shared/services/auth.service';
import { GlobalService } from '@shared/services/global.service';

declare let $;
@Component({
  selector: 'app-sectors',
  templateUrl: './sectors.component.html',
  styleUrls: ['./sectors.component.scss']
})
export class SectorsComponent implements OnInit {
  env: any = {};
  modules: any[] = [
    {URLPath:'/house-receipts/credit-notes',IconFont:"../../../assets/images/cards/hour.png",Name:"asd",Description:"asd"}
  ];
  CompanyLogoText: string = this._globalService.systemSettingsGetValues(
    'CompanyLogo'
  ).Value;

  constructor(
    private _authenticationService: AuthService,
    private _globalService: GlobalService
  ) {}

  ngOnInit() {
    $('#my-element').textfill();
    this.env = environment;
    this._authenticationService.getModuels().subscribe((res: any) => {
      if (res.isSuccess) {
        this.modules = res.data;
      }
    });
  }
}

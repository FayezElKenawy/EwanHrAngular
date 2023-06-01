import { Component, OnInit, ViewChild } from "@angular/core";
import { GlobalService } from "@shared/services/global.service";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { PageListConfig } from "@shared/models/page-list-config.model";
import { SearchType } from "@shared/enum/searchType.enum";
import { environment } from "@environments/environment";
import { Router } from "@angular/router";

@Component({
  selector: "app-list-customer-account",
  templateUrl: "./list-customer-account.component.html",
  styleUrls: ["./list-customer-account.component.scss"]
})
export class ListCustomerAccountComponent implements OnInit {

  pageListConfig:PageListConfig;
  constructor(
    private _router:Router,
    private _globalService: GlobalService,
    public _dynamicSearchService: DynamicSearchService
  ) {}

  ngOnInit() {
    this.createPageListConfig()
  }

  createPageListConfig() {
    this.pageListConfig = {
      pageAuthorization: 'Finance-CustomerAccount-GetPagedList',
      pageTitle: 'Receipts.Titles.CustomersAccounts',
      createAuthorization: '',
      createButtonTitle: '',
      createLink: '',
      getDataAPIURL: `${environment.financeSectorAPIURL}/v1/CustomerAccount/GetPagedList`,
      searchFields: [
        {
          fieldName: 'SectorTypeId',
          operator: 'equal',
          value: this._globalService.getSectorType()
        },
      ],
      actions: [
        {
          authorization: 'Finance-CustomerAccount-Details',
          title: 'App.Buttons.Details',
          callBack: (dataItem) => {
            this.details(dataItem.id);
          },
        }
      ],
      cols : [
        {
          field: "code",
          header: "Receipts.Fields.CustomerId",
          hidden: false,
          searchable: true,
          searchType: SearchType.Text
        },
        {
          field: "name",
          header: "Receipts.Fields.CustomerName",
          hidden: false,
          searchable: true,
          searchType: SearchType.Text
        },
        {
          field: "phoneNumber",
          header: "Receipts.Fields.CustomerPhone",
          hidden: false,
          searchable: true,
          searchType: SearchType.Text
        },
        {
          field: "debitBalance",
          header: "Receipts.Fields.DebitBalance",
          hidden: false,
          searchable: true,
          searchType: SearchType.Text
        },
        {
          field: "creditBalance",
          header: "Receipts.Fields.CreditBalance",
          hidden: false,
          searchable: true,
          searchType: SearchType.Text
        },
        {
          field: "currentBalance",
          header: "Receipts.Fields.CustomerBalance",
          hidden: false,
          searchable: true,
          searchType: SearchType.Text
        }

      ]
  }

  }

  details(id:any){
    this._router.navigate(["/finance/receipts/details-customer-account",id])
  }

}

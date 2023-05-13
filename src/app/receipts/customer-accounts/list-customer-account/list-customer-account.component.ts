import { Component, OnInit, ViewChild } from "@angular/core";
import { CustomerAccountService } from "../customer-account.service";
import { GlobalService } from "@shared/services/global.service";
import { ActivatedRoute } from "@angular/router";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";
import { IServiceResult } from "@shared/interfaces/results";
import { Table } from "primeng/table";

@Component({
  selector: "app-list-customer-account",
  templateUrl: "./list-customer-account.component.html",
  styleUrls: ["./list-customer-account.component.scss"]
})
export class ListCustomerAccountComponent implements OnInit {
  pagingMetaData: PagingMetaData;
  searchForm: FormGroup;
  searchModel: SearchModel = {};
  operators: string[];
  progressSpinner = true;
  dataItems: any[];
  cols: any[];
  constructor(
    private customerAccountService: CustomerAccountService,
    private _globalService: GlobalService,
    public _dynamicSearchService: DynamicSearchService
  ) {}

  ngOnInit() {
    this.defineCols();
    // build form for search
    this.searchForm = this._dynamicSearchService.buildSearchForm(this.cols);
    this.operators = this._dynamicSearchService.operators;
  }

  defineCols() {
    this.cols = [
      {
        field: "SegmentsCustomerId",
        header: "Receipts.Fields.CustomerId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "Name",
        header: "Receipts.Fields.CustomerName",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "PhoneNumber",
        header: "Receipts.Fields.CustomerPhone",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "CustomerTypeArabicName",
        header: "Receipts.Fields.CustomerTypeName",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      // {
      //   field: 'UnifiedBankAccountNumber',
      //   header: 'Receipts.Fields.UnifiedBankAccountNumber',
      //   hidden: false,
      //   searchable: true,
      //   searchType: 'text'
      // },
      {
        field: "Discount",
        header: "Sales.Fields.DiscountRatio",
        hidden: true,
        searchable: false,
        searchType: "text"
      },
      {
        field: "DebitBalance",
        header: "Receipts.Fields.DebitBalance",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "CreditBalance",
        header: "Receipts.Fields.CreditBalance",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "CurrentBalance",
        header: "Receipts.Fields.CurrentBalance",
        hidden: false,
        searchable: true,
        searchType: "text"
      }
      // { field: 'ActionButtons', header: 'App.Fields.Actions', hidden: false }
    ];
  }

  getData() {
    this.progressSpinner = true;
    this.customerAccountService.getList(this.searchModel).subscribe(
      (result: IServiceResult) => {
        this.dataItems = result.data.CustomerAccounts;
        this.pagingMetaData = result.data.PagingMetaData;
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }
}

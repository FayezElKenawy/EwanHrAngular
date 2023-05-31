import { Component, OnInit, ViewChild } from "@angular/core";
import { MenuItem } from "primeng/api";
import { ReturnPaymentReceiptService } from "../../services/return-payment-receipt.service";
import { Router } from "@angular/router";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { PagedList } from "@shared/interfaces/paged-list";
import { PageListConfig } from "@shared/models/page-list-config.model";
import { SearchType } from "@shared/enum/searchType.enum";
import { GlobalService } from "@shared/services/global.service";
import { ColumnPipeFormat } from "@shared/enum/columns-pipe-format.enum";
import { ColumnPipeType } from "@shared/enum/column-pipe.enum";
import { environment } from "@environments/environment";

@Component({
  selector: "app-list-returned-payment-receipts",
  templateUrl: "./list-returned-payment-receipts.component.html",
  styleUrls: ["./list-returned-payment-receipts.component.scss"]
})
export class ListReturnedPaymentReceiptsComponent implements OnInit {
  dataItems: any[];
  cols: any;
  menuItems: MenuItem[];
  selectedItem: any;
  progressSpinner = true;
  pagingMetaData: PagingMetaData;
  searchForm: FormGroup;
  searchModel: SearchModel = {};
  operators: string[];
  pageListConfig:PageListConfig;

  constructor(
    private _returnPaymentReceiptService: ReturnPaymentReceiptService,
    private _router: Router,
    public _dynamicSearchService: DynamicSearchService,
    private _globalService:GlobalService
  ) {}

  ngOnInit() {
    this.createPageListConfig()
  }

  update(id: string) {
    console.log(id)
    this._router.navigate([
      `finance/receipts/edit-return-payment-receipts`,id]);
  }

  getData() {
    this.progressSpinner = true;
    this._returnPaymentReceiptService.getAll(this.searchModel).subscribe(
      (result:PagedList) => {
          this.dataItems = result.entities;
          this.pagingMetaData = result.pagingData;
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }

  createPageListConfig() {
    this.pageListConfig = {
      pageAuthorization: 'Finance-DebitPayment-GetPagedList',
      pageTitle: 'Receipts.Titles.ReturnedPaymentReceiptsListPage',
      createAuthorization: 'Finance-DebitPayment-Create',
      createButtonTitle: 'Receipts.Buttons.ReturnedPaymentReceiptCreate',
      createLink: '/finance/receipts/create-returned-payment-receipts',
      getDataAPIURL: `${environment.financeSectorAPIURL}/v1/DebitPayment/GetPagedList`,
      searchFields: [
        {
          fieldName: 'SectorTypeId',
          operator: 'equal',
          value: this._globalService.getSectorType()
        },
      ],
      actions: [
        {
          authorization: 'Finance-DebitPayment-Update',
          title: 'App.Buttons.Edit',
          callBack: (dataItem) => {
            debugger
            this.update(dataItem.id);
          },
        }
      ],
      cols : [
        {
          field: "id",
          header: "Receipts.Fields.ReciptId",
          hidden: true
        },
        {
          field: "code",
          header: "Receipts.Fields.ReciptId",
          hidden: false,
          searchable: true,
          searchType: SearchType.Text
        },
        {
          field: "documentDate",
          header: "Receipts.Fields.ReciptDate",
          hidden: false,
          pipe: ColumnPipeType.Date,
          pipeFormat: ColumnPipeFormat.DatePipeFormat,
          searchable: true,
          searchType: SearchType.Date
        },
        {
          field: "segmentsCustomerId",
          header: "Receipts.Fields.SegmentsCustomerId",
          hidden: false,
          searchable: true,
          searchType: SearchType.Text
        },
        {
          field: "customerFullName",
          header: "Receipts.Fields.CustomerName",
          hidden: false,
          searchable: true,
          searchType: SearchType.Text
        },
        {
          field: "branchName",
          header: "App.Fields.Branch",
          hidden: false,
          searchable: true,
          searchType: SearchType.Text
        },
        {
          field: "entityCode",
          header: "Receipts.Fields.ContractId",
          hidden: false,
          searchable: true,
          searchType: SearchType.Text
        },
        {
          field: "netValue",
          header: "Receipts.Fields.ReciptValue",
          hidden: false,
          pipe: ColumnPipeType.Currency,
          searchable: true,
          searchType: SearchType.Text
        },
        {
          field: "totalRefund",
          header: "Receipts.Fields.AllRetreived",
          hidden: false,
          pipe: ColumnPipeType.Currency,
          searchable: true,
          searchType: SearchType.Text
        }
      ],
      defaultOrder:'documentDate',
      defaultOrderType:'desc'
    };
  }
}

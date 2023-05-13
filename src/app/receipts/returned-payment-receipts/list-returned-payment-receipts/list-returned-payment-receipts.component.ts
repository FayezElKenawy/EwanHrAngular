import { Component, OnInit, ViewChild } from "@angular/core";
import { MenuItem } from "primeng/api";
import { ReturnPaymentReceiptService } from "../return-payment-receipt.service";
import { Router } from "@angular/router";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
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

  constructor(
    private _returnPaymentReceiptService: ReturnPaymentReceiptService,
    private _router: Router,
    public _dynamicSearchService: DynamicSearchService
  ) {}

  ngOnInit() {
    this.cols = [
      // { field: 'ActionButtons', header: '', hidden: false, searchable: true },
      {
        field: "Id",
        header: "Receipts.Fields.ReciptId",
        hidden: true
      },
      {
        field: "DebitPaymentId",
        header: "Receipts.Fields.ReciptId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "DocumentDate",
        header: "Receipts.Fields.ReciptDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
        searchable: true,
        searchType: "date"
      },
      {
        field: "SegmentsCustomerId",
        header: "Receipts.Fields.SegmentsCustomerId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "CustomerFullName",
        header: "Receipts.Fields.CustomerName",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      // {
      //   field: "CreatedBy",
      //   header: "Sales.Fields.CreatedBy",
      //   hidden: false,
      //   searchable: true,
      //   searchType: "text"
      // },
      {
        field: "BranchName",
        header: "App.Fields.Branch",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "SegmentContractId",
        header: "Receipts.Fields.ContractId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "NetValue",
        header: "Receipts.Fields.ReciptValue",
        hidden: false,
        pipe: "currency",
        searchable: true,
        searchType: "text"
      },
      {
        field: "TotalRefund",
        header: "Receipts.Fields.AllRetreived",
        hidden: false,
        pipe: "currency",
        searchable: true,
        searchType: "text"
      }
    ];

    // build form for search
    this.searchForm = this._dynamicSearchService.buildSearchForm(this.cols);
    this.operators = this._dynamicSearchService.operators;
  }

  setId(id: string) {
    this._router.navigate([
      "individual/receipts/edit-return-payment-receipts",
      id
    ]);
  }

  getData() {
    this.progressSpinner = true;
    this._returnPaymentReceiptService.getAll(this.searchModel).subscribe(
      result => {
        if (result.isSuccess) {
          this.dataItems = result.data.ReturnPaymentReceipts;
          this.pagingMetaData = result.data.PagingMetaData;
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }
}

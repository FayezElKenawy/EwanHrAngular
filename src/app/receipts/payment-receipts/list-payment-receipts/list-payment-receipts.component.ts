import { Component, OnInit, ViewChild } from "@angular/core";
import { MenuItem } from "primeng/api";
import { PaymentReceiptService } from "../payment-receipt.service";
import { Router } from "@angular/router";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { ReportModelViewerComponent } from "@shared/components/report-model-viewer/report-model-viewer.component";
import { AuthService } from "@shared/services/auth.service";

@Component({
  selector: "app-list-payment-receipts",
  templateUrl: "./list-payment-receipts.component.html",
  styleUrls: ["./list-payment-receipts.component.scss"],
})
export class ListPaymentReceiptsComponent implements OnInit {
  @ViewChild(ReportModelViewerComponent)
  reportchild: ReportModelViewerComponent;
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
    private _paymentReceiptService: PaymentReceiptService,
    private _router: Router,
    public _dynamicSearchService: DynamicSearchService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.cols = [
      // { field: 'ActionButtons', header: '', hidden: false },
      {
        field: "Id",
        header: "Receipts.Fields.ReciptId",
        hidden: true
      },
      {
        field: "CreditReceivableId",
        header: "Receipts.Fields.ReciptId",
        hidden: false,
        searchable: true,
        searchType: "text",
      },
      {
        field: "DocumentDate",
        header: "Receipts.Fields.ReciptDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
        searchable: true,
        searchType: "date",
      },
      {
        field: "SegmentsCustomerId",
        header: "Receipts.Fields.SegmentsCustomerId",
        hidden: false,
        searchable: true,
        searchType: "text",
      },
      {
        field: "CustomerFullName",
        header: "Receipts.Fields.CustomerName",
        hidden: false,
        searchable: true,
        searchType: "text",
      },
      {
        field: "SegmentContractId",
        header: "Receipts.Fields.ContractId",
        hidden: false,
        searchable: true,
        searchType: "text",
      },
      {
        field: "BankName",
        header: "Receipts.Fields.BankAccountName",
        hidden: false,
        searchable: true,
        searchType: "text",
      },
      {
        field: "CashBoxName",
        header: "Receipts.Fields.CashBoxName",
        hidden: false,
        searchable: true,
        searchType: "text",
      },
      {
        field: "CreditCardTypeName",
        header: "Receipts.Fields.CreditCardTypeName",
        hidden: false,
        searchable: true,
        searchType: "text",
      },
      // {
      //   field: "CreatedBy",
      //   header: "Sales.Fields.CreatedBy",
      //   hidden: false,
      //   searchable: true,
      //   searchType: "text",
      // },
      {
        field: "BranchName",
        header: "App.Fields.Branch",
        hidden: false,
        searchable: true,
        searchType: "text",
      },
      {
        field: "NetValueAfterTax",
        header: "Receipts.Fields.ReciptValue",
        hidden: false,
        searchable: true,
        pipe: "currency",
        searchType: "text",
      },
      {
        field: "IsDownPayment",
        header: "Receipts.Fields.ReciptType",
        hidden: false,
        searchable: false,
        searchType: "text",
      },
      {
        field: "TolalPaid",
        header: "Receipts.Fields.InvoiceGetPaid",
        hidden: false,
        searchable: true,
        pipe: "currency",
        searchType: "text",
      },
      {
        field: "TotalRefund",
        header: "Receipts.Fields.AllRetreived",
        hidden: false,
        searchable: true,
        pipe: "currency",
        searchType: "text",
      },
    ];

    // build form for search
    this.searchForm = this._dynamicSearchService.buildSearchForm(this.cols);
    this.operators = this._dynamicSearchService.operators;
  }

  setId(id: string) {
    this._router.navigate(["/individual/receipts/edit-payment-receipts", id]);
  }

  getData() {
    this.progressSpinner = true;
    this._paymentReceiptService.getAll(this.searchModel).subscribe(
      (result) => {
        if (result.isSuccess) {
          this.dataItems = result.data.PaymentReceipts;
          this.pagingMetaData = result.data.PagingMetaData;
          this.dataItems.forEach(element => {
            if (element.CreditCardTypeId == null) {
              element.CreditCardTypeName = "ــــــ"
            }
          });
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }

  showReport(paymentId) {
    this.reportchild.reportName = "Receipts.Titles.PaymentReceiptsListPage";
    this.auth.getAuthUser().subscribe((result) => {
      const user = result.data;
      this.reportchild.showReprot(
        8,
        `&Ds1_Filter1=And,CreditReceivableId,=,${paymentId}&UserName=${user.ArabicFullName}`,
        false
      );
    });
  }
}

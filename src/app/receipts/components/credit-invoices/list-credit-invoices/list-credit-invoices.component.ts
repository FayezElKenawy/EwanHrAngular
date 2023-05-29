import { Component, OnInit, ViewChild, ViewChildren } from "@angular/core";
import { MenuItem } from "primeng/api";
import { CreditInvoiceService } from "../../../services/credit-invoice.service";
import { DetailCreditInvoiceComponent } from "../detail-credit-invoice/detail-credit-invoice.component";
import { ReportModelViewerComponent } from "@shared/components/report-model-viewer/report-model-viewer.component";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { AuthService } from "@shared/services/auth.service";
import { SearchType } from "@shared/enum/searchType.enum";
import { ColumnPipeType } from "@shared/enum/column-pipe.enum";
import { ColumnPipeFormat } from "@shared/enum/columns-pipe-format.enum";
import { environment } from "@environments/environment";
import { GlobalService } from "@shared/services/global.service";
import { Router } from "@angular/router";
import { PageListConfig } from "@shared/models/page-list-config.model";

@Component({
  selector: "app-list-credit-invoices",
  templateUrl: "./list-credit-invoices.component.html",
  styleUrls: ["./list-credit-invoices.component.scss"]
})
export class ListCreditInvoicesComponent implements OnInit {

  @ViewChild(ReportModelViewerComponent)
  reportchild: ReportModelViewerComponent;

  pageListConfig: PageListConfig;

  constructor(
    public _dynamicSearchService: DynamicSearchService,
    private authService: AuthService,
    private globalService: GlobalService,
    private _router: Router,
  ) { }

  ngOnInit() {
    this.createPageListConfig();
  }


  createPageListConfig() {
    this.pageListConfig = {
      pageAuthorization: 'Finance-CreditInvoice-GetPagedList',
      pageTitle: 'Receipts.Titles.CreditInvoicesListPage',
      createAuthorization: 'Finance-CreditInvoice-Create',
      createButtonTitle: 'Receipts.Buttons.CreditInvoiceCreate',
      createLink: '/finance/receipts/create-credit-invoice',
      getDataAPIURL: `${environment.financeSectorAPIURL}/v1/CreditInvoice/GetPagedList`,
      searchFields: [
        {
          fieldName: 'SectorTypeId',
          operator: 'equal',
          value: this.globalService.getSectorType()
        },
      ],
      actions: [
        {
          authorization: 'Finance-CreditInvoice-Details',
          title: 'App.Buttons.Details',
          callBack: (dataItem) => {
            this._router.navigate([
              '/finance/receipts/details-credit-invoices',
              dataItem.id,
            ]);
          },
        },
        {
          authorization: '',
          title: 'App.Buttons.Print',
          callBack: (dataItem) => {
            this.showReport(dataItem.code);
          },
        },
      ],
      cols: [
        {
          field: "code",
          header: "Receipts.Fields.InvoiceId",
        },
        {
          field: "documentDate",
          header: "Receipts.Fields.InvoiceDate",
          searchType: SearchType.Date,
          pipe: ColumnPipeType.Date,
          pipeFormat: ColumnPipeFormat.DatePipeFormat,
        },
        {
          field: "customerCode",
          header: "Receipts.Fields.SegmentsCustomerId",
        },
        {
          field: "customerName",
          header: "Receipts.Fields.CustomerName",

        },
        {
          field: "BranchName",
          header: "App.Fields.Branch",
        },
        {
          field: "entityCode",
          header: "Receipts.Fields.ContractId",

        },
        {
          field: "netValue",
          header: "Receipts.Fields.InvoiceValue",
          pipe: ColumnPipeType.Currency,
        },
        {
          field: "discountAmount",
          header: "Receipts.Fields.DiscountValue",
          pipe: ColumnPipeType.Currency,
        },
        {
          field: "taxAmount",
          header: "Receipts.Fields.TaxValue",
          pipe: ColumnPipeType.Currency,
        },
        {
          field: "netValueAfterTax",
          header: "Receipts.Fields.AllInvoiceValue",
          pipe: ColumnPipeType.Currency,
        },
        {
          field: "totalPaid",
          header: "Receipts.Fields.InvoiceGetPaid",
          pipe: ColumnPipeType.Currency,
        },
        {
          field: "paidFromDownpayment",
          header: "Receipts.Fields.PaidFromDownpayment",
          pipe: ColumnPipeType.Currency,
        },
        {
          field: "totalReceivable",
          header: "Receipts.Fields.TotalReceivable",
          pipe: ColumnPipeType.Currency,
        }
      ],
      defaultOrder: 'documentDate',
      defaultOrderType: 'desc'
    };
  }

  showReport(invoiceId: any) {
    this.reportchild.reportName = "Receipts.Titles.TotalInvoice";
    this.authService.getAuthUser().subscribe(result => {
      const user = result.data;
      switch (this.globalService.getSectorType()) {
        case "01-01":
          this.reportchild.showReprot(
            71,
            `&Ds1_Filter1=And,DebitReceivableId,=,${invoiceId}&Ds1_Filter2=And,DebitReceivableTypeId,=,CR&UserName=${user.ArabicFullName}`,
            false
          );
          break;
        case "01-02":
          this.reportchild.showReprot(
            3,
            `&Ds1_Filter1=And,DebitReceivableId,=,${invoiceId}&Ds1_Filter2=And,DebitReceivableTypeId,=,CR&UserName=${user.ArabicFullName}`,
            false
          );
          break;

      }
    });
  }
}

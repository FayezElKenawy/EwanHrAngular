import { Component, OnInit, ViewChild, ViewChildren } from "@angular/core";
import { MenuItem } from "primeng/api";
import { CreditInvoiceService } from "../credit-invoice.service";
import { DetailCreditInvoiceComponent } from "../detail-credit-invoice/detail-credit-invoice.component";
import { ReportModelViewerComponent } from "@shared/components/report-model-viewer/report-model-viewer.component";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { AuthService } from "@shared/services/auth.service";

@Component({
  selector: "app-list-credit-invoices",
  templateUrl: "./list-credit-invoices.component.html",
  styleUrls: ["./list-credit-invoices.component.scss"]
})
export class ListCreditInvoicesComponent implements OnInit {
  @ViewChild(DetailCreditInvoiceComponent) child: DetailCreditInvoiceComponent;
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
    private _creditInvoiceService: CreditInvoiceService,
    public _dynamicSearchService: DynamicSearchService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.cols = [
      // { field: 'ActionButtons', header: '', hidden: false, searchable: true },
      {
        field: "DebitReceivableId",
        header: "Receipts.Fields.InvoiceId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "DocumentDate",
        header: "Receipts.Fields.InvoiceDate",
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
        field: "CustomerArabicName",
        header: "Receipts.Fields.CustomerName",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
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
        header: "Receipts.Fields.InvoiceValue",
        hidden: false,
        pipe: "currency",

        searchable: true,
        searchType: "text"
      },
      {
        field: "DiscountAmount",
        header: "Receipts.Fields.DiscountValue",
        hidden: false,
        pipe: "currency",
        searchable: true,
        searchType: "text"
      },
      {
        field: "TaxAmount",
        header: "Receipts.Fields.TaxValue",
        hidden: false,
        pipe: "currency",
        searchable: true,
        searchType: "text"
      },
      {
        field: "NetValueAfterTax",
        header: "Receipts.Fields.AllInvoiceValue",
        hidden: false,
        pipe: "currency",

        searchable: true,
        searchType: "text"
      },
      {
        field: "TotalPaid",
        header: "Receipts.Fields.InvoiceGetPaid",
        hidden: false,
        searchable: true,
        pipe: "currency",
        searchType: "text"
      },
      {
        field: "PaidFromDownpayment",
        header: "Receipts.Fields.PaidFromDownpayment",
        hidden: false,
        searchable: true,
        pipe: "currency",
        searchType: "text"
      },
      {
        field: "TotalReceivable",
        header: "Receipts.Fields.TotalReceivable",
        hidden: false,
        pipe: "currency",
        searchable: true,
        searchType: "text"
      }
    ];

    this.menuItems = [
      {
        label: "التفاصيل",
        icon: "pi pi-details"
      },
      {
        label: "طباعة",
        icon: "pi pi-print"
      }
    ];
    // build form for search
    this.searchForm = this._dynamicSearchService.buildSearchForm(this.cols);
    this.operators = this._dynamicSearchService.operators;
  }

  getData() {
    this.progressSpinner = true;
    this._creditInvoiceService.getAll(this.searchModel).subscribe(
      result => {
        this.dataItems = result.data.CreditInvoices;
        this.pagingMetaData = result.data.PagingMetaData;
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }

  itemDetails(id: string) {
    this.child.getDetails(id);
  }

  showReport(invoiceId) {
    this.reportchild.reportName = "Receipts.Titles.TotalInvoice";
    this.auth.getAuthUser().subscribe(result => {
      const user = result.data;
      this.reportchild.showReprot(
        3,
        `&Ds1_Filter1=And,DebitReceivableId,=,${invoiceId}&Ds1_Filter2=And,DebitReceivableTypeId,=,CR&UserName=${user.ArabicFullName}`,
        false
      );
    });
  }
}

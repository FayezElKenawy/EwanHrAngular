import { Component, OnInit, ViewChild } from "@angular/core";
import { MenuItem } from "primeng/api";
import { CreditNoteService } from "../credit-note.service";
import { Router } from "@angular/router";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { ReportModelViewerComponent } from "@shared/components/report-model-viewer/report-model-viewer.component";
import { AuthService } from "@shared/services/auth.service";
import { IResult } from "@shared/interfaces/results";
import { PagedList } from "@shared/interfaces/paged-list";
import { SearchType } from "@shared/enum/searchType.enum";
import { ColumnPipeType } from "@shared/enum/column-pipe.enum";
import { ColumnPipeFormat } from "@shared/enum/columns-pipe-format.enum";

@Component({
  selector: "app-list-credit-notes",
  templateUrl: "./list-credit-notes.component.html",
  styleUrls: ["./list-credit-notes.component.scss"]
})
export class ListCreditNotesComponent implements OnInit {
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
    private _creditNotService: CreditNoteService,
    private _router: Router,
    public _dynamicSearchService: DynamicSearchService,
    private authService:AuthService
  ) { }

  ngOnInit() {

    this.createCols()

    // build form for search
    this.searchForm = this._dynamicSearchService.buildSearchForm(this.cols);
    this.operators = this._dynamicSearchService.operators;
  }

  createCols(){
    this.cols = [
      {
        field: "code",
        header: "Receipts.Fields.CreditNoteId",
      },
      {
        field: "documentDate",
        header: "Receipts.Fields.CreditNoteDate",
        searchType:SearchType.Date,
        pipe: ColumnPipeType.Date,
        pipeFormat: ColumnPipeFormat.DatePipeFormat,
      },
      {
        field: 'customerCode',
        header: 'Receipts.Fields.customerCode',
        customSearchField:"Customer.Code",
      },
      {
        field: "customerFullName",
        header: "Receipts.Fields.CustomerName",
        customSearchField:"Customer.Name",
        isLocalized:true,
      },
      {
        field: 'entityCode',
        header: 'Receipts.Fields.ContractId',
      },
      // {
      //   field: "CreatedBy",
      //   header: "Sales.Fields.CreatedBy",
      //   hidden: false,
      //   searchable: true,
      //   searchType: "text"
      // },
      {
        field: "branchName",
        header: "App.Fields.Branch",
        customSearchField:"Bank.Name",
        isLocalized:true,
      },
      {
        field: "netValueAfterTax",
        header: "Receipts.Fields.CreditNoteValue",
        pipe:ColumnPipeType.Currency,
      },
      {
        field: "tolalPaid",
        header: "Receipts.Fields.InvoiceGetPaid",
        pipe:ColumnPipeType.Currency,
      },
      {
        field: "otalRefund",
        header: "Receipts.Fields.AllRetreived",
        pipe:ColumnPipeType.Currency,
      }
    ];
  }

  setId(id: string) {
    this._router.navigate(["/receipts/details-credit-note", id]);
  }

  getData() {
    this.progressSpinner = true;
    this._creditNotService.getAll(this.searchModel).subscribe(
      (result:PagedList) => {
          this.dataItems = result.entities;
          this.pagingMetaData = result.pagingData;
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }

  showReport(creditReceivableId) {
    this.reportchild.reportName = "Receipts.Titles.CreditNotesInvoice";
    this.authService.getAuthUser().subscribe(result => {
      const user = result.data;
      this.reportchild.showReprot(
        70,
        `&Ds1_Filter1=And,CreditReceivableId,=,${creditReceivableId}&UserName=${user.ArabicFullName}`,
        false
      );
    });
  }
}

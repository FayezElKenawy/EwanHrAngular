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

    this.cols = [
      // { field: 'ActionButtons', header: '', hidden: false, searchable: false },
      {
        field: "creditReceivableId",
        header: "Receipts.Fields.CreditNoteId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "documentDate",
        header: "Receipts.Fields.CreditNoteDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
        searchable: true,
        searchType: "date"
      },
      {
        field: "segmentsCustomerId",
        header: "Receipts.Fields.SegmentsCustomerId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "customerFullName",
        header: "Receipts.Fields.CustomerName",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "segmentContractId",
        header: "Receipts.Fields.ContractId",
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
        field: "branchName",
        header: "App.Fields.Branch",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "netValueAfterTax",
        header: "Receipts.Fields.CreditNoteValue",
        hidden: false,
        pipe: "currency",
        searchable: true,
        searchType: "text"
      },
      {
        field: "tolalPaid",
        header: "Receipts.Fields.InvoiceGetPaid",
        hidden: false,
        pipe: "currency",
        searchable: true,
        searchType: "text"
      },
      {
        field: "otalRefund",
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
    this._router.navigate(["/individual/receipts/details-credit-note", id]);
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

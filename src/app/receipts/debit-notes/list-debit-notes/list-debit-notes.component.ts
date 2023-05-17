import { Component, OnInit, ViewChild } from "@angular/core";
import { MenuItem } from "primeng/api";
import { DebitNoteService } from "../debit-note.service";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { Router } from "@angular/router";
declare let $: any;

@Component({
  selector: "app-list-debit-notes",
  templateUrl: "./list-debit-notes.component.html",
  styleUrls: ["./list-debit-notes.component.scss"]
})
export class ListDebitNotesComponent implements OnInit {
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
    private _debitNoteService: DebitNoteService,
    private _router: Router,
    public _dynamicSearchService: DynamicSearchService
  ) {}

  ngOnInit() {
    this.cols = [
      {
        field: "DebitReceivableId",
        header: "Receipts.Fields.CreditNoteId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "DocumentDate",
        header: "Receipts.Fields.CreditNoteDate",
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
      {
        field: "SegmentContractId",
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
        field: "BranchName",
        header: "App.Fields.Branch",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "NetValue",
        header: "Receipts.Fields.CreditNoteValue",
        hidden: false,
        searchable: true,
        pipe: "currency",
        searchType: "text"
      },
      {
        field: "TotalPaid",
        header: "Receipts.Fields.InvoiceGetPaid",
        hidden: false,
        pipe: "currency",
        searchable: true,
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
      }
    ];
    // build form for search
    this.searchForm = this._dynamicSearchService.buildSearchForm(this.cols);
    this.operators = this._dynamicSearchService.operators;
  }
  setId(id: string) {
    this._router.navigate(["/receipts/edit-debit-note", id]);
  }

  getData() {
    this.progressSpinner = true;
    this._debitNoteService.getAll(this.searchModel).subscribe(
      result => {
        if (result.isSuccess) {
          this.dataItems = result.data.DebitNotes;
          this.pagingMetaData = result.data.PagingMetaData;
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }
  itemDetails(id: string) {
    // this.child.getDetails(id);
  }

  refresh() {
    this.getData();
  }
}

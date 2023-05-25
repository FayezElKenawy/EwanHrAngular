import { Component, OnInit, ViewChild } from "@angular/core";
import { MenuItem } from "primeng/api";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { Router } from "@angular/router";
import { DebitNoteService } from "src/app/receipts/services/debit-note.service";
import { PageListConfig } from "@shared/models/page-list-config.model";
import { ReportModelViewerComponent } from "@shared/components/report-model-viewer/report-model-viewer.component";
import { ColumnPipeType } from "@shared/enum/column-pipe.enum";
import { ColumnPipeFormat } from "@shared/enum/columns-pipe-format.enum";
import { SearchType } from "@shared/enum/searchType.enum";
import { AuthService } from "@shared/services/auth.service";
import { GlobalService } from "@shared/services/global.service";
import { environment } from "@environments/environment";
declare let $: any;

@Component({
  selector: "app-list-debit-notes",
  templateUrl: "./list-debit-notes.component.html",
  styleUrls: ["./list-debit-notes.component.scss"]
})
export class ListDebitNotesComponent implements OnInit {

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
      pageAuthorization: 'receipts-debit-notes-list',
      pageTitle: 'Receipts.Titles.DebitNotesListPage',
      createAuthorization: 'receipts-debit-notes-create',
      createButtonTitle: 'Receipts.Buttons.DebitNoteCreate',
      createLink: '/finance/receipts/create-debit-note',
      getDataAPIURL: `${environment.financeSectorAPIURL}/v1/DebitNote/GetPagedList`,
      searchFields: [
        {
          fieldName: 'SectorTypeId',
          operator: 'equal',
          value: this.globalService.getSectorType()
        },
      ],
      actions: [
        {
          authorization: '',
          title: 'App.Buttons.Details',
          callBack: (dataItem) => {
            this._router.navigate([
              '/finance/receipts/details-debit-note',
              dataItem.id,
            ]);
          },
        }
      ],
      cols: [
        {
          field: "code",
          header: "Receipts.Fields.CreditNoteId",
        },
        {
          field: "documentDate",
          header: "Receipts.Fields.CreditNoteDate",
          searchType: SearchType.Date,
          pipe: ColumnPipeType.Date,
          pipeFormat: ColumnPipeFormat.DatePipeFormat,
        },
        {
          field: 'customerCode',
          header: 'Receipts.Fields.customerCode',
          customSearchField: "Customer.Code",
        },
        {
          field: "customerFullName",
          header: "Receipts.Fields.CustomerName",
          customSearchField: "Customer.Name",
          isLocalized: true,
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
          field: "netValue",
          header: "Receipts.Fields.CreditNoteValue",
          pipe: ColumnPipeType.Currency,
        },
        {
          field: "totalPaid",
          header: "Receipts.Fields.InvoiceGetPaid",
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


}

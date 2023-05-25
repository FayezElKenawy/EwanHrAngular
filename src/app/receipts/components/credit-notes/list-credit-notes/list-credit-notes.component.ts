import { Component, OnInit, ViewChild } from "@angular/core";
import { MenuItem } from "primeng/api";
import { CreditNoteService } from "../../../services/credit-note.service";
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
import { PageListConfig } from "@shared/models/page-list-config.model";
import { environment } from "@environments/environment";
import { GlobalService } from "@shared/services/global.service";

@Component({
  selector: "app-list-credit-notes",
  templateUrl: "./list-credit-notes.component.html",
  styleUrls: ["./list-credit-notes.component.scss"]
})
export class ListCreditNotesComponent implements OnInit {

  @ViewChild(ReportModelViewerComponent)
  reportchild: ReportModelViewerComponent;

  pageListConfig: PageListConfig;
  constructor(
    public _dynamicSearchService: DynamicSearchService,
    private authService:AuthService,
    private globalService: GlobalService
  ) { }

  ngOnInit() {
       this.createPageListConfig()
  }

  createPageListConfig() {
    this.pageListConfig = {
      pageAuthorization: 'Finance-CreditNote-GetPagedList',
      pageTitle: 'Receipts.Titles.CreditNotesListPage',
      createAuthorization: 'Finance-CreditNote-Create',
      createButtonTitle: 'Receipts.Buttons.CreditNoteCreate',
      createLink: '/finance/receipts/create-credit-note',
      getDataAPIURL: `${environment.financeSectorAPIURL}/v1/CreditNote/GetPagedList`,
      searchFields: [
        {
          fieldName: 'SectorTypeId',
          operator: 'equal',
          value: this.globalService.getSectorType()
        },
      ],
      actions: [
        {
          authorization: 'Finance-CreditNote-Print',
          title: 'App.Buttons.Print',
          callBack: (dataItem) => {
            this.showReport(dataItem.code);
          },
        },
      ],
       cols:[
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
        // {
        //   field: "branchName",
        //   header: "App.Fields.Branch",
        //   customSearchField:"Bank.Name",
        //   isLocalized:true,
        // },
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
          field: "totalRefund",
          header: "Receipts.Fields.AllRetreived",
          pipe:ColumnPipeType.Currency,
        }
      ],
      defaultOrder:'documentDate',
      defaultOrderType:'desc'
    };
  }

  showReport(code) {
    this.reportchild.reportName = "Receipts.Titles.CreditNotesInvoice";
    this.authService.getAuthUser().subscribe(result => {
      const user = result.data;
      this.reportchild.showReprot(
        70,
        `&Ds1_Filter1=And,CreditReceivableId,=,${code}&UserName=${user.ArabicFullName}`,
        false
      );
    });
  }
}

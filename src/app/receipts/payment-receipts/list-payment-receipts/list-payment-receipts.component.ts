import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PaymentReceiptService } from '../payment-receipt.service';
import { Router } from '@angular/router';
import { PagingMetaData } from '@shared/interfaces/paging-meta-data';
import { FormGroup } from '@angular/forms';
import { SearchModel } from '@shared/interfaces/search-model';
import { DynamicSearchService } from '@shared/services/dynamic-search.service';
import { ReportModelViewerComponent } from '@shared/components/report-model-viewer/report-model-viewer.component';
import { AuthService } from '@shared/services/auth.service';
import { PagedList } from '@shared/interfaces/paged-list';
import { ColumnType } from '@shared/models/column-type.model';
import { ColumnPipeType } from '@shared/enum/column-pipe.enum';
import { ColumnPipeFormat } from '@shared/enum/columns-pipe-format.enum';
import { SearchType } from '@shared/enum/searchType.enum';

@Component({
  selector: 'app-list-payment-receipts',
  templateUrl: './list-payment-receipts.component.html',
  styleUrls: ['./list-payment-receipts.component.scss'],
})
export class ListPaymentReceiptsComponent implements OnInit {
  @ViewChild(ReportModelViewerComponent)
  reportchild: ReportModelViewerComponent;
  dataItems: any[];
  cols: ColumnType[] = [];
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
    this.createCols();
    debugger;
    this.searchForm = this._dynamicSearchService.buildSearchForm(this.cols);
    this.operators = this._dynamicSearchService.operators;
  }

  createCols(){
    this.cols = [
      {
        field: 'code',
        header: 'Receipts.Fields.ReciptId'
      },
      {
        field: 'documentDate',
        header: 'Receipts.Fields.ReciptDate',
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
        field: 'customerName',
        header: 'Receipts.Fields.CustomerName',
        customSearchField:"Customer.Name",
        isLocalized:true,
      },
      {
        field: 'entityCode',
        header: 'Receipts.Fields.ContractId',
      },
      {
        field: 'bankName',
        header: 'Receipts.Fields.BankAccountName',
        customSearchField:"Bank.Name",
        isLocalized:true,
      },
      {
        field: 'cashBoxName',
        header: 'Receipts.Fields.CashBoxName',
        customSearchField:"CashBox.Name",
        isLocalized:true,
      },
      {
        field: 'creditCardTypeName',
        header: 'Receipts.Fields.CreditCardTypeName',
        customSearchField:"CreditCardType.Name",
        isLocalized:true,
      },
      {
        field: 'branchName',
        header: 'App.Fields.Branch',
        customSearchField:"Branch.Name",
        isLocalized:true,
      },
      {
        field: 'netValueAfterTax',
        header: 'Receipts.Fields.ReciptValue',
      },
      {
        field: 'isDownPayment',
        header: 'Receipts.Fields.ReciptType',
      },
      {
        field: 'tolalPaid',
        header: 'Receipts.Fields.InvoiceGetPaid',
      },
      {
        field: 'totalRefund',
        header: 'Receipts.Fields.AllRetreived',
      },
    ];
  }

  getPagedList() {
    debugger;
    this.progressSpinner = true;
    this._paymentReceiptService
      .getPagedList(this.searchModel)
      .subscribe((result: PagedList) => {
        this.dataItems = result.entities;
        this.pagingMetaData = result.pagingData;
        this.progressSpinner = false;
      });
  }

  setId(id: string) {
    this._router.navigate(['/individual/receipts/edit-payment-receipts', id]);
  }

  showReport(paymentId) {
    this.reportchild.reportName = 'Receipts.Titles.PaymentReceiptsListPage';
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

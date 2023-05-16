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

@Component({
  selector: 'app-list-payment-receipts',
  templateUrl: './list-payment-receipts.component.html',
  styleUrls: ['./list-payment-receipts.component.scss'],
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
    this.createCols();
    debugger;
    this.searchForm = this._dynamicSearchService.buildSearchForm(this.cols);
    this.operators = this._dynamicSearchService.operators;
  }

  createCols(){
    this.cols = [
      {
        field: 'id',
        header: 'Receipts.Fields.ReciptId',
        hidden: true,
      },
      {
        field: 'code',
        header: 'Receipts.Fields.ReciptId',
        hidden: false,
        searchable: true,
        searchType: 'text',
      },
      {
        field: 'documentDate',
        header: 'Receipts.Fields.ReciptDate',
        hidden: false,
        pipe: 'date',
        pipeFormat: 'yyyy-MM-dd',
        searchable: true,
        searchType: 'date',
      },
      {
        field: 'customerCode',
        header: 'Receipts.Fields.customerCode',
        hidden: false,
        searchable: true,
        searchType: 'text',
      },
      {
        field: 'customerName',
        header: 'Receipts.Fields.CustomerName',
        hidden: false,
        searchable: true,
        searchType: 'text',
      },
      {
        field: 'entityCode',
        header: 'Receipts.Fields.ContractId',
        hidden: false,
        searchable: true,
        searchType: 'text',
      },
      {
        field: 'bankName',
        header: 'Receipts.Fields.BankAccountName',
        hidden: false,
        searchable: true,
        searchType: 'text',
      },
      {
        field: 'cashBoxName',
        header: 'Receipts.Fields.CashBoxName',
        hidden: false,
        searchable: true,
        searchType: 'text',
      },
      {
        field: 'creditCardTypeName',
        header: 'Receipts.Fields.CreditCardTypeName',
        hidden: false,
        searchable: true,
        searchType: 'text',
      },
      {
        field: 'branchName',
        header: 'App.Fields.Branch',
        hidden: false,
        searchable: true,
        searchType: 'text',
      },
      {
        field: 'netValueAfterTax',
        header: 'Receipts.Fields.ReciptValue',
        hidden: false,
        searchable: true,
        pipe: 'currency',
        searchType: 'text',
      },
      {
        field: 'isDownPayment',
        header: 'Receipts.Fields.ReciptType',
        hidden: false,
        searchable: false,
        searchType: 'text',
      },
      {
        field: 'tolalPaid',
        header: 'Receipts.Fields.InvoiceGetPaid',
        hidden: false,
        searchable: true,
        pipe: 'currency',
        searchType: 'text',
      },
      {
        field: 'totalRefund',
        header: 'Receipts.Fields.AllRetreived',
        hidden: false,
        searchable: true,
        pipe: 'currency',
        searchType: 'text',
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

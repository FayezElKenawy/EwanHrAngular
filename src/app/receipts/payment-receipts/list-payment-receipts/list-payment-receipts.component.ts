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
import { PageListConfig } from '@shared/models/page-list-config.model';
import { environment } from '@environments/environment';
import { GlobalService } from '@shared/services/global.service';

@Component({
  selector: 'app-list-payment-receipts',
  templateUrl: './list-payment-receipts.component.html',
  styleUrls: ['./list-payment-receipts.component.scss'],
})
export class ListPaymentReceiptsComponent implements OnInit {
  @ViewChild(ReportModelViewerComponent)
  reportchild: ReportModelViewerComponent;

  pageListConfig: PageListConfig;

  constructor(
    public _dynamicSearchService: DynamicSearchService,
    private _router: Router,
    private auth: AuthService,
    private globalService: GlobalService
  ) {}

  ngOnInit() {
    this.createPageListConfig();
  }

  createPageListConfig() {
    this.pageListConfig = {
      pageAuthorization: 'receipts-payment-receipts-list',
      pageTitle: 'Receipts.Titles.PaymentReceiptsListPage',
      createAuthorization: 'receipts-payment-receipts-create',
      createButtonTitle: 'Receipts.Buttons.PaymentReceiptCreate',
      createLink: '/finance/receipts/create-payment-receipts',
      getDataAPIURL: `${environment.financeSectorAPIURL}/v1/PaymentReceipt/GetPagedList`,
      searchFields: [
        {
          fieldName: 'SectorTypeId',
          operator: 'equal',
          value: this.globalService.getSectorType()
        },
      ],
      actions: [
        {
          authorization: 'receipts-payment-receipts-edit',
          title: 'App.Buttons.Edit',
          callBack: (dataItem) => {
            this._router.navigate([
              '/receipts/edit-payment-receipts',
              dataItem.id,
            ]);
          },
        },
        {
          authorization: 'receipts-payment-receipts-print',
          title: 'App.Buttons.Print',
          callBack: (dataItem) => {
            this.showReport(dataItem.id);
          },
        },
      ],
      cols: [
        {
          field: 'code',
          header: 'Receipts.Fields.ReciptId',
        },
        {
          field: 'documentDate',
          header: 'Receipts.Fields.ReciptDate',
          searchType: SearchType.Date,
          pipe: ColumnPipeType.Date,
          pipeFormat: ColumnPipeFormat.DatePipeFormat,
        },
        {
          field: 'customerCode',
          header: 'Receipts.Fields.customerCode',
          customSearchField: 'Customer.Code',
        },
        {
          field: 'customerName',
          header: 'Receipts.Fields.CustomerName',
          customSearchField: 'Customer.Name',
          isLocalized: true,
        },
        {
          field: 'entityCode',
          header: 'Receipts.Fields.ContractId',
        },
        {
          field: 'bankName',
          header: 'Receipts.Fields.BankAccountName',
          customSearchField: 'BankAccount.Name',
          isLocalized: true,
        },
        {
          field: 'cashBoxName',
          header: 'Receipts.Fields.CashBoxName',
          customSearchField: 'CashBox.Name',
          isLocalized: true,
        },
        {
          field: 'creditCardTypeName',
          header: 'Receipts.Fields.CreditCardTypeName',
          customSearchField: 'CreditCardType.Name',
          isLocalized: true,
        },
        {
          field: 'branchName',
          header: 'App.Fields.Branch',
          customSearchField: 'Branch.Name',
          isLocalized: true,
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
      ],
    };
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

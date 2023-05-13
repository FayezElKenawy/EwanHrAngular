import { Component, OnInit } from '@angular/core';
import { CreditInvoiceService } from '../credit-invoice.service';
import { IServiceResult } from '@shared/interfaces/results';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail-credit-invoice',
  templateUrl: './detail-credit-invoice.component.html',
  styleUrls: ['./detail-credit-invoice.component.scss']
})
export class DetailCreditInvoiceComponent implements OnInit {
  viewModel: any;
  progressSpinner: boolean;
  Cols: any[] = [];

  constructor(
    private _creditInvoiceService: CreditInvoiceService,
    private _datePipe: DatePipe,
    private _route: ActivatedRoute
  ) {
    _route.queryParams.subscribe(data => {
      this.getDetails(data['id']);
    });
  }

  ngOnInit() {
    this.Cols = [
      {
        field: 'CostElementId',
        header: 'Receipts.Fields.ItemId',
        hidden: false
      },
      {
        field: 'CostElementName',
        header: 'Receipts.Fields.ItemDesc',
        hidden: false
      },
      {
        field: 'ElementAmount',
        header: 'Receipts.Fields.Quantity',
        hidden: false
      },
      {
        field: 'TaxName',
        header: 'Receipts.Fields.TaxType',
        hidden: false
      },
      {
        field: 'TaxRatio',
        header: 'Receipts.Fields.TaxPercent',
        hidden: false,
        pipe: 'percentage'
      },
      {
        field: 'ElementTaxAmount',
        header: 'Receipts.Fields.TaxValue',
        hidden: false
      }
    ];
  }
  
  getDetails(id: string) {
    this.progressSpinner = true;
    this._creditInvoiceService.getDetails(id).subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          this.viewModel = result.data.DebitReceivableSnapshotVM;
          this.progressSpinner = false;
        }
      },
      null,
      () => (this.progressSpinner = false)
    );
  }
}

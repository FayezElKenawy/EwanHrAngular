import { Component, OnInit } from '@angular/core';
import { CreditInvoiceService } from '../../../services/credit-invoice.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail-credit-invoice',
  templateUrl: './detail-credit-invoice.component.html',
  styleUrls: ['./detail-credit-invoice.component.scss']
})
export class DetailCreditInvoiceComponent implements OnInit {
  viewModel: any;
  progressSpinner: boolean;
  cols: any[] = [];

  constructor(
    private _creditInvoiceService: CreditInvoiceService,
    private _route: ActivatedRoute
  ) {
  }

  ngOnInit() {

    this.defCols();
    this.getDetails(this._route.snapshot.paramMap.get("id"))
    
  }

  defCols(){
    this.cols = [
      {
        field: 'costElementId',
        header: 'Receipts.Fields.ItemId',
        hidden: false
      },
      {
        field: 'costElementName',
        header: 'Receipts.Fields.ItemDesc',
        hidden: false
      },
      {
        field: 'netAmount',
        header: 'Receipts.Fields.Quantity',
        hidden: false
      },
      {
        field: 'taxName',
        header: 'Receipts.Fields.TaxType',
        hidden: false
      },
      {
        field: 'taxRatio',
        header: 'Receipts.Fields.TaxPercent',
        hidden: false,
        pipe: 'percentage'
      },
      {
        field: 'taxAmount',
        header: 'Receipts.Fields.TaxValue',
        hidden: false
      }
    ];
  }

  getDetails(id: string) {
    this._creditInvoiceService.getDetails(id).subscribe(
      (result) => {
        if (result) {
          this.viewModel = result;
        }
      })
  }
}

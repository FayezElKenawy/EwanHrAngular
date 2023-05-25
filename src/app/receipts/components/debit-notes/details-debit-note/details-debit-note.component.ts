import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CostCenterService } from '@shared/services/cost-center.service';
import { CustomerService } from '@shared/services/customer.service';
import { GlobalService } from '@shared/services/global.service';
import { SalesPeriodService } from 'src/app/master-data/services/sales-period.service';
import { CostElementService } from 'src/app/receipts/services/cose-element.service';
import { DebitNoteService } from 'src/app/receipts/services/debit-note.service';

@Component({
  selector: 'app-details-debit-note',
  templateUrl: './details-debit-note.component.html',
  styleUrls: ['./details-debit-note.component.scss']
})
export class DetailsDebitNoteComponent implements OnInit{
  viewModel: any;
  sectorId:string;
  allCostElements:any[]=[];
  costElementCols: { field: string; header: string; }[];
  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _datePipe: DatePipe,
    private _route:ActivatedRoute,
    private _globalService: GlobalService,
    private _debitNoteService: DebitNoteService,
    private _customerService: CustomerService,
    private _costCenterService: CostCenterService,
    private _salesPeriodService: SalesPeriodService,
    private _costElementService:CostElementService
  ) { }

  ngOnInit() {

    this.defCols();
    this.getDebitNoteData(this._route.snapshot.paramMap.get("id"))

  }

  defCols() {
    this.costElementCols = [
      { field: "costElementId", header: "Receipts.Fields.CostElementId" },
      {
        field: "costElementName",
        header: "Receipts.Fields.CostElementName"
      },
      {
        field: "elementAmount",
        header: "Receipts.Fields.CostElementAmount"
      },

      {
        field: "elementTaxAmount",
        header: "Receipts.Fields.TaxRatio"
      },
      {
        field: "elementNetAmount",
        header: "Receipts.Fields.TaxAmount"
      },
      {
        field: "ActionButtons",
        header: "",
      },
    ];
  }

  getDebitNoteData(id:any){
    this._debitNoteService.getById(id).subscribe(
      res=>{
        this.viewModel=res;
      }
    );
  }
}


import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DebitNoteService } from 'src/app/receipts/services/debit-note.service';

@Component({
  selector: 'app-details-debit-note',
  templateUrl: './details-debit-note.component.html',
  styleUrls: ['./details-debit-note.component.scss']
})
export class DetailsDebitNoteComponent implements OnInit {

  viewModel: any;
  sectorId: string;
  allCostElements: any[] = [];
  costElementCols: { field: string; header: string; }[];

  constructor(
    private _route: ActivatedRoute,
    private _debitNoteService: DebitNoteService,
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
        field: "netAmount",
        header: "Receipts.Fields.CostElementAmount"
      },

      {
        field: "taxRatio",
        header: "Receipts.Fields.TaxRatio"
      },
      {
        field: "taxAmount",
        header: "Receipts.Fields.TaxAmount"
      },
      {
        field: "ActionButtons",
        header: "",
      },
    ];
  }

  getDebitNoteData(id: any) {
    this._debitNoteService.getById(id).subscribe(
      res => {
        this.viewModel = res;
      }
    );
  }
}


import { Component, OnInit } from "@angular/core";
import { CreditNoteService } from "../../../services/credit-note.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { GetCreditNoteModel } from "src/app/receipts/models/creditNote/get-credit-note.model";


@Component({
  selector: 'app-details-credit-note',
  templateUrl: './details-credit-note.component.html',
  styleUrls: ['./details-credit-note.component.scss']
})
export class DetailsCreditNoteComponent implements OnInit {
  vouchersCols: any[] = [];
  form: FormGroup;
  viewModel: GetCreditNoteModel;
  settlementCols: any[];
  costElementCols: any[] = [];

  constructor(
    private _route: ActivatedRoute,
    private _creditNoteService: CreditNoteService,

  ) {
  }

  ngOnInit() {
    this.defCols();
    this.getCreditNoteData(this._route.snapshot.paramMap.get("id"));
  }

  defCols() {
    this.vouchersCols = [
      {
        field: "voucherCode",
        header: "App.Fields.DocumentId"
      },
      {
        field: "voucherTypeId",
        header: "Receipts.Fields.DocumentType"
      },
      {
        field: "voucherTypeName",
        header: "Receipts.Fields.DocumentType"
      },
      {
        field: "netValueAfterTax",
        header: "Receipts.Fields.ReciptValue"
      },
      {
        field: "currentBalance",
        header: "Receipts.Fields.CurrentBalance"
      },
    ];
    this.costElementCols = [
      { field: "costElementId", header: "Receipts.Fields.CostElementId" },
      {
        field: "voucherTypeName",
        header: "Receipts.Fields.CostElementName"
      },
      {
        field: "amount",
        header: "Receipts.Fields.CostElementAmount"
      },

      {
        field: "taxAmount",
        header: "Receipts.Fields.TaxRatio"
      },
      {
        field: "netAmount",
        header: "Receipts.Fields.TaxAmount"
      },
      {
        field: "ActionButtons",
        header: "",
      },
    ];
    this.settlementCols = [
      {
        field: "debitReceivableCode",
        header: "Receipts.Fields.DocumentId",
        hidden: false,
      },
      {
        field: "voucherTypeName",
        header: "Receipts.Fields.DocumentType",
        hidden: false,
      },
      {
        field: "currentBalance",
        header: "Receipts.Fields.CurrentBalance",
        hidden: false
      },
      {
        field: "netValueAfterTax",
        header: "Receipts.Fields.ReciptValue",
        hidden: false,
      },
      { field: "paidAmount", header: "Receipts.Fields.Value", hidden: false },
      { field: "ActionButtons", header: "", hidden: false },
    ];
  }


  getCreditNoteData(id: any) {
    this._creditNoteService
      .getById(id)
      .subscribe((result) => {
        this.viewModel = result;
      })
  }

}

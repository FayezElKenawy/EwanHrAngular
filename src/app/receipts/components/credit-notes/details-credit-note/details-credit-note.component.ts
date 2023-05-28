import { Component, OnInit } from "@angular/core";
import { CreditNoteService } from "../../../services/credit-note.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DatePipe } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { IServiceResult } from "@shared/interfaces/results";
import { CustomerService } from "@shared/services/customer.service";
import { ContractService } from "@shared/services/contract.service";
import { SalesPeriodService } from "src/app/master-data/services/sales-period.service";
import { CostCenterService } from "@shared/services/cost-center.service";
import { Settlement } from "src/app/receipts/models/credit-notes/settlement.model";


@Component({
  selector: 'app-details-credit-note',
  templateUrl: './details-credit-note.component.html',
  styleUrls: ['./details-credit-note.component.scss']
})
export class DetailsCreditNoteComponent implements OnInit {
  vouchersCols: any[] = [];
  form: FormGroup;
  viewModel: any;
  vouchers: any[];
  settlementCols: any[];
  settlements: any[];
  selectedItem: any;
  costElementCols: any[] = [];
  costElements: any[] = [];
  allCostElements: any[] = [];
  DebitNoteCostElements: any[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private _creditNoteService: CreditNoteService,

  ) {
    this.settlements = [];
  }

  ngOnInit() {
    this.createForm();
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

  createForm() {
    this.form = this._formBuilder.group({
      DocumentDate: ["", Validators.required],
      RefNumber: [""],
      Customer: ["", Validators.required],
      Contract: [{ value: "", disabled: true }, Validators.required],
      ArabicRemarks: [""],
    });
  }

  getCreditNoteData(id: any) {
    this._creditNoteService
      .getById(id)
      .subscribe((result) => {
        this.viewModel = result;
        this.form.patchValue({
          CreditReceivableId: this.viewModel.id,
          CreditReceivableTypeId: this.viewModel.voucherTypeId,
          DocumentDate: new Date(this.viewModel.documentDate),
          RefNumber: this.viewModel.refNumber,
          Customer: this.viewModel.customer,
          Contract: { entityCode: this.viewModel.entityCode },
          SalesRepresentative:
            this.viewModel.salesRepresentativeName,
          ArabicRemarks: this.viewModel.ArabicRemarks,
          CreditCardType: this.viewModel.creditCardType,
          IsBankDeposit: this.viewModel.isBankDeposit,
          BankDepositAmount: this.viewModel.isBankDeposit
            ? this.viewModel.bankDepositAmount
            : 0,
          BankAccount: this.viewModel.bankAccount,
          IsCashBox: this.viewModel.isCashBox,
          CashBox: this.viewModel.cashBox,
          CashBoxAmount: this.viewModel.isCashBox
            ? this.viewModel.cashBoxAmount
            : 0,
          IsPaidOnline: this.viewModel.isPaidOnline,
          OnlinePaidCreditCard: this.viewModel.CreditCardType
            ? this.viewModel.CreditCardType.ArabicName
            : "",
          PaymentOnlineRef: this.viewModel.paymentOnlineRef,
        });


        this.settlements = this.viewModel.paymentsTransactions
          ? this.viewModel.paymentsTransactions
          : [];

        this.costElements = this.viewModel.costElements

      });
  }

}

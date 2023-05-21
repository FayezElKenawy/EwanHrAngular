import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DatePipe } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { CreditNoteService } from "../../../services/credit-note.service";
import { IServiceResult } from "@shared/interfaces/results";

@Component({
  selector: "app-edit-credit-note",
  templateUrl: "./edit-credit-note.component.html",
  styleUrls: ["./edit-credit-note.component.scss"],
})
export class EditCreditNoteComponent implements OnInit {
  vouchersCols: any[] = [];
  form: FormGroup;
  viewModel: any;
  filteredArray: any[];
  submitted: Boolean;
  progressSpinner: boolean;
  toYear = new Date().getFullYear() + 5;
  Contracts: any;
  vouchers: any[];
  selectedVoucher: any;
  settlementCols: any[];
  settlements: any[];
  paidValue: number;
  added: boolean;
  currentSettlement: any;
  filteredVouchers: any[];
  voucherType: any;

  selectedItem: any;
  costElementCols: any[] = [];
  costElements: any[] = [];
  DebitNoteCostElements: any[] = [];
  NetVal: number;
  NetValAfterTax: number;
  TotalTaxAmount: number;
  Amount: number;
  selected: Boolean;
  minDateValue: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _route: ActivatedRoute,
    private _creditNoteService: CreditNoteService
  ) {
    this.settlements = [];
    this.voucherType = 'CR';
  }

  ngOnInit() {
    this.createForm();
    const id = this._route.snapshot.paramMap.get("id");
    this.getEditFormData(id);

    this.vouchersCols = [
      { field: "VoucherId", header: "App.Fields.DocumentId", hidden: false },
      {
        field: "VoucherTypeId",
        header: "Receipts.Fields.DocumentType",
        hidden: true,
      },
      {
        field: "VoucherTypeArabicName",
        header: "Receipts.Fields.DocumentType",
        hidden: false,
      },
      {
        field: "NetValueAfterTax",
        header: "Receipts.Fields.ReciptValue",
        hidden: false,
      },
      {
        field: "CurrentBalance",
        header: "Receipts.Fields.CurrentBalance",
        hidden: false,
        pipe: "number",
        pipeFormat: "3.1-4",
      },
    ];
    this.costElementCols = [
      { field: "Id", header: "Sales.Fields.CostElementId", hidden: false },
      {
        field: "ArabicName",
        header: "Sales.Fields.CostElementName",
        hidden: false,
      },
      {
        field: "Amount",
        header: "Sales.Fields.CostElementAmount",
        hidden: false,
      },

      { field: "TaxRatio", header: "Sales.Fields.TaxRatio", hidden: false },
      { field: "TaxAmount", header: "Sales.Fields.TaxAmount", hidden: false },
      { field: "ActionButtons", header: "", hidden: false },
    ];
    this.settlementCols = [
      {
        field: "DebitReceivableId",
        header: "Receipts.Fields.DocumentId",
        hidden: false,
      },
      {
        field: "VoucherTypeArabicName",
        header: "Receipts.Fields.DocumentType",
        hidden: false,
      },
      {
        field: "DebitReceivableTypeId",
        header: "رقم نوع المستند",
        hidden: true,
      },
      {
        field: "NetValueAfterTax",
        header: "Receipts.Fields.ReciptValue",
        hidden: false,
      },
      {
        field: "CurrentBalance",
        header: "Receipts.Fields.CurrentBalance",
        hidden: false,
        pipe: "number",
        pipeFormat: "3.1-4",
      },
      {
        field: "CanBePay",
        header: "Receipts.Fields.CanPay",
        hidden: false,
        pipe: "number",
        pipeFormat: "1.1-3",
      },
      { field: "PaidAmount", header: "Receipts.Fields.Value", hidden: false },
      { field: "ActionButtons", header: "", hidden: false },
    ];
  }

  getEditFormData(id: string) {
    this.progressSpinner = true;
    this._creditNoteService.getEdit(id).subscribe((result: IServiceResult) => {
      this.viewModel = result.data;
      this.costElements = this.viewModel.CreditReceivableCostElements;
      this.calculateCreditNote();
      const creditNote = this.viewModel.CreditNote;
      this.form.setValue({
        CreditReceivableId: creditNote.CreditReceivableId,
        CreditReceivableTypeId: creditNote.CreditReceivableTypeId,
        DocumentDate: new Date(creditNote.DocumentDate),
        RefNumber: creditNote.RefNumber,
        Customer: creditNote.Customer,
        Contract: creditNote.Contract,
        NetValue: creditNote.NetValue,
        ArabicRemarks: creditNote.ArabicRemarks,
      });

      this.minDateValue = new Date(this.viewModel.MinSelectableDate);

      this.form.get("Customer").disable();
      this.form.get("Contract").disable();
      this.settlements = creditNote.PaymentsTransactions
        ? creditNote.PaymentsTransactions
        : [];
      this._creditNoteService
        .getVouchers(creditNote.Contract.Id)
        .subscribe((res: IServiceResult) => {
          this.vouchers = res.data;
          this.progressSpinner = false;

          this.onSelectVoucherType();
        });
    });
  }

  createForm() {
    this.form = this._formBuilder.group({
      CreditReceivableId: [""],
      CreditReceivableTypeId: ["CN"],
      DocumentDate: [{ value: "", disabled: true }, Validators.required],
      RefNumber: [{ value: "", disabled: true }],
      Customer: ["", Validators.required],
      Contract: [{ value: "", disabled: true }, Validators.required],
      ArabicRemarks: [{ value: "", disabled: true }],
      NetValue: [0, [Validators.required, Validators.min(0.0001)]],
    });
  }

  onSelectVoucherType() {
    if(this.vouchers){
      this.filteredVouchers = this.vouchers.filter(
        (v) => v.VoucherTypeId === this.voucherType
      );
      this.selectedVoucher = undefined;
    }
  }

  EditCreditNote() {
    this.submitted = true;
    let totalSetteled = 0;
    this.settlements.forEach((item) => {
      totalSetteled += item.PaidAmount;
    });
    if (this.form.valid && this.settlements.length > 0 && this.costElements.length > 0) {
      if (this.NetValAfterTax != totalSetteled) {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.SettlementValueNotEqualToNoteValue"
          )
        );
        return;
      }
      if (this.NetValAfterTax <= 0) {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.NetValMoreThanPaid"
          )
        );
        return;
      }
      this.progressSpinner = true;
      const postedViewModel = Object.assign({}, this.form.getRawValue());
      postedViewModel.CustomerId = postedViewModel.Customer.Id;
      postedViewModel.ContractId = postedViewModel.Contract.Id;
      postedViewModel.DocumentDate = this._datePipe.transform(
        postedViewModel.DocumentDate
      );
      postedViewModel.CostElements = this.costElements;
      postedViewModel.NetValue = this.NetVal;
      postedViewModel.PaymentsTransactions = this.settlements;
      this._creditNoteService.edit(postedViewModel).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.form.reset();
            this._router.navigate(["/receipts/credit-notes"]);
          }
        },
        null,
        () => {
          this.progressSpinner = false;
        }
      );
    }
  }

  addSettlement() {
    this.added = true;
    if (this.selectedVoucher && this.paidValue > 0) {
      const settlement = {
        DebitReceivableIdFK:this.selectedVoucher.Id,
        DebitReceivableId: this.selectedVoucher.VoucherId,
        DebitReceivableTypeId: this.selectedVoucher.VoucherTypeId,
        PaidAmount: this.paidValue,
        NetValueAfterTax: this.selectedVoucher.NetValueAfterTax,
        VoucherTypeArabicName: this.selectedVoucher.VoucherTypeArabicName,
        CurrentBalance: this.selectedVoucher.CurrentBalance,
        CanBePay: this.selectedVoucher.CurrentBalance,
      };

      if (
        this.settlements.find(
          (e) =>
            e.DebitReceivableId === settlement.DebitReceivableId &&
            e.DebitReceivableTypeId === settlement.DebitReceivableTypeId
        ) === undefined
      ) {
        if (this.selectedVoucher.CurrentBalance < settlement.PaidAmount) {
          this._globalService.messageAlert(
            MessageType.Warning,
            this._globalService.translateWordByKey(
              "Receipts.Messages.TotalPaidMoreThanBalance"
            )
          );
          return;
        }

        let totalSetteled = 0;
        this.settlements.forEach((item) => {
          totalSetteled += item.PaidAmount;
        });
        if (totalSetteled + settlement.PaidAmount > this.NetValAfterTax) {
          this._globalService.messageAlert(
            MessageType.Warning,
            this._globalService.translateWordByKey(
              "Receipts.Messages.SettlementValueNotEqualToNoteValue"
            )
          );
          return;
        }
        this.settlements.push(settlement);
      } else {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.RepeatedVoucher"
          )
        );
      }
      this.added = false;
    }
  }

  onEditChange(event: any) {
    this.currentSettlement = Object.assign({}, event.data);
  }

  onEdit(event: any) {
    const settlement = event.data;
    const itemIndex = this.settlements.findIndex(
      (s) =>
        s.DebitReceivableId === settlement.DebitReceivableId &&
        s.DebitReceivableTypeId === settlement.DebitReceivableTypeId
    );
    if (settlement.PaidAmount > settlement.CanBePay) {
      this.settlements[itemIndex] = this.currentSettlement;
      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey(
          "Receipts.Messages.TotalPaidMoreThanBalance"
        )
      );
      return;
    }
    if (settlement.PaidAmount <= 0) {
      this.settlements[itemIndex] = this.currentSettlement;
      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey(
          "Receipts.Messages.PaidMoreThanZero"
        )
      );
      return;
    }
    let totalSetteled = 0;
    this.settlements.forEach((item, index) => {
      if (index !== itemIndex) {
        totalSetteled += item.PaidAmount;
      }
    });
    if (totalSetteled + settlement.PaidAmount != this.NetValAfterTax) {
      this.settlements[itemIndex] = this.currentSettlement;

      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey(
          "Receipts.Messages.SettlementValueNotEqualToNoteValue"
        )
      );
      return;
    }
  }

  addCostElement() {
    this.selected = true;
    if (this.Amount > 0 && this.selectedItem) {
      if (
        this.costElements.find((e) => e.Id === this.selectedItem.Id) ===
        undefined
      ) {
        const costElement = Object.assign({}, this.selectedItem);
        costElement.Amount = this.Amount;
        costElement.TaxAmount = (this.Amount * costElement.TaxRatio) / 100;
        this.costElements.push(costElement);
        this.selected = false;
        this.calculateCreditNote();
      } else {
        this._globalService.messageAlert(
          MessageType.Error,
          this._globalService.translateWordByKey(
            "Receipts.Messages.ThisElementExist"
          )
        );
      }
    }
  }

  onSelectItem(item) {
    this.selectedItem = item;
  }

  calculateCreditNote() {
    this.NetVal = +Number(
      this.costElements.reduce((sum, current) => sum + Number(current.Amount), 0)
    ).toFixed(2);

    this.TotalTaxAmount = +Number(
      this.costElements.reduce((sum, current) => sum + Number(current.TaxAmount), 0)
      ).toFixed(2);

    this.NetValAfterTax =
      +(Number(this.NetVal)
      + Number(this.TotalTaxAmount))
      .toFixed(2);
  }

  Clear() {
    this.selectedItem = null;
  }

  removeItem(item) {
    this.costElements.splice(this.costElements.indexOf(item, 0), 1);
    this.calculateCreditNote();
  }

  onClear(event: any) {
    this.form.controls[event].setValue(null);
  }

  calculateCreditNoteWithCostElements(id) {
    this.costElements.find((i) => i.Id === id).TaxAmount =
      (Number(this.costElements.find((i) => i.Id === id).TaxRatio) *
        Number(this.costElements.find((i) => i.Id === id).Amount)) /
      100;
    this.calculateCreditNote();
  }

  onlyTwoPrecsionDigits(event): boolean {
    var value =event.target.value;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31) {
      var number =value.split('.');
      if(number[1] &&
         number[1].length>=2){
        return false
      }
    }
    return true;
  }

  filterArray(event, arrayObject: any, ColName = "FullArabicName") {

    this.filteredArray = [];

    if(arrayObject){
      for (let i = 0; i < arrayObject.length; i++) {
        const item = arrayObject[i];
        var itemFullName = item[ColName];

        itemFullName = itemFullName.replace(/\s/g, "").toLowerCase();
        var queryString = event.query.replace(/\s/g, "").toLowerCase();
        if (itemFullName.indexOf(queryString) >= 0) {
          this.filteredArray.push(item);
        }
      }
    }
  }

  removeSettlement(settlement: any) {
    const voucher = this.vouchers.find(
      (v) =>
        v.VoucherId === settlement.DebitReceivableId &&
        v.VoucherTypeId === settlement.DebitReceivableTypeId
    );

    if (voucher === null || voucher === undefined) {
      const deletedVoucher = {
        VoucherId: settlement.DebitReceivableId,
        VoucherTypeId: settlement.DebitReceivableTypeId,
        CurrentBalance: settlement.PaidAmount,
        NetValueAfterTax: settlement.NetValueAfterTax,
        VoucherTypeArabicName: settlement.VoucherTypeArabicName,
      };
      this.vouchers.push(deletedVoucher);
    }

    this.settlements.splice(this.settlements.indexOf(settlement, 0), 1);
    this.voucherType = "CR";
    this.onSelectVoucherType();
  }
}

import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DatePipe } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { PaymentReceiptService } from "../payment-receipt.service";
import { IServiceResult } from "@shared/interfaces/results";
import { AuthService } from "@shared/services/auth.service";

@Component({
  selector: "app-edit-payment-receipt",
  templateUrl: "./edit-payment-receipt.component.html",
  styleUrls: ["./edit-payment-receipt.component.scss"],
})
export class EditPaymentReceiptComponent implements OnInit {
  vouchersCols: any[] = [];
  form: FormGroup;
  viewModel: any;
  filteredArray: any[];
  submitted: Boolean;
  progressSpinner: boolean;
  toYear = new Date().getFullYear() + 5;
  Contracts: any;
  totalVal: number;
  vouchers: any[];
  isDownPayment: boolean = true;
  selectedVoucher: any;
  settlementCols: any[];
  settlements: any[];
  paidValue: number;
  showPaidOnlineSection: boolean = false;
  added: boolean;
  currentSettlement: any;
  disabled: boolean;
  voucherType: any = "CR";
  filteredVouchers: any[] = [];
  CashBoxs:any[];
  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _route: ActivatedRoute,
    private _paymentReceiptService: PaymentReceiptService,
    private _authService: AuthService
  ) {
    this.settlements = [];
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
        pipeFormat: "1.1-4",
      },
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
        pipeFormat: "1.1-3",
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
    this._paymentReceiptService
      .getEdit(id)
      .subscribe((result: IServiceResult) => {
        this.viewModel = result.data;
        if (this._authService.currentAuthUser.RoleTypeId == '001') {
          this.CashBoxs = this.viewModel.CashBoxs;
        }
        else {
          this.CashBoxs = this.viewModel.CashBoxs.filter(x => x.Id === this._authService.currentAuthUser.CashBoxId);
        }
        debugger;
        const paymentReceipt = this.viewModel.PaymentReceipt;
        this.form.patchValue({
          CreditReceivableId: paymentReceipt.CreditReceivableId,
          CreditReceivableTypeId: paymentReceipt.CreditReceivableTypeId,
          DocumentDate: new Date(paymentReceipt.DocumentDate),
          RefNumber: paymentReceipt.RefNumber,
          Customer: paymentReceipt.Customer,
          Contract: paymentReceipt.Contract,
          SalesRepresentative:
            paymentReceipt.Contract.SalesRepresentativeArabicName,
          ArabicRemarks: paymentReceipt.ArabicRemarks,
          CreditCardType: this.getSelectedItem(
            this.viewModel.CreditCardTypes,
            paymentReceipt.CreditCardTypeId
          ),
          IsBankDeposit: paymentReceipt.IsBankDeposit,
          BankDepositAmount: paymentReceipt.IsBankDeposit
            ? paymentReceipt.BankDepositAmount
            : 0,
          BankAccount: paymentReceipt.BankAccount,
          IsCashBox: paymentReceipt.IsCashBox,
          CashBox: paymentReceipt.CashBox,
          CashBoxAmount: paymentReceipt.IsCashBox
            ? paymentReceipt.CashBoxAmount
            : 0,
          IsPaidOnline: paymentReceipt.IsPaidOnline,
          OnlinePaidCreditCard: paymentReceipt.CreditCardType
            ? paymentReceipt.CreditCardType.ArabicName
            : "",
          PaymentOnlineRef: paymentReceipt.PaymentOnlineRef,
        });
        this.isDownPayment = paymentReceipt.IsDownPayment;
        this.showPaidOnlineSection = paymentReceipt.IsPaidOnline;
        this.form.get("Customer").disable();
        this.form.get("Contract").disable();
        this.IsCashOrDeposit();
        this.settlements = paymentReceipt.PaymentsTransactions
          ? paymentReceipt.PaymentsTransactions
          : [];
        if (paymentReceipt.IsDownPayment) {
          this.form.disable();
          this.disabled = true;
        }
        this._paymentReceiptService
          .getVouchers(paymentReceipt.Contract.Id)
          .subscribe((res: IServiceResult) => {
            this.vouchers = res.data;
            this.progressSpinner = false;
            //////////// me
            this.onSelectVoucherType();
            ////////////////////
          });
      });
  }

  createForm() {
    this.form = this._formBuilder.group({
      Id: [""],
      CreditReceivableId: [""],
      CreditReceivableTypeId: ["PR"],
      DocumentDate: [{ value: "", disabled: true }, Validators.required],
      RefNumber: [""],
      Customer: ["", Validators.required],
      Contract: [{ value: "", disabled: true }, Validators.required],
      SalesRepresentative: [""],
      ArabicRemarks: [""],
      CreditCardType: [""],
      IsBankDeposit: [false],
      BankDepositAmount: [0, Validators.required],
      BankAccount: ["", Validators.required],
      IsCashBox: [true, Validators.required],
      CashBox: ["", Validators.required],
      CashBoxAmount: [0, Validators.required],
      IsPaidOnline: [false],
      OnlinePaidCreditCard: [""],
      PaymentOnlineRef: [""],
    });
  }

  setFormValues(id: string) { }

  EditPaymentReciept() {
    this.submitted = true;
    if (this.disabled) {
      this._globalService.messageAlert(
        MessageType.Warning,
        "Receipts.Messages.CannotEditDownPayment",
        true
      );
      return;
    }

    let totalpaid = 0;
    this.settlements.forEach((item) => {
      totalpaid += item.PaidAmount;
    });
    if (this.form.valid) {
      if (this.totalVal < totalpaid) {
        this._globalService.messageAlert(
          MessageType.Warning,
          "Receipts.Messages.VoucherMustBeMoreThanTotalPaid",
          true
        );
        return;
      }
      if (this.totalVal <= 0) {
        this._globalService.messageAlert(
          MessageType.Warning,
          "Receipts.Messages.NetValMustBeMoreThanPaid",
          true
        );
        return;
      }
      this.progressSpinner = true;
      const postedViewModel = Object.assign({}, this.form.getRawValue());
      postedViewModel.Id = this.viewModel.PaymentReceipt.Id;
      postedViewModel.CustomerId = postedViewModel.Customer.Id;
      postedViewModel.ContractId = postedViewModel.Contract.Id;

      if (postedViewModel.CreditCardType) {
        postedViewModel.CreditCardTypeId = postedViewModel.CreditCardType.Id;
      }
      if (postedViewModel.CashBox) {
        postedViewModel.CashBoxId = postedViewModel.CashBox.Id;
      }
      postedViewModel.BankAccountId = postedViewModel.BankAccount
        ? postedViewModel.BankAccount.Id
        : null;
      postedViewModel.DocumentDate = this._datePipe.transform(
        postedViewModel.DocumentDate
      );
      ;
      postedViewModel.PaymentsTransactions = this.settlements;
      this._paymentReceiptService.edit(postedViewModel).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.form.reset();
            this._router.navigate(["/individual/receipts/payment-receipts"]);
          }
        },
        null,
        () => {
          this.progressSpinner = false;
        }
      );
    }
  }

  onSelectVoucherType() {
    ;
    this.filteredVouchers = this.vouchers.filter(
      (v) => v.VoucherTypeId === this.voucherType
    );
    this.selectedVoucher = undefined;
  }

  addSettlement() {
    this.added = true;
    if (this.selectedVoucher && Number(this.paidValue) > 0) {
      const settlement = {
        DebitReceivableIdFK:  this.selectedVoucher.Id,
        DebitReceivableId: this.selectedVoucher.VoucherId,
        DebitReceivableTypeId: this.selectedVoucher.VoucherTypeId,
        PaidAmount: Number(this.paidValue),
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
        if (settlement.CurrentBalance < settlement.PaidAmount) {
          this._globalService.messageAlert(
            MessageType.Warning,
            "Receipts.Messages.PaidMoreThanCurrentBalance",
            true
          );
          return;
        }

        let totalpaid = 0;
        this.settlements.forEach((item) => {
          totalpaid += item.PaidAmount;
        });
        if (totalpaid + settlement.PaidAmount > this.totalVal) {
          this._globalService.messageAlert(
            MessageType.Warning,
            "Receipts.Messages.PaidMoreThanPaymentReceipt",
            true
          );
          return;
        }

        this.settlements.push(settlement);
      } else {
        this._globalService.messageAlert(
          MessageType.Warning,
          "Receipts.Messages.VoucherExist",
          true
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
        "Receipts.Messages.PaidMoreThanCurrentBalance",
        true
      );
      return;
    }
    if (settlement.PaidAmount <= 0) {
      this.settlements[itemIndex] = this.currentSettlement;
      this._globalService.messageAlert(
        MessageType.Warning,
        "Receipts.Messages.PaidMustMoreThanZero",
        true
      );
      return;
    }
    let totalpaid = 0;
    this.settlements.forEach((item, index) => {
      if (index !== itemIndex) {
        totalpaid += item.PaidAmount;
      }
    });
    if (totalpaid + settlement.PaidAmount > this.totalVal) {
      this.settlements[itemIndex] = this.currentSettlement;

      this._globalService.messageAlert(
        MessageType.Warning,
        "Receipts.Messages.PaidMustLessThanCreditNote",
        true
      );
      return;
    }
  }

  filterArray(event, arrayObject: any, ColName = "FullName") {
    this.filteredArray = [];

    for (let i = 0; i < arrayObject.length; i++) {
      const item = arrayObject[i];
      let itemFullName = item[ColName];

      itemFullName = itemFullName.replace(/\s/g, "").toLowerCase();
      const queryString = event.query.replace(/\s/g, "").toLowerCase();
      if (itemFullName.indexOf(queryString) >= 0) {
        this.filteredArray.push(item);
      }
    }
  }

  onClear(controlName: string) {
    this.form.controls[controlName].setValue(null);
  }

  IsCashOrDeposit() {
    if (this.form.get("IsCashBox").value) {
      this.form.get("CashBox").enable();
      this.form.get("CashBox").setValidators([Validators.required]);
      this.form.get("CashBoxAmount").enable();
      this.form.get("CashBoxAmount").setValidators([Validators.required]);
      this.form.get("CreditCardType").enable();
    } else {
      this.form.get("CashBox").reset();
      this.form.get("CashBox").disable();
      this.form.get("CashBoxAmount").reset();
      this.form.get("CashBoxAmount").disable();
      this.form.get("CreditCardType").reset();
      this.form.get("CreditCardType").disable();
    }
    if (this.form.get("IsBankDeposit").value) {
      this.form.get("BankAccount").enable();
      this.form.get("BankAccount").setValidators([Validators.required]);
      this.form.get("BankDepositAmount").enable();
      this.form.get("BankDepositAmount").setValidators([Validators.required]);
    } else {
      this.form.get("BankAccount").reset();
      this.form.get("BankAccount").disable();
      this.form.get("BankDepositAmount").reset();
      this.form.get("BankDepositAmount").disable();
    }
    this.form.updateValueAndValidity();
    this.calculate();
  }

  calculate() {
    const BankDepositAmount = this.form.get("BankDepositAmount").value;
    const CashBoxAmount = this.form.get("CashBoxAmount").value;
    this.totalVal =
      parseFloat(BankDepositAmount ? BankDepositAmount : 0) +
      parseFloat(CashBoxAmount ? CashBoxAmount : 0);
  }

  removeSettlement(settlement: any) {
    const voucher = this.vouchers.find(
      (v) =>
        v.VoucherId === settlement.DebitReceivableId &&
        v.VoucherTypeId === settlement.DebitReceivableTypeId
    );
    if (voucher === null || voucher === undefined) {
      const deletedVoucher = {
        Id: settlement.Id,
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
  getSelectedItem(vm: any, id: any) {
    if (id) {
      return vm.filter((x) => x.Id.toString() === id.toString())[0];
    }
    return null;
  }
}

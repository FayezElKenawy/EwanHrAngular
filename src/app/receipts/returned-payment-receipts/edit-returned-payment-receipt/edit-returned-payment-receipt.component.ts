import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DatePipe } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { ReturnPaymentReceiptService } from "../return-payment-receipt.service";
import { ServiceRequestService } from "src/app/sales/requests-services/service-request.service";
import { IServiceResult } from "@shared/interfaces/results";
@Component({
  selector: "app-edit-returned-payment-receipt",
  templateUrl: "./edit-returned-payment-receipt.component.html",
  styleUrls: ["./edit-returned-payment-receipt.component.scss"],
})
export class EditReturnedPaymentReceiptComponent implements OnInit {
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
  selectedVoucher: any;
  settlementCols: any[];
  settlements: any[];
  refundValue: number;
  added: boolean;
  currentSettlement: any;
  DebitPaymentId: string;
  filteredVouchers: any[];
  voucherType: any;
  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _route: ActivatedRoute,
    private _returnPaymentReceiptService: ReturnPaymentReceiptService,
    private _serviceRequestService: ServiceRequestService
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
        field: "NetValue",
        header: "Receipts.Fields.ReciptValue",
        hidden: false,
      },
      {
        field: "TotalRefund",
        header: "Receipts.Fields.InvoiceGetPaid",
        hidden: false,
      },
      {
        field: "NotRefund",
        header: "Receipts.Fields.CurrentBalanc",
        hidden: false,
      },
    ];

    this.settlementCols = [
      {
        field: "CreditReceivableId",
        header: "Receipts.Fields.DocumentId",
        hidden: false,
      },
      {
        field: "VoucherTypeArabicName",
        header: "Receipts.Fields.DocumentType",
        hidden: false,
      },
      {
        field: "CreditReceivableTypeId",
        header: "رقم نوع المستند",
        hidden: true,
      },
      {
        field: "NetValue",
        header: "Receipts.Fields.ReciptValue",
        hidden: false,
      },
      {
        field: "CurrentBalance",
        header: "Receipts.Fields.CurrentBalance",
        hidden: false,
      },
      { field: "CanBePay", header: "Receipts.Fields.CanPay", hidden: false },
      {
        field: "RefundAmount",
        header: "Receipts.Fields.AllRetreived",
        hidden: false,
      },
      { field: "ActionButtons", header: "", hidden: false },
    ];
  }

  getEditFormData(id: string) {
    this.progressSpinner = true;
    this.DebitPaymentId = id;
    this._returnPaymentReceiptService
      .getEdit(id)
      .subscribe((result: IServiceResult) => {
        this.viewModel = result.data;
        const returnPaymentReceipt = this.viewModel.ReturnPaymentReceipt;
        this.form.setValue({
          Id: id,
          DocumentDate: new Date(returnPaymentReceipt.DocumentDate),
          RefNumber: returnPaymentReceipt.RefNumber,
          Customer: returnPaymentReceipt.Customer,
          Contract: returnPaymentReceipt.Contract,
          SalesRepresentative:
            returnPaymentReceipt.Contract.SalesRepresentativeId,
          ArabicRemarks: returnPaymentReceipt.ArabicRemarks,
          IsBankWithdraw: returnPaymentReceipt.IsBankWithdraw,
          BankWithdrawAmount: returnPaymentReceipt.IsBankWithdraw
            ? returnPaymentReceipt.BankWithdrawAmount
            : 0,
          BankAccount: returnPaymentReceipt.BankAccount,
          IsCashBox: returnPaymentReceipt.IsCashBox,
          CashBox: returnPaymentReceipt.CashBox,
          CashBoxAmount: returnPaymentReceipt.IsCashBox
            ? returnPaymentReceipt.CashBoxAmount
            : 0,
        });
        this.form.get("Customer").disable();
        this.form.get("Contract").disable();
        this.IsCashOrWithdraw();
        this.settlements = returnPaymentReceipt.RefundsTransactions
          ? returnPaymentReceipt.RefundsTransactions
          : [];
        this._returnPaymentReceiptService
          .getVouchers(returnPaymentReceipt.Contract.Id)
          .subscribe((res: IServiceResult) => {
            this.vouchers = res.data;
            this.progressSpinner = false;
          });
      });
  }

  createForm() {
    this.form = this._formBuilder.group({
      Id: [""],
      DocumentDate: [{ value: "", disabled: true }, Validators.required],
      RefNumber: [""],
      Customer: ["", Validators.required],
      Contract: [{ value: "", disabled: true }, Validators.required],
      SalesRepresentative: [""],
      ArabicRemarks: [""],
      IsBankWithdraw: [false],
      BankWithdrawAmount: [0, [Validators.required]],
      BankAccount: ["", Validators.required],
      IsCashBox: [true, Validators.required],
      CashBox: ["", Validators.required],
      CashBoxAmount: [0, Validators.required],
    });
  }

  setFormValues(id: string) {}

  EditReturnPaymentReciept() {
    this.submitted = true;
    let totalrefund = 0;
    this.settlements.forEach((item) => {
      totalrefund += item.RefundAmount;
    });
     
    if(this.form.controls.BankWithdrawAmount.value < 0){
      this._globalService.messageAlert(
        MessageType.Error,
        "App.Fields.NumberShouldBePositive", 
        true
      );
      return ;
    }
    if (this.form.valid) {
      if (this.totalVal < totalrefund) {
        this._globalService.messageAlert(
          MessageType.Warning,
          "Receipts.Messages.VoucherMustMeMoreThanPaid",
          true
        );
        return;
      }
      if (this.totalVal <= 0) {
        this._globalService.messageAlert(
          MessageType.Warning,
          "Receipts.Messages.VoucherMustBeMoreThanZero",
          true
        );
        return;
      }
      this.progressSpinner = true;
      const postedViewModel = Object.assign({}, this.form.getRawValue());
      postedViewModel.Id = this.viewModel.ReturnPaymentReceipt.Id;
      postedViewModel.CustomerId = postedViewModel.Customer.Id;
      postedViewModel.ContractId = postedViewModel.Contract.Id;
      if (postedViewModel.CashBox) {
        postedViewModel.CashBoxId = postedViewModel.CashBox.Id;
      }
      postedViewModel.BankAccountId = postedViewModel.BankAccount
        ? postedViewModel.BankAccount.Id
        : null;
      postedViewModel.DocumentDate = this._datePipe.transform(
        postedViewModel.DocumentDate
      );
      postedViewModel.RefundsTransactions = this.settlements;
      this._returnPaymentReceiptService.edit(postedViewModel).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.form.reset();
            this._router.navigate([
              "individual/receipts/returned-payment-receipts",
            ]);
          }
        },
        () => {
          this.progressSpinner = false;
        },
        () => {
          this.progressSpinner = false;
        }
      );
    }
  }

  onSelectVoucherType() {
    this.filteredVouchers = this.vouchers.filter(
      (v) => v.VoucherTypeId === this.voucherType
    );
    this.selectedVoucher = undefined;
  }

  addSettlement() {
    this.added = true;
    if (this.selectedVoucher && this.refundValue > 0) {
      const settlement = {
        CreditReceivableIdFK: this.selectedVoucher.Id,
        CreditReceivableId: this.selectedVoucher.VoucherId,
        CreditReceivableTypeId: this.selectedVoucher.VoucherTypeId,
        RefundAmount: this.refundValue,
        NetValue: this.selectedVoucher.NetValue,
        VoucherTypeArabicName: this.selectedVoucher.VoucherTypeArabicName,
        CanBePay: this.selectedVoucher.NotRefund,
        CurrentBalance: this.selectedVoucher.NotRefund,
      };

      if (
        this.settlements.find(
          (e) =>
            e.CreditReceivableId === settlement.CreditReceivableId &&
            e.CreditReceivableTypeId === settlement.CreditReceivableTypeId
        ) === undefined
      ) {
        if (this.selectedVoucher.CanBePay < settlement.RefundAmount) {
          this._globalService.messageAlert(
            MessageType.Warning,
            "Receipts.Messages.PaidMoreThanCurrentBalance",
            true
          );
          return;
        }

        let totalrefund = 0;
        this.settlements.forEach((item) => {
          totalrefund += item.RefundAmount;
        });
        if (totalrefund + settlement.RefundAmount > this.totalVal) {
          this._globalService.messageAlert(
            MessageType.Warning,
            "Receipts.Messages.PaidShouldLessThanRefund",
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
        s.CreditReceivableId === settlement.CreditReceivableId &&
        s.CreditReceivableTypeId === settlement.CreditReceivableTypeId
    );

    if (settlement.RefundAmount > settlement.CanBePay) {
      this.settlements[itemIndex] = this.currentSettlement;
      this._globalService.messageAlert(
        MessageType.Warning,
        "Receipts.Messages.PaidMoreThanCurrentBalance",
        true
      );
      return;
    }
    if (settlement.RefundAmount <= 0) {
      this.settlements[itemIndex] = this.currentSettlement;
      this._globalService.messageAlert(
        MessageType.Warning,
        "Receipts.Messages.PaidShouldMoreThanZero",
        true
      );
      return;
    }
    let totalrefund = 0;
    this.settlements.forEach((item, index) => {
      if (index !== itemIndex) {
        totalrefund += item.RefundAmount;
      }
    });

    if (totalrefund + settlement.RefundAmount > this.totalVal) {
      this.settlements[itemIndex] = this.currentSettlement;

      this._globalService.messageAlert(
        MessageType.Warning,
        "Receipts.Messages.PaidShouldLessThanRefund",
        true
      );
      return;
    }
  }

  filterArray(event, arrayObject: any, ColName = "FullArabicName") {
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

  IsCashOrWithdraw() {
    if (this.form.get("IsCashBox").value) {
      this.form.get("CashBox").enable();
      this.form.get("CashBox").setValidators([Validators.required]);
      this.form.get("CashBoxAmount").enable();
      this.form.get("CashBoxAmount").setValidators([Validators.required]);
    } else {
      this.form.get("CashBox").reset();
      this.form.get("CashBox").disable();
      this.form.get("CashBoxAmount").reset();
      this.form.get("CashBoxAmount").disable();
    }
    if (this.form.get("IsBankWithdraw").value) {
      this.form.get("BankAccount").enable();
      this.form.get("BankAccount").setValidators([Validators.required]);
      this.form.get("BankWithdrawAmount").enable();
      this.form.get("BankWithdrawAmount").setValidators([Validators.required]);
    } else {
      this.form.get("BankAccount").reset();
      this.form.get("BankAccount").disable();
      this.form.get("BankWithdrawAmount").reset();
      this.form.get("BankWithdrawAmount").disable();
    }
    this.form.updateValueAndValidity();
    this.calculate();
  }

  calculate() {
    const BankWithdrawAmount = this.form.get("BankWithdrawAmount").value;
    const CashBoxAmount = this.form.get("CashBoxAmount").value;
    this.totalVal =
      parseFloat(BankWithdrawAmount ? BankWithdrawAmount : 0) +
      parseFloat(CashBoxAmount ? CashBoxAmount : 0);
  }

  removeSettlement(settlement: any) {
    const voucher = this.vouchers.find(
      (v) =>
        v.VoucherId === settlement.CreditReceivableId &&
        v.VoucherTypeId === settlement.CreditReceivableTypeId
    );
    if (voucher === null || voucher === undefined) {
      const deletedVoucher = {
        VoucherId: settlement.CreditReceivableId,
        VoucherTypeId: settlement.CreditReceivableTypeId,
        NotRefund: settlement.RefundAmount,
        TotalRefund: settlement.NetValue - settlement.CurrentBalance,
        NetValue: settlement.NetValue,
        VoucherTypeArabicName: settlement.VoucherTypeArabicName,
      };
      this.vouchers.push(deletedVoucher);
    }
    this.settlements.splice(this.settlements.indexOf(settlement, 0), 1);
    this.voucherType = "PR";
    this.onSelectVoucherType();
  }
}

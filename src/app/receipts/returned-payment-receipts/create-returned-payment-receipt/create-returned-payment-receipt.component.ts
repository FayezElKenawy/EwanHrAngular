import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { ReturnPaymentReceiptService } from "../return-payment-receipt.service";
import { IServiceResult } from "@shared/interfaces/results";

import { GlobalService, MessageType } from "@shared/services/global.service";
import { AuthService } from "@shared/services/auth.service";
import { CashboxService } from "@shared/services/cashbox.service";
import { BankAccountService } from "@shared/services/bank-account.service";
import { CustomerService } from "@shared/services/customer.service";
@Component({
  selector: "app-create-returned-payment-receipt",
  templateUrl: "./create-returned-payment-receipt.component.html",
  styleUrls: ["./create-returned-payment-receipt.component.scss"],
})
export class CreateReturnedPaymentReceiptComponent implements OnInit {
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
  filteredVouchers: any[];
  voucherType: any;
  minDateValue: any;
  CashBoxs:any[]=[];
  Customers:any[]=[];
  BankAccount:any[]=[];
  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _returnPaymentReceipt: ReturnPaymentReceiptService,
    private _authService: AuthService,
    private _cashBox:CashboxService,
    private _bankAccount:BankAccountService,
    private _customer:CustomerService
  ) {
    this.settlements = [];
  }

  ngOnInit() {
    this.createForm();
    //this.getCreatFormData();
    this.IsCashOrWithdraw();

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
        header: "Receipts.Fields.CurrentBalance",
        hidden: false,
      },
    ];

    this.settlementCols = [
      {
        field: "Id",
        header: "Receipts.Fields.DocumentId",
        hidden: true,
      },
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

  // getCreatFormData() {
  //   this.progressSpinner = true;

  //   this._returnPaymentReceipt
  //     .getCreate()
  //     .subscribe((result: IServiceResult) => {
  //       this.viewModel = result.data;
  //       if (this._authService.currentAuthUser.RoleTypeId == '001') {
  //         this.CashBoxs = this.viewModel.CashBoxs;
  //       }
  //       else {
  //         this.CashBoxs = this.viewModel.CashBoxs.filter(x => x.Id === this._authService.currentAuthUser.CashBoxId);
  //       }
  //       this.progressSpinner = false;

  //       this.form
  //         .get("DocumentDate")
  //         .setValue(
  //           new Date(this.viewModel.CurrentDate)
  //         );

  //         this.minDateValue = new Date(this.viewModel.MinSelectableDate);
  //     });
  // }

  createForm() {
    this.form = this._formBuilder.group({
      DocumentDate: ["", Validators.required],
      RefNumber: [""],
      Customer: ["", Validators.required],
      Contract: [{ value: "", disabled: true }, Validators.required],
      SalesRepresentative: [{value:"",disabled:true}],
      ArabicRemarks: [""],
      IsBankWithdraw: [false],
      BankWithdrawAmount: [0, Validators.required],
      BankAccount: ["", Validators.required],
      IsCashBox: [false],
      CashBox: ["", Validators.required],
      CashBoxAmount: [0, Validators.required],
    });
  }

  createReturnPaymentReciept() {
    this.submitted = true;
    let totalrefund = 0;
    this.settlements.forEach((item) => {
      totalrefund += item.RefundAmount;
    });
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
      const postedViewModel = Object.assign({}, this.form.value);
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

      this._returnPaymentReceipt.create(postedViewModel).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.form.reset();
            // this.Oncancel.emit();
            this._router.navigate([
              "/individual/receipts/returned-payment-receipts",
            ]);
          }
        },
        null,
        () => {
          this.progressSpinner = false;
        }
      );
    }
  }

  searchCustomers(event: any) {
    this._customer.getAll(event.query)
    .subscribe(result =>{
      this.Customers = result;
    });
  }

  onSelectCustomer(event: any) {
    this.progressSpinner = true;
    this.settlements = [];
    this.vouchers = [];
    this.selectedVoucher = undefined;
    this._returnPaymentReceipt
      .getContractShortList(event.Id)
      .subscribe((result: IServiceResult) => {
        this.progressSpinner = false;
        this.filteredArray = [];
        this.filteredArray = result.data;
        this.Contracts = result.data;
        if (result.data.length > 0) {
          this.form.controls.Contract.enable();
          this.form.controls.Contract.reset();
          this.form.get("SalesRepresentative").reset();
        } else {
          this.form.controls.Contract.setValue("");
          this.form.controls.Contract.disable();
        }
      });
  }

  onSelectContract(event) {
    this.progressSpinner = true;
    this.settlements = [];
    this.vouchers = [];
    this.selectedVoucher = undefined;
    this.form
      .get("SalesRepresentative")
      .setValue(event.SalesRepresentativeName);
    this._returnPaymentReceipt
      .getVouchers(event.Id)
      .subscribe((result: IServiceResult) => {
        this.progressSpinner = false;
        this.vouchers = result.data;
      });
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
        if (settlement.RefundAmount > this.selectedVoucher.CanBePay) {
          this._globalService.messageAlert(
            MessageType.Warning,
            "Receipts.Messages.RefuundMustMoreThanPaid",
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
        "Receipts.Messages.PaidMoreThanVoucher",
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

  removeSettlement(settlement: number) {
    this.settlements.splice(this.settlements.indexOf(settlement, 0), 1);
  }
}

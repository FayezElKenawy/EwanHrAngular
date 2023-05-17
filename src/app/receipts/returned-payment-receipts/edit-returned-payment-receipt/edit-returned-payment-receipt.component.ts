import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DatePipe } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { ReturnPaymentReceiptService } from "../return-payment-receipt.service";

import { IServiceResult } from "@shared/interfaces/results";
import { CashboxService } from "@shared/services/cashbox.service";
import { BankAccountService } from "@shared/services/bank-account.service";
import { CustomerService } from "@shared/services/customer.service";
import { ContractService } from "@shared/services/contract.service";
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
  debitPaymentObj :any;
  customers:any[]=[];
  bankAccounts:any[]=[];
  cashboxs:any[]=[];
  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _route: ActivatedRoute,
    private _returnPaymentReceiptService: ReturnPaymentReceiptService,
    private _cashBox:CashboxService,
    private _bankAccount:BankAccountService,
  ) {
    this.settlements = [];
  }

  ngOnInit() {
    this.createForm();
    this.getLookups();
    const id = this._route.snapshot.paramMap.get("id");

    this._returnPaymentReceiptService
    .getById(parseInt(id)).subscribe(result =>{
      this.debitPaymentObj = result;
      this.form.patchValue({
        id:result.code,
        documentDate:this._datePipe.transform(result.documentDate,'yyyy-MM-dd'),
        refNumber:result.refNumber,
        customer:result.customer,
        contract:{entityCode:result.entityCode},
        salesRepresentative:result.salesRepresentativeName,
        arabicRemarks:result.arabicRemarks,
        bankWithdrawAmount:result.bankWithdrawAmount,
        bankAccount:result.bankAccount,
        cashBox:result.cashBox,
        cashBoxAmount:result.cashBoxAmount
      })
    });
    this.vouchersCols = [
      { field: "voucherId", header: "App.Fields.DocumentId", hidden: false },
      {
        field: "voucherTypeId",
        header: "Receipts.Fields.DocumentType",
        hidden: true,
      },
      {
        field: "voucherTypeName",
        header: "Receipts.Fields.DocumentType",
        hidden: false,
      },
      {
        field: "netValue",
        header: "Receipts.Fields.ReciptValue",
        hidden: false,
      },
      {
        field: "totalRefund",
        header: "Receipts.Fields.InvoiceGetPaid",
        hidden: false,
      },
      {
        field: "notRefund",
        header: "Receipts.Fields.CurrentBalance",
        hidden: false,
      },
    ];

    this.settlementCols = [
      {
        field: "id",
        header: "Receipts.Fields.DocumentId",
        hidden: true,
      },
      {
        field: "creditReceivableId",
        header: "Receipts.Fields.DocumentId",
        hidden: false,
      },
      {
        field: "voucherTypeName",
        header: "Receipts.Fields.DocumentType",
        hidden: false,
      },
      {
        field: "creditReceivableVoucherTypeId",
        header: "رقم نوع المستند",
        hidden: true,
      },
      {
        field: "netValue",
        header: "Receipts.Fields.ReciptValue",
        hidden: false,
      },
      {
        field: "currentBalance",
        header: "Receipts.Fields.CurrentBalance",
        hidden: false,
      },
      { field: "canBePay", header: "Receipts.Fields.CanPay", hidden: false },
      {
        field: "refundAmount",
        header: "Receipts.Fields.AllRetreived",
        hidden: false,
      },
      { field: "ActionButtons", header: "", hidden: false },
    ];
  }

  createForm() {
    this.form = this._formBuilder.group({
      id: [""],
      documentDate: [{ value: "", disabled: true }, Validators.required],
      refNumber: [""],
      customer: [{value:"",disabled:true}, Validators.required],
      contract: [{ value: "", disabled: true }, Validators.required],
      salesRepresentative: [{value:"",disabled:true}],
      arabicRemarks: [""],
      isBankWithdraw: [true],
      bankWithdrawAmount: [0, [Validators.required]],
      bankAccount: ["", Validators.required],
      isCashBox: [true, Validators.required],
      cashBox: ["", Validators.required],
      cashBoxAmount: [0, Validators.required],
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
        (result: any) => {
          if (result) {
            this.submitted = false;
            this.form.reset();
            this._router.navigate([
              "individual/receipts/returned-payment-receipts",
            ]);
          }
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
        creditReceivableId: this.selectedVoucher.id,
        creditReceivableVoucherTypeId: this.selectedVoucher.voucherTypeId,
        refundAmount: this.refundValue,
        netValue: this.selectedVoucher.netValue,
        voucherTypeName: this.selectedVoucher.voucherTypeName,
        canBePay: this.selectedVoucher.notRefund,
        currentBalance: this.selectedVoucher.notRefund,
      };

      if (
        this.settlements.find(
          (e) =>
            e.CreditReceivableId === settlement.creditReceivableId &&
            e.CreditReceivableTypeId === settlement.creditReceivableVoucherTypeId
        ) === undefined
      ) {
        if (this.selectedVoucher.CanBePay < settlement.refundAmount) {
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
        if (totalrefund + settlement.refundAmount > this.totalVal) {
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
    if (this.form.get("isCashBox").value) {
      this.form.get("cashBox").enable();
      this.form.get("cashBox").setValidators([Validators.required]);
      this.form.get("cashBoxAmount").enable();
      this.form.get("cashBoxAmount").setValidators([Validators.required]);
    } else {
      this.form.get("cashBox").reset();
      this.form.get("cashBox").disable();
      this.form.get("cashBoxAmount").reset();
      this.form.get("cashBoxAmount").disable();
    }
    if (this.form.get("isBankWithdraw").value) {
      this.form.get("bankAccount").enable();
      this.form.get("bankAccount").setValidators([Validators.required]);
      this.form.get("bankWithdrawAmount").enable();
      this.form.get("bankWithdrawAmount").setValidators([Validators.required]);
    } else {
      this.form.get("bankAccount").reset();
      this.form.get("bankAccount").disable();
      this.form.get("bankWithdrawAmount").reset();
      this.form.get("bankWithdrawAmount").disable();
    }
    this.form.updateValueAndValidity();
    this.calculate();
  }

  calculate() {
    const BankWithdrawAmount = this.form.get("bankWithdrawAmount").value;
    const CashBoxAmount = this.form.get("cashBoxAmount").value;
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

  getLookups(){
    this._bankAccount.getAll('').subscribe(result=>{
      this.bankAccounts = result;
    });
    this._cashBox.getAll('').subscribe(result=>{
      this.cashboxs = result;
    });
  }
}

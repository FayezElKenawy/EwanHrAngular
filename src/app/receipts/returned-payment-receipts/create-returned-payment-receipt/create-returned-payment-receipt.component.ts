import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { ReturnPaymentReceiptService } from "../../services/return-payment-receipt.service";
import { IServiceResult } from "@shared/interfaces/results";

import { GlobalService, MessageType } from "@shared/services/global.service";
import { AuthService } from "@shared/services/auth.service";
import { CashboxService } from "@shared/services/cashbox.service";
import { BankAccountService } from "@shared/services/bank-account.service";
import { CustomerService } from "@shared/services/customer.service";
import { ContractService } from "@shared/services/contract.service";
import { CostCenterService } from "@shared/services/cost-center.service";
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
  toYear = new Date().getFullYear() + 5;

  totalVal: number;
  vouchers: any[] = [];
  selectedVoucher: any;
  settlementCols: any[];
  settlements: any[];
  refundValue: number;
  added: boolean;
  currentSettlement: any;
  filteredVouchers: any[];
  voucherType: any;
  minDateValue: any;
  CashBoxs: any[] = [];
  Customers: any[] = [];
  BankAccounts: any[] = [];
  sectorId: string;
  disabledVoucher: boolean = true;
  customerCode: string;

  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _returnPaymentReceipt: ReturnPaymentReceiptService,
    private _costCenterService: CostCenterService,
    private _cashBox: CashboxService,
    private _bankAccount: BankAccountService,
    private _customer: CustomerService,
    private _contract: ContractService
  ) {
    this.settlements = [];
  }

  ngOnInit() {
    this.sectorId = this._globalService.getSectorType();
    this.createForm();
    this.IsCashOrWithdraw();

    this.vouchersCols = [
      { field: "code", header: "App.Fields.DocumentId", hidden: false },
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
        field: "voucherId",
        header: "Receipts.Fields.DocumentId",
        hidden: true,
      },
      {
        field: "code",
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
      documentDate: ["", Validators.required],
      refNumber: [""],
      customer: ["", Validators.required],
      contract: [{ value: "", disabled: true }, Validators.required],
      arabicRemarks: [""],
      isBankWithdraw: [false],
      bankWithdrawAmount: [0, Validators.required],
      bankAccount: ["", Validators.required],
      isCashBox: [false],
      cashBox: ["", Validators.required],
      cashBoxAmount: [0, Validators.required],
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

      const postedViewModel = Object.assign({}, this.form.value);
      postedViewModel.customerId = postedViewModel.customer.id;
      postedViewModel.entityCode = postedViewModel.contract.entityCode;
      postedViewModel.sectorTypeId = this.sectorId;
      postedViewModel.cashBoxId = postedViewModel.cashBox
        ? postedViewModel.cashBox.code
        : null;
      postedViewModel.bankAccountId = postedViewModel.bankAccount
        ? postedViewModel.bankAccount.code
        : null;
      postedViewModel.documentDate = this._datePipe.transform(
        postedViewModel.documentDate, 'yyyy-MM-ddTHH:mm:ss'
      );

      postedViewModel.refundsTransactions = this.settlements;
      this._returnPaymentReceipt.create(postedViewModel).subscribe(
        (result: any) => {
          if (result) {
            this._globalService.messageAlert(
              MessageType.Success,
              this._globalService.translateWordByKey(
                "App.Messages.SavedSuccessfully"));
            this.submitted = false;
            this.form.reset();
            this._router.navigate([
              "/finance/receipts/returned-payment-receipts",
            ]);
          }
        }
      );
    }
  }

  searchCustomers(event: any) {
    setTimeout(() => {
      this._customer.getCustomersBySectorId(event.query)
        .subscribe(result => {
          this.Customers = result;
        });
    }, 1500);

  }

  searchCostCenters(event: any) {
    setTimeout(() => {
      this._costCenterService.getCostCenterSelectList(this.customerCode, event.query).subscribe(
        (res: any) => {
          this.filteredArray = res;
        }
      )
    }, 1500);
  }

  onSelectCustomer(event: any) {
    this.settlements = [];
    this.vouchers = [];
    this.selectedVoucher = undefined;
    this.customerCode = event.code
    this._costCenterService
      .getCostCenterSelectList(event.code, '')
      .subscribe((result: any) => {

        this.filteredArray = result;
        if (result.length > 0) {
          this.form.controls.contract.enable();
          this.form.controls.contract.reset();
        } else {
          this.form.controls.contract.setValue("");
          this.form.controls.contract.disable();
        }
      });
  }

  onSelectContract(event) {
    this.settlements = [];
    this.vouchers = [];
    this.selectedVoucher = undefined;
    this._returnPaymentReceipt
      .getVouchers(event.entityCode)
      .subscribe((result: any) => {
        this.vouchers = result;
        this.filteredVouchers = this.vouchers;
      });
    this._cashBox.getAll('')
      .subscribe(result => {
        this.CashBoxs = result;
      });

    this._bankAccount.getAll('')
      .subscribe(result => {
        this.BankAccounts = result;
      })
  }

  onSelectVoucherType() {
    this.disabledVoucher = this.vouchers?.length <= 0;
    this.filteredVouchers = this.vouchers.filter(
      (v) => v.voucherTypeId === this.voucherType
    );
    this.selectedVoucher = undefined;
  }

  addSettlement() {
    this.added = true;
    if (this.selectedVoucher && this.refundValue > 0) {
      const settlement = {
        code: this.selectedVoucher.code,
        creditReceivableId: this.selectedVoucher.id,
        creditReceivableVoucherTypeId: this.selectedVoucher.voucherTypeId,
        refundAmount: this.refundValue,
        netValue: this.selectedVoucher.netValue,
        voucherTypeName: this.selectedVoucher.voucherTypeName,
        currentBalance: this.selectedVoucher.notRefund,
      };

      if (
        this.settlements.find(
          (e) =>
            e.creditReceivableId === settlement.creditReceivableId &&
            e.creditReceivableVoucherTypeId === settlement.creditReceivableVoucherTypeId
        ) === undefined
      ) {
        if (settlement.refundAmount > this.selectedVoucher.notRefund) {
          this._globalService.messageAlert(
            MessageType.Warning,
            "Receipts.Messages.RefuundMustMoreThanPaid",
            true
          );
          return;
        }

        let totalrefund = 0;
        this.settlements.forEach((item) => {
          totalrefund += item.refundAmount;
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
        s.creditReceivableId === settlement.creditReceivableId &&
        s.creditReceivableTypeId === settlement.creditReceivableVoucherTypeId
    );

    if (settlement.refundAmount > settlement.currentBalance) {
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
        totalrefund += item.refundAmount;
      }
    });

    if (totalrefund + settlement.refundAmount > this.totalVal) {
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

  removeSettlement(settlement: number) {
    this.settlements.splice(this.settlements.indexOf(settlement, 0), 1);
  }
}

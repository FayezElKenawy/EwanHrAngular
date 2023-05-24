import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";

import { IServiceResult } from "@shared/interfaces/results";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { AuthService } from "@shared/services/auth.service";
import { CustomerService } from "@shared/services/customer.service";
import { PaymentReceiptService } from "src/app/receipts/services/payment-receipt.service";
import { CostCenterService } from "@shared/services/cost-center.service";
import { CashboxService } from "@shared/services/cashbox.service";
import { Settlement } from "src/app/receipts/models/credit-notes/settlement.model";
import { CreditCardTypeService } from "src/app/master-data/services/credit-card-type.service";
import { BankAccountService } from "@shared/services/bank-account.service";

@Component({
  selector: "app-create-payment-receipt",
  templateUrl: "./create-payment-receipt.component.html",
  styleUrls: ["./create-payment-receipt.component.scss"],
})
export class CreatePaymentReceiptComponent implements OnInit {
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
  paidValue: number;
  added: boolean;
  currentSettlement: any;
  voucherType: any;
  filteredVouchers: any[];
  minDateValue: any;
  CashBoxs: any[];
  sectorId: string;
  creditCardTypes:any[];
  bankAccounts:any[]=[];
  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _paymentReceipt: PaymentReceiptService,
    private _authService: AuthService,
    private _customerService: CustomerService,
    private _costCenterService: CostCenterService,
    private _cashBox: CashboxService,
    private _creditCardTypeService:CreditCardTypeService,
    private _bankAccount:BankAccountService,
  ) {
    this.settlements = [];
    this.creditCardTypes = [];
  }

  ngOnInit() {
    this.sectorId = this._globalService.getSectorType();

    this.createForm();
    this.IsCashOrDeposit();
    this.getVoucherCols();
    this.getSettleCols();
    this.setCreditCardTypes();
  }

  getSettleCols() {
    this.settlementCols = [
      { field: "id", header: "Receipts.Fields.CostElementId" },
      {
        field: "name",
        header: "Receipts.Fields.CostElementName"
      },
      {
        field: "Amount",
        header: "Receipts.Fields.CostElementAmount"
      },

      {
        field: "TaxRatio",
        header: "Receipts.Fields.TaxRatio"
      },
      {
        field: "TaxAmount",
        header: "Receipts.Fields.TaxAmount"
      },
      {
        field: "ActionButtons",
        header: "",
      },
    ];
    this.settlementCols = [
      {
        field: "voucherCode",
        header: "Receipts.Fields.DocumentId",
        hidden: false,
      },
      {
        field: "voucherTypeArabicName",
        header: "Receipts.Fields.DocumentType",
        hidden: false,
      },
      {
        field: "debitReceivableTypeId",
        header: "رقم نوع المستند",
        hidden: true,
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
      {
        field: "canBePay",
        header: "Receipts.Fields.CanPay",
        hidden: false
      },
      { field: "paidAmount", header: "Receipts.Fields.Value", hidden: false },
      { field: "ActionButtons", header: "", hidden: false },
    ];
  }

  getVoucherCols() {
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
  }


  createForm() {
    this.form = this._formBuilder.group({
      DocumentDate: ["", Validators.required],
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
    });
  }
  
  setCreditCardTypes(){
    this._creditCardTypeService.getAll().subscribe(
      result=>{
        this.filteredArray = [];
        this.creditCardTypes = result;
      }
    )
  }

  createPaymentReciept() {
    this.submitted = true;
    let totalpaid = 0;
    this.settlements.forEach((item) => {
      totalpaid += item.paidAmount;
    });
    if (this.form.valid) {
      if (this.totalVal < totalpaid) {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.VoucherMustBeMoreThanPaid"
          )
        );
        return;
      }
      if (this.totalVal <= 0) {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.VoucherMustBeMoreThanZero"
          )
        );
        return;
      }

      this.progressSpinner = true;
      const postedViewModel = Object.assign({}, this.form.value);
      postedViewModel.CustomerId =this.form.value.Customer.id;
      postedViewModel.EntityCode = postedViewModel.Contract.entityCode;
      postedViewModel.SectorTypeId = this.sectorId;

      if (postedViewModel.CreditCardType) {
        postedViewModel.CreditCardTypeId = postedViewModel.CreditCardType.code;
      }
      if (postedViewModel.CashBox) {
        postedViewModel.CashBoxId = postedViewModel.CashBox.code;
      }

      postedViewModel.BankAccountId = postedViewModel.BankAccount
        ? postedViewModel.BankAccount.code
        : null;
      postedViewModel.DocumentDate = this._datePipe.transform(
        postedViewModel.DocumentDate, 'yyyy-MM-ddTHH:mm:ss'
      );
      postedViewModel.PaymentsTransactions = this.settlements;
      this._paymentReceipt.create(postedViewModel).subscribe(
        (result: any) => {
          if (result) {
            this.submitted = false;
            this.form.reset();
            // this.Oncancel.emit();
            this._globalService.messageAlert(
              MessageType.Success,
              this._globalService.translateWordByKey(
                "Receipts.Messages.creditNoteAdded"
              )
            );
            this._router.navigate(["/finance/receipts/payment-receipts"]);
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

  searchCustomers(event: any) {
    setTimeout(() => {
      this._customerService
        .getCustomersBySectorId(this.sectorId, event.query)
        .subscribe((result) => {
          this.filteredArray = [];
          this.filteredArray = result;
        });
    }, 1500);
  }

  onSelectCustomer(event: any) {
    this.progressSpinner = true;
    this.settlements = [];
    this.vouchers = [];
    this.selectedVoucher = undefined;

    this._costCenterService.getAll(event.code)
      .subscribe((result) => {
        this.progressSpinner = false;
        this.filteredArray = [];
        this.filteredArray = result;
        this.Contracts = result;
        if (result.length > 0) {
          this.form.controls.Contract.enable();
          this.form.controls.Contract.reset();
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
      .setValue(event.SalesRepresentativeArabicName);
    this._paymentReceipt
      .getVouchers(event.entityCode)
      .subscribe((result: any) => {
        this.progressSpinner = false;
        this.vouchers = result;
        this.onSelectVoucherType();
      });

    this._cashBox.getAll('')
      .subscribe(result => {
        this.CashBoxs = result;
      });

      this._bankAccount.getAll('')
    .subscribe(result =>{
      this.bankAccounts = result;
    })

  }

  onSelectVoucherType() {

    this.filteredVouchers = this.vouchers.filter(
      (v) => v.VoucherTypeId === this.voucherType
    );
    this.selectedVoucher = undefined;
  }

  addSettlement() {
    this.added = true;
    if (this.selectedVoucher && Number(this.paidValue) > 0) {
      const settlement: Settlement = {
        id: this.selectedVoucher.id,
        voucherCode: this.selectedVoucher.voucherCode,
        debitReceivableId: this.selectedVoucher.id,
        debitReceivableVoucherTypeId: this.selectedVoucher.voucherTypeId,
        paidAmount: this.paidValue,
        netValueAfterTax: this.selectedVoucher.netValueAfterTax,
        voucherTypeArabicName: this.selectedVoucher.voucherTypeName,
        currentBalance: Number(this.selectedVoucher.currentBalance),
        canBePay: Number(this.selectedVoucher.currentBalance),
      };

      if (
        this.settlements.find(
          (e: Settlement) =>
            e.id === settlement.id &&
            e.debitReceivableVoucherTypeId === settlement.debitReceivableVoucherTypeId
        ) === undefined
      ) {

        if (settlement.currentBalance < settlement.paidAmount) {
          this._globalService.messageAlert(
            MessageType.Warning,
            this._globalService.translateWordByKey(
              "Receipts.Messages.TotalPaidMoreThanBalance"
            )
          );
          return;
        }

        let totalpaid = 0;
        this.settlements.forEach((item) => {
          totalpaid += item.paidAmount;
        });
        if (totalpaid + settlement.paidAmount > this.totalVal) {
          this._globalService.messageAlert(
            MessageType.Warning,
            this._globalService.translateWordByKey(
              "Receipts.Messages.PaidMoreThanVal"
            )
          );
          return;
        }
        this.settlements.push(settlement);
        ///////// me
        this.selectedVoucher.CurrentBalance = settlement.currentBalance;
        //////////
      } else {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.VoucherExist"
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
          "Receipts.Messages.PaidMoreThanCurrentBalance"
        )
      );
      return;
    }
    if (settlement.PaidAmount <= 0) {
      this.settlements[itemIndex] = this.currentSettlement;
      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey(
          "Receipts.Messages.PaidMustMoreThanZero"
        )
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
        "Receipts.Messages.PaidMoreThanPaymentReceipt",
        true
      );
      return;
    }
  }

  onClear(controlName: string) {
    this.form.controls[controlName].setValue(null);
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

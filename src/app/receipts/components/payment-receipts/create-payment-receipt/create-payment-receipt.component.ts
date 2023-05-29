import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { CustomerService } from "@shared/services/customer.service";
import { PaymentReceiptService } from "src/app/receipts/services/payment-receipt.service";
import { CostCenterService } from "@shared/services/cost-center.service";
import { CashboxService } from "@shared/services/cashbox.service";
import { CreditCardTypeService } from "src/app/master-data/services/credit-card-type.service";
import { BankAccountService } from "@shared/services/bank-account.service";
import { SettlementModel } from "src/app/receipts/models/creditNote/settlement.model";
import { CreatePaymentReceiptModel } from '../../../models/paymentReceipt/create-payment-receipt.model';
import { VoucherType } from "src/app/receipts/enum/voucher-type.enum";
import { CreatePaymentTransactionModel } from "src/app/receipts/models/paymentTransaction/create-payment-transaction.model";
import { GetCostCenterListModel } from "src/app/receipts/models/costCenter/cost-center.model";
import { ColumnType } from "@shared/models/column-type.model";

@Component({
  selector: "app-create-payment-receipt",
  templateUrl: "./create-payment-receipt.component.html",
  styleUrls: ["./create-payment-receipt.component.scss"],
})
export class CreatePaymentReceiptComponent implements OnInit {

  form: FormGroup;
  submittedObjectModel: CreatePaymentReceiptModel;

  vouchersCols: ColumnType[];
  vouchers: SettlementModel[];
  filteredVouchers: SettlementModel[];
  selectedVoucher: SettlementModel;
  voucherType: string = VoucherType.CreditInvoice;

  settlementCols: ColumnType[];
  settlements: SettlementModel[];
  currentSettlement: SettlementModel;

  filteredArray: any[];
  submitted: Boolean;
  toYear = new Date().getFullYear() + 5;
  costCenters: GetCostCenterListModel[];
  totalVal: number;

  paidValue: number;
  added: boolean;
  minDateValue: any;
  cashBoxs: any[];
  sectorId: string;
  creditCardTypes: any[];
  bankAccounts: any[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _paymentReceipt: PaymentReceiptService,
    private _customerService: CustomerService,
    private _costCenterService: CostCenterService,
    private _cashBox: CashboxService,
    private _creditCardTypeService: CreditCardTypeService,
    private _bankAccount: BankAccountService,
  ) {
    this.settlements = [];
    this.creditCardTypes = [];
  }

  ngOnInit() {
    this.sectorId = this._globalService.getSectorType();

    this.createForm();
    this.isCashOrDeposit();
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
      documentDate: ["", Validators.required],
      refNumber: [""],
      customer: ["", Validators.required],
      costCenter: [{ value: "", disabled: true }, Validators.required],
      salesRepresentative: [""],
      arabicRemarks: [""],
      creditCardType: [""],
      isBankDeposit: [false],
      bankDepositAmount: [0, Validators.required],
      bankAccount: ["", Validators.required],
      isCashBox: [true, Validators.required],
      cashBox: ["", Validators.required],
      cashBoxAmount: [0, Validators.required],
    });
  }

  setCreditCardTypes() {
    this._creditCardTypeService.getAll().subscribe(
      result => {
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

      this.submittedObjectModel = Object.assign({}, this.form.value);
      this.submittedObjectModel.customerId = this.form.value.customer.id;
      this.submittedObjectModel.entityCode = this.form.value.costCenter.entityCode;
      this.submittedObjectModel.sectorTypeId = this.sectorId;

      if (this.submittedObjectModel.creditCardTypeId) {
        this.submittedObjectModel.creditCardTypeId = this.form.value.creditCardType.code;
      }
      if (this.submittedObjectModel.cashBoxAmount) {
        this.submittedObjectModel.cashBoxId = this.form.value.cashBox.code;
      }

      this.submittedObjectModel.bankAccountId = this.form.value.bankAccount
        ? this.form.value.bankAccount.code
        : null;
      this.submittedObjectModel.documentDate = this._datePipe.transform(
        this.submittedObjectModel.documentDate, 'yyyy-MM-ddTHH:mm:ss'
      );

      this.submittedObjectModel.paymentsTransactions=[];
      this.settlements.forEach((settlement) => {
        let paymentTransaction: CreatePaymentTransactionModel =
        {
          debitReceivableId: settlement.debitReceivableId,
          debitReceivableVoucherTypeId: settlement.debitReceivableVoucherTypeId,
          paidAmount:settlement.paidAmount
        }
        this.submittedObjectModel.paymentsTransactions.push(paymentTransaction);
      });

      this._paymentReceipt.create(this.submittedObjectModel).subscribe(
        (result: any) => {
          if (result) {
            this.submitted = false;
            this.form.reset();
            this._globalService.messageAlert(
              MessageType.Success,
              this._globalService.translateWordByKey(
                "Receipts.Messages.EditSuccessFully"
              )
            );
            this._router.navigate(["/finance/receipts/payment-receipts"]);
          }
        });
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
    this.settlements = [];
    this.vouchers = [];
    this.selectedVoucher = undefined;

    this._costCenterService.getCostCenterSelectList(event.code)
      .subscribe((result) => {
        this.filteredArray = [];
        this.filteredArray = result;
        this.costCenters = result;
        if (result.length > 0) {
          this.form.controls.costCenter.enable();
          this.form.controls.costCenter.reset();
        } else {
          this.form.controls.costCenter.setValue("");
          this.form.controls.costCenter.disable();
        }
      });

  }


  onSelectcostCenter(event) {
    this.settlements = [];
    this.vouchers = [];
    this.selectedVoucher = undefined;
    this.form
      .get("salesRepresentative")
      .setValue(event.SalesRepresentativeArabicName);
    this._paymentReceipt
      .getVouchers(event.entityCode)
      .subscribe((result: any) => {
        this.vouchers = result;
        this.onSelectVoucherType();
      });

    this._cashBox.getAll('')
      .subscribe(result => {
        this.cashBoxs = result;
      });

    this._bankAccount.getAll('')
      .subscribe(result => {
        this.bankAccounts = result;
      })

  }

  onSelectVoucherType() {
    this.filteredVouchers = this.vouchers.filter(
      (v) => v.voucherTypeId === this.voucherType
    );
    this.selectedVoucher = undefined;
  }

  addSettlement() {
    this.added = true;
    if (this.selectedVoucher && Number(this.paidValue) > 0) {
      const settlement: SettlementModel = {
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
          (e: SettlementModel) =>
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
        this.selectedVoucher.currentBalance = settlement.currentBalance;
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
        s.debitReceivableId === settlement.debitReceivableId &&
        s.debitReceivableVoucherTypeId === settlement.debitReceivableVoucherTypeId
    );
    if (settlement.paidAmount > settlement.canBePay) {
      this.settlements[itemIndex] = this.currentSettlement;
      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey(
          "Receipts.Messages.PaidMoreThanCurrentBalance"
        )
      );
      return;
    }
    if (settlement.paidAmount <= 0) {
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
        totalpaid += item.paidAmount;
      }
    });
    if (totalpaid + settlement.paidAmount > this.totalVal) {
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

  isCashOrDeposit() {
    if (this.form.get("isCashBox").value) {
      this.form.get("cashBox").enable();
      this.form.get("cashBox").setValidators([Validators.required]);
      this.form.get("cashBoxAmount").enable();
      this.form.get("cashBoxAmount").setValidators([Validators.required]);
      this.form.get("creditCardType").enable();
    } else {
      this.form.get("cashBox").reset();
      this.form.get("cashBox").disable();
      this.form.get("cashBoxAmount").reset();
      this.form.get("cashBoxAmount").disable();
      this.form.get("creditCardType").reset();
      this.form.get("creditCardType").disable();
    }
    if (this.form.get("isBankDeposit").value) {
      this.form.get("bankAccount").enable();
      this.form.get("bankAccount").setValidators([Validators.required]);
      this.form.get("bankDepositAmount").enable();
      this.form.get("bankDepositAmount").setValidators([Validators.required]);
    } else {
      this.form.get("bankAccount").reset();
      this.form.get("bankAccount").disable();
      this.form.get("bankDepositAmount").reset();
      this.form.get("bankDepositAmount").disable();
    }
    this.form.updateValueAndValidity();
    this.calculate();
  }

  calculate() {
    const bankDepositAmount = this.form.get("bankDepositAmount").value;
    const cashBoxAmount = this.form.get("cashBoxAmount").value;
    this.totalVal =
      parseFloat(bankDepositAmount ? bankDepositAmount : 0) +
      parseFloat(cashBoxAmount ? cashBoxAmount : 0);
  }

  removeSettlement(settlement: SettlementModel) {
    const voucher = this.vouchers.find(
      (v) =>
        v.id === settlement.debitReceivableId &&
        v.debitReceivableVoucherTypeId === settlement.debitReceivableVoucherTypeId
    );
    if (voucher === null || voucher === undefined) {
      this.vouchers.push(settlement);
    }
    this.settlements.splice(this.settlements.indexOf(settlement, 0), 1);
    this.voucherType = VoucherType.CreditInvoice;
    this.onSelectVoucherType();
  }
}

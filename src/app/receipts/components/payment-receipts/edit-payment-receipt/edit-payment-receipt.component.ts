import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DatePipe } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { PaymentReceiptService } from "src/app/receipts/services/payment-receipt.service";
import { CustomerService } from "@shared/services/customer.service";
import { CashboxService } from "@shared/services/cashbox.service";
import { CreditCardTypeService } from "src/app/master-data/services/credit-card-type.service";
import { BankAccountService } from "@shared/services/bank-account.service";
import { SettlementModel } from "src/app/receipts/models/creditNote/settlement.model";
import { VoucherType } from "src/app/receipts/enum/voucher-type.enum";
import { UpdatePaymentReceiptModel } from "src/app/receipts/models/paymentReceipt/update-payment-receipt.model";
import { GetCostCenterListModel } from "src/app/receipts/models/costCenter/cost-center.model";
import { ColumnType } from "@shared/models/column-type.model";

@Component({
  selector: "app-edit-payment-receipt",
  templateUrl: "./edit-payment-receipt.component.html",
  styleUrls: ["./edit-payment-receipt.component.scss"],
})
export class EditPaymentReceiptComponent implements OnInit {

  form: FormGroup;
  submittedObjectModel: UpdatePaymentReceiptModel = new UpdatePaymentReceiptModel();

  vouchersCols: ColumnType[];
  vouchers: SettlementModel[];
  selectedVoucher: SettlementModel;
  voucherType: any = VoucherType.CreditInvoice;
  filteredVouchers: SettlementModel[] = [];

  settlementCols: ColumnType[];
  settlements: any[];

  filteredArray: any[];
  submitted: Boolean;
  toYear = new Date().getFullYear() + 5;
  costCenters: GetCostCenterListModel[];
  totalVal: number;

  isDownPayment: boolean = true;
  paidValue: number;
  showPaidOnlineSection: boolean = false;
  added: boolean;
  currentSettlement: any;
  disabled: boolean;

  cashBoxs: any[];
  creditCardTypes: any[];
  bankAccounts: any[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _route: ActivatedRoute,
    private _paymentReceiptService: PaymentReceiptService,
    private _customerService: CustomerService,
    private _cashBox: CashboxService,
    private _creditCardTypeService: CreditCardTypeService,
    private _bankAccount: BankAccountService,
  ) {
    this.settlements = [];
  }

  ngOnInit() {
    this.createForm();
    const id = this._route.snapshot.paramMap.get("id");
    this.getEditFormData(id);

    this.defCols();

    this._cashBox.getAll('')
      .subscribe(result => {
        this.cashBoxs = result;
      });

    this._bankAccount.getAll('')
      .subscribe(result => {
        this.bankAccounts = result;
      })

    this._creditCardTypeService.getAll().subscribe(
      result => {
        this.filteredArray = [];
        this.creditCardTypes = result;
      }
    )

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
      { field: "paidAmount", header: "Receipts.Fields.Value", hidden: false },
      { field: "ActionButtons", header: "", hidden: false },
    ];
  }

  searchCustomers(event: any) {
    this._customerService
      .getCustomersBySectorId(this._globalService.getSectorType(), event.query)
      .subscribe((result) => {
        this.filteredArray = [];
        this.filteredArray = result;
      });
  }


  createForm() {
    this.form = this._formBuilder.group({
      id: [""],
      creditReceivableId: [""],
      creditReceivableTypeId: [VoucherType.PaymentReceipt],
      documentDate: [{ value: "", disabled: true }, Validators.required],
      refNumber: [""],
      customer: ["", Validators.required],
      entityCode: [""],
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
      isPaidOnline: [false],
      onlinePaidCreditCard: [""],
      paymentOnlineRef: [""],
      customerId: [""],
      sectorTypeId: [""]
    });
  }

  getEditFormData(id: string) {
    this._paymentReceiptService
      .details(id)
      .subscribe((result) => {
        this.submittedObjectModel = result;
        this.form.patchValue({
          id: result.id,
          creditReceivableId: result.id,
          creditReceivableTypeId: result.voucherTypeId,
          documentDate: new Date(result.documentDate),
          refNumber: result.refNumber,
          customer: result.customer,
          costCenter: { entityCode: result.entityCode },
          entityCode: result.entityCode,
          salesRepresentative:
            result.salesRepresentativeName,
          arabicRemarks: result.arabicRemarks,
          creditCardType: result.creditCardType,
          isBankDeposit: result.isBankDeposit,
          bankDepositAmount: result.isBankDeposit
            ? result.bankDepositAmount
            : 0,
          bankAccount: result.bankAccount,
          isCashBox: result.isCashBox,
          cashBox: result.cashBox,
          cashBoxAmount: result.isCashBox
            ? result.cashBoxAmount
            : 0,
          isPaidOnline: result.isPaidOnline,
          onlinePaidCreditCard: result.creditCardType
            ? result.creditCardType.ArabicName
            : "",
          paymentOnlineRef: result.paymentOnlineRef,
          customerId: result.customerId,
          sectorTypeId: this._globalService.getSectorType()
        });

        this.isDownPayment = result.isDownPayment;
        this.showPaidOnlineSection = result.isPaidOnline;
        this.form.get("customer").disable();
        this.form.get("costCenter").disable();
        this.isCashOrDeposit();

        this.settlements = result.paymentsTransactions
          ? result.paymentsTransactions
          : [];

        if (result.isDownPayment) {
          this.form.disable();
          this.disabled = true;
        }

        this._paymentReceiptService
          .getVouchers(result.entityCode)
          .subscribe((res) => {
            this.vouchers = res;
            //////////// me
            this.onSelectVoucherType();
            ////////////////////
          });
      });
  }


  editPaymentReciept() {
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
      totalpaid += item.paidAmount;
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
      this.submittedObjectModel = Object.assign({}, this.form.getRawValue());

      if (this.submittedObjectModel.bankDepositAmount == null) {
        this.submittedObjectModel.bankDepositAmount = 0;
      }

      this.submittedObjectModel.sectorTypeId = this._globalService.getSectorType();


      if (this.form.value.creditCardType) {
        this.submittedObjectModel.creditCardTypeId = this.form.value.creditCardType.code;
      }
      if (this.form.value.creditCardType) {
        this.submittedObjectModel.cashBoxId = this.form.value.cashBox.id;
      }
      this.submittedObjectModel.bankAccountId = this.form.value.bankAccount
        ? this.form.value.bankAccount.code
        : null;
      this.submittedObjectModel.documentDate = this._datePipe.transform(
        this.submittedObjectModel.documentDate, 'yyyy-MM-ddTHH:mm:ss'
      );

      this.submittedObjectModel.paymentsTransactions = this.settlements;

      this._paymentReceiptService.edit(this.submittedObjectModel).subscribe(
        (result) => {
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
        })
    }
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
      const settlement: any = {
        id: this.selectedVoucher.id,
        voucherCode: this.selectedVoucher.voucherCode,
        debitReceivableCode: this.selectedVoucher.voucherCode,
        debitReceivableId: this.selectedVoucher.id,
        debitReceivableVoucherTypeId: this.selectedVoucher.voucherTypeId,
        paidAmount: this.paidValue,
        netValueAfterTax: this.selectedVoucher.netValueAfterTax,
        voucherTypeName: this.selectedVoucher.voucherTypeName,
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
      (e) =>
        e.id === settlement.id &&
        e.debitReceivableVoucherTypeId === settlement.debitReceivableVoucherTypeId
    );
    if (settlement.paidAmount > settlement.canBePay) {
      this.settlements[itemIndex] = this.currentSettlement;
      this._globalService.messageAlert(
        MessageType.Warning,
        "Receipts.Messages.PaidMoreThanCurrentBalance",
        true
      );
      return;
    }
    if (settlement.paidAmount <= 0) {
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
        totalpaid += item.paidAmount;
      }
    });
    if (totalpaid + settlement.paidAmount > this.totalVal) {
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


  getSelectedItem(vm: any, id: any) {
    if (id) {
      return vm.filter((x) => x.Id.toString() === id.toString())[0];
    }
    return null;
  }

  getSelectedCreditCard(vm: any, code: any) {
    if (code) {
      return vm.filter((x) => x.code.toString() === code.toString())[0];
    }
    return null;
  }
}

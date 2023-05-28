import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DatePipe } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { IServiceResult } from "@shared/interfaces/results";
import { AuthService } from "@shared/services/auth.service";
import { PaymentReceiptService } from "src/app/receipts/services/payment-receipt.service";
import { CustomerService } from "@shared/services/customer.service";
import { CostCenterService } from "@shared/services/cost-center.service";
import { CashboxService } from "@shared/services/cashbox.service";
import { CreditCardTypeService } from "src/app/master-data/services/credit-card-type.service";
import { BankAccountService } from "@shared/services/bank-account.service";
import { Settlement } from "src/app/receipts/models/credit-notes/settlement.model";

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
  CashBoxs: any[];
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
        this.CashBoxs = result;
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



  getEditFormData(id: string) {
    this._paymentReceiptService
      .details(id)
      .subscribe((result) => {
        debugger
        this.viewModel = result;
        const paymentReceipt = this.viewModel;

        this.form.patchValue({
          CreditReceivableId: paymentReceipt.id,
          CreditReceivableTypeId: paymentReceipt.voucherTypeId,
          DocumentDate: new Date(paymentReceipt.documentDate),
          RefNumber: paymentReceipt.refNumber,
          Customer: paymentReceipt.customer,
          Contract: { entityCode: paymentReceipt.entityCode },
          SalesRepresentative:
            paymentReceipt.salesRepresentativeName,
          ArabicRemarks: paymentReceipt.arabicRemarks,
          CreditCardType: paymentReceipt.creditCardType,
          IsBankDeposit: paymentReceipt.isBankDeposit,
          BankDepositAmount: paymentReceipt.isBankDeposit
            ? paymentReceipt.bankDepositAmount
            : 0,
          BankAccount: paymentReceipt.bankAccount,
          IsCashBox: paymentReceipt.isCashBox,
          CashBox: paymentReceipt.cashBox,
          CashBoxAmount: paymentReceipt.isCashBox
            ? paymentReceipt.cashBoxAmount
            : 0,
          IsPaidOnline: paymentReceipt.isPaidOnline,
          OnlinePaidCreditCard: paymentReceipt.CreditCardType
            ? paymentReceipt.CreditCardType.ArabicName
            : "",
          PaymentOnlineRef: paymentReceipt.paymentOnlineRef
        });

        this.isDownPayment = paymentReceipt.isDownPayment;
        this.showPaidOnlineSection = paymentReceipt.isPaidOnline;
        this.form.get("Customer").disable();
        this.form.get("Contract").disable();
        this.IsCashOrDeposit();

        this.settlements = paymentReceipt.paymentsTransactions
          ? paymentReceipt.paymentsTransactions
          : [];
        if (paymentReceipt.isDownPayment) {
          this.form.disable();
          this.disabled = true;
        }

        this._paymentReceiptService
          .getVouchers(paymentReceipt.entityCode)
          .subscribe((res) => {
            this.vouchers = res;
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
      const postedViewModel = Object.assign({}, this.form.getRawValue());

      if (postedViewModel.BankDepositAmount == null) {
        postedViewModel.BankDepositAmount = 0;
      }
      postedViewModel.Id = this.viewModel.id;
      postedViewModel.CustomerId = postedViewModel.Customer.id;
      postedViewModel.EntityCode = postedViewModel.Contract.entityCode;
      postedViewModel.SectorTypeId = this._globalService.getSectorType();


      if (postedViewModel.CreditCardType) {
        postedViewModel.CreditCardTypeId = postedViewModel.CreditCardType.code;
      }
      if (postedViewModel.CashBox) {
        postedViewModel.CashBoxId = postedViewModel.CashBox.id;
      }
      postedViewModel.BankAccountId = postedViewModel.BankAccount
        ? postedViewModel.BankAccount.code
        : null;
      postedViewModel.DocumentDate = this._datePipe.transform(
        postedViewModel.DocumentDate, 'yyyy-MM-ddTHH:mm:ss'
      );
      postedViewModel.PaymentsTransactions = this.settlements;

      this._paymentReceiptService.edit(postedViewModel).subscribe(
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
      debugger
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
    debugger
    if (id) {
      return vm.filter((x) => x.Id.toString() === id.toString())[0];
    }
    return null;
  }


  getSelectedCreditCard(vm: any, code: any) {
    debugger
    if (code) {
      return vm.filter((x) => x.code.toString() === code.toString())[0];
    }
    return null;
  }
}

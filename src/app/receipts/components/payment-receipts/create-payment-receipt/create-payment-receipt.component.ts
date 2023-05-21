import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { PaymentReceiptService } from "../payment-receipt.service";
import { IServiceResult } from "@shared/interfaces/results";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { AuthService } from "@shared/services/auth.service";
import { CustomerService } from "@shared/services/customer.service";

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

  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _paymentReceipt: PaymentReceiptService,
    private _authService: AuthService,
    private _customerService : CustomerService
  ) {
    this.settlements = [];
  }

  ngOnInit() {
    this.createForm();
    //this.getCreatFormData();
    this.IsCashOrDeposit();
    this.getVoucherCols();
    this.getSettleCols();
  }

  getSettleCols(){
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
      { field: "CanBePay", header: "Receipts.Fields.CanPay", hidden: false },
      { field: "PaidAmount", header: "Receipts.Fields.Value", hidden: false },
      { field: "ActionButtons", header: "", hidden: false },
    ];
  }

  getVoucherCols(){
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
  }

  // getCreatFormData() {
  //   this.progressSpinner = true;

  //   this._paymentReceipt.getCreate().subscribe((result: IServiceResult) => {
  //     this.viewModel = result.data;
  //     if (this._authService.currentAuthUser.RoleTypeId == '001') {
  //       this.CashBoxs = this.viewModel.CashBoxs;
  //     }
  //     else {
  //       this.CashBoxs = this.viewModel.CashBoxs.filter(x => x.Id === this._authService.currentAuthUser.CashBoxId);
  //     }
  //     this.progressSpinner = false;

  //     this.form
  //       .get("DocumentDate")
  //       .setValue(
  //         new Date(this.viewModel.CurrentDate)
  //       );

  //     this.minDateValue = new Date(this.viewModel.MinSelectableDate);
  //   });
  // }

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

  createPaymentReciept() {
    this.submitted = true;
    let totalpaid = 0;
    this.settlements.forEach((item) => {
      totalpaid += item.PaidAmount;
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
      postedViewModel.PaymentsTransactions = this.settlements;
      this._paymentReceipt.create(postedViewModel).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.form.reset();
            // this.Oncancel.emit();
            this._router.navigate(["/receipts/payment-receipts"]);
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

  getCustomers(event: any) {
   this._customerService.getAll(event.query)
   .subscribe()
  }

  onSelectCustomer(event: any) {
    this.progressSpinner = true;
    this.settlements = [];
    this.vouchers = [];
    this.selectedVoucher = undefined;
    this._paymentReceipt
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
      .setValue(event.SalesRepresentativeArabicName);
    this._paymentReceipt
      .getVouchers(event.Id)
      .subscribe((result: IServiceResult) => {
        
        this.progressSpinner = false;
        this.vouchers = result.data;
        //////////// me
        this.voucherType = "CR";
        this.onSelectVoucherType();
        ////////////////////
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
    if (this.selectedVoucher && Number(this.paidValue) > 0) {
      const settlement = {
        DebitReceivableIdFK: this.selectedVoucher.Id,
        DebitReceivableId: this.selectedVoucher.VoucherId,
        DebitReceivableTypeId: this.selectedVoucher.VoucherTypeId,
        PaidAmount: Number(this.paidValue),
        NetValueAfterTax: this.selectedVoucher.NetValueAfterTax,
        VoucherTypeArabicName: this.selectedVoucher.VoucherTypeArabicName,
        CanBePay: this.selectedVoucher.CurrentBalance,
        CurrentBalance: this.selectedVoucher.CurrentBalance,
      };

      if (
        this.settlements.find(
          (e) =>
            e.DebitReceivableId === settlement.DebitReceivableId &&
            e.DebitReceivableTypeId === settlement.DebitReceivableTypeId
        ) === undefined
      ) {
        /////////// me
        if (settlement.CanBePay < settlement.PaidAmount) {
          this._globalService.messageAlert(
            MessageType.Warning,
            this._globalService.translateWordByKey(
              "Receipts.Messages.PaidMoreThanVoucher"
            )
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
            this._globalService.translateWordByKey(
              "Receipts.Messages.PaidMoreThanVal"
            )
          );
          return;
        }
        this.settlements.push(settlement);
        ///////// me
        this.selectedVoucher.CurrentBalance = settlement.CurrentBalance;
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

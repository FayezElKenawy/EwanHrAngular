import {
  GlobalService,
  MessageType
} from "./../../../shared/services/global.service";
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { IServiceResult } from "@shared/interfaces/results";
import { DownpaymentReceiptService } from "../downpayment-receipt.service";
import { AuthService } from "@shared/services/auth.service";

@Component({
  selector: "app-create-downpayment-receipt",
  templateUrl: "./create-downpayment-receipt.component.html",
  styleUrls: ["./create-downpayment-receipt.component.scss"]
})
export class CreateDownpaymentReceiptComponent implements OnInit {
  @Output() OnComplete: EventEmitter<any> = new EventEmitter();
  @Output() Oncancel: EventEmitter<any> = new EventEmitter();
  CashBoxs:any[];
  form: FormGroup;
  viewModel: any;
  filteredArray: any[];
  filteredCustomersArray: any[];
  submitted: Boolean;
  progressSpinner: boolean;
  contract: any;
  totalVal: number;
  downpayment: any;
  currentYear = new Date().getFullYear() + 5;
  disabled: boolean;
  skipClicked: boolean;
  DateValidation: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _downpaymentReceipt: DownpaymentReceiptService,
    private globalService: GlobalService,
    private _authService: AuthService
  ) { }

  ngOnInit() {
    this.createForm();
    this.getCreatFormData();
  }

  getCreatFormData() {
    this._downpaymentReceipt.getCreate().subscribe((result: IServiceResult) => {
      this.viewModel = result.data;
      if (this._authService.currentAuthUser.RoleTypeId == '001') {
        this.CashBoxs = this.viewModel.CashBoxs;
      }
      else {
        this.CashBoxs = this.viewModel.CashBoxs.filter(x => x.Id === this._authService.currentAuthUser.CashBoxId);
      }
      this.progressSpinner = false;
      this.form
        .get("DocumentDate")
        .setValue(
          new Date(this._datePipe.transform(this.viewModel.CurrentDate))
        );
    });
  }

  createForm() {
    this.form = this._formBuilder.group({
      VoucherType: [""],
      DocumentDate: ["", Validators.required],
      RefNumber: [""],
      Customer: ["", Validators.required],
      Contract: ["", Validators.required],
      SalesRepresentative: [""],
      ArabicRemarks: [""],
      CreditCardType: [""],
      IsBankDeposit: [false],
      BankAccount: ["", Validators.required],
      BankDepositAmount: [0, Validators.required],
      IsCashBox: [true],
      CashBox: ["", Validators.required],
      CashBoxAmount: [0, Validators.required],
      ContractDownPaymentAmount: [0, Validators.required],
      ContractInsuranceAmount: [0],
      EscapeInsuranceAmount: [0],
      IsTermAgreements: [false]
    });
  }

  setFormValues(id: string) {
    this.progressSpinner = true;
    this._downpaymentReceipt
      .getContract(id)
      .subscribe((result: IServiceResult) => {
        
        this.contract = result.data;
        this.form.controls["DocumentDate"].setValue(new Date());
        this.form.controls["Customer"].setValue(
          this.contract.SegmentsCustomerId + " - " + this.contract.CustomerName
        );
        this.form.controls["Contract"].setValue(this.contract.SegmentContractId);
        this.form.controls["ContractDownPaymentAmount"].setValue(
          this.contract.BundleDownPayment
        );
        this.form.controls["EscapeInsuranceAmount"].setValue(
          this.contract.BundleEscapeInsuranceAmount
        );
        this.form.controls["ContractInsuranceAmount"].setValue(
          this.contract.BundleContractInsuranceAmount
        );
        this.form.controls["SalesRepresentative"].setValue(
          this.contract.SalesRepresentativeId +
          " - " +
          this.contract.SalesRepresentativeName
        );
        this.downpayment = this.contract.BundleDownPayment;
        this.form.controls["BankAccount"].disable();
        this.form.controls["BankDepositAmount"].disable();
        this.form.controls["IsCashBox"].setValue(true);
        this.form.controls["IsTermAgreements"].setValue(
          this.contract.IsTermAgreements
        );
        
        if (this.viewModel.CurrentDate < this.contract.ContractDate) {
          this.form.disable();
          this.DateValidation = true;
          this.form.controls["CreditCardType"].disable();
          this.form.controls["BankAccount"].disable();
          this.form.controls["CashBox"].disable();
        } 

        this.IsCashOrDeposit();
        this.progressSpinner = false;
      });
  }

  createdownpaymentReciept() {
    this.submitted = true;
    const postedViewModel = Object.assign({}, this.form.value);

    const docVal =
      parseFloat(
        postedViewModel.BankDepositAmount
          ? postedViewModel.BankDepositAmount
          : 0
      ) +
      parseFloat(
        postedViewModel.CashBoxAmount ? postedViewModel.CashBoxAmount : 0
      );
    if (
      this.form.valid &&
      this.totalVal <= docVal &&
      (this.downpayment <=
      (postedViewModel.ContractDownPaymentAmount
        ? postedViewModel.ContractDownPaymentAmount
        : 0)) &&
        this.totalVal >= this.form.get('BankDepositAmount').value + this.form.get('CashBoxAmount').value
    ) {
      this.progressSpinner = true;

      postedViewModel.CustomerId = this.contract.CustomerId;
      postedViewModel.ContractId = this.contract.Id;
      postedViewModel.DocumentDate = this._datePipe.transform(
        postedViewModel.DocumentDate
      );
      postedViewModel.CreditCardTypeId = postedViewModel.CreditCardType
        ? postedViewModel.CreditCardType.Id
        : null;
      postedViewModel.BankAccountId = postedViewModel.BankAccount
        ? postedViewModel.BankAccount.Id
        : null;
      postedViewModel.CashBoxId = postedViewModel.CashBox
        ? postedViewModel.CashBox.Id
        : null;

      this._downpaymentReceipt.create(postedViewModel).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.form.reset();
            this.OnComplete.emit();
          }
        },
        null,
        () => {
          this.progressSpinner = false;
        }
      );
    }
  }

  skipDownpayment(contractId) {
    this.progressSpinner = true;

    if (!this.form.get("IsTermAgreements").value) {
      this.progressSpinner = false;
      this.skipClicked = true;
      this.globalService.messageAlert(
        MessageType.Error,
        "App.Messages.TermAgreements",
        true
      );
      return;
    }

    this._downpaymentReceipt.skipDownPayment(contractId).subscribe(
      (result: IServiceResult) => {
        this.progressSpinner = false;
        if (result.isSuccess) {
          this.submitted = false;
          this.skipClicked = false;

          this.form.reset();
          this.OnComplete.emit();
        }
      },
      () => (this.progressSpinner = false),
      () => {
        this.progressSpinner = false;
      }
    );
  }

  filterArray(event, arrayObject: any) {
    this.filteredArray = [];

    for (let i = 0; i < arrayObject.length; i++) {
      const item = arrayObject[i];
      let itemFullName = item.FullArabicName;
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
      this.form.get("CreditCardType").enable();
      this.form.get("CashBoxAmount").enable();
      this.form.get("CashBoxAmount").setValidators([Validators.required]);
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
    this.calculate();
  }

  calculate() {
    const ContractDownPaymentAmount = this.form.get("ContractDownPaymentAmount")
      .value;
    const ContractInsuranceAmount = this.form.get("ContractInsuranceAmount")
      .value;
    const EscapeInsuranceAmount = this.form.get("EscapeInsuranceAmount").value;
    // const BankDepositAmount = this.form.get('BankDepositAmount').value;
    // const CashBoxAmount = this.form.get('CashBoxAmount').value;
    this.totalVal =
      parseFloat(ContractDownPaymentAmount ? ContractDownPaymentAmount : 0) +
      parseFloat(EscapeInsuranceAmount ? EscapeInsuranceAmount : 0) +
      parseFloat(ContractInsuranceAmount ? ContractInsuranceAmount : 0);
  }

  reset() {
    this.Oncancel.emit();
    this.form.reset();
    this.downpayment = 0;
    this.totalVal = 0;
    this.submitted = false;
  }
}

import { Component, OnInit } from "@angular/core";
import { CreditNoteService } from "../../../services/credit-note.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { IServiceResult } from "@shared/interfaces/results";
import { CustomerService } from "@shared/services/customer.service";
import { ContractService } from "@shared/services/contract.service";
import { SalesPeriodService } from "src/app/master-data/services/sales-period.service";
import { CostCenterService } from "@shared/services/cost-center.service";
import { Settlement } from "src/app/receipts/models/credit-notes/settlement.model";

@Component({
  selector: "app-create-credit-note",
  templateUrl: "./create-credit-note.component.html",
  styleUrls: ["./create-credit-note.component.scss"],
})
export class CreateCreditNoteComponent implements OnInit {
  vouchersCols: any[] = [];
  form: FormGroup;
  viewModel: any;
  filteredArray: any[];
  submitted: Boolean;
  progressSpinner: boolean;
  toYear = new Date().getFullYear() + 5;
  Contracts: any;
  vouchers: any[];
  selectedVoucher: any;
  settlementCols: any[];
  settlements: any[];
  selectedItem: any;
  costElementCols: any[] = [];
  costElements: any[] = [];
  AllCostElements: any[] = [];
  DebitNoteCostElements: any[] = [];
  NetVal: number;
  NetValAfterTax: number;
  TotalTaxAmount: number;
  Amount: number;
  selected: Boolean;
  paidValue: number;
  added: boolean;
  currentSettlement: any;
  filteredVouchers: any[];
  voucherType: any;
  minDateValue: any;
  sectorId: string;

  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _creditNoteService: CreditNoteService,
    private _customerService: CustomerService,
    private _costCenterService: CostCenterService,
    private _salesPeriodService: SalesPeriodService
  ) {
    this.settlements = [];
    this.voucherType = 'CR';
  }

  ngOnInit() {
    this.sectorId = this._globalService.getSectorType();
    this.createForm();
    this.getCostElements();
    this.defCols();
    this._salesPeriodService.getMinSelectedDate(this.sectorId).subscribe(
      res => {
        this.minDateValue = new Date(res);
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
    this.costElementCols = [
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

  getCostElements() {
    this._creditNoteService.getCostElements().subscribe(
      (res: any) => {
        this.AllCostElements = res;
      }
    )
  }

  createForm() {
    this.form = this._formBuilder.group({
      DocumentDate: ["", Validators.required],
      RefNumber: [""],
      Customer: ["", Validators.required],
      Contract: [{ value: "", disabled: true }, Validators.required],
      ArabicRemarks: [""],
    });
  }

  onSelectVoucherType() {
    if (this.vouchers) {
      this.filteredVouchers = this.vouchers.filter(
        (v) => v.voucherTypeId === this.voucherType
      );
      this.selectedVoucher = undefined;
    }
  }

  createCreditNote() {
    this.submitted = true;
    let totalSetteled = 0;
    this.settlements.forEach((item) => {
      totalSetteled += item.paidAmount;
    });

    if (this.form.valid && this.settlements.length > 0 && this.costElements.length > 0) {
      if (this.NetValAfterTax != totalSetteled) {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.SettlementValueNotEqualToNoteValue"
          )
        );
        return;
      }
      if (this.NetVal <= 0) {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.NetValMoreThanPaid"
          )
        );
        return;
      }

      this.progressSpinner = true;
      const postedViewModel = Object.assign({}, this.form.value);
      postedViewModel.CustomerId = this.form.value.Customer.id;

      postedViewModel.DocumentDate = this._datePipe.transform(
        postedViewModel.DocumentDate, 'yyyy-MM-ddTHH:mm:ss'
      );
      postedViewModel.PaymentsTransactions = this.settlements;
      postedViewModel.costElements = this.costElements;
      postedViewModel.NetValue = this.NetVal;
      postedViewModel.EntityCode = postedViewModel.Contract.entityCode;
      postedViewModel.SectorTypeId = this.sectorId;

      this._creditNoteService.create(postedViewModel).subscribe(
        (result: IServiceResult) => {
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
            this._router.navigate(["/finance/receipts/credit-notes"]);
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
    this._creditNoteService
      .getVouchers(event.entityCode)
      .subscribe((result: any) => {
        this.progressSpinner = false;
        this.vouchers = result;
        this.onSelectVoucherType();
      });
  }

  addSettlement() {
    this.added = true;
    if (this.selectedVoucher && this.paidValue > 0) {
      debugger
      const settlement:Settlement = {
        id: this.selectedVoucher.id,
        voucherCode:this.selectedVoucher.voucherCode,
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
          (e:Settlement) =>
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

        let totalSetteled = 0;
        this.settlements.forEach((item) => {
          totalSetteled += item.PaidAmount;
        });

        if (totalSetteled + settlement.paidAmount > this.NetValAfterTax) {
          this._globalService.messageAlert(
            MessageType.Warning,
            this._globalService.translateWordByKey(
              "Receipts.Messages.SettlementValueNotEqualToNoteValue"
            )
          );
          return;
        }
        this.settlements.push(settlement);
      } else {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.RepeatedVoucher"
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
        s.id === settlement.id &&
        s.debitReceivableTypeId === settlement.debitReceivableTypeId
    );
    if (settlement.paidAmount > settlement.canBePay) {
      this.settlements[itemIndex] = this.currentSettlement;
      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey(
          "Receipts.Messages.TotalPaidMoreThanBalance"
        )
      );
      return;
    }
    if (settlement.paidAmount <= 0) {
      this.settlements[itemIndex] = this.currentSettlement;
      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey(
          "Receipts.Messages.PaidMoreThanZero"
        )
      );
      return;
    }
    let totalSetteled = 0;
    this.settlements.forEach((item, index) => {
      if (index !== itemIndex) {
        totalSetteled += item.paidAmount;
      }
    });
    if (totalSetteled + settlement.paidAmount != this.NetValAfterTax) {
      this.settlements[itemIndex] = this.currentSettlement;

      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey(
          "Receipts.Messages.SettlementValueNotEqualToNoteValue"
        )
      );
      return;
    }
  }

  addCostElement() {

    this.selected = true;
    if (this.Amount > 0 && this.selectedItem) {
      if (
        this.costElements.find((e) => e.id === this.selectedItem.id) ===
        undefined
      ) {
        const costElement = Object.assign({}, this.selectedItem);
        costElement.TaxRatio = this.selectedItem.tax.taxRatio;
        costElement.Amount = ((this.Amount * 100) / (100 + costElement.TaxRatio)).toFixed(4);
        costElement.TaxAmount = (this.Amount - costElement.Amount).toFixed(4);

        this.costElements.push(costElement);
        this.selected = false;
        this.calculateCreditNote();
      } else {
        this._globalService.messageAlert(
          MessageType.Error,
          this._globalService.translateWordByKey(
            "Receipts.Messages.ThisElementExist"
          )
        );
      }
    }
  }

  onSelectItem(item) {
    this.selectedItem = item;
  }

  calculateCreditNote() {

    this.NetVal = Number(
      Number(this.costElements.reduce((sum, current) => sum + Number(current.Amount), 0)).toFixed(4)
    );
    this.TotalTaxAmount = Number(
      Number(this.costElements.reduce((sum, current) => sum + Number(current.TaxAmount), 0)).toFixed(4)
    );
    this.NetValAfterTax = Number((this.NetVal + this.TotalTaxAmount).toFixed(4));
  }

  Clear() {
    this.selectedItem = null;
  }

  removeItem(item) {
    this.costElements.splice(this.costElements.indexOf(item, 0), 1);
    this.calculateCreditNote();
  }

  onClear(event: any) {
    this.form.controls[event].setValue(null);
  }

  calculateCreditNoteWithCostElements(id) {
    this.costElements.find((i) => i.Id === id).TaxAmount =
      ((Number(this.costElements.find((i) => i.Id === id).TaxRatio) *
        Number(this.costElements.find((i) => i.Id === id).Amount)) /
        100).toFixed(4);
    this.calculateCreditNote();
  }

  onlyTwoPrecsionDigits(event): boolean {
    var value = event.target.value;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31) {
      var number = value.split('.');
      if (number[1] &&
        number[1].length >= 2) {
        return false
      }
    }
    return true;
  }

  filterArray(event, arrayObject: any, ColName = "FullName") {
    this.filteredArray = [];
    if (arrayObject) {
      for (let i = 0; i < arrayObject.length; i++) {
        const item = arrayObject[i];
        var itemFullName = item[ColName];

        itemFullName = itemFullName.replace(/\s/g, "").toLowerCase();
        var queryString = event.query.replace(/\s/g, "").toLowerCase();
        if (itemFullName.indexOf(queryString) >= 0) {
          this.filteredArray.push(item);
        }
      }
    }
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
    this.onSelectVoucherType();
  }
}
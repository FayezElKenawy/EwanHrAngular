import { Component, OnInit } from "@angular/core";
import { CreditNoteService } from "../../../services/credit-note.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { CustomerService } from "@shared/services/customer.service";
import { SalesPeriodService } from "src/app/master-data/services/sales-period.service";
import { CostCenterService } from "@shared/services/cost-center.service";
import { SettlementModel } from "src/app/receipts/models/creditNote/settlement.model";
import { VoucherType } from "src/app/receipts/enum/voucher-type.enum";
import { CreateCreditNoteModel } from "src/app/receipts/models/creditNote/create-creditNote.model";
import { GetCostElementListModel } from "src/app/receipts/models/costelement/get-cost-element-list.model";
import { CreateCostElementItemModel } from "src/app/receipts/models/costelement/create-cost-element-item.model";
import { GetCostCenterListModel } from "src/app/receipts/models/costCenter/cost-center.model";
import { ColumnType } from "@shared/models/column-type.model";

@Component({
  selector: "app-create-credit-note",
  templateUrl: "./create-credit-note.component.html",
  styleUrls: ["./create-credit-note.component.scss"],
})
export class CreateCreditNoteComponent implements OnInit {

  vouchersCols: ColumnType[];
  vouchers: SettlementModel[];
  selectedVoucher: SettlementModel;
  filteredVouchers: SettlementModel[];
  voucherType: string = VoucherType.CreditInvoice;

  settlementCols: ColumnType[];
  settlements: SettlementModel[];
  currentSettlement: SettlementModel;

  costElementCols: ColumnType[];
  costElements: CreateCostElementItemModel[] = [];
  allCostElements: CreateCostElementItemModel[] = [];
  selectedItem: CreateCostElementItemModel;

  netVal: number;
  netValAfterTax: number;
  totalTaxAmount: number;
  amount: number;
  selected: boolean;
  paidValue: number;
  added: boolean;
  minDateValue: any;

  form: FormGroup;
  submittedObjectModel: CreateCreditNoteModel;
  filteredArray: any[];
  submitted: boolean;
  toYear = new Date().getFullYear() + 5;

  costCenters: GetCostCenterListModel[];

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
  }

  ngOnInit() {

    this.createForm();
    this.getCostElements();
    this.defCols();
    this._salesPeriodService.getMinSelectedDate(this._globalService.getSectorType()).subscribe(
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
        field: "amount",
        header: "Receipts.Fields.CostElementAmount"
      },

      {
        field: "taxRatio",
        header: "Receipts.Fields.TaxRatio"
      },
      {
        field: "taxAmount",
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
      { field: "paidAmount", header: "Receipts.Fields.Value", hidden: false },
      { field: "ActionButtons", header: "", hidden: false },
    ];
  }

  getCostElements() {
    this._creditNoteService.getCostElements().subscribe(
      (res: any) => {
        this.allCostElements = res;
      }
    )
  }

  createForm() {
    this.form = this._formBuilder.group({
      documentDate: ["", Validators.required],
      refNumber: [""],
      customer: ["", Validators.required],
      costCenter: [{ value: "", disabled: true }, Validators.required],
      arabicRemarks: [""],
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
      if (this.netValAfterTax != totalSetteled) {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.SettlementValueNotEqualToNoteValue"
          )
        );
        return;
      }
      if (this.netVal <= 0) {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.NetValMoreThanPaid"
          )
        );
        return;
      }

      this.submittedObjectModel = Object.assign({}, this.form.value);
      this.submittedObjectModel.customerId = this.form.value.customer.id;

      this.submittedObjectModel.documentDate = this._datePipe.transform(
        this.submittedObjectModel.documentDate, 'yyyy-MM-ddTHH:mm:ss'
      );
      this.submittedObjectModel.paymentsTransactions = this.settlements;
      this.submittedObjectModel.costElements = this.costElements;
      this.submittedObjectModel.netValue = this.netVal;
      this.submittedObjectModel.entityCode = this.form.value.costCenter.entityCode;
      this.submittedObjectModel.sectorTypeId = this._globalService.getSectorType();
      this.submittedObjectModel.totalTaxAmount = this.totalTaxAmount;

      this._creditNoteService.create(this.submittedObjectModel).subscribe(
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
            this._router.navigate(["/finance/receipts/credit-notes"]);
          }
        },
        null,

      );
    }
  }

  searchCustomers(event: any) {
    this._customerService
      .getCustomersBySectorId(this._globalService.getSectorType(), event.query)
      .subscribe((result) => {
        this.filteredArray = [];
        this.filteredArray = result;
      });
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

  onSelectCostCenter(event) {
    this.settlements = [];
    this.vouchers = [];
    this.selectedVoucher = undefined;
    this._creditNoteService
      .getVouchers(event.entityCode)
      .subscribe((result: any) => {
        this.vouchers = result;
        this.onSelectVoucherType();
      });
  }

  addSettlement() {
    this.added = true;
    if (this.selectedVoucher && this.paidValue > 0) {
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

        let totalSetteled = 0;
        this.settlements.forEach((item) => {
          totalSetteled += item.paidAmount;
        });

        if (totalSetteled + settlement.paidAmount > this.netValAfterTax) {
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
        s.debitReceivableVoucherTypeId === settlement.debitReceivableTypeId
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
    if (totalSetteled + settlement.paidAmount != this.netValAfterTax) {
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
    if (this.amount > 0 && this.selectedItem) {
      if (
        this.costElements.find((e) => e.id === this.selectedItem.id) ===
        undefined
      ) {

        const costElement:CreateCostElementItemModel = Object.assign({}, this.selectedItem);
        costElement.taxRatio = this.selectedItem.taxRatio;
        costElement.amount =Number(((this.amount * 100) / (100 + costElement.taxRatio)).toFixed(4));
        costElement.taxAmount =Number((this.amount - costElement.amount).toFixed(4));

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
    this.netVal = Number(
      Number(this.costElements.reduce((sum, current) => sum + Number(current.amount), 0)).toFixed(4)
    );
    this.totalTaxAmount = Number(
      Number(this.costElements.reduce((sum, current) => sum + Number(current.taxAmount), 0)).toFixed(4)
    );
    this.netValAfterTax = Number((this.netVal + this.totalTaxAmount).toFixed(4));
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
    this.costElements.find((elem) => elem.id === id).taxAmount = Number(
      ((Number(this.costElements.find((i) => i.id === id).taxRatio) *
        Number(this.costElements.find((i) => i.id === id).amount)) /
        100).toFixed(4));
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
    this.onSelectVoucherType();
  }
}

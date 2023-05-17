import { Component, OnInit } from "@angular/core";
import { CreditNoteService } from "../credit-note.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { IServiceResult } from "@shared/interfaces/results";

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

  constructor(
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _datePipe: DatePipe,
    private _router: Router,
    private _creditNoteService: CreditNoteService
  ) {
    this.settlements = [];
    this.voucherType = 'CR';
  }

  ngOnInit() {
    this.createForm();
    this.getCreatFormData();

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
        hidden: false
      },
    ];
    this.costElementCols = [
      { field: "Id", header: "Sales.Fields.CostElementId", hidden: false },
      {
        field: "Name",
        header: "Sales.Fields.CostElementName",
        hidden: false,
      },
      {
        field: "Amount",
        header: "Sales.Fields.CostElementAmount",
        hidden: false,
      },

      { field: "TaxRatio", header: "Sales.Fields.TaxRatio", hidden: false },
      { field: "TaxAmount", header: "Sales.Fields.TaxAmount", hidden: false },
      { field: "ActionButtons", header: "", hidden: false },
    ];
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
        field: "CurrentBalance",
        header: "Receipts.Fields.CurrentBalance",
        hidden: false
      },
      {
        field: "NetValueAfterTax",
        header: "Receipts.Fields.ReciptValue",
        hidden: false,
      },
      {
        field: "CanBePay",
        header: "Receipts.Fields.CanPay",
        hidden: false
      },
      { field: "PaidAmount", header: "Receipts.Fields.Value", hidden: false },
      { field: "ActionButtons", header: "", hidden: false },
    ];
  }

  getCreatFormData() {
    this.progressSpinner = true;

    this._creditNoteService.getCreate().subscribe((result: IServiceResult) => {
      this.viewModel = result.data;
      this.progressSpinner = false;

      this.form
        .get("DocumentDate")
        .setValue(
          new Date(this.viewModel.CurrentDate)
        );

        this.minDateValue = new Date(this.viewModel.MinSelectableDate);
    });
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
    if(this.vouchers){
      this.filteredVouchers = this.vouchers.filter(
        (v) => v.VoucherTypeId === this.voucherType
      );
      this.selectedVoucher = undefined;
    }  
  }

  createCreditNote() {
    this.submitted = true;
    let totalSetteled = 0;
    this.settlements.forEach((item) => {
      totalSetteled += item.PaidAmount;
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
      postedViewModel.CustomerId = postedViewModel.Customer.Id;
      postedViewModel.ContractId = postedViewModel.Contract.Id;
      postedViewModel.DocumentDate = this._datePipe.transform(
        postedViewModel.DocumentDate
      );
      postedViewModel.PaymentsTransactions = this.settlements;
      postedViewModel.costElements = this.costElements;
      postedViewModel.NetValue = this.NetVal;
      this._creditNoteService.create(postedViewModel).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.form.reset();
            // this.Oncancel.emit();
            this._router.navigate(["/receipts/credit-notes"]);
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
      this._creditNoteService
        .SearchCustomer(event.query)
        .subscribe((result: IServiceResult) => {
          this.filteredArray = [];
          this.filteredArray = result.data;
        });
    }, 1500);
  }

  onSelectCustomer(event: any) {
    this.progressSpinner = true;
    this.settlements = [];
    this.vouchers = [];
    this.selectedVoucher = undefined;
    this._creditNoteService
      .getContractShortList(event.Id)
      .subscribe((result: IServiceResult) => {
        this.progressSpinner = false;
        this.filteredArray = [];
        this.filteredArray = result.data;
        this.Contracts = result.data;
        if (result.data.length > 0) {
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
      .getVouchers(event.Id)
      .subscribe((result: IServiceResult) => {
        this.progressSpinner = false;
        this.vouchers = result.data;
        
        this.onSelectVoucherType();
      });
  }

  addSettlement() {
    
    this.added = true;
    if (this.selectedVoucher && this.paidValue > 0) {
      const settlement = {
        Id: this.selectedVoucher.Id,
        DebitReceivableIdFK: this.selectedVoucher.Id,
        DebitReceivableId: this.selectedVoucher.VoucherId,
        DebitReceivableTypeId: this.selectedVoucher.VoucherTypeId,
        PaidAmount: this.paidValue,
        NetValueAfterTax: this.selectedVoucher.NetValueAfterTax,
        VoucherTypeArabicName: this.selectedVoucher.VoucherTypeArabicName,
        CurrentBalance: this.selectedVoucher.CurrentBalance,
        CanBePay: this.selectedVoucher.CurrentBalance,
      };

      if (
        this.settlements.find(
          (e) =>
            e.Id === settlement.Id &&
            e.DebitReceivableTypeId === settlement.DebitReceivableTypeId
        ) === undefined
      ) {
        if (this.selectedVoucher.CurrentBalance < settlement.PaidAmount) {
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

        if (totalSetteled + settlement.PaidAmount > this.NetValAfterTax) {
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
        s.Id === settlement.Id &&
        s.DebitReceivableTypeId === settlement.DebitReceivableTypeId
    );
    if (settlement.PaidAmount > settlement.CanBePay) {
      this.settlements[itemIndex] = this.currentSettlement;
      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey(
          "Receipts.Messages.TotalPaidMoreThanBalance"
        )
      );
      return;
    }
    if (settlement.PaidAmount <= 0) {
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
        totalSetteled += item.PaidAmount;
      }
    });
    if (totalSetteled + settlement.PaidAmount != this.NetValAfterTax) {
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
        this.costElements.find((e) => e.Id === this.selectedItem.Id) ===
        undefined
      ) {
        const costElement = Object.assign({}, this.selectedItem);
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
    var value =event.target.value;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31) {
      var number =value.split('.');
      if(number[1] &&
         number[1].length>=2){
        return false
      }
    }   
    return true;
  }

  filterArray(event, arrayObject: any, ColName = "FullName") {
    this.filteredArray = [];

    if(arrayObject){
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

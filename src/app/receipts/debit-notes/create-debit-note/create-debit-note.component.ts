import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { IServiceResult } from "@shared/interfaces/results";
import { DebitNoteService } from "../debit-note.service";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { GlobalService, MessageType } from "@shared/services/global.service";

declare let $: any;

@Component({
  selector: "app-create-debit-note",
  templateUrl: "./create-debit-note.component.html",
  styleUrls: ["./create-debit-note.component.scss"],
})
export class CreateDebitNoteComponent implements OnInit {
  form: FormGroup;

  viewModel: any;
  filteredArray: any[];
  submitted: Boolean;
  progressSpinner: boolean;
  currentYear = new Date().getFullYear() + 5;
  Contracts: any;
  @Output() refresh: EventEmitter<any> = new EventEmitter();
  selectedItem: any;
  costElementCols: any[] = [];
  costElements: any[] = [];
  DebitNoteCostElements: any[] = [];
  NetVal: number;
  NetValAfterTax: number;
  MonthlyCost: number;
  TotalTaxAmount: number;
  Amount: number;
  selected: Boolean;
  ValidFromMaxDate: Date;
  ValidToMinDate: Date;
  minDateValue: any;

  constructor(
    private _debitNoteService: DebitNoteService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _datePipe: DatePipe,
    private _globalService: GlobalService
  ) {}

  ngOnInit() {
    this.createForm();
    this.getCreatFormData();
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
  }

  getCreatFormData() {
    this.progressSpinner = true;

    this._debitNoteService
      .getCreatePage()
      .subscribe((result: IServiceResult) => {
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

  searchCustomers(event: any) {
    setTimeout(() => {
      this._debitNoteService
        .SearchCustomer(event.query)
        .subscribe((result: IServiceResult) => {
          this.filteredArray = [];
          this.filteredArray = result.data;
        });
    }, 1500);
  }

  createForm() {
    this.form = this._formBuilder.group({
      Id: [""],
      DocumentDate: ["", Validators.required],
      RefNumber: [""],
      Customer: ["", Validators.required],
      Contract: [{ value: "", disabled: true }, Validators.required],
      ArabicRemarks: [""],
    });
  }

  createDebitNote() {
    this.submitted = true;
    if (!this.form.controls.Contract.value) {
      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey(
          "Receipts.Messages.SelectContract"
        )
      );
      return;
    }
    if (this.form.valid) {
      if (this.costElements.length === 0) {
        this._globalService.messageAlert(
          MessageType.Warning,
          this._globalService.translateWordByKey(
            "Receipts.Messages.ValLessThanZero"
          )
        );
        return;
      }
      this.progressSpinner = true;
      const debitNote = Object.assign({}, this.form.value);
      debitNote.DocumentDate = this._datePipe.transform(debitNote.DocumentDate);
      debitNote.CustomerId = debitNote.Customer.Id;
      debitNote.ContractId = debitNote.Contract.Id;
      debitNote.TotalTaxAmount = this.TotalTaxAmount;
      debitNote.NetValAfterTax = this.NetValAfterTax;
      debitNote.NetValue = this.NetVal;
      debitNote.CostElements = this.costElements;
      
      this._debitNoteService.create(debitNote).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            $("#createModal").modal("hide");
            this._router.navigate(["/individual/receipts/debit-notes"]);
            this.submitted = false;
            this.form.reset();
            this.refresh.emit();
          }
        },
        null,
        () => (this.progressSpinner = false)
      );
    }
  }

  resetForm() {
    this.form.reset();
    this.submitted = false;
  }

  addCostElement() {
    this.selected = true;
    if (this.Amount > 0 && this.selectedItem) {
      if (
        this.costElements.find((e) => e.Id === this.selectedItem.Id) ===
        undefined
      ) {
        const costElement = Object.assign({}, this.selectedItem);
        costElement.Amount = this.Amount;
        costElement.TaxAmount = (this.Amount * costElement.TaxRatio) / 100;
        this.costElements.push(costElement);
        this.selected = false;
        this.calculateDebitNote();
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

  calculateDebitNote() {
    this.NetVal = Number(
      this.costElements.reduce((sum, current) => sum + current.Amount, 0)
    );
    this.TotalTaxAmount = Number(
      this.costElements.reduce((sum, current) => sum + current.TaxAmount, 0)
    );
    this.NetValAfterTax = Number(this.NetVal) + Number(this.TotalTaxAmount);
  }

  removeItem(item) {
    this.costElements.splice(this.costElements.indexOf(item, 0), 1);
    this.calculateDebitNote();
  }

  onClear(event: any) {
    this.form.controls[event].setValue(null);
  }

  calculateDebitNoteWithCostElements(id) {
    this.costElements.find((i) => i.Id === id).TaxAmount =
      (Number(this.costElements.find((i) => i.Id === id).TaxRatio) *
        Number(this.costElements.find((i) => i.Id === id).Amount)) /
      100;
    this.calculateDebitNote();
  }
  
  onSelectCustomer(event: any) {
    this.progressSpinner = true;
    this._debitNoteService
      .getContractShortList(event.Id)
      .subscribe((result: IServiceResult) => {
        this.progressSpinner = false;
        this.filteredArray = [];
        this.filteredArray = result.data;

        this.Contracts = result.data;
        if (result.data.length > 0) {
          this.form.controls.Contract.enable();
        } else {
          this.form.controls.Contract.setValue("");
          this.form.controls.Contract.disable();
        }
      });
  }

  Clear() {
    this.selectedItem = null;
  }

  filterArray(event, arrayObject: any, ColName = "FullName") {
    this.filteredArray = [];

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

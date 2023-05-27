import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { IServiceResult } from "@shared/interfaces/results";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DebitNoteService } from "src/app/receipts/services/debit-note.service";
import { CustomerService } from "@shared/services/customer.service";
import { CostCenterService } from "@shared/services/cost-center.service";
import { SalesPeriodService } from "src/app/master-data/services/sales-period.service";
import { CostElementService } from "src/app/receipts/services/cose-element.service";

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
  sectorId:string;
  allCostElements:any[]=[];
  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _datePipe: DatePipe,
    private _globalService: GlobalService,
    private _debitNoteService: DebitNoteService,
    private _customerService: CustomerService,
    private _costCenterService: CostCenterService,
    private _salesPeriodService: SalesPeriodService,
    private _costElementService:CostElementService
  ) { }

  ngOnInit() {

    this.sectorId=this._globalService.getSectorType();
    this.createForm();
    this.defCols();
    this.getCostElements();
  }

  defCols() {
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
  }


  searchCustomers(event: any) {
      this._customerService
        .getCustomersBySectorId(this.sectorId,event.query)
        .subscribe((result) => {
          this.filteredArray = [];
          this.filteredArray = result;
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

  getCostElements() {
    this._costElementService.getCostElements().subscribe(
      (res: any) => {
        this.allCostElements = res;
      }
    )
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
      const debitNote = Object.assign({}, this.form.value);
      debitNote.DocumentDate = this._datePipe.transform(
        debitNote.DocumentDate, 'yyyy-MM-ddTHH:mm:ss'
      );

      debitNote.CustomerId = this.form.value.Customer.id;
      debitNote.TotalTaxAmount = this.TotalTaxAmount;
      debitNote.NetValAfterTax = this.NetValAfterTax;
      debitNote.NetValue = this.NetVal;
      debitNote.CostElements = this.costElements;
      debitNote.EntityCode = debitNote.Contract.entityCode;
      debitNote.SectorTypeId = this.sectorId;


      this._debitNoteService.create(debitNote).subscribe(
        (result) => {
          if (result) {
            $("#createModal").modal("hide");

            this._globalService.messageAlert(
              MessageType.Success,
              this._globalService.translateWordByKey(
                "Receipts.Messages.EditSuccessFully"
              )
            );
            this._router.navigate(["/finance/receipts/debit-notes"]);
            this.submitted = false;
            this.form.reset();
            this.refresh.emit();
          }
        },
        null,
      );
    }
  }

  resetForm() {
    this.form.reset();
    this.submitted = false;
  }

  addCostElement() {
    debugger
    this.selected = true;
    if (this.Amount > 0 && this.selectedItem) {
      if (
        this.costElements.find((e) => e.id === this.selectedItem.id) ===
        undefined
      ) {
        const costElement = Object.assign({}, this.selectedItem);
        costElement.Amount = this.Amount;
        costElement.TaxAmount = (this.Amount * costElement.tax.taxRatio) / 100;
        costElement.TaxRatio = costElement.tax.taxRatio
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
      Number(this.costElements.reduce((sum, current) => sum + Number(current.Amount), 0)).toFixed(4)
    );
    this.TotalTaxAmount =  Number(
      Number(this.costElements.reduce((sum, current) => sum + Number(current.TaxAmount), 0)).toFixed(4)
    );
    this.NetValAfterTax = Number((this.NetVal + this.TotalTaxAmount).toFixed(4));
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

    this._costCenterService
      .getAll(event.code)
      .subscribe((result) => {
        this.progressSpinner = false;
        this.filteredArray = [];
        this.filteredArray = result;

        this.Contracts = result;
        if (result.length > 0) {
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

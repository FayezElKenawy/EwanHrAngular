import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { BundleService } from "../bundle.service";
import { IServiceResult } from "@shared/interfaces/results";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { Router, Data } from "@angular/router";

declare let $: any;

@Component({
  selector: "app-create-bundle",
  templateUrl: "./create-bundle.component.html",
  styleUrls: ["./create-bundle.component.scss"],
})
export class CreateBundleComponent implements OnInit {
  form: FormGroup;
  bundle: any;
  toYear = new Date().getFullYear() + 5;
  minDate: Date = new Date();
  minActivationDate: Date = new Date();
  submitted: Boolean;
  progressSpinner: boolean;
  filteredArray: any[];
  viewModel: any;
  @Output() refresh: EventEmitter<any> = new EventEmitter();
  selectedItem: any;
  costElementCols: any[] = [];
  costElements: any[] = [];
  bundleCostElements: any[] = [];
  NetVal: number;
  NetValAfterTax: number;
  MonthlyCost: number;
  TotalTaxAmount: number;
  Amount: number;
  selected: Boolean;
  NonDeductible: boolean;
  ValidFromMaxDate: Date;
  ValidToMinDate: Date;
  constructor(
    private _bundleService: BundleService,
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.progressSpinner = true;
    this._bundleService.getForCreate().subscribe((result: IServiceResult) => {
      this.viewModel = result.data;
      this.progressSpinner = false;
    });
    this.createForm();
    this.costElementCols = [
      { field: "Id", header: "Sales.Fields.CostElementId", hidden: false },
      {
        field: "ArabicName",
        header: "Sales.Fields.CostElementName",
        hidden: false,
      },
      {
        field: "Amount",
        header: "Sales.Fields.CostElementAmount",
        hidden: false,
      },
      // {
      //   field: "NonDeductible",
      //   header: "Sales.Fields.NonDeductible",
      //   hidden: false,
      // },
      { field: "TaxRatio", header: "Sales.Fields.TaxRatio", hidden: false },
      { field: "TaxAmount", header: "Sales.Fields.TaxAmount", hidden: false },
      { field: "ActionButtons", header: "", hidden: false },
    ];
  }

  createForm() {
    this.form = this._formBuilder.group({
      ArabicName: ["", Validators.required],
      NationalityId: ["", Validators.required],
      ProfessionId: ["", Validators.required],
      Period: [
        "",
        [Validators.required, Validators.min(1), Validators.pattern(`^\\d+$`)],
      ],
      NoInstallment: [
        "",
        [Validators.required, Validators.min(1), Validators.pattern(`^\\d+$`)],
      ],
      Downpayment: ["", [Validators.required, Validators.min(0.01)]],
      ValidFrom: [""],
      ValidTo: [""],
      EscapeInsuranceAmount: ["", Validators.required],
      ContractInsuranceAmount: ["",Validators.required],
      IsInactive: [false],
    });
  }

  createBundle() {
    this.submitted = true;
    if (this.form.valid && this.costElements.length > 0 && this.NetVal > 0) {
      const bundle = Object.assign({}, this.form.value);
      if (bundle.Period <= 0) {
        this._globalService.messageAlert(
          MessageType.Error,
          this._globalService.translateWordByKey(
            "Sales.Messages.BundlePeriodLessThanZero"
          )
        );
        return;
      }
      this.progressSpinner = true;
      bundle.BundleCostElements = this.costElements.map((b) => ({
        CostElementId: b.Id,
        Amount: b.Amount,
        NonDeductible: false ,//b.NonDeductible,
      }));
      bundle.ProfessionId = bundle.ProfessionId.Id;
      bundle.NationalityId = bundle.NationalityId.Id;

      this._bundleService.create(bundle).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            $("#createModal").modal("hide");
            this.submitted = false;
            this.form.reset();
            this.router.navigate(["sales/list-bundles"]);
          }
        },
        null,
        () => (this.progressSpinner = false)
      );
    }
  }
  DatesChanged() {
    this.ValidToMinDate = this.form.get("ValidFrom").value as Date;
    this.ValidFromMaxDate = this.form.get("ValidTo").value as Date;
  }
  resetForm() {
    this.form.reset();
    this.submitted = false;
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

  onClear(event: any) {
    this.form.controls[event].setValue(null);
  }

  calculateBundle() {
    this.NetVal = Number(
      this.costElements.reduce((sum, current) => sum + current.Amount, 0)
    );
    this.TotalTaxAmount = Number(
      this.costElements.reduce((sum, current) => sum + current.TaxAmount, 0)
    );
    this.NetValAfterTax = Number(this.NetVal) + Number(this.TotalTaxAmount);
    this.MonthlyCost =
      Number(this.NetValAfterTax) /
      Number(this.form.get("NoInstallment").value);
  }

  onSelectItem(item) {
    this.selectedItem = item;
    // if (this.selectedNationality && this.selectedProfession) {
    //   // this.progressSpinner = true;
    //   this._serviceRequestService
    //     .GetBundles(this.selectedNationality.Id, this.selectedProfession.Id)
    //     .subscribe((result: IServiceResult) => {
    //       this.bundles = result.data.Bundles;
    //       // this.progressSpinner = false;
    //     });
    // }
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
        costElement.NonDeductible = false;//this.NonDeductible;
        this.costElements.push(costElement);
        this.selected = false;
        this.calculateBundle();
      } else {
        this._globalService.messageAlert(
          MessageType.Error,
          this._globalService.translateWordByKey("Sales.Messages.ExistBundle")
        );
      }
    }
  }

  removeItem(item) {
    this.costElements.splice(this.costElements.indexOf(item, 0), 1);
    this.calculateBundle();
  }

  Clear() {
    this.selectedItem = null;
  }

  calculateBundleWithCostElements(id) {
    this.costElements.find((i) => i.Id === id).TaxAmount =
      (Number(this.costElements.find((i) => i.Id === id).TaxRatio) *
        Number(this.costElements.find((i) => i.Id === id).Amount)) /
      100;
    this.calculateBundle();
  }
}

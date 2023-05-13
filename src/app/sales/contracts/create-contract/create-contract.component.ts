import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";
import { ContractService } from "../contract.service";
import { IServiceResult } from "@shared/interfaces/results";
import { Router, ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { ContractPenalitiesComponent } from "../contract-penalities/contract-penalities.component";
import { GlobalService } from "@shared/services/global.service";

@Component({
  selector: "app-create-contract",
  templateUrl: "./create-contract.component.html",
  styleUrls: ["./create-contract.component.scss"]
})
export class CreateContractComponent implements OnInit {
  @ViewChild(ContractPenalitiesComponent) child: ContractPenalitiesComponent;
  form: FormGroup;
  viewModel: any;
  filteredArray: any[];
  submitted: Boolean;
  DateValidation: Boolean = false;
  progressSpinner: boolean;
  filteredArrayServer: any[];
  selectedLaborer: any;
  disableControl = false;
  currentYear = new Date().getFullYear() + 5;
  minSelectableDate: Date = new Date(); 

  constructor(
    private _contractService: ContractService,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _datePipe: DatePipe,
    private _globalService: GlobalService
  ) {}

  ngOnInit() {
    this.createForm();

    this.progressSpinner = true;
    this._activatedRoute.params.subscribe(params => {
      this._contractService.getCreate(params["id"]).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.viewModel = result.data;

            this.minSelectableDate = new Date(this.viewModel.MinSelectableDate);

            this.form
              .get("ContractDate")
              .setValue(
                new Date(this.viewModel.ContractDate)
              );
            if (
              this.viewModel.ContractDate <
              this.viewModel.ServiceRequestVM.ServiceRequestDate
            ) {
              this.form.disable();
              this.DateValidation = true;

              this.disableControl = true;
            }

            this.setFormValues();
            this.child.getCreate();
          } else {
            this.form.disable();
            this.disableControl = true;
          }
        },
        null,
        () => (this.progressSpinner = false)
      );
    });
  }

  createForm() {
    this.form = this._formBuilder.group({
      RefNumber: [""],
      ContractDate: ["", Validators.required],
      Period: new FormControl(
        { value: "", disabled: true },
        Validators.required
      ),
      LaborerReceptionDate: ["", Validators.required],
      ExpectedTerminationDate: new FormControl(
        { value: "", disabled: true },
        Validators.required
      ),
      SalesRepresentative: ["", Validators.required],
      Branch: [{ value: "", disabled: true }],
      NetValue: new FormControl(
        { value: "", disabled: true },
        Validators.required
      ),
      DiscountRatio: [{ value: "", disabled: true }],
      DiscountAmount: [{ value: "", disabled: true }],
      NetValueAfterDiscount: [{ value: "", disabled: true }],
      TaxAmount: new FormControl(
        { value: "", disabled: true },
        Validators.required
      ),
      NetValueAfterTax: [{ value: "", disabled: true }]
    });
  }

  setFormValues() {
    const discountAmount = this.viewModel.ServiceRequestVM.Customer
      .IsRatioDiscount
      ? (this.viewModel.ServiceRequestVM.Customer.CustomerDiscount *
          this.viewModel.ServiceRequestVM.Bundle.NetVal) /
        100
      : this.viewModel.ServiceRequestVM.Customer.CustomerDiscount;
    const DiscountRatio = this.viewModel.ServiceRequestVM.Customer
      .IsRatioDiscount
      ? this.viewModel.ServiceRequestVM.Customer.CustomerDiscount
      : (this.viewModel.ServiceRequestVM.Customer.CustomerDiscount /
          this.viewModel.ServiceRequestVM.Bundle.NetVal) *
        100;
    if (this.viewModel) {
      let taxRatio = this.viewModel.ServiceRequestVM.Bundle.TaxAmount / this.viewModel.ServiceRequestVM.Bundle.NetVal;
      let netValueAfterDiscount = this.viewModel.ServiceRequestVM.Bundle.NetVal - discountAmount;
      this.viewModel.ServiceRequestVM.Bundle.TaxAmount = netValueAfterDiscount * taxRatio;
      this.viewModel.ServiceRequestVM.Bundle.NetValAfterTax = netValueAfterDiscount + (netValueAfterDiscount * taxRatio);
      this.viewModel.ServiceRequestVM.Bundle.MonthlyCost = 
          (this.viewModel.ServiceRequestVM.Bundle.NetValAfterTax / this.viewModel.ServiceRequestVM.Bundle.NoInstallment).toFixed(4) ;
      this.form.patchValue({
        Period: this.viewModel.ServiceRequestVM.Bundle.Period,
        NetValue: this.viewModel.ServiceRequestVM.Bundle.NetVal,
        DiscountRatio: Number(DiscountRatio).toFixed(4),
        DiscountAmount: discountAmount,
        NetValueAfterDiscount: netValueAfterDiscount ,
        TaxAmount: this.viewModel.ServiceRequestVM.Bundle.TaxAmount,
        NetValueAfterTax:
          this.viewModel.ServiceRequestVM.Bundle.NetValAfterTax ,
        Branch: this.viewModel.ServiceRequestVM.Branch.ArabicName
      });

      // this.onDiscountInputChange(this.form.controls.DiscountAmount.value);
    }
  }

  createContract() {
    this.submitted = true;
    if (this.form.valid && this.child.isFormValid()) {
      this.progressSpinner = true;

      const contract = Object.assign({}, this.form.getRawValue());
      contract.SalesRepresentativeId = contract.SalesRepresentative.Id;
      contract.ServiceRequestId = this.viewModel.ServiceRequestVM.Id;
      contract.BundleId = this.viewModel.ServiceRequestVM.BundleId;

      contract.ContractDate = this._datePipe.transform(contract.ContractDate);
      contract.LaborerReceptionDate = this._datePipe.transform(
        contract.LaborerReceptionDate
      );
      contract.ExpectedTerminationDate = this._datePipe.transform(
        contract.ExpectedTerminationDate
      );

      this._contractService.create(contract).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.child.addContractPenalities(result.data, "create");
            this._router.navigate(["sales/list-contracts"]);
          }
        },
        null,
        () => (this.progressSpinner = false)
      );
    }
  }

  getSelectedItem(vm: any, id: any) {
    if (id) {
      return vm.filter(x => x.Id.toString() === id.toString())[0];
    }
    return null;
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

  onLaborerReceptionDateSelect(event: any) {
    const d = new Date(Date.parse(event));
    const expectedTerminationDate = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate() + this.form.controls.Period.value
    );
    this.form.controls.ExpectedTerminationDate.setValue(
      expectedTerminationDate
    );
  }

  onClear(controlName: string) {
    this.form.controls[controlName].setValue(null);
  }

  resetForm() {
    this.form.reset();
    this.submitted = false;
  }

  // adjustDate(date: any): Date {
  //   const d = new Date(Date.parse(date));
  //   return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  // }

  // search(event: any) {
  //   this._contractService
  //     .SearchLaborer(
  //       event.query,
  //       null,
  //       this.viewModel.ServiceRequestVM.Bundle.NationalityId,
  //       this.viewModel.ServiceRequestVM.Bundle.ProfessionId
  //     )
  //     .subscribe((result: IServiceResult) => {
  //       this.filteredArrayServer = [];
  //       this.filteredArrayServer = result.data.ShortLaborerFilesVM;
  //     });
  // }

  // onSelectLaborerFile(event: any) {
  //   // this.progressSpinner = true;
  //   this._contractService
  //     .GetLaborer(event.Id)
  //     .subscribe((result: IServiceResult) => {
  //       this.selectedLaborer = result.data;
  //       // this.progressSpinner = false;
  //     });
  // }

  // onDiscountInputChange(discount: any) {
  //   const tax = this.viewModel.ServiceRequestVM.Bundle.TaxRatio;
  //   const bundleNetVal = this.viewModel.ServiceRequestVM.Bundle.NetVal;
  //   const bundleNetValAfterDiscount =
  //     bundleNetVal - (bundleNetVal * discount) / 100;
  //   const contractNetAmount =
  //     bundleNetValAfterDiscount + (bundleNetValAfterDiscount * tax) / 100;
  //   this.form.controls.NetAmount.setValue(contractNetAmount);
  // }
}

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

@Component({
  selector: "app-edit-contract",
  templateUrl: "./edit-contract.component.html",
  styleUrls: ["./edit-contract.component.scss"]
})
export class EditContractComponent implements OnInit {
  @ViewChild(ContractPenalitiesComponent) child: ContractPenalitiesComponent;

  form: FormGroup;
  viewModel: any;
  filteredArray: any[];
  submitted: Boolean;
  progressSpinner: boolean;
  filteredArrayServer: any[];
  selectedLaborer: any;
  disableControl = false;
  currentYear = new Date().getFullYear() + 5;

  constructor(
    private _contractService: ContractService,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.createForm();

    this._activatedRoute.params.subscribe(params => {
      this.setFormValues(params["id"]);
    });
  }

  createForm() {
    this.form = this._formBuilder.group({
      Id: [""],
      RefNumber: [""],
      ContractDate: [{value:"",disabled:true}, Validators.required],
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

  setFormValues(id: number) {
    this.progressSpinner = true;
    this._contractService.getEdit(id).subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          this.viewModel = result.data;
          this.form.setValue({
            Id: this.viewModel.ContractSnapshotVM.Id,
            RefNumber: this.viewModel.ContractSnapshotVM.RefNumber,
            ContractDate: new Date(
              this.viewModel.ContractSnapshotVM.ContractDate
            ),
            Period: this.viewModel.ContractSnapshotVM.ContractTotalDays,
            LaborerReceptionDate: new Date(
              this.viewModel.ContractSnapshotVM.LaborerReceptionDate
            ),
            ExpectedTerminationDate: new Date(
              this.viewModel.ContractSnapshotVM.ExpectedTerminationDate
            ),
            SalesRepresentative: this.getSelectedItem(
              result.data.SalesRepresentativesShortVM,
              this.viewModel.ContractSnapshotVM.SalesRepresentativeId
            ), // this.viewModel.ContractSnapshotVM.SalesRepresentative,
            Branch: this.viewModel.ContractSnapshotVM.BranchName, // this.viewModel.ContractSnapshotVM.BranchesShortVM,
            NetValue: this.viewModel.ContractSnapshotVM.NetValue,
            DiscountRatio: this.viewModel.ContractSnapshotVM.DiscountRatio,
            DiscountAmount: this.viewModel.ContractSnapshotVM.DiscountAmount,
            NetValueAfterDiscount: this.viewModel.ContractSnapshotVM
              .NetValueAfterDiscount,
            TaxAmount: this.viewModel.ContractSnapshotVM.TaxAmount,
            NetValueAfterTax: this.viewModel.ContractSnapshotVM.NetValueAfterTax
          });

          this.child.getEdit(id);
          // this.selectedLaborer = this.viewModel.ContractSnapshotVM.LaborerFile;
        } else {
          this.form.disable();
          this.disableControl = true;
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }

  editContract() {
    this.submitted = true;

    if (this.form.valid && this.child.isFormValid()) {
      this.progressSpinner = true;

      const postedViewModel = Object.assign({}, this.form.getRawValue());
      postedViewModel.SalesRepresentativeId =
        postedViewModel.SalesRepresentative.Id;
      // postedViewModel.ContractSnapshotVM.BranchId = postedViewModel.ContractSnapshotVM.Branch.Id;
      postedViewModel.BundleId = this.viewModel.ContractSnapshotVM.BundleId;
      postedViewModel.ServiceRequestId = this.viewModel.ContractSnapshotVM.ServiceRequestId;

      postedViewModel.ContractDate = this._datePipe.transform(
        postedViewModel.ContractDate
      );
      postedViewModel.LaborerReceptionDate = this._datePipe.transform(
        postedViewModel.LaborerReceptionDate
      );
      postedViewModel.ExpectedTerminationDate = this._datePipe.transform(
        postedViewModel.ExpectedTerminationDate
      );
      postedViewModel.ContractStatusId = this.viewModel.ContractSnapshotVM.ContractStatusId;

      this._contractService.edit(postedViewModel).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.child.addContractPenalities(result.data, "edit");
            // this._router.navigate(['sales/list-contracts']);
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

  // search(event: any) {
  //   // this._contractService
  //   //   .SearchLaborer(
  //   //     event.query,
  //   //     this.viewModel.ContractSnapshotVM.LaborerFileId,
  //   //     this.viewModel.ContractSnapshotVM.Bundle.NationalityId,
  //   //     this.viewModel.ContractSnapshotVM.Bundle.ProfessionId
  //   //   )
  //   //   .subscribe((result: IServiceResult) => {
  //   //     this.filteredArrayServer = [];
  //   //     this.filteredArrayServer = result.data.ShortLaborerFilesVM;
  //   //   });
  // }

  // onSelectLaborerFile(event: any) {
  //   this._contractService
  //     .GetLaborer(event.Id)
  //     .subscribe((result: IServiceResult) => {
  //       this.selectedLaborer = result.data;
  //     });
  // }

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

  // onDiscountInputChange(discount: any) {
  //   const tax = this.viewModel.ContractSnapshotVM.Bundle.TaxRatio;
  //   const bundleNetVal = this.viewModel.ContractSnapshotVM.Bundle.NetVal;
  //   const bundleNetValAfterDiscount =
  //     bundleNetVal - (bundleNetVal * discount) / 100;
  //   const contractNetAmount =
  //     bundleNetValAfterDiscount + (bundleNetValAfterDiscount * tax) / 100;
  //   this.form.controls.NetAmount.setValue(contractNetAmount);
  // }

  resetForm() {
    this.form.reset();
    this.submitted = false;
  }

  // adjustDate(date: any): Date {
  //   const d = new Date(Date.parse(date));
  //   return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  // }
}

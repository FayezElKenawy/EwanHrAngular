import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { ContractExtentionService } from "../contract-extention.service";
import { ActivatedRoute, Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { IServiceResult } from "@shared/interfaces/results";
import { GlobalService, MessageType } from "@shared/services/global.service";

@Component({
  selector: "app-create-contract-extention",
  templateUrl: "./create-contract-extention.component.html",
  styleUrls: ["./create-contract-extention.component.scss"],
})
export class CreateContractExtentionComponent implements OnInit {
  form: FormGroup;
  viewModel: any;
  filteredArray: any[];
  submitted: Boolean;
  progressSpinner: boolean;
  selectedLaborer: any;
  disableControl = false;
  currentYear = new Date().getFullYear() + 5;
  constructor(
    private _contractExtentionService: ContractExtentionService,
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _datePipe: DatePipe,
    private _globalService: GlobalService
  ) {}

  ngOnInit() {
    this.createForm();
    const id = this._route.snapshot.paramMap.get("id");
    this.setFormValues(id);
  }

  createForm() {
    this.form = this._formBuilder.group({
      ContractId: ["", Validators.required],
      RefNumber: [""],
      ContractDate: ["", Validators.required],
      LaborerFile: ["", Validators.required],
      ContractTotalDays: new FormControl(
        { value: "", disabled: true },
        Validators.required
      ),
      LaborerReceptionDate: ["", Validators.required],
      ExpectedTerminationDate: new FormControl(
        { value: "", disabled: true },
        Validators.required
      ),
      SalesRepresentative: ["", Validators.required],
      Area: [{ value: "", disabled: true }],
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
      NetValueAfterTax: [{ value: "", disabled: true }],
    });
  }

  setFormValues(id: string) {
    this.progressSpinner = true;
    this._contractExtentionService.getCreate(id).subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          this.viewModel = result.data;
          this.form.patchValue({
            ContractId: this.viewModel.Contract.ContractId,
            ContractTotalDays: this.viewModel.Contract.ContractTotalDays,
            Area: this.viewModel.Contract.AreaArabicName, // this.viewModel.AreasShortVM,
            Branch: this.viewModel.Contract.BranchArabicName,
            NetValue: this.viewModel.Contract.NetValue,
            DiscountRatio: this.viewModel.Contract.DiscountRatio,
            DiscountAmount: this.viewModel.Contract.DiscountAmount,
            NetValueAfterDiscount: this.viewModel.Contract
              .NetValueAfterDiscount,
            TaxAmount: this.viewModel.Contract.TaxAmount,
            NetValueAfterTax: this.viewModel.Contract.NetValueAfterTax,
          });

          // this.selectedLaborer = this.viewModel.Contract.LaborerFile;
        } else {
          this.form.disable();
          this.disableControl = true;
        }
      },
      null,
      () => (this.progressSpinner = false)
    );
  }

  createContract() {
    this.submitted = true;
    if (
      this.form.get("ContractDate").value >
      this.form.get("LaborerReceptionDate").value
    ) {
      this._globalService.messageAlert(
        MessageType.Error,
        "Sales.Messages.Receivegreaterthancontractdate"
      );
      return 0;
    }
    if (this.form.valid) {
      this.progressSpinner = true;

      const contract = Object.assign({}, this.form.value);
      contract.SalesRepresentativeId = contract.SalesRepresentative.Id;
      contract.LaborerFileId = contract.LaborerFile.Id;
      contract.ContractDate = this._datePipe.transform(contract.ContractDate);
      contract.LaborerReceptionDate = this._datePipe.transform(
        contract.LaborerReceptionDate
      );
      contract.ExpectedTerminationDate = this._datePipe.transform(
        this.form.getRawValue().ExpectedTerminationDate
      );

      this._contractExtentionService.create(contract).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this._router.navigate(["sales/list-contracts"]);
          }
        },
        null,
        () => (this.progressSpinner = false)
      );
    }
  }

  searchLaborer(event: any) {
    this._contractExtentionService
      .SearchLaborer(
        event.query,
        this.viewModel.Contract.Bundle.NationalityId,
        this.viewModel.Contract.Bundle.ProfessionId,
        this.viewModel.Contract.BranchId
      )
      .subscribe((result: IServiceResult) => {
        this.filteredArray = result.data.ShortLaborerFilesVM;
        if (this.filteredArray.length === 0) {
          this._globalService.messageAlert(
            MessageType.Error,
            "Sales.Messages.NoLabors",
            true
          );
        }
      });
  }

  onSelectLaborerFile(event: any) {
    this._contractExtentionService
      .GetLaborer(event.Id)
      .subscribe((result: IServiceResult) => {
        this.selectedLaborer = result.data;
      });
  }

  filterArray(event, arrayObject: any, ColName = "FullArabicName") {
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
      d.getDate() + this.form.controls.ContractTotalDays.value
    );
    this.form.controls.ExpectedTerminationDate.setValue(
      expectedTerminationDate
    );
  }

  onClear(controlName: string) {
    this.form.controls[controlName].setValue(null);
  }
}

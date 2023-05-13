import { LaborerDetailsComponent } from "./../laborer-details/laborer-details.component";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ServiceRequestService } from "../service-request.service";
import { IServiceResult } from "@shared/interfaces/results";
import { DatePipe } from "@angular/common";
import { GlobalService, MessageType } from "@shared/services/global.service";

@Component({
  selector: "app-edit-request-service",
  templateUrl: "./edit-request-service.component.html",
  styleUrls: ["./edit-request-service.component.scss"],
})
export class EditRequestServiceComponent implements OnInit {
  form: FormGroup;
  viewModel: any;
  filteredArray: any[];
  submitted: Boolean;
  progressSpinner: boolean;
  filteredCustomersArray: any[];
  filteredLaborerFileArray: any[];
  selectedCustomer: any;
  selectedLaborer: any;
  currentYear = new Date().getFullYear() + 5;
  bundleCols: any[];
  bundles: any[];
  selectedBundle: any;
  selectedCustomerContractPerson: any;
  selectedNationality: any;
  selectedProfession: any;
  laborerCols: { field: string; header: string; hidden: boolean }[];
  allLaborers: any[];

  //Pagination for laborers list
  totalRecords: number;
  pageNumber: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  minDateValue: any;
  searchTerm:string = '';

  @ViewChild(LaborerDetailsComponent) child: LaborerDetailsComponent;
  constructor(
    private _formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _serviceRequestService: ServiceRequestService,
    private _globalService: GlobalService,
    private _datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.createForm();
    this.getEditData();
    this._globalService.languageOnChange().subscribe((lang) => {
      this.getEditData();
    });

    this.bundleCols = [
      { field: "Id", header: "Sales.Fields.BundleId", hidden: false },
      { field: "ArabicName", header: "Sales.Fields.BundleName", hidden: false },
      {
        field: "NationalityArabicName",
        header: "App.Fields.Nationality",
        hidden: false,
      },
      {
        field: "ProfessionArabicName",
        header: "App.Fields.Profession",
        hidden: false,
      },
      { field: "Period", header: "Sales.Fields.BundlePeriod", hidden: false },
      {
        field: "NoInstallment",
        header: "Sales.Fields.NoInstallment",
        hidden: false,
      },
      {
        field: "MonthlyCost",
        header: "Sales.Fields.MonthlyCost",
        hidden: false,
      },
      {
        field: "Downpayment",
        header: "Sales.Fields.DownPayment",
        hidden: false,
      },
      { field: "NetVal", header: "Sales.Fields.BundleNetVal", hidden: false },
      {
        field: "DiscoundAmount",
        header: "Sales.Fields.DiscountAmount",
        hidden: true,
      },
      { field: "TaxeAmount", header: "Sales.Fields.TaxAmount", hidden: false },
      {
        field: "NetValAfterTaxes",
        header: "Sales.Fields.BundleTotal",
        hidden: false,
      },
    ];
    this.laborerCols = [
      { field: "Id", header: "App.Fields.LaborerFileId", hidden: false },
      {
        field: "FullName",
        header: "App.Fields.LaborerFileName",
        hidden: false,
      },
      {
        field: "NationalityArabicName",
        header: "App.Fields.Nationality",
        hidden: false,
      },
      {
        field: "ProfessionArabicName",
        header: "App.Fields.Profession",
        hidden: false,
      },
      {
        field: "BranchArabicName",
        header: "App.Fields.Branch",
        hidden: false,
      },
    ];
  }

  createForm() {
    this.form = this._formBuilder.group({
      Id: [""],
      RefNumber: [""],
      ServiceRequestDate: ["", Validators.required],
      ExpectedContractDate: ["", Validators.required],
      ExpiryDate: ["", Validators.required],
      AssignLabor: [true],
      ExpiryTime: ["", Validators.required],
      Customer: ["", Validators.required],
      Bundle: ["", Validators.required],
      LaborerFile: [[""], Validators.required],
      Branch: [{ value: null }, Validators.required],
      ServiceRequestStatus: ["", Validators.required],
      BranchName: [{ value: null, disabled: true }, Validators.required],
    });
    // this.form
    //   .get('ExpiryDate')
    //   .setValidators([
    //     Validators.required,
    //     CustomValidators.minDate(this.form.get('ServiceRequestDate'))
    //   ]);
  }
  getEditData() {
    this.progressSpinner = true;
    const id = this.route.snapshot.paramMap.get("id");
    this._serviceRequestService
      .getEdit(id)
      .subscribe((result: IServiceResult) => {
        this.viewModel = result.data;
        this.setFormValues(this.viewModel.ServiceRequestVM);
        this.form.controls.ServiceRequestDate.disable();
        this.selectedCustomer = this.viewModel.ServiceRequestVM.Customer;
        this.selectedBundle = this.viewModel.ServiceRequestVM.Bundle;
        this.selectedNationality = this.viewModel.Nationalities.find(
          (x) => x.Id === this.viewModel.ServiceRequestVM.Bundle.NationalityId
        );
        this.selectedProfession = this.viewModel.Professions.find(
          (x) => x.Id === this.viewModel.ServiceRequestVM.Bundle.ProfessionId
        );
        if (!this.AssignLabor.value) {
          this.form.controls.LaborerFile.disable();
        }
        //
        this.minDateValue = new Date(this.viewModel.MinSelectableDate);

        this.onSelectProfessionIdOrNationality(null, null);
        this.searchLaborer();
        this.selectedLaborer = this.viewModel.ServiceRequestVM.LaborerFile;
        if (!this.canEdit) {
          this.form.disable();
        }
        this.progressSpinner = false;
      });
  }

  setFormValues(ServiceRequestVM) {
    this.form.setValue({
      Id: ServiceRequestVM.Id,
      RefNumber: ServiceRequestVM.RefNumber,
      ServiceRequestDate: new Date(ServiceRequestVM.ServiceRequestDate),
      ExpectedContractDate: new Date(ServiceRequestVM.ExpectedContractDate),
      ExpiryDate: new Date(ServiceRequestVM.ExpiryDate),
      ExpiryTime: new Date("2019-01-01T" + ServiceRequestVM.ExpiryTime),
      Customer: ServiceRequestVM.Customer,
      AssignLabor: ServiceRequestVM.LaborerFile != null,
      LaborerFile: ServiceRequestVM.LaborerFile,
      Bundle: ServiceRequestVM.Bundle,
      ServiceRequestStatus: ServiceRequestVM.ServiceRequestStatus,
      Branch: {
        Id: ServiceRequestVM.BranchId,
        Name: ServiceRequestVM.BranchName,
      },
      BranchName: ServiceRequestVM.BranchName,
    });
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

  searchCustomer(event: any) {
    setTimeout(() => {
      this._serviceRequestService
        .SearchCustomer(event.query)
        .subscribe((result: IServiceResult) => {
          this.filteredCustomersArray = [];
          this.filteredCustomersArray = result.data;
        });
    }, 1500);
  }

  searchLaborer() {
    if (!this.AssignLabor.value) {
      return null;
    }
     
    const Branch = this.form.get("Branch").value;
    if (!Branch) {
      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey("Sales.Messages.SelectBranch")
      );
      this.selectedBundle = [];
      return;
    }
    this.progressSpinner = true;
    this._serviceRequestService
      .SearchLaborer(
        this.searchTerm,
        String(this.pageNumber),
        this.selectedBundle.NationalityId,
        this.selectedBundle.ProfessionId,
        Branch.Id
      )
      .subscribe(
        (result: IServiceResult) => {
          this.filteredLaborerFileArray = [];
          this.filteredLaborerFileArray = result.data.LaborerFilesVM;
          this.totalRecords = result.data.PagingMetaData.TotalItemCount;
          if (this.selectedLaborer) {
            if (
              this.selectedLaborer.NationalityId ===
                this.selectedBundle.NationalityId &&
              this.selectedLaborer.ProfessionId ===
                this.selectedBundle.ProfessionId &&
              this.selectedLaborer.BranchId === Branch.Id
            ) {
              this.filteredLaborerFileArray.push(this.selectedLaborer);
            }
          }
        },
        () => {
          this.progressSpinner = false;
        },
        () => {
          this.progressSpinner = false;
        }
      );
  }

  getBranchesLaborers() {
    if (!this.AssignLabor.value) {
      return null;
    }
    this.progressSpinner = true;
    this._serviceRequestService
      .getAllLaborers(
        "",
        this.selectedBundle.NationalityId,
        this.selectedBundle.ProfessionId
      )
      .subscribe((result: IServiceResult) => {
        this.progressSpinner = false;
        this.allLaborers = [];
        this.allLaborers = result.data.SmallLaborerFilesVM;
      });
  }

  onSelectCustomer(event: any) {
    debugger;
    this.progressSpinner = true;
    this._serviceRequestService.GetCustomer(event.Id).subscribe(
      (result: IServiceResult) => {
        this.selectedCustomer = result.data;
      },
      () => {
        this.progressSpinner = false;
      },
      () => {
        this.progressSpinner = false;
      }
    );
  }

  setId(id: string) {
    this.child.getDetails(id);
  }

  onSelectLaborerFile(event: any) {
    this._serviceRequestService.GetLaborer(event.Id).subscribe(
      (result: IServiceResult) => {
        this.selectedLaborer = result.data;
      },
      () => {
        this.progressSpinner = false;
      },
      () => {
        this.progressSpinner = false;
      }
    );
  }

  onSelectProfessionIdOrNationality(profession, nationality) {
    if (nationality) {
      this.selectedNationality = nationality;
    }
    if (profession) {
      this.selectedProfession = profession;
    }
    if (!this.selectedCustomer) {
      this._globalService.messageAlert(
        MessageType.Warning,
        this._globalService.translateWordByKey("Sales.Messages.SelectCustomer")
      );
      return;
    }

    if (this.selectedNationality && this.selectedProfession) {
      this.progressSpinner = true;
      this._serviceRequestService
        .GetBundles(this.selectedNationality.Id, this.selectedProfession.Id)
        .subscribe(
          (result: IServiceResult) => {
            this.bundles = result.data;
            this.bundles.forEach((element) => {
              Object.assign(element, { DiscountAmount: 0 });
              element.DiscountAmount = !this.selectedCustomer.IsRatioDiscount
                ? this.selectedCustomer.CustomerDiscount
                : this.selectedCustomer.CustomerDiscount *
                  (element.NetVal / 100);
                  let taxRatio = element.TaxeAmount / element.NetVal;
                  let netValueAfterDiscount = element.NetVal - element.DiscountAmount;
                  element.TaxeAmount = netValueAfterDiscount * taxRatio;
                  element.NetValAfterTaxes = netValueAfterDiscount + (netValueAfterDiscount * taxRatio);
                  element.MonthlyCost = (element.NetValAfterTaxes / element.NoInstallment).toFixed(4) ;
              // element.NetValAfterTaxes =
              //   element.NetValAfterTaxes - element.DiscountAmount;
            });
          },
          () => {
            this.progressSpinner = false;
          },
          () => {
            this.progressSpinner = false;
          }
        );
    }
  }

  editServiceRequest() {
    this.submitted = true;
    this.form.get("Bundle").setValue(this.selectedBundle);
    this.form.get("LaborerFile").setValue(this.selectedLaborer);
    var assignLabor = this.form.get("AssignLabor").value;

    if (this.form.valid) {
      if (
        !this.selectedBundle ||
        this.selectedBundle.NetValAfterTaxes <= 0 ||
        this.selectedBundle.NetValAfterTaxes <
          this.selectedBundle.DiscountAmount
      ) {
        this._globalService.messageAlert(
          MessageType.Error,
          this._globalService.translateWordByKey(
            "Sales.Messages.BundleMustBestMoreThanZero"
          )
        );
        return;
      }
      if (
        assignLabor &&
        (this.filteredLaborerFileArray.length == 0 || !this.selectedLaborer)
      ) {
        console.log(this.filteredLaborerFileArray);
        this._globalService.messageAlert(
          MessageType.Error,
          this._globalService.translateWordByKey(
            "Sales.Messages.MustHaveLabourers"
          )
        );
      }
      this.progressSpinner = true;
      const postedViewModel = Object.assign({}, this.form.value);
      ////
      postedViewModel.ContactPerson = this.selectedCustomer.ContactPerson;
      postedViewModel.ContactPersonPhoneNumber =
        this.selectedCustomer.ContactPersonPhoneNumber;
      postedViewModel.ContactPersonAddress =
        this.selectedCustomer.ContactPersonAddress;
      ////
      postedViewModel.CustomerId = postedViewModel.Customer.Id;
      postedViewModel.BundleId = postedViewModel.Bundle.Id;
      postedViewModel.ServiceRequestStatusId =
        postedViewModel.ServiceRequestStatus.Id;
      postedViewModel.LaborerFileId = assignLabor
        ? postedViewModel.LaborerFile.Id
        : null;
      postedViewModel.BranchId = postedViewModel.Branch.Id;
      postedViewModel.ServiceRequestDate = this._datePipe.transform(
        this.viewModel.ServiceRequestVM.ServiceRequestDate
      );
      postedViewModel.ExpectedContractDate = this._datePipe.transform(
        postedViewModel.ExpectedContractDate
      );
      postedViewModel.ExpiryDate = this._datePipe.transform(
        postedViewModel.ExpiryDate
      );
      postedViewModel.ExpiryTime = this._datePipe.transform(
        postedViewModel.ExpiryTime,
        "HH:mm:ss"
      );
      this._serviceRequestService.edit(postedViewModel).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.form.reset();
            this.router.navigate(["sales/list-requests-services"]);
          }
        },
        null,
        () => {
          this.progressSpinner = false;
        }
      );
    }
  }
 
  canEdit() {
    if (this.viewModel) {
      return (
        this.viewModel.ServiceRequestVM.ServiceRequestStatus.Actions.search(
          "edit-service-request,"
        ) === -1
      );
    }
    return false;
  }

  onUnselectBundle() {
    this.selectedLaborer = null;
    this.form.get("LaborerFile").reset();
    this.filteredLaborerFileArray = [];
  }

  onClear(controlName: string) {
    this.form.controls[controlName].setValue(null);
  }

  getSelectedItem(vm: any, id: any) {
    if (id) {
      return vm.filter((x) => x.Id.toString() === id.toString())[0];
    }
    return null;
  }
  expiryDateUpdateValueAndValidity(event) {
    this.form.get("ExpiryDate").updateValueAndValidity();
  }

  loadLabores(event) {
    this.pageNumber = event.first / 10 + 1;
    this.searchLaborer();
  }

  onAssignLaborsChange(event) {
    if (event.checked) {
      this.form.get("LaborerFile").enable();
      this.filteredLaborerFileArray = [];
    } else {
      this.form.get("LaborerFile").disable();
    }
  }

  get AssignLabor() {
    return this.form.get("AssignLabor");
  }
  // onSelectTime() {
  //   let timeString = this._globalService.helperGetTimeAsString();
  //   this.form.get('ExpiryTime').setValue(timeString);
  // }

}

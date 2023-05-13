import { LaborerDetailsComponent } from "./../laborer-details/laborer-details.component";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ServiceRequestService } from "../service-request.service";
import { Router } from "@angular/router";
import { IServiceResult } from "@shared/interfaces/results";
import { DatePipe } from "@angular/common";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { environment } from "../../../../environments/environment";
import { AuthService } from "@shared/services/auth.service";

@Component({
  selector: "app-create-request-service",
  templateUrl: "./create-request-service.component.html",
  styleUrls: ["./create-request-service.component.scss"],
})
export class CreateRequestServiceComponent implements OnInit {
  @ViewChild(LaborerDetailsComponent) child: LaborerDetailsComponent;
  form: FormGroup;
  viewModel: any;
  TodayDate: Date = new Date();
  ServiceRequestDate: Date;
  ExpectedContractDate: Date;
  filteredArray: any[];
  submitted: Boolean;
  progressSpinner: boolean;
  filteredCustomersArray: any[];
  filteredLaborerFileArray: any[];
  selectedCustomer: any;
  currentYear = new Date().getFullYear() + 5;
  bundleCols: any[];
  bundles: any[];
  selectedBundle: any;
  selectedLaborer: any;
  selectedNationality: any;
  selectedProfession: any;
  environment = environment;
  allLaborers: any[];
  laborerCols: { field: string; header: string; hidden: boolean }[];
  branchArabicName: any;
  branchEnglishName: any;
  minDateValue: any;

  //Pagination for laborers list
  totalRecords: number;
  pageNumber: Number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  searchTerm:string = '';

  constructor(
    private _serviceRequestService: ServiceRequestService,
    private _formBuilder: FormBuilder,
    private router: Router,
    public globalService: GlobalService,
    private _datePipe: DatePipe,
    private _authService: AuthService
  ) {
    // this.selectedCustomer = {};
  }

  ngOnInit() {
    this.createForm();
    this.progressSpinner = true;
    this.TodayDate.setDate(this.TodayDate.getDate() + 1);
    this._serviceRequestService.getCreate().subscribe(
      (result: IServiceResult) => {
        this.viewModel = result.data;
        this.form
          .get("ServiceRequestDate")
          .setValue(new Date(this.viewModel.CurrentDate));
        this.minDateValue = new Date(this.viewModel.MinSelectableDate);
        this.form
          .get("ExpiryTime")
          .setValue(new Date(this.viewModel.CurrentDate));

        this.branchArabicName =
          this._authService.currentAuthUser.BranchArabicName;
        this.branchEnglishName =
          this._authService.currentAuthUser.BranchEnglishName;
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );

    this.bundleCols = [
      { field: "Id", header: "Sales.Fields.BundleId", hidden: false },
      { field: "ArabicName", header: "Sales.Fields.BundleName", hidden: false },
      {
        field: "NationalityName",
        header: "App.Fields.Nationality",
        hidden: false,
      },
      {
        field: "ProfessionName",
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
        field: "DiscountAmount",
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
        field: "NationalityName",
        header: "App.Fields.Nationality",
        hidden: false,
      },
      {
        field: "ProfessionName",
        header: "App.Fields.Profession",
        hidden: false,
      },
      {
        field: "BranchName",
        header: "App.Fields.Branch",
        hidden: false,
      },
    ];
  }

  createForm() {
    this.form = this._formBuilder.group({
      RefNumber: [""],
      ServiceRequestDate: ["", [Validators.required]],
      ExpectedContractDate: ["", Validators.required],
      ExpiryDate: ["", Validators.required],
      ExpiryTime: ["", Validators.required],
      AssignLabor: [true],
      Customer: ["", Validators.required],
      LaborerFile: ["", Validators.required],
      Bundle: ["", Validators.required],
      Branch: [{ value: null, disabled: true }, Validators.required],
      isInactive: [false],
    });
    // this.form
    //   .get('ExpiryDate')
    //   .setValidators([
    //     Validators.required,
    //     CustomValidators.minDate(this.form.get('ServiceRequestDate'))
    //   ]);
  }

  createserviceRequest() {
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
        this.globalService.messageAlert(
          MessageType.Error,
          this.globalService.translateWordByKey(
            "Sales.Messages.BundleMustBestMoreThanZero"
          )
        );
        return;
      }
      if (
        assignLabor &&
        (this.filteredLaborerFileArray.length == 0 || !this.selectedLaborer)
      ) {
        this.globalService.messageAlert(
          MessageType.Error,
          this.globalService.translateWordByKey(
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
      postedViewModel.LaborerFileId = assignLabor
        ? postedViewModel.LaborerFile.Id
        : null;
      postedViewModel.BranchId = this._authService.currentAuthUser.BranchId;
      postedViewModel.ServiceRequestDate = this._datePipe.transform(
        postedViewModel.ServiceRequestDate
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

      this._serviceRequestService.create(postedViewModel).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.form.reset();
            this.router.navigate(["sales/list-requests-services"]);
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
     
    if (this.selectedBundle) {
      if (!this.AssignLabor.value) {
        return null;
      }

      this.progressSpinner = true;
      this._serviceRequestService
        .SearchLaborer(
          this.searchTerm,
          String(this.pageNumber),
          this.selectedBundle.NationalityId,
          this.selectedBundle.ProfessionId,
          this._authService.currentAuthUser.BranchId
        )
        .subscribe(
          (result: IServiceResult) => {
            this.filteredLaborerFileArray = [];
            this.filteredLaborerFileArray = result.data.LaborerFilesVM;
            this.totalRecords = result.data.PagingMetaData.TotalItemCount;
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
        this.allLaborers = this.allLaborers.filter(
          (l) => l.BranchId !== this._authService.currentAuthUser.BranchId
        );
        if (this.allLaborers.length === 0) {
          this.globalService.messageAlert(
            MessageType.Error,
            this.globalService.translateWordByKey("Sales.Messages.NoLabors")
          );
        }
      });
  }

  onSelectCustomer(event: any) {
    this.progressSpinner = true;
    this._serviceRequestService.GetCustomer(event.Id).subscribe(
      (result: IServiceResult) => {
        this.selectedCustomer = result.data;
        this.onSelectProfessionIdOrNationality(
          this.selectedProfession,
          this.selectedNationality
        );
      },
      () => {
        this.progressSpinner = false;
      },
      () => {
        this.progressSpinner = false;
      }
    );
  }

  onSelectLaborerFile(event: any) {
    this._serviceRequestService
      .GetLaborer(event.Id)
      .subscribe((result: IServiceResult) => {
        this.selectedLaborer = result.data;
      });
  }
  onSelectProfessionIdOrNationality(profession, nationality) {
    if (nationality) {
      this.selectedNationality = nationality;
    }
    if (profession) {
      this.selectedProfession = profession;
    }
    if (!this.selectedCustomer) {
      this.globalService.messageAlert(
        MessageType.Warning,
        this.globalService.translateWordByKey("Sales.Messages.SelectCustomer")
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
              //    element.NetValAfterTaxes - element.DiscountAmount;
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

  onUnselectBundle() {
    this.selectedLaborer = null;
    this.filteredLaborerFileArray = [];
  }

  onClear(controlName: string) {
    this.form.controls[controlName].setValue(null);
  }

  expiryDateUpdateValueAndValidity(event) {
    this.form.get("ExpiryDate").updateValueAndValidity();
  }

  // onSelectTime() {
  //   let timeString = this.globalService.helperGetTimeAsString();
  //   this.form.get('ExpiryTime').setValue(timeString);
  // }

  getLaborerDetails(id) {
    this.child.getDetails(id);
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
}

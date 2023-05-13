import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { IServiceResult } from '@shared/interfaces/results';
import { AuthService } from '@shared/services/auth.service';
import { GlobalService, MessageType } from '@shared/services/global.service';

import { LaborerDetailsComponent } from '../requests-services/laborer-details/laborer-details.component';
import { ServiceRequestService } from '../requests-services/service-request.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-assign-labor-to-service-request',
  templateUrl: './assign-labor-to-service-request.component.html',
  styleUrls: ['./assign-labor-to-service-request.component.scss']
})
export class AssignLaborToServiceRequestComponent implements OnInit {
  @ViewChild(LaborerDetailsComponent) child: LaborerDetailsComponent;
  viewModel: any;

  filteredArray: any[];
  submitted: Boolean;
  progressSpinner: boolean;
  filteredCustomersArray: any[];
  filteredLaborerFileArray: any[];

  selectedLaborer: any;

  allLaborers: any[];
  laborerCols: { field: string; header: string; hidden: boolean }[];


  //Pagination for laborers list
  totalRecords: number;
  pageNumber: Number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  selectedBundle: any;
  selectLabor = true;
  serviceRequest: any;
  showDetails: boolean;
  searchTerm:string = '';

  constructor(
    private _serviceRequestService: ServiceRequestService,
    private router: Router,
    public globalService: GlobalService,
    private _datePipe: DatePipe,
    private _authService: AuthService,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
  ) {
    // this.selectedCustomer = {};
    this.serviceRequest  = config.data.serviceRequest;
  }
  ngOnInit() {
    this.progressSpinner = true;

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

  assign() {
    if (this.selectedLaborer) {
      this.progressSpinner = true;
      const postedViewModel =
        {
          Id: this.serviceRequest.Id,
          LaborerFileId :this.selectedLaborer.Id
      };
      this._serviceRequestService.assignLabor(postedViewModel,this.config.data.isCalledFromConractsPage as boolean).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            this.ref.close(result.data);
          }
        },
        ()=>this.progressSpinner = false,
        ()=>this.progressSpinner = false
      );
    }else{
      this.globalService.messageAlert(
        MessageType.Error,
        this.globalService.translateWordByKey(
          "Sales.Messages.MustHaveLabourers"
        )
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

  searchLaborer() {
    this.progressSpinner = true;
    this._serviceRequestService
      .SearchLaborer(
        this.searchTerm,
        String(this.pageNumber),
         this.serviceRequest.BundleNationalityId,
         this.serviceRequest.BundleProfessionId,
         this._authService.currentAuthUser.BranchId
        )
      .subscribe(
        (result: IServiceResult) => {
          this.filteredLaborerFileArray = [];
          this.filteredLaborerFileArray = result.data.LaborerFilesVM;
          this.totalRecords = result.data.PagingMetaData.TotalItemCount;
        },
        ()=>this.progressSpinner = false,
        ()=>this.progressSpinner = false
      );
  }

  getBranchesLaborers() {
    this.selectLabor = false;
  }
  getLaborerDetails(id){
    this.config.data.showLaborDetails.next(id);
  }

  onSelectLaborerFile(event: any) {
    this.selectedLaborer = event;
  }

  onUnselectBundle() {
    this.selectedLaborer = null;
    this.filteredLaborerFileArray = [];
  }

  loadLabores(event) {
    this.pageNumber = event.first / 10 + 1;
    this.searchLaborer();
  }
  cancel(){
    this.ref.close();
  }
}

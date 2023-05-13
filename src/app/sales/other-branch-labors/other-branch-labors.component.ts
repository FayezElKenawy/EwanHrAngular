import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IServiceResult } from '@shared/interfaces/results';
import { AuthService } from '@shared/services/auth.service';
import { GlobalService, MessageType } from '@shared/services/global.service';
import { LaborerDetailsComponent } from '../requests-services/laborer-details/laborer-details.component';
import { ServiceRequestService } from '../requests-services/service-request.service';

@Component({
  selector: 'app-other-branch-labors',
  templateUrl: './other-branch-labors.component.html',
  styleUrls: ['./other-branch-labors.component.scss']
})
export class OtherBranchLaborsComponent implements OnInit {

  @ViewChild(LaborerDetailsComponent) child: LaborerDetailsComponent;
  progressSpinner: boolean;
  allLaborers: any[];
  laborerCols: { field: string; header: string; hidden: boolean }[];
  //Pagination for laborers list
  totalRecords: number;
  pageNumber: Number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  @Input() serviceRequest: any;
  @Output() close: EventEmitter<any> = new EventEmitter();
  constructor(
    private _serviceRequestService: ServiceRequestService,
    public globalService: GlobalService,
    private _authService: AuthService
    ) {
    // this.selectedCustomer = {};
  }
  ngOnInit() {
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
    this.getBranchesLaborers();
  }

  getBranchesLaborers() {
    this.progressSpinner = true;
    this._serviceRequestService
      .getAllLaborers(
        "",
        this.serviceRequest.BundleNationalityId,
        this.serviceRequest.BundleProfessionId
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
  closeComponent(){
    this.close.emit();
  }
}

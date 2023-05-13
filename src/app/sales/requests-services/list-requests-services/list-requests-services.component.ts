import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicDialog';
import { ServiceRequestService } from "../service-request.service";
import { Router } from "@angular/router";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { CustomReportComponent } from "@shared/components/reporting/custom-report/custom-report.component";
import { Operators } from "@shared/models/Operators";
import { FieldTypesEnum } from "@shared/models/dynamic-fields";
import { AssignLaborToServiceRequestComponent } from "../../assign-labor-to-service-request/assign-labor-to-service-request.component";
import { GlobalService } from "@shared/services/global.service";
import { LaborerDetailsComponent } from "../laborer-details/laborer-details.component";
import { Subject } from "rxjs";
import { MenuItem } from "primeng/api";

@Component({
  selector: "app-list-requests-services",
  templateUrl: "./list-requests-services.component.html",
  styleUrls: ["./list-requests-services.component.scss"],
  providers: [DialogService]
})
export class ListRequestsServicesComponent implements OnInit {
  @ViewChild(CustomReportComponent) report: CustomReportComponent;
@ViewChild(LaborerDetailsComponent) child: LaborerDetailsComponent;
  dataItems: any[];
  cols: any;
  menuItems: MenuItem[];
  selectedItem: any;
  progressSpinner = true;
  pagingMetaData: PagingMetaData;
  searchForm: FormGroup;
  searchModel: SearchModel = {};
  operators: string[];
  showDetails: boolean;
  showLaborDetails: Subject<any>;
  constructor(
    private _serviceRequestService: ServiceRequestService,
    private router: Router,
    public _dynamicSearchService: DynamicSearchService,
    public DialogService: DialogService,
    private _globalService:GlobalService
  ) {}

  ngOnInit() {
    this.showLaborDetails = new Subject();
    this.showLaborDetails.subscribe((id)=>{
      this.getLaborerDetails(id)
    })
    this.cols = [
      // { field: 'ActionButtons', header: '', hidden: false, searchable: false },
      {
        field: "Id",
        header: "Sales.Fields.ServiceRequestId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      // {
      //   field: 'RefNumber',
      //   header: 'Sales.Fields.RefNumber',
      //   hidden: false,
      //   searchable: true,
      //   searchType: 'text'
      // },
      {
        field: "ServiceRequestDate",
        header: "Sales.Fields.ServiceRequestDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
        searchable: true,
        searchType: "date"
      },
      {
        field: "ExpectedContractDate",
        header: "Sales.Fields.ExpectedContractDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
        searchable: true,
        searchType: "date"
      },
      {
        field: "SegmentsCustomerId",
        header: "Sales.Fields.SegmentsCustomerId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "CustomerArabicName",
        header: "App.Fields.CustomerName",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      // {
      //   field: 'BundleId',
      //   header: 'Sales.Fields.BundleId',
      //   hidden: false,
      //   searchable: true,
      //   searchType: 'text'
      // },
      {
        field: "CreatedBy",
        header: "Sales.Fields.CreatedBy",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "BundleArabicName",
        header: "Sales.Fields.BundleName",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "LaborerFileId",
        header: "App.Fields.LaborerFileId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "LaborerFileArabicName",
        header: "App.Fields.LaborerFileName",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "BundleNationalityName",
        header: "App.Fields.Nationality",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "BundleProfessionName",
        header: "App.Fields.Profession",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "ServiceRequestStatusArabicName",
        header: "Sales.Fields.ServiceRequestStatus",
        hidden: false,
        searchable: true,
        searchType: "text"
      }
    ];

    this.menuItems = [
      {
        label: "App.Buttons.Edit",
        icon: "pi pi-pencil",
        command: event => this.editDataItem(this.selectedItem.Id)
      }
    ];
    // build form for search
    this.searchForm = this._dynamicSearchService.buildSearchForm(this.cols);
    this.operators = this._dynamicSearchService.operators;
  }

  setId(id: string) {}

  getData() {
    this.progressSpinner = true;
    this._serviceRequestService.getAll(this.searchModel).subscribe(
      result => {
        this.dataItems = result.data.ServiceRequests;
        this.pagingMetaData = result.data.PagingMetaData;
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }

  showActionButton(Actions, actionName) {
    return Actions.search(actionName) !== -1;
  }

  editDataItem(id: any) {
    this.router.navigate(["/sales/edit-request-service", id]);
  }

  ServiceTransferSample(id) {
    this.report.filters = [
      {
        dataSourceName: "Ds1",
        fieldName: "ServiceRequestId",
        logicalOperator: "And",
        operator: Operators.Equal,
        type: FieldTypesEnum.Text,
        value: id
      }
    ];

    this.report.reportId = "19";
    this.report.reportName = "Sales.Titles.ServiceTransferSample";
    this.report.showReport();
  }

  assignLaborer(serviceRequest){
    const ref = this.DialogService.open(AssignLaborToServiceRequestComponent, {
      header: this._globalService.translateWordByKey("Sales.Titles.AssignLabor"),
      styleClass: 'gen_popup',
      data:{serviceRequest,showLaborDetails:this.showLaborDetails},
      });
    ref.onClose.subscribe(result=>{
      if(result){
        this.getData();
      }
    });
  }

  getLaborerDetails(id) {
    this.showDetails = true;
    setTimeout(() => {
      this.child.getDetails(id);
    }, 500);
  }


}

import { Component, OnInit, ViewChild } from "@angular/core";

import { Router } from "@angular/router";
import { ContractService } from "../contract.service";
import { EditContractComponent } from "../edit-contract/edit-contract.component";
import { DatePipe } from "@angular/common";
import { CreateDownpaymentReceiptComponent } from "src/app/receipts/downpayment-receipt/create-downpayment-receipt/create-downpayment-receipt.component";
import { TerminateContractComponent } from "../terminate-contract/terminate-contract.component";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { ReportModelViewerComponent } from "@shared/components/report-model-viewer/report-model-viewer.component";
import { CustomReportComponent } from "@shared/components/reporting/custom-report/custom-report.component";
import { FieldTypesEnum } from "@shared/models/dynamic-fields";
import { Operators } from "@shared/models/Operators";
import { AssignLaborToServiceRequestComponent } from "../../assign-labor-to-service-request/assign-labor-to-service-request.component";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { LaborerDetailsComponent } from "../../requests-services/laborer-details/laborer-details.component";
import { Subject } from "rxjs";
import { LaborReplacementComponent } from "../labor-replacement/labor-replacement.component";
import { HoldContractComponent } from "../hold-contract/hold-contract.component";
import { AvailableLaborsForHoldingComponent } from "../available-labors-for-holding/available-labors-for-holding.component";
import { MenuItem } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";

declare let $: any;

@Component({
  selector: "app-list-contracts",
  templateUrl: "./list-contracts.component.html",
  styleUrls: ["./list-contracts.component.scss"],
  providers: [DatePipe,DialogService]
})
export class ListContractsComponent implements OnInit {
  @ViewChild(EditContractComponent) child: EditContractComponent;
  @ViewChild(CreateDownpaymentReceiptComponent)
  downpaymentReceiptChild: CreateDownpaymentReceiptComponent;
  @ViewChild(TerminateContractComponent) TerminateContractchild: TerminateContractComponent;
  @ViewChild(ReportModelViewerComponent)
  reportchild: ReportModelViewerComponent;
  @ViewChild(CustomReportComponent) report: CustomReportComponent;
  @ViewChild(LaborerDetailsComponent) laborDetailschild: LaborerDetailsComponent;
  @ViewChild(LaborReplacementComponent) laborReplacementComponent: LaborReplacementComponent;
  @ViewChild(HoldContractComponent) holdContractchild: HoldContractComponent;
  @ViewChild(AvailableLaborsForHoldingComponent) laborReassignComponent: AvailableLaborsForHoldingComponent;



  showReplacement: boolean;
  showHolding: boolean;
  selectedProfId: string;
  selectedContractId: any;
  selectedNationalId: string;
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
  branchId: string='';

  constructor(
    private _contractService: ContractService,
    private _router: Router,
    private _globalService:GlobalService,
    private _datePipe: DatePipe,
    public _dynamicSearchService: DynamicSearchService,
    public dialogService: DialogService,
    private router:Router
  ) {}

  ngOnInit() {
    this.showLaborDetails = new Subject();
    this.showLaborDetails.subscribe((id)=>{
      this.getLaborerDetails(id)
    })
    this.cols = [
      {
        field: "SegmentContractId",
        header: "Sales.Fields.ContractId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "ContractDate",
        header: "Sales.Fields.ContractDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
        searchable: true,
        searchType: "date"
      },
      {
        field: "ExpectedTerminationDate",
        header: "Sales.Fields.ExpectedTerminationDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
        searchable: true,
        searchType: "date"
      },
      {
        field: "ContractStartDate",
        header: "Sales.Fields.ContractStartDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
        searchable: true,
        searchType: "date"
      },
      {
        field: "ContractTerminationDate",
        header: "Sales.Fields.ContractTerminationDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
        searchable: true,
        searchType: "date"
      },
      {
        field: "SegmentsCustomerId",
        header: "Sales.Fields.CustomerId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "CustomerArabicName",
        header: "Sales.Fields.CustomerName",
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
        field: "ContractTotalDays",
        header: "Sales.Fields.ContractTotalDays",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "ActualConsumedDays",
        header: "Sales.Fields.ConsumedDays",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "ActualRemainingDays",
        header: "Sales.Fields.RemainingDays",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "NetValue",
        header: "Sales.Fields.ContractNetValue",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "DiscountAmount",
        header: "Sales.Fields.DiscountAmount",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "CreatedBy",
        header: "Sales.Fields.CreatedBy",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "BranchName",
        header: "App.Fields.Branch",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "NetValueAfterDiscount",
        header: "Sales.Fields.NetValueAfterDiscount",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "TaxAmount",
        header: "Sales.Fields.TaxAmount",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "NetValueAfterTax",
        header: "Sales.Fields.ContractNetValueAfterTax",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "ContractStatusId",
        header: "Sales.Fields.ContractStatusId",
        hidden: true,
        searchable: true,
        searchType: "text"
      },
      // {
      //   field: "ContractStatusArabicName",
      //   header: "Sales.Fields.ContractStatusName",
      //   hidden: false,
      //   searchable: true,
      //   searchType: "text"
      // },
      {
        field: "SalesRepresentativeId",
        header: "Sales.Fields.SalesRepresentativeId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "SalesRepresentativeName",
        header: "Sales.Fields.SalesRepresentativeName",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "Discount",
        header: "Sales.Fields.Discount",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "AreaId",
        header: "App.Fields.AreaId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "AdminstrativeAreaArabicName",
        header: "Sales.Fields.AdminstrativeAreaName",
        hidden: false,
        searchable: true,
        searchType: "text"
      },

      {
        field: "BundleId",
        header: "Sales.Fields.BundleId",
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
        field: "BranchId",
        header: "App.Fields.BranchId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "BranchName",
        header: "App.Fields.Branch",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "ServiceRequestId",
        header: "Sales.Fields.ServiceRequestId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "TerminationReasonId",
        header: "Sales.Fields.TerminationReasonId",
        hidden: true,
        searchable: false,
        searchType: "text"
      },
      {
        field: "TerminationReasonArabicName",
        header: "Sales.Fields.TerminationReason",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "ContractExtentionId",
        header: "Sales.Fields.ContractExtentionId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "ContractStatusArabicName",
        header: "Sales.Fields.ContractStatusName",
        hidden: false,
        searchable: true,
        searchType: "text"
      }
    ];

    this.menuItems = [
      {
        label: "تعديل",
        icon: "pi pi-pencil",
        command: event => this.editDataItem(this.selectedItem.Id)
      }
    ];
    // build form for search
    this.searchForm = this._dynamicSearchService.buildSearchForm(this.cols);
    this.operators = this._dynamicSearchService.operators;
  }

  getData() {
    this.progressSpinner = true;
    this._contractService.getList(this.searchModel).subscribe(
      result => {
        if (result.isSuccess) {
          this.dataItems = result.data.ContractItemsVM;
          this.pagingMetaData = result.data.PagingMetaData;
        }
      },
      null,
      () => (this.progressSpinner = false)
    );
  }

  editDataItem(id: string) {
    this._router.navigate(["sales/edit-contract", id]);
  }

  showContractDetails(id: string) {
    this._router.navigate(["sales/contract-details", id]);
  }

  formatDate(date: Date) {
    return this._datePipe.transform(date, "yyyy-MM-dd");
  }

  createDownpaymentReceipt(id: string) {
    this.downpaymentReceiptChild.setFormValues(id);
  }

  hideModal(modalId: string) {
    $(`#${modalId}`).modal("hide");
  }

  ShowTerminateContractModal(contract: any) {
    this.TerminateContractchild.Show(contract);
  }

  ShowHoldContractModal(contract: any) {
    this.holdContractchild.Show(contract);
  }

  toggleActionButtonVisibility(actions: string, actionName: string) {
    return actions.search(actionName) !== -1;
  }

  refresh() {
    this.getData();
  }

  showReport(reportId, title, contractId) {
    this.report.filters = [
      {
        dataSourceName: "Ds1",
        fieldName: "Id",
        logicalOperator: "And",
        operator: Operators.Equal,
        type: FieldTypesEnum.Text,
        value: contractId
      }
    ];
    this.report.reportId = reportId;
    this.report.reportName = title;
    this.report.showReport();
  }

  showContractTerminateReport(contractId, contractType) {
    this.report.filters = [
      {
        dataSourceName: "Ds1",
        fieldName: "Id",
        logicalOperator: "And",
        operator: Operators.Equal,
        type: FieldTypesEnum.Text,
        value: contractId
      }
    ];
    this.report.params = [
      {
        contractType
      }
    ];
    this.report.reportId = "12";
    this.report.reportName = "Sales.Titles.PrintContractTerminate";
    this.report.showReport();
  }

  showClientAccountStatementReport(contractId) {
    this.report.filters = [
      {
        dataSourceName: "Ds1",
        fieldName: "ContractId",
        logicalOperator: "And",
        operator: Operators.Equal,
        type: FieldTypesEnum.Text,
        value: contractId
      }
    ];
    this.report.reportId = "24";
    this.report.reportName = "Sales.Titles.PrintClientAccountStatement";
    this.report.showReport();
  }

  assignLaborer(contract){
    const ref = this.dialogService.open(AssignLaborToServiceRequestComponent, {
      header: this._globalService.translateWordByKey("Sales.Titles.AssignLabor"),
      styleClass: 'gen_popup',
      data:{
        serviceRequest :{
          Id: contract.ServiceRequestId,
          BundleNationalityId:contract.BundleNationalityId,
          BundleProfessionId:contract.BundleProfessionId
        },
        isCalledFromConractsPage:true,
        showLaborDetails:this.showLaborDetails
       },
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
      this.laborDetailschild.getDetails(id);
    }, 500);
  }

  getLaborReplacement(id) {
    this.selectedContractId = id.Id;
    this.selectedProfId = id.BundleProfessionId;
    this.selectedNationalId = id.BundleNationalityId;
    this.branchId = id.BranchId;
    this.showReplacement = true;

    setTimeout(() => {
      this.laborReplacementComponent.initForm();
    }, 50);
  }

  getLaborReactivateHolding(id) {
    this.selectedContractId = id.Id;
    this.selectedProfId = id.BundleProfessionId;
    this.selectedNationalId = id.BundleNationalityId;
    this.branchId = id.BranchId;
    this.showHolding = true;

    setTimeout(() => {
      this.laborReassignComponent.initForm();
    }, 50);
  }

  closeReplacementModal(event){
    if(event){
      this.showReplacement= false;
      this.selectedProfId= null;
      this.selectedNationalId= null;
      this.selectedContractId= null;
      $('#replacmentModal').modal('hide');
      this.getData();

    }
  }

  closeReActivateHoldingModal(event){
    if(event){
      this.showHolding= false;
      this.selectedProfId= null;
      this.selectedNationalId= null;
      this.selectedContractId= null;
      $('#re-activaite-holding').modal('hide');
      this.getData();

    }
  }

  displayCustomerAccount(customerId:number){
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/individual/receipts/details-customer-account"], {
        queryParams: {
          id: customerId,
        }
      })
    );

    window.open(url, '_blank');

  }

  terminateHoldedContract(contract: any)
  {
    this._globalService.messageConfirm(
      this._globalService.translateWordByKey("Sales.Messages.DoYouWantTerminateHoldedContract") ,
      () => {
        this.progressSpinner = true;
        this._contractService.stopHoldedContractForTermination(contract.Id).subscribe(
          (result) => {
            if (result.isSuccess) {
              // this._globalService.messageAlert(
              //   MessageType.Success,
              //   'Sales.Messages.TerminatedSuccess',
              //   true
              // );
              this.getData();
            } else {
              this.progressSpinner = false;
            }
          },
          () => (this.progressSpinner = false),
          () => this.progressSpinner = false
        );
      }
     );
  }

  reactivateContractDialog(contractId:number,dialogMessage:string){
    this._globalService.messageConfirm(
      this._globalService.translateWordByKey(dialogMessage) ,
      () => {
        this.progressSpinner = true;
        this._contractService.reactivateHoldedContract(contractId).subscribe(
          (result) => {
            if (result.IsSuccess) {
              this.getData();
              console.log(result);
              this._globalService.messageAlert(MessageType.Success,result.Message);
            } else {
              this.progressSpinner = false;
              this._globalService.messageAlert(MessageType.Error,result.Message);
            }
          },
          () => (this.progressSpinner = false),
          () => this.progressSpinner = false
        );
      }
     );
  }

}

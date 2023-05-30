import { Component, OnInit, ViewChild } from "@angular/core";
import { CustomerAccountService } from "../customer-account.service";
import { DatePipe } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { IServiceResult } from "@shared/interfaces/results";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { CustomReportComponent } from "@shared/components/reporting/custom-report/custom-report.component";
import { Operators } from "@shared/models/Operators";
import { FieldTypesEnum } from "@shared/models/dynamic-fields";
import { CustomerAccountModel } from "../../models/customer-account/customer-account.model";
import { CostCenterService } from "@shared/services/cost-center.service";
import { CustomerDetailsPageModel } from "../../models/customer-account/customer-details-page.model";
import { SendCustomerSMSModel } from "../../models/customer-account/send-customer-sms.model";
declare let Swal: any;

@Component({
  selector: "app-details-customer-account",
  templateUrl: "./details-customer-account.component.html",
  styleUrls: ["./details-customer-account.component.scss"],
})
export class DetailsCustomerAccountComponent implements OnInit {
  viewModel: CustomerDetailsPageModel;

  customerCode: string;
  costCenter: string;

  debitCols: any[] = [];
  creditCols: any[] = [];
  logCols: any[] = [];
  filteredArray: any[];
  costCenters: any[] = [];
  selectedContract: any;
  showExtentionMessage: boolean = false;
  showNotification: boolean = false;

  showReport: boolean = false;
  sectorTypeId: string;
  customerData: any;
  customerId: number;
  showModal: boolean = false;
  message: string = "";
  notificationType: string = "";

  constructor(
    private _customerAccountService: CustomerAccountService,
    private _globalService: GlobalService,
    private _route: ActivatedRoute,
    private _costCenterService: CostCenterService,
  ) { }

  ngOnInit() {
    this.customerId = this._route.snapshot.params['id'];
    this.sectorTypeId = this._globalService.getSectorType();
    this.getDetails(this.customerId, '');
    this.defCols();
  }

  defCols() {
    this.debitCols = [
      {
        field: "code",
        header: "App.Fields.DocumentId",
        hidden: false,
      },
      {
        field: "documentDate",
        header: "App.Fields.DocumentDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },
      {
        field: "entityCode",
        header: "Receipts.Fields.ContractId",
        hidden: false,
      },
      {
        field: "voucherType",
        header: "Receipts.Fields.ReciptType",
        hidden: false,
      },
      {
        field: "netValue",
        header: "Receipts.Fields.NetValue",
        hidden: false,
      },
    ];

    this.creditCols = [
      {
        field: "code",
        header: "App.Fields.DocumentId",
        hidden: false,
      },
      {
        field: "documentDate",
        header: "App.Fields.DocumentDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },
      {
        field: "entityCode",
        header: "Receipts.Fields.ContractId",
        hidden: false,
      },
      {
        field: "voucherType",
        header: "Receipts.Fields.ReciptType",
        hidden: false,
      },
      {
        field: "netValue",
        header: "Receipts.Fields.NetValue",
        hidden: false,
      },
    ];

    this.logCols = [
      {
        field: "CreationDate",
        header: "App.Fields.DocumentDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },
      {
        field: "SegmentContractId",
        header: "Receipts.Fields.ContractId",
        hidden: false,
      },
      {
        field: "Message",
        header: "Receipts.Fields.ReciptType",
        hidden: true,
      },
    ];
  }

  getCostCenters(code: string) {
    this._costCenterService
      .getAll(code)
      .subscribe((result: any) => {
        this.filteredArray = [];
        this.filteredArray = result;
        this.costCenters = result;

      });
  }


  filterArray(event, arrayObject: any, ColName = "FullName") {

    this.filteredArray = [];

    if (arrayObject) {
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
  }

  onSelectContract(event) {

    if (event.entityCode === "All" || event.entityCode === "الكل") {
      this.costCenter = null;
      this.showReport = false;
    } else {
      this.costCenter = event?.entityCode;
      this.showReport = true;
    }

    this.getDetails(this.customerId, event?.entityCode)

  }

  openModal() {
    this.showModal = true;
  }

  onClear(event: any) {
    this.reset();
  }

  reset() {
    if (this.viewModel) {
      this.viewModel.customerAccount.currentBalance = 0;
      this.viewModel.customerAccount.creditBalance = 0;
      this.viewModel.customerAccount.debitBalance = 0;
      this.viewModel.credits = [];
      this.viewModel.debits = [];
    }
  }

  getDetails(customerId: number, contractId: string) {

    if (customerId) {
      this.reset();

      this._customerAccountService.details(customerId, contractId, this.sectorTypeId).subscribe(
        (result: CustomerDetailsPageModel) => {
          if (result) {

            this.viewModel = result;
            this.customerCode = this.viewModel?.customerAccount?.code;
            this.getCostCenters(this.viewModel?.customerAccount?.code)
            if (this.viewModel.isExtentionContract)
              this.showExtentionMessage = true;
            else this.showExtentionMessage = false;
            let debitValue =
              this.viewModel && this.viewModel.customerAccount
                ? Number(this.viewModel.customerAccount.debitBalance)
                : 0;
            let creditValue =
              this.viewModel && this.viewModel.customerAccount
                ? Number(this.viewModel.customerAccount.creditBalance)
                : 0;
            if (debitValue <= creditValue) {
              this.showNotification = false;
            } else {
              this.showNotification = true;
            }
          }
        }
      );
    }
  }


  getSMSMessage(notificationType: string) {

    if (notificationType.toLowerCase() === "noify1") {
      this.notificationType = "noify1";
      this.getMessage(1);
    } else if (notificationType.toLowerCase() === "noify2") {
      this.notificationType = "noify2";
      this.getMessage(2);
    } else {
      this.notificationType = "noify3";
      this.getMessage(3);
    }

  }

  sentSms(notificationType: string) {

    let entityCode = this.selectedContract?.entityCode ? this.selectedContract?.entityCode : '';

    this._customerAccountService.isCustomerBalanceDebit(this.viewModel.customerAccount.id, entityCode).subscribe(
      res => {
        if (res) {
          let notificationTypeSelected = notificationType.toUpperCase();
          let customerNotification: SendCustomerSMSModel = {
            message: this.message,
            notificationType: notificationTypeSelected,
            customerId: this.viewModel.customerAccount.id,
            customerCode:this.viewModel.customerAccount.code,
            debitValue: this.viewModel && this.viewModel.customerAccount
              ? Number(this.viewModel.customerAccount.debitBalance)
              : 0,
            creditValue: this.viewModel && this.viewModel.customerAccount
              ? Number(this.viewModel.customerAccount.creditBalance)
              : 0,
            contractId: entityCode
          };

          this._customerAccountService
            .sendCustomerAccountSMS(customerNotification)
            .subscribe((res) => {
              if(res){
                this._globalService.messageAlert(
                  MessageType.Success,
                  this._globalService.translateWordByKey(
                    "App.Messages.SentSuccessFully"
                  )
                );
              }else{

                this._globalService.messageAlert(
                  MessageType.Error,
                  this._globalService.translateWordByKey(
                    "App.Messages.Error"
                  ));
              }
            });
        } else {

          this.showNotification = false;
          this._globalService.messageAlert(
            MessageType.Error,
            this._globalService.translateWordByKey(
              "App.Messages.Error"
            )
          );
        }
      }

    )


  }

  onCancel(event) {
    this.showModal = false;
  }

  getMessage(notificationNumber) {

    let entityCode = this.selectedContract?.entityCode ? this.selectedContract?.entityCode : null;
    this._customerAccountService.getNotificationMessage(
      {
        notificationNumber: notificationNumber,
        customerName: this.viewModel?.customerAccount?.name,
        entityCode: entityCode,
        balance: this.viewModel.customerAccount.currentBalance,
        customerId: this.viewModel.customerAccount.id
      })
      .subscribe(
        (res) => {
          this.message = res;

          Swal.fire({
            title: this.message,
            type: "warning",
            showCancelButton: true,
            confirmButtonText:
              this._globalService.languageGetCurrent === "ar"
                ? "إرسال"
                : "Send",
            cancelButtonText:
              this._globalService.languageGetCurrent === "ar"
                ? "إلغاء"
                : "Cancel",
          }).then((result) => {
            if (result.value) {
              this.sentSms(this.notificationType);
            }
          });
        }
      )

    return this.message;
  }




  @ViewChild(CustomReportComponent) report: CustomReportComponent;

  // showClientAccountStatementReport(contractId) {

  //   let x =this.selectedContract;

  //   this.report.filters = [
  //     {
  //       dataSourceName: "Ds1",
  //       fieldName: "CustomerId",
  //       logicalOperator: "And",
  //       operator: Operators.Equal,
  //       type: FieldTypesEnum.Text,
  //       value: this.customerData.SegmentsCustomerId
  //     },
  //     {
  //       dataSourceName: "Ds1",
  //       fieldName: "ContractId",
  //       logicalOperator: "And",
  //       operator: Operators.Equal,
  //       type: FieldTypesEnum.Text,
  //       value: (contractId === 'All' || contractId === 'الكل') ? ' ' : contractId
  //     }
  //   ];
  //   this.report.reportId = "24";
  //   this.report.reportName = "Sales.Titles.PrintClientAccountStatement";

  //   this.report.showReport();
  // }
}

import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { CustomReportComponent } from "@shared/components/reporting/custom-report/custom-report.component";
import { Operators } from "@shared/models/Operators";
import { FieldTypesEnum } from "@shared/models/dynamic-fields";
import { CostCenterService } from "@shared/services/cost-center.service";
import { CustomerAccountService } from "src/app/receipts/services/customer-account.service";
import { CustomerDetailsPageModel } from "src/app/receipts/models/customer-account/customer-details-page.model";
import { SendCustomerSMSModel } from "src/app/receipts/models/customer-account/send-customer-sms.model";
declare let Swal: any;

@Component({
  selector: "app-details-customer-account",
  templateUrl: "./details-customer-account.component.html",
  styleUrls: ["./details-customer-account.component.scss"],
})
export class DetailsCustomerAccountComponent implements OnInit {

  @ViewChild(CustomReportComponent) report: CustomReportComponent;

  viewModel: CustomerDetailsPageModel;

  customerCode: string;
  costCenter: string;

  debitCols: any[] = [];
  creditCols: any[] = [];

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
        field: "netValueAfterTax",
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
        field: "netValueAfterTax",
        header: "Receipts.Fields.NetValue",
        hidden: false,
      },
    ];
  }

  getCostCenters(code: string) {
    setTimeout(() => {
    this._costCenterService
      .getCostCenterSelectList(this.viewModel?.customerAccount?.code,code)
      .subscribe((result: any) => {
        this.filteredArray = [];
        this.filteredArray = result;
        this.costCenters = result;
        this.filteredArray.unshift({ entityCode:'الكل' });

        if(!this.selectedContract){
          this.selectedContract = {entityCode:'الكل' };
        }

      });
    }, 1500);
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
    debugger
    if (event.entityCode == 'الكل') {
      this.costCenter = null;
      this.showReport = false;
      this.getDetails(this.customerId, '')
    } else {
      this.costCenter = event?.entityCode;
      this.showReport = true;
      this.getDetails(this.customerId, event?.entityCode)
    }



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
    this.notificationType = notificationType;
    this.getMessage();
  }

  sentSms(notificationType: string) {

    let entityCode = this.selectedContract?.entityCode ? this.selectedContract?.entityCode : '';

    let notificationTypeSelected = notificationType.toUpperCase();
    let customerNotification: SendCustomerSMSModel = {
      message: this.message,
      notificationType: notificationTypeSelected,
      customerId: this.viewModel.customerAccount.id,
      customerCode: this.viewModel.customerAccount.code,
      debitValue: this.viewModel && this.viewModel.customerAccount
        ? Number(this.viewModel.customerAccount.debitBalance)
        : 0,
      creditValue: this.viewModel && this.viewModel.customerAccount
        ? Number(this.viewModel.customerAccount.creditBalance)
        : 0,
      entityCode: entityCode,
      balance: this.viewModel.customerAccount.currentBalance
    };

    this._customerAccountService
      .sendCustomerAccountSMS(customerNotification)
      .subscribe((res) => {
        if (res) {
          this._globalService.messageAlert(
            MessageType.Success,
            this._globalService.translateWordByKey(
              "App.Messages.SentSuccessFully"
            )
          );
        } else {

          this._globalService.messageAlert(
            MessageType.Error,
            this._globalService.translateWordByKey(
              "App.Messages.Error"
            ));
        }})
  }

  onCancel(event) {
    this.showModal = false;
  }

  getMessage() {

    let entityCode = this.selectedContract?.entityCode ? this.selectedContract?.entityCode : null;
    this._customerAccountService.getNotificationMessage(
      {
        notificationType: this.notificationType,
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






  showClientAccountStatementReport(contractId) {
    this.report.filters = [
      {
        dataSourceName: "Ds1",
        fieldName: "CustomerId",
        logicalOperator: "And",
        operator: Operators.Equal,
        type: FieldTypesEnum.Text,
        value: this.viewModel?.customerAccount?.code
      },
      {
        dataSourceName: "Ds1",
        fieldName: "ContractId",
        logicalOperator: "And",
        operator: Operators.Equal,
        type: FieldTypesEnum.Text,
        value: (contractId === 'All' || contractId === 'الكل') ? ' ' : contractId
      }
    ];
    this.report.reportId = "24";
    this.report.reportName = "Sales.Titles.PrintClientAccountStatement";

    this.report.showReport();
  }
}

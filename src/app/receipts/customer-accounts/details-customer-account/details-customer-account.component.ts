import { Component, OnInit, ViewChild } from "@angular/core";
import { CustomerAccountService } from "../customer-account.service";
import { DatePipe } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { IServiceResult } from "@shared/interfaces/results";
import { GlobalService } from "@shared/services/global.service";
import { CustomReportComponent } from "@shared/components/reporting/custom-report/custom-report.component";
import { Operators } from "@shared/models/Operators";
import { FieldTypesEnum } from "@shared/models/dynamic-fields";
declare let Swal: any;

@Component({
  selector: "app-details-customer-account",
  templateUrl: "./details-customer-account.component.html",
  styleUrls: ["./details-customer-account.component.scss"],
})
export class DetailsCustomerAccountComponent implements OnInit {
  viewModel: any;
  progressSpinner: boolean;
  isLoading: boolean;
  debitCols: any[] = [];
  creditCols: any[] = [];
  logCols: any[] = [];
  filteredArray: any[];
  customerId: number;
  contracts: any[] = [];
  customerData: any;
  selectedContract: any;
  showExtentionMessage: boolean = false;
  showNotification: boolean = false;
  contractId: number;
  showReport: boolean = false;

  constructor(
    private _customerAccountService: CustomerAccountService,

    private _globalService: GlobalService,

    private _datePipe: DatePipe,
    private _route: ActivatedRoute
  ) {
    _route.queryParams.subscribe((data) => {
      this.customerId = Number(data["id"]);
      this.getCustomerData(this.customerId);
      this.getCustomerContracts();
      this.onSelectContract({ Id: "All" ,SegmentId:'All'});
    });
  }

  ngOnInit() {
    this.debitCols = [
      {
        field: "DebitId",
        header: "App.Fields.DocumentId",
        hidden: false,
      },
      {
        field: "DocumentDate",
        header: "App.Fields.DocumentDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },
      // {
      //   field: 'CustomerId',
      //   header: 'Receipts.Fields.CustomerId',
      //   hidden: false
      // },
      {
        field: "SegmentContractId",
        header: "Receipts.Fields.ContractId",
        hidden: false,
      },
      {
        field: "DebitReceivableTypeId",
        header: "Receipts.Fields.ReciptType",
        hidden: true,
      },
      {
        field: "DebitReceivableTypeArabicName",
        header: "Receipts.Fields.ReciptType",
        hidden: false,
      },
      {
        field: "NetValue",
        header: "Receipts.Fields.NetValue",
        hidden: false,
      },
    ];

    this.creditCols = [
      {
        field: "CreditReceivableId",
        header: "App.Fields.DocumentId",
        hidden: false,
      },
      {
        field: "DocumentDate",
        header: "App.Fields.DocumentDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },
      // {
      //   field: 'CustomerId',
      //   header: 'Receipts.Fields.CustomerId',
      //   hidden: false
      // },
      {
        field: "SegmentContractId",
        header: "Receipts.Fields.ContractId",
        hidden: false,
      },
      {
        field: "CreditReceivableTypeId",
        header: "Receipts.Fields.ReciptType",
        hidden: true,
      },
      {
        field: "CreditReceivableTypeArabicName",
        header: "Receipts.Fields.ReciptType",
        hidden: false,
      },
      {
        field: "NetValueAfterTax",
        header: "Receipts.Fields.NetValueAfterTax",
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
      // {
      //   field: 'CustomerId',
      //   header: 'Receipts.Fields.CustomerId',
      //   hidden: false
      // },
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

  getCustomerData(customerId) {
    this.progressSpinner = true;
    this._customerAccountService.getCustomerData(customerId).subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          this.customerData = result.data;
          this.progressSpinner = false;
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }

  getCustomerContracts() {
    this.progressSpinner = true;
    // this.contractService
    //   .getCustomerContracts(this.customerId)
    //   .subscribe((result: IServiceResult) => {
    //     debugger;
    //     this.progressSpinner = false;
    //     this.filteredArray = [];
    //     this.filteredArray = result.data;
    //     this.filteredArray.unshift({ Id: "All",SegmentId:'All' });

    //     this.selectedContract = { Id: "الكل",SegmentId:'الكل' };
    //     this.contracts = result.data;
    //   });
  }

  filterArray(event, arrayObject: any, ColName = "FullName") {
    debugger;
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
    if (event.SegmentId === "All" || event.SegmentId === "الكل") {
      this.contractId = null;
      this.showReport = false;
    } else {
      this.contractId = event.Id;
      this.showReport = true;
    }
    this.getDetails(this.customerId, event.Id);
  }

  showModal: boolean = false;

  openModal() {
    this.showModal = true;
  }

  onClear(event: any) {
    this.reset();
  }

  reset() {
    if (this.viewModel) {
      this.viewModel.CustomerAccount.CurrentBalance = 0;
      this.viewModel.CustomerAccount.CreditBalance = 0;
      this.viewModel.CustomerAccount.DebitBalance = 0;
      this.viewModel.Credits = [];
      this.viewModel.Debits = [];
    }
  }

  getDetails(customerId: number, contractId: number, fromSms?: boolean) {
    debugger
    if (contractId && customerId) {
      this.reset();

      this.isLoading = true;
      this._customerAccountService.getDetails(customerId, contractId).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            debugger;
            this.viewModel = result.data;

            if (this.viewModel.IsExtentionContract)
              this.showExtentionMessage = true;
            else this.showExtentionMessage = false;

            this.isLoading = false;

            let debitValue =
              this.viewModel && this.viewModel.CustomerAccount
                ? Number(this.viewModel.CustomerAccount.DebitBalance)
                : 0;
            let creditValue =
              this.viewModel && this.viewModel.CustomerAccount
                ? Number(this.viewModel.CustomerAccount.CreditBalance)
                : 0;
            if (debitValue <= creditValue) {
              this.showNotification = false;
            } else {
              this.showNotification = true;
            }
            if (fromSms) {
              if (this.notificationType.toLowerCase() === "noify1") {
                this.message = this.getMessage1();
              } else if (this.notificationType.toLowerCase() === "noify2") {
                this.message = this.getMessage2();
              } else {
                this.message = this.getMessage3();
              }

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
          }
        },
        () => (this.isLoading = false),
        () => (this.isLoading = false)
      );
    }
  }

  message: string = "";
  notificationType: string = "";
  sendSMSMessage(notificationType: string) {
    this.notificationType = notificationType;
    if (this.selectedContract.Id === "الكل") {
      this.getDetails(this.customerId, null, true);
    }
    this.getDetails(this.customerId, this.selectedContract.Id, true);
  }

  sentSms(notificationType: string) {
    debugger;
    let message = "";
    if (notificationType.toLowerCase() === "noify1") {
      message = this.getMessage1();
    } else if (notificationType.toLowerCase() === "noify2") {
      message = this.getMessage2();
    } else {
      message = this.getMessage3();
    }

    let notificationTypeSelected = notificationType.toUpperCase();
    let customerNotification = {
      Message: message,
      NotificationType: notificationTypeSelected,
      CustomerId: 0,
      DebitValue: 0,
      CreditValue: 0,
      ContractId:
        this.selectedContract.SegmentId === "All" ||
        this.selectedContract.SegmentId === "الكل"
          ? null
          : this.selectedContract.Id,
    };

    customerNotification.CustomerId = this.customerData
      ? this.customerData.Id
      : "";
    customerNotification.DebitValue =
      this.viewModel && this.viewModel.CustomerAccount
        ? Number(this.viewModel.CustomerAccount.DebitBalance)
        : 0;
    customerNotification.CreditValue =
      this.viewModel && this.viewModel.CustomerAccount
        ? Number(this.viewModel.CustomerAccount.CreditBalance)
        : 0;

    this.progressSpinner = true;

    this._customerAccountService
      .SendCustomerAccountSMS(customerNotification)
      .subscribe((res) => {
        if (res && res.isSuccess) {
          this.progressSpinner = false;
        } else {
          this.progressSpinner = false;
        }
        () => {
          this.progressSpinner = false;
        };
        () => {
          this.progressSpinner = false;
        };
      });
  }

  onCancel(event) {
    this.showModal = false;
  }

  getMessage1() {
    let contId: string = "";

    contId =
      this.selectedContract.SegmentId === "All" || this.selectedContract.SegmentId === "الكل"
        ? ""
        : `رقم العقد : (${this.selectedContract.SegmentId})`;
    return `عميلنا العزيز / ${this.customerData.Name}
    لديك فواتير لم تسدد بعد، يُرجى سداد المبلغ المستحق
    ${contId}
    مبلغ المديونية: ( ${this.viewModel.CustomerAccount.CurrentBalance} ريال)
     شركة ايوان للموارد البشرية
    بنك الراجحى: رقم حساب 678608010051770 - رقم الابيان SA7280000678608010051770
    شاكرين لك: خدمة العملاء (920007653)`;
  }

  getMessage2() {
    let contId: string = "";

    contId =
      this.selectedContract.SegmentId === "All" || this.selectedContract.SegmentId === "الكل"
        ? ""
        : `رقم العقد : (${this.selectedContract.SegmentId})`;

    return `عزيزى العميل / ${this.customerData.Name}
    لديك فاتورة مستحقة متأخرة لم يتم سدادها ، فضلاً سداد المبلغ فى مدة اقصاها ثلاثة ايام تجنباً لتحويل العقد لقسم الشؤون القانونية
    ${contId}
    مبلغ المديونية: ( ${this.viewModel.CustomerAccount.CurrentBalance} ريال)
     شركة ايوان للموارد البشرية
    بنك الراجحى: رقم حساب 678608010051770 - رقم الابيان SA7280000678608010051770
    شاكرين لك: خدمة العملاء (920007653)`;
  }

  getMessage3() {
    let contId: string = "";

    contId =
      this.selectedContract.SegmentId === "All" || this.selectedContract.SegmentId === "الكل"
        ? ""
        : `رقم العقد : (${this.selectedContract.SegmentId})`;
    return `عزيزى العميل / ${this.customerData.Name}
    لديك فاتورة مستحقة متأخرة لم يتم سدادها ، فضلاً سداد المبلغ فى مدة أقصاها 48 ساعة تجنباً لإتخاذ الإجراءات القانونية
    ${contId}
    مبلغ المديونية: ( ${this.viewModel.CustomerAccount.CurrentBalance} ريال)
     شركة ايوان للموارد البشرية
    بنك الراجحى: رقم حساب 678608010051770 - رقم الابيان SA7280000678608010051770
    شاكرين لك: خدمة العملاء (920007653) `;
  }

  @ViewChild(CustomReportComponent) report: CustomReportComponent;

  showClientAccountStatementReport(contractId) {
    debugger;
    let x =this.selectedContract;

    this.report.filters = [
      {
        dataSourceName: "Ds1",
        fieldName: "CustomerId",
        logicalOperator: "And",
        operator: Operators.Equal,
        type: FieldTypesEnum.Text,
        value: this.customerData.SegmentsCustomerId
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

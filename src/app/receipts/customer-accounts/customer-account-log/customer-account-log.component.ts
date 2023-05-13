import { EventEmitter, Input, Output } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { IServiceResult } from "@shared/interfaces/results";
import { CustomerAccountService } from "../customer-account.service";

@Component({
  selector: "app-customer-account-log",
  templateUrl: "./customer-account-log.component.html",
  styleUrls: ["./customer-account-log.component.scss"],
})
export class CustomerAccountLogComponent implements OnInit {

  @Input("contractId") contractId: number;
  @Input("customerId") customerId: number;

  @Output() cancel = new EventEmitter<boolean>();

  viewModel: any;
  progressSpinner: boolean;
  dataLogs: any[];
  logCols: any[] = [];

  constructor(private _customerAccountService: CustomerAccountService) {}

  ngOnInit() {
    this.logCols = [
      {
        field: "SegmentsCustomerId",
        header: "Receipts.Fields.SegmentsCustomerId",
        hidden: true,
      },

      {
        field: "ContractId",
        header: "Receipts.Fields.ContractId",
        hidden: false,
      },

      {
        field: "CreatedDate",
        header: "App.Fields.SentDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },

      {
        field: "NotificationType",
        header: "App.Fields.NotificationType",
        hidden: false,
      },

      {
        field: "Message",
        header: "App.Fields.Message",
        hidden: false,
      },
    ];
    this.getCustomerAccountLoggers(this.customerId, this.contractId);
  }

 

  getCustomerAccountLoggers(customerId: number, contractId: number) {
    this.progressSpinner = true;
    this._customerAccountService
      .getCustomerAccountLoggers(customerId, contractId)
      .subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.dataLogs = result.data;
            this.progressSpinner = false;
          }
        },
        null,
        () => (this.progressSpinner = false)
      );
  }

  onCancel() {
    this.contractId = null;
    this.customerId = null;
    this.cancel.emit(true);
  }
}

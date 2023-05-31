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

  @Input("costCenter") costCenter: string='';
  @Input("customerCode") customerCode: string;

  @Output() cancel = new EventEmitter<boolean>();

  viewModel: any;
  dataLogs: any[];
  logCols: any[] = [];

  constructor(private _customerAccountService: CustomerAccountService,) {}

  ngOnInit() {
    this.logCols = [
      {
        field: "segmentsCustomerId",
        header: "Receipts.Fields.SegmentsCustomerId",
        hidden: true,
      },

      {
        field: "contractId",
        header: "Receipts.Fields.ContractId",
        hidden: false,
      },

      {
        field: "createdDate",
        header: "App.Fields.SentDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },

      {
        field: "notificationType",
        header: "App.Fields.NotificationType",
        hidden: false,
      },

      {
        field: "message",
        header: "App.Fields.Message",
        hidden: false,
      },
    ];
    this.getCustomerAccountLoggers(this.customerCode, this.costCenter);
  }



  getCustomerAccountLoggers(customerId: string, contractId: string) {
    debugger
    this._customerAccountService
      .getCustomerAccountLoggers(customerId, contractId)
      .subscribe(
        (result: any) => {
          if (result) {
            this.dataLogs = result;
          }
        },
      );
  }

  onCancel() {
    this.costCenter = null;
    this.customerCode = null;
    this.cancel.emit(true);
  }
}

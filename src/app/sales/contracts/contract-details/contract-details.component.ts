import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '../contract.service';
import { IServiceResult } from '@shared/interfaces/results';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contract-details',
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.scss']
})
export class ContractDetailsComponent implements OnInit {
  contract: any;
  progressSpinner: boolean;
  totalRecords;
  contractLines: any[] = [];
  contractlineCols: { field: string; header: string; hidden: boolean, pipe?:string, pipeFormat?: string, type?:string }[];
  underReplacement : string = this._translateService.instant('App.Fields.underReplacement');
  laborFileHistory: any[]=[];

  constructor(
    private _contractService: ContractService,
    private _translateService: TranslateService,
    private _activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.contractlineCols = [
      {
        field: "ContractLineTypeName",
        header: "Sales.Fields.ContractLineTypeName",
        hidden: false,
        type:'status'
      },
      {
        field: "ExpectedDate",
        header: "Sales.Fields.ExpectedDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },
      { field: "OldLaborerFileId", 
        header: "Sales.Fields.OldLaborerFileNumber", 
        hidden: false 
      },
      {
        field: "OldLaborerFileName",
        header: "Sales.Fields.OldLaborerFileName",
        hidden: false,
      },
      {
        field: "OldLaborerStartDate",
        header: "Sales.Fields.OldLaborerStartDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },
      {
        field: "OldLaborerEndDate",
        header: "Sales.Fields.OldLaborerEndDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },
      {
        field: "OldLaborerStatusName",
        header: "Sales.Fields.OldLaborerStatusName",
        hidden: false,
      },
      {
        field: "NewLaborerFileId",
        header: "Sales.Fields.NewLaborerFileId",
        hidden: false,
      },
      {
        field: "NewLaborerFileName",
        header: "Sales.Fields.NewLaborerFileName",
        hidden: false,
      },
      {
        field: "NewLaborerStartDate",
        header: "Sales.Fields.NewLaborerStartDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },
      {
        field: "NewLaborerEndDate",
        header: "Sales.Fields.NewLaborerEndDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
      },
      // {
      //   field: "EntityDate",
      //   header: "Sales.Fields.EntityDate",
      //   hidden: false,
      //   pipe: "date",
      //   pipeFormat: "yyyy-MM-dd",
      // },
      
    ];

    const id = this._activatedRoute.snapshot.paramMap.get('id');
    this.getContract(id);
  }

  getContract(id: string) {
    this.progressSpinner = true;
    this._contractService.get(id).subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          debugger;
          this.contract = result.data;
          this.contractLines = this.contract.ContractLines;
        } else {
          this.contract = {};
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }
}

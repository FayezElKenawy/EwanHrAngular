import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { IServiceResult } from '@shared/interfaces/results';
import { GlobalService, MessageType } from '@shared/services/global.service';
import { ContractService } from '../contract.service';
import { ContractPenalityValueVM } from '../models/ContractPenalityValueVM.model';
import { PenalityFieldVM } from '../models/PenalityFieldVM.model';
declare let $: any;
declare let Swal: any;

@Component({
  selector: 'app-terminate-contract',
  templateUrl: './terminate-contract.component.html',
  styleUrls: ['./terminate-contract.component.scss']
})
export class TerminateContractComponent implements OnInit {
  filteredArray: any[];
  form: FormGroup;
  toYear = new Date().getFullYear() + 5;
  submitted: Boolean;
  progressSpinner: boolean;
  value: any;
  @Output() refresh: EventEmitter<any> = new EventEmitter();
  Contract: any;
  viewModel: any;
  selectedpenalities: ContractPenalityValueVM[];
  constructor(
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _globalService: GlobalService,
    private _contractService: ContractService
  ) {}

  ngOnInit() {
    this.createForm();
  }
  createForm() {
    this.form = this._formBuilder.group({
      TerminationReasonId: ['', Validators.required],
      LaborerStatusId: ['', Validators.required],
      TerminationConfirm: [''],
      ContractStopedDate: [new Date(), Validators.required]
    });
  }

  Show(contract: any) {
    this.Contract = contract;
    this.progressSpinner = true;
    this._contractService.getTerminateAndHoldContractPage(contract.Id).subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          this.viewModel = result.data;
        } else {
        }
      },
      null,
      () => (this.progressSpinner = false)
    );
  }

  onselectReason(event) {
    // const penalites: ContractPenalityValueVM[] = this.viewModel
    //   .ContractPenalities;
    // switch (event.Id) {
    //   case '001':
    //     this.selectedpenalities = penalites.filter(
    //       p => p.PenalityField.PenalityId === '002'
    //     );
    //     break;
    //   case '002':
    //     this.selectedpenalities = penalites.filter(
    //       p => p.PenalityField.PenalityId === '005'
    //     );
    //     break;
    //   case '003':
    //     this.selectedpenalities = penalites.filter(
    //       p => p.PenalityField.PenalityId === '006'
    //     );
    //     break;
    //   case '004':
    //     this.selectedpenalities = penalites.filter(
    //       p => p.PenalityField.PenalityId === '003'
    //     );
    //     break;
    //   case '005':
    //     this.selectedpenalities = penalites.filter(
    //       p => p.PenalityField.PenalityId === '004'
    //     );
    //     break;
    //   default:
    //     break;
    // }
  }
  public get languageGetCurrent() {
    return localStorage.getItem("lang") !== null
      ? localStorage.getItem("lang")
      : "ar";
  }
  StopContractForTermination(terminate?:boolean) {
    this.submitted = true;
    if (this.form.valid) {
      this.progressSpinner = true;
      const postedVM = Object.assign({}, this.form.value);
      postedVM.ContractId = this.Contract.Id;
      postedVM.TerminationReasonId = postedVM.TerminationReasonId.Id;
      postedVM.LaborerStatusId = postedVM.LaborerStatusId.Id;
      postedVM.TerminationConfirm = postedVM.TerminationConfirm;
      postedVM.TerminationCompilation = terminate;
      postedVM.ContractStopedDate = this._datePipe.transform(
        postedVM.ContractStopedDate
      );
      this._contractService.stopContractForTermination(postedVM).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.form.reset();
            this.Contract='';
            $('#terminateContract').modal('hide');
            this.submitted = false;
            this.refresh.emit();
          } else{
              if (result.failedReason === "terminationdate-befourPayAllCost") {
              if (result.data > 0) {//مدين
                debugger;
                if(postedVM.TerminationConfirm){
                  Swal({
                    title:  this._globalService.translateWordByKey(
                      "Sales.Messages.terminationdate-befourPayAllDeptCost"
                    ).replace('#debitValue', result.data).replace('#Date', new Date(postedVM.ContractStopedDate).toDateString())
                    +'\n'
                    + (this.languageGetCurrent === "ar" ? 
                    "هل تريد اكمال انهاء التعاقد قبل تسدبد المديونية؟" :
                      "Are you sure of contract termination before customer pay"),
                    type: (MessageType.Error).toString().toLowerCase(),
                    showCancelButton: true,
                    confirmButtonText: this.languageGetCurrent === "ar" ? "تأكيد" : "Ok",
                    cancelButtonText: this.languageGetCurrent === "ar" ? "اغلاق" : "Close",
                  }).then((result) => {
                    debugger;
                    if (result.value) {
                      
                      this.StopContractForTermination(true);
                    }
                  });
                } else {
                  this._globalService.messageAlert(
                    MessageType.Error,
                    this._globalService.translateWordByKey(
                      "Sales.Messages.terminationdate-befourPayAllDeptCost"
                    ).replace('#debitValue', result.data).replace('#Date', new Date(postedVM.ContractStopedDate).toDateString())
                    
                  );
                }
              
              } else {//دائن
                debugger;
                if(postedVM.TerminationConfirm){
                  debugger;
                  Swal.fire({
                    title: this._globalService.translateWordByKey(
                      "Sales.Messages.terminationdate-befourPayAllCreditCost"
                    ).replace('#CreditValue', result.data * -1)
                    .replace('#Date', new Date(postedVM.ContractStopedDate).toDateString())
                    +'\n'
                    + (this.languageGetCurrent === "ar" ? 
                    "هل تريد اكمال انهاء التعاقد قبل تسدبد المديونية؟" :
                      "Are you sure of contract termination before customer pay"),
                    type: (MessageType.Error).toString().toLowerCase(),
                    showCancelButton: true,
                    confirmButtonText: this.languageGetCurrent === "ar" ? "تأكيد" : "Ok",
                    cancelButtonText: this.languageGetCurrent === "ar" ? "اغلاق" : "Close",
                  }).then((result) => {
                    debugger;
                    if (result.value) {
                      this.StopContractForTermination(true);
                    }
                  });
                } else {
                  this._globalService.messageAlert(
                    MessageType.Error,
                    this._globalService.translateWordByKey(
                      "Sales.Messages.terminationdate-befourPayAllCreditCost"
                    ).replace('#CreditValue', result.data * -1)
                    .replace('#Date', new Date(postedVM.ContractStopedDate).toDateString())
                  );
                }
              }
            }
          }
        },
        null,
        () => (this.progressSpinner = false)
      );
    }
  }

  filterArray(event, arrayObject: any, ColName = 'FullArabicName') {
    this.filteredArray = [];

    for (let i = 0; i < arrayObject.length; i++) {
      const item = arrayObject[i];
      var itemFullName = item[ColName];

      itemFullName = itemFullName.replace(/\s/g, '').toLowerCase();
      var queryString = event.query.replace(/\s/g, '').toLowerCase();
      if (itemFullName.indexOf(queryString) >= 0) {
        this.filteredArray.push(item);
      }
    }
  }

  onClear(controlName: string) {
    this.form.controls[controlName].setValue(null);
  }
}

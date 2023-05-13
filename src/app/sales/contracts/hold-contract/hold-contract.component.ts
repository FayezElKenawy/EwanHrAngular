import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IServiceResult } from '@shared/interfaces/results';
import { ContractService } from '../contract.service';
declare let $: any;


@Component({
  selector: 'app-hold-contract',
  templateUrl: './hold-contract.component.html',
  styleUrls: ['./hold-contract.component.scss']
})
export class HoldContractComponent implements OnInit {
  filteredArray: any[];
  form: FormGroup;
  toYear = new Date().getFullYear() + 5;
  submitted: Boolean;
  progressSpinner: boolean;
  value: any;
  @Output() refresh: EventEmitter<any> = new EventEmitter();
  Contract: any;
  viewModel: any;
  
  constructor(
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _contractService: ContractService
  ) {}

  ngOnInit() {
    this.createForm();
  }
  createForm() {
    this.form = this._formBuilder.group({
      LaborerStatusId: ['', Validators.required],
      ContractHoldDate: [new Date(), Validators.required]
    });
  }

  Show(contract: any) {
    debugger;
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

  onSubmit() {
    debugger;
    this.submitted = true;
    if (this.form.valid) {
      this.progressSpinner = true;
      const postedVM = Object.assign({}, this.form.value);
      postedVM.ContractId = this.Contract.Id;
      postedVM.LaborerStatusId = postedVM.LaborerStatusId.Id;
      postedVM.ContractHoldDate = this._datePipe.transform(
        postedVM.ContractHoldDate
      );
      this._contractService.stopContractHold(postedVM).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.form.reset();
            this.Contract='';
            $('#holdContract').modal('hide');
            this.submitted = false;
            this.refresh.emit();
          }
        },
        null,
        () => (this.progressSpinner = false)
      );
    }
  }

}

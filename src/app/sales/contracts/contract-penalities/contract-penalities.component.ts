import { Component, OnInit, Input } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  FormControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { ContractPenalitiesService } from '../contract-penalities.service';
import { IServiceResult } from '@shared/interfaces/results';
import { PenalityVM } from '../models/PenalityVM.model';
import { PenalityFieldVM } from '../models/PenalityFieldVM.model';
import { ContractPenalityValueVM } from '../models/ContractPenalityValueVM.model';

@Component({
  selector: 'app-contract-penalities',
  templateUrl: './contract-penalities.component.html',
  styleUrls: ['./contract-penalities.component.scss']
})
export class ContractPenalitiesComponent implements OnInit {
  @Input() contractValue: number;
  form: FormGroup;
  viewModel: any;
  penalities: PenalityVM[];
  progressSpinner: boolean;
  constructor(
    private _contractPenalities: ContractPenalitiesService,
    private _formBuilder: FormBuilder,
    private _router: Router
  ) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this._formBuilder.group({
      penalities: this._formBuilder.array([]),
      dummy: []
    });
  }

  getCreate() {
    this._contractPenalities.getCreate().subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          this.viewModel = result.data;
          this.penalities = this.viewModel.Penalities;
          this.buildForm();
          // this.setPenalityValues(this.viewModel.DefaultPenalityValues);
        }
      },
      null,
      () => (this.progressSpinner = false)
    );
  }

  getEdit(id: number) {
    this._contractPenalities.getEdit(id).subscribe((result: IServiceResult) => {
      if (result.isSuccess) {
        this.penalities = result.data.Penalities;
        this.buildForm();
        
        this.setPenalityValues(result.data.ContractPenalityValues);
      }
    });
  }

  buildForm() {
    let fieldsCount = 0;
    for (const p of this.penalities) {
      for (const f of p.PenalityFields) {
        const formarray = this.form.get('penalities') as FormArray;
        formarray.push(
          this._formBuilder.group({
            PenalityFieldId: [f.Id],
            Value: new FormControl(
              { value: '', disabled: true },
              f.IsRequired ? Validators.required : null
            )
          })
        );
        f.Index = fieldsCount;
        fieldsCount++;
      }
    }
  }

  setPenalityValues(contractPenalityValues: ContractPenalityValueVM[]) {
    // check penalities has value
    for (const p of this.penalities) {
      for (const field of p.PenalityFields) {
        if (
          contractPenalityValues.findIndex(
            pv => pv.PenalityFieldId === field.Id && pv.Value !== null
          ) === -1
        ) {
          p.Checked = false;
        } else {
          p.Checked = true;
        }
      }
    }

    // calulate calculated values
    for (const penality of this.penalities) {
      this.selectPenality(penality.PenalityFields, penality.Checked);
    }
    // set penality values
    for (const penalityValue of contractPenalityValues) {
      const penalityField = this.penalities
        .find(p => p.Id === penalityValue.PenalityField.PenalityId)
        .PenalityFields.find(f => f.Id === penalityValue.PenalityFieldId);
      this.form
        .get('penalities')
        .get(penalityField.Index.toString())
        .setValue({
          Value: penalityValue.Value,
          PenalityFieldId: penalityValue.PenalityFieldId
        });
    }

    for (const penality of this.penalities) {
      for (const penalityField of penality.PenalityFields) {
        this.calculate(penalityField);
      }
    }
  }

  selectPenality(penalityFields: PenalityFieldVM[], checked: boolean) {
    for (const element of penalityFields) {
      this.penalities.find(p => p.Id === element.PenalityId).Checked = checked;
      if (!checked) {
        this.form
          .get('penalities')
          .get(element.Index.toString())
          .disable();
      } else {
        this.form
          .get('penalities')
          .get(element.Index.toString())
          .enable();
      }
      this.form
        .get('penalities')
        .get(element.Index.toString())
        .get('Value')
        .reset();
    }
  }

  addContractPenalities(contractId: number, actionType: string) {
    if (this.isFormValid()) {
      let contractPenalityValues = this.form.value.penalities;
      if (!contractPenalityValues) {
        contractPenalityValues = [];
      }
      this._contractPenalities
        .create(contractPenalityValues, contractId)
        .subscribe(
          (result: IServiceResult) => {
            if (result.isSuccess) {
              this._router.navigate(['sales/list-contracts']);
            } else if (actionType === 'create') {
              // another action
              this._router.navigate(['sales/list-contracts']);
            }
          },
          null,
          () => (this.progressSpinner = false)
        );
    }
  }

  isFormValid() {
    return this.form.valid;
  }

  calculate(penalityField: PenalityFieldVM) {
    // for eval
    const contractValue = this.contractValue;
    // get other fields
    const penalityFields = this.penalities.find(
      p => p.Id === penalityField.PenalityId
    ).PenalityFields;
    // set value for calculated field
    for (const field of penalityFields) {
      if (field.IsCalculated) {
        const ratio = this.form
          .get('penalities')
          .get(penalityFields[0].Index.toString()).value['Value'];

        const penalitiesFormArray = this.form.get('penalities') as FormArray;
        penalitiesFormArray.controls
          .find(f => f.value.PenalityFieldId === field.Id)
          .setValue({
            Value: eval(field.Expression).toString(),
            PenalityFieldId: field.Id
          });
      }
    }
  }
}

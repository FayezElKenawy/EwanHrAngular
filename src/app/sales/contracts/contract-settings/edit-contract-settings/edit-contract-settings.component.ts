import { GlobalService } from "@shared/services/global.service";
import { Component, OnInit } from "@angular/core";
import { ContractSettingService } from "../../contract-setting.service";
import { PenalityVM } from "../../models/PenalityVM.model";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
import { IServiceResult } from "@shared/interfaces/results";
import { PenalityFieldVM } from "../../models/PenalityFieldVM.model";
import { ContractSettingVM } from "../../models/ContractSettingVM";
import { ContractSettingsFields } from "../../models/ContractSettingsFields";

@Component({
  selector: "app-edit-contract-settings",
  templateUrl: "./edit-contract-settings.component.html",
  styleUrls: ["./edit-contract-settings.component.scss"],
})
export class EditContractSettingsComponent implements OnInit {
  constructor(
    private _contractSetting: ContractSettingService,
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService
  ) { }
  viewModel: any;
  penalitiesVM: PenalityVM[];
  form: FormGroup;
  progressSpinner: boolean;
  contractSettingFields: ContractSettingsFields;
  ngOnInit() {
    this.progressSpinner = true;
    this.createForm();
    this.getContractSettings();

    this._globalService.languageOnChange().subscribe(() => {
      this.getContractSettings();
    });
  }
  isFormValid() {
    return this.form.valid;
  }

  getContractSettings() {
    this.progressSpinner = true;
    this._contractSetting.getEdit().subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          this.viewModel = result.data;
          let fieldsCount = 0;

          this.penalitiesVM = this.viewModel.PenalityList;
          const formarray = this.form.get("penalities") as FormArray;
          while (formarray.length !== 0) {
            formarray.removeAt(0);
          }
          this.penalitiesVM.forEach((p) => {
            p.PenalityFields.forEach((f) => {
              formarray.push(
                this._formBuilder.group({
                  Key: [""],
                  ContractSettingTypeId: ["2"],
                  Value: new FormControl(
                    { value: "", disabled: true },
                    f.IsRequired ? Validators.required : null
                  ),
                })
              );
              f.Index = fieldsCount;
              fieldsCount++;
            });
          });

          this.setValues();
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }

  createForm() {
    this.form = this._formBuilder.group({
      // LaborerData: this._formBuilder.control(
      //   "LaborerData",
      //   Validators.required
      // ),
      penalities: this._formBuilder.array([]),
    });
  }

  setValues() {
    // this.form.controls["LaborerData"].setValue(
    //   this.viewModel.LaborerReceiptionDays
    // );

    const contractSettingsValues: ContractSettingVM[] = this.viewModel
      .contractSettingValueList;

    this.penalitiesVM.forEach((p) => {
      p.PenalityFields.forEach((field) => {
        if (
          contractSettingsValues.findIndex(
            (pv) => pv.Key === field.Id && pv.Value !== null
          ) === -1
        ) {
          p.Checked = false;
        } else {
          p.Checked = true;
        }
      });
    });

    for (const penality of this.penalitiesVM) {
      this.selectPenality(penality.PenalityFields, penality.Checked);
    }
    contractSettingsValues.forEach((Value) => {
      this.penalitiesVM.forEach((p) => {
        p.PenalityFields.forEach((pf) => {
          if (Value.Key == pf.Id) {
            this.form.get("penalities").get(pf.Index.toString()).setValue({
              ContractSettingTypeId: Value.ContractSettingTypeId,
              Value: Value.Value,
              Key: Value.Key,
            });
          }
        });
      });
    });
  }

  Submit() {
    ;
    if (this.form.valid) {
      this.progressSpinner = true;
      ;
      this.contractSettingFields = new ContractSettingsFields();
      this.contractSettingFields.PenalityFields = [];

      this.contractSettingFields.PenalityFields = Object.assign(
        {},
        this.form.get("penalities")
      ).value;

      this._contractSetting
        .Edit(this.contractSettingFields.PenalityFields)
        .subscribe(() => {
          this.contractSettingFields.PenalityFields = [];
          this.progressSpinner = false;
        });
    }
  }

  selectPenality(penalityFields: PenalityFieldVM[], checked: boolean) {
    penalityFields.forEach((element) => {
      this.penalitiesVM.find(
        (p) => p.Id === element.PenalityId
      ).Checked = checked;
      if (!checked) {
        this.form.get("penalities").get(element.Index.toString()).disable();
      } else {
        this.form.get("penalities").get(element.Index.toString()).enable();
      }
      this.form
        .get("penalities")
        .get(element.Index.toString())
        .get("Value")
        .reset();
    });
  }
}

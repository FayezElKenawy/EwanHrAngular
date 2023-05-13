import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { GlobalService } from '@shared/services/global.service';
import { LangChangeEvent } from '@ngx-translate/core';
import { FilterField, FieldTypesEnum } from '@shared/models/dynamic-fields';
import { Sorting } from '@shared/models/Sorting';
import { Filter } from '@shared/models/Filter';
import { ReportViewerComponent } from '../report-viewer/report-viewer.component';

@Component({
  selector: 'app-dynamic-report-viewer',
  templateUrl: './dynamic-report-viewer.component.html',
  styleUrls: ['./dynamic-report-viewer.component.scss']
})
export class DynamicReportViewerComponent implements OnInit {
  @Input() filterFields: FilterField[];
  @Input() reportId: string;
  @Input() sorting: Sorting[];
  @Input() params: object[];
  @Input() paging: boolean;
  @ViewChild(ReportViewerComponent) reportViewer: ReportViewerComponent;
  form: FormGroup;
  showReport = false;
  progressSpinner = false;

  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private globalService: GlobalService
  ) {
    this.globalService
      .languageOnChange()
      .subscribe((event: LangChangeEvent) => {
        if (this.showReport) {
          this.OnSubmitForm();
        }
      });
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      filters: this.formBuilder.array([])
    });

    this.filterFields.forEach(field => {
      const filters = this.filterFieldsFormArray;
      filters.push(
        this.formBuilder.group({
          type: [field.type],
          dataSourceName: [field.dataSourceName],
          fieldName: [field.fieldName],
          operator: [field.operator],
          value: [field.value],
          logicalOperator: [field.logicalOperator],
          isParam: [field.isParam],
          paramName: [field.paramName]
        })
      );

      if (
        field.type === this.fieldTypesEnum.AutoComplete ||
        field.type === this.fieldTypesEnum.DropDown
      ) {
        if (!field.selectFieldProps) {
          throw `selectFieldProps can not be null or undefiened for AutoComplete and DropDown search fields.please provide it`;
        }
        if (
          !field.selectFieldProps.selectList &&
          !field.selectFieldProps.getSelectList
        ) {
          throw 'selectFieldProps.selectList && selectFieldProps.getSelectList can not be null or undefiened for AutoComplete and DropDown search fields. Please provide one of them';
        }

        field.selectFieldProps.key = field.selectFieldProps.key || 'Id';
        field.selectFieldProps.value =
          field.selectFieldProps.value || 'FullName';

        if (
          field.type === this.fieldTypesEnum.DropDown &&
          !field.selectFieldProps.selectList &&
          field.selectFieldProps.getSelectList
        ) {
          this.progressSpinner = true;
          field.selectFieldProps.getSelectList().subscribe(result => {
            field.selectFieldProps.selectList = result.data || [];
            this.progressSpinner = false;
          });
        }
      }
    });
  }

  get filterFieldsFormArray() {
    return this.form.get('filters') as FormArray;
  }

  get fieldTypesEnum() {
    return FieldTypesEnum;
  }

  completeMethod(event, field: FilterField) {

    if (field && field.type == this.fieldTypesEnum.AutoComplete) {
      if (field.selectFieldProps.apiSingleCalling === true) {
        if (
          !(field.selectFieldProps as any).allDataList ||
          (field.selectFieldProps as any).allDataList.length == 0
        ) {
          field.selectFieldProps
            .getSelectList(null, this.filterFieldsFormArray.value)
            .subscribe(result => {
              field.selectFieldProps.selectList = result.data || [];
              (field.selectFieldProps as any).allDataList =
                field.selectFieldProps.selectList;
            });
        } else {
          const allDataList: any[] = (field.selectFieldProps as any)
            .allDataList;

          field.selectFieldProps.selectList =
            event.query === ''
              ? [...allDataList]
              : allDataList.filter(f => {
                const value = f[field.selectFieldProps.value]
                  .replace(/\s/g, '')
                  .toLowerCase();
                const queryString = event.query
                  .replace(/\s/g, '')
                  .toLowerCase();
                if (value.indexOf(queryString) >= 0) {
                  return true;
                }
                return false;
              }) || [];
        }
      } else {
        field.selectFieldProps
          .getSelectList(event.query, this.filterFieldsFormArray.value)
          .subscribe(result => {
            field.selectFieldProps.selectList = result.data || [];
          });
      }
    }
  }

  resetForm() {
    this.resetFields();
    this.reportViewer.filters = this.filters;
    this.reportViewer.showReport();
  }

  resetFields() {
    if (this.filterFields && this.filterFields.length > 0) {
      for (let index = 0; index < this.filterFields.length; index++) {
        if (index < this.filterFieldsFormArray.controls.length) {
          const group = this.filterFieldsFormArray.get(index.toString());
          if (group) {
            group.get('value').reset();
          }
        }
      }
    }
  }

  OnSubmitForm() {
    this.reportViewer.filters = this.filters;
    this.showReport = true;
    this.reportViewer.showReport();
  }

  private get filters(): any {
    const formArrayValue = this.filterFieldsFormArray.value as Filter[];
    const filters: Filter[] = [];
    for (let index = 0; index < formArrayValue.length; index++) {
      const element = formArrayValue[index];
      const filterField = this.filterFields[index];
      if (element.value) {
        if (filterField.type === FieldTypesEnum.AutoComplete) {
          filters.push({
            dataSourceName: element.dataSourceName,
            fieldName: element.fieldName,
            logicalOperator: element.logicalOperator,
            operator: element.operator,
            type: element.type,
            value: element.value[filterField.selectFieldProps.key],
            isParam: element.isParam,
            paramName: element.paramName
          });
        } else if (filterField.type === FieldTypesEnum.Date) {
          filters.push({
            dataSourceName: element.dataSourceName,
            fieldName: element.fieldName,
            logicalOperator: element.logicalOperator,
            operator: element.operator,
            type: element.type,
            value: element.value
              ? this.datePipe.transform(element.value, 'yyyy-MM-dd')
              : '',
            isParam: element.isParam,
            paramName: element.paramName
          });
        } else {
          filters.push(element);
        }
      }
    }
    return filters;
  }
}

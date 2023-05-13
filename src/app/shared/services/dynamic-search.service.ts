import { Injectable } from '@angular/core';
import { FormBuilder, FormArray } from '@angular/forms';
import { SearchModel } from '@shared/interfaces/search-model';

@Injectable({
  providedIn: 'root'
})
export class DynamicSearchService {
  operators: string[] = [
    'GreaterThan',
    'GreaterThanOrEqual',
    'LessThan',
    'LessThanOrEqual',
    'Contain',
    'NotContain',
    'Equal',
    'NotEqual'
  ];

  constructor(private _formBuilder: FormBuilder) {}

  initializeSearch() {}

  lazy(event, searchModel: SearchModel, func) {
    searchModel.OrderBy = event.sortField;
    searchModel.OrderType = event.sortOrder === 1 ? 'asc' : 'desc';
    searchModel.PageNumber = event.first / event.rows + 1;
    searchModel.PageSize = event.rows;
    func();
  }

  buildSearchForm(cols: any) {
    const searchForm = this._formBuilder.group({
      SearchFields: this._formBuilder.array([])
    });
    const formarray = searchForm.get('SearchFields') as FormArray;
    cols.forEach(element => {
      if (element.searchType === 'select') {
        formarray.push(
          this._formBuilder.group({
            FieldName: [element.searchField],
            Operator: ['Contain'],
            Value: ['']
          })
        );
      } else {
        formarray.push(
          this._formBuilder.group({
            FieldName: [element.field],
            Operator: ['Contain'],
            Value: ['']
          })
        );
      }
    });
    return searchForm;
  }

  reset(searchForm, cols, func) {
    const x = searchForm.get('SearchFields') as FormArray;
    for (let index = 0; index < cols.length; index++) {
      if (cols[index].searchable) {
        searchForm
          .get('SearchFields')
          .get(index.toString())
          .get('Value')
          .reset();
      }
    }
    func();
  }

  search(searchForm, searchModel, func) {
    searchModel.PageNumber = 1;
    searchModel.SearchFields = searchForm.get('SearchFields').value;
    func();
  }
}

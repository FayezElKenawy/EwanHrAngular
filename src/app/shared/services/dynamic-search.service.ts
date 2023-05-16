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
    debugger;
    if(event.sortField)
    searchModel.orderBy = event.sortField;

    if(event.sortOrder)
    searchModel.orderType = event.sortOrder === 1 ? 'asc' : 'desc';
    
    if(event.first && event.first > 0 && event.rows)
      searchModel.pageNumber = event.first / event.rows + 1;
    else
      searchModel.pageNumber = 1;

    if(event.rows)
    searchModel.pageSize = event.rows;

    func();
  }

  buildSearchForm(cols: any) {
    debugger;
    const searchForm = this._formBuilder.group({
      searchFields: this._formBuilder.array([])
    });
    const formarray = searchForm.get('searchFields') as FormArray;
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
    debugger;
    const x = searchForm.get('searchFields') as FormArray;
    for (let index = 0; index < cols.length; index++) {
      if (cols[index].searchable) {
        searchForm
          .get('searchFields')
          .get(index.toString())
          .get('Value')
          .reset();
      }
    }
    func();
  }

  search(searchForm, searchModel, func) {
    debugger;
    searchModel.pageNumber = 1;
    searchModel.searchFields = searchForm.get('searchFields').value;
    func();
  }
}

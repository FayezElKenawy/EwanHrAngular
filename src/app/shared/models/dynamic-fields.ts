import { Observable } from 'rxjs';
import { IServiceResult } from '@shared/interfaces/results';
import { Operators } from './Operators';

export enum FieldTypesEnum {
  None = 0,
  Text = 1,
  Number = 2,
  Date = 3,
  DropDown = 4,
  AutoComplete = 5
}

export interface SelectFieldProps {
  key?: string;
  value?: string;
  selectList?: any[];
  apiSingleCalling?: boolean;

  getSelectList?: (
    searchQuery?: string,
    searchData?: any[]
  ) => Observable<IServiceResult>;
}

export interface FilterField {
  title: string;
  // key: string;
  secondKeyIsLocalized?: boolean;
  type: FieldTypesEnum;
  value?: any;
  colSize?: number;
  selectFieldProps?: SelectFieldProps;
  showOperators?: boolean;
  isLocalized?: boolean;
  hidden?: boolean;
  // report
  fieldName: string;
  dataSourceName: string;
  operator: Operators;
  logicalOperator: string;
  isParam?: boolean;
  paramName?: string;
}

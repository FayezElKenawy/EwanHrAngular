import { Operators } from './Operators';
import { FieldTypesEnum } from './dynamic-fields';
export interface Filter {
  dataSourceName: string;
  fieldName: string;
  operator: Operators;
  value: any;
  logicalOperator: 'Or' | 'And';
  type: FieldTypesEnum;
  isParam?: boolean;
  paramName?: string;
}

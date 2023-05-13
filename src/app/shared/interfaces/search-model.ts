export interface SearchModel {
  SearchFields?: SearchField[];
  OrderBy?: string;
  OrderType?: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface SearchField {
  FieldName: string;
  Operator: string;
  Value: string;
}

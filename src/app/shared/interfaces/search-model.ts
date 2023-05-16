export interface SearchModel {
  searchFields?: SearchField[];
  orderBy?: string;
  orderType?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface SearchField {
  FieldName: string;
  Operator: string;
  Value: string;
}

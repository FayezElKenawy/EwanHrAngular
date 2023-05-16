export class SearchModel {
  searchFields?: SearchField[];
  orderBy?: string;
  orderType?: string;
  pageNumber?: number = 1;
  pageSize?: number = 10;
}

export class SearchField {
  FieldName: string;
  Operator: string;
  Value: string;
}

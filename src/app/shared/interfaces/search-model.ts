import { Employees } from "src/app/attendance/models/emps-info.model";

export class SearchModel {
  searchFields?: SearchField[];
  orderBy?: string;
  orderType?: string;
  pageNumber?: number = 1;
  pageSize?: number = 10;
}

export class SearchField {
  fieldName: string;
  operator: string;
  value: string;
}

import { SearchField } from '@shared/interfaces/search-model';
import { ListAction } from './action';
import { ColumnType } from './column-type.model';

export class PageListConfig {
  pageAuthorization: string;
  pageTitle: string;
  createLink: string;
  createAuthorization: string;
  createButtonTitle: string;
  getDataAPIURL: string;
  searchFields?: SearchField[] = []; // for static Search
  defaultOrder?:string;
  defaultOrderType?:string;
  cols: ColumnType[] = [];
  actions: ListAction[] = [];
}

import { PagingMetaData } from "./paging-meta-data";

export interface PagedList {
  pagingData: PagingMetaData;
  entities: any[];
}

export interface PagingMetaData {
  PageCount: number;
  TotalItemCount: number;
  PageNumber: number;
  PageSize: number;
  HasPreviousPage: boolean;
  HasNextPage: boolean;
  IsFirstPage: boolean;
  IsLastPage: boolean;
  FirstItemOnPage: number;
  LastItemOnPage: number;
}

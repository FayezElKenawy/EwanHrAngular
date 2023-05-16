// Server Side Result Returned for API Methods
export interface IResultVM {
  IsSuccess: boolean;
  FailedReason: string;
  Message: string;
  Data: any;
}

// Client Side Result Returned for Angular Service
export interface IServiceResult {
  isSuccess: boolean;
  data?: any;
  failedReason?: string;
}


export interface IResult {
  entities?: any;
  pagingData?: any;
}

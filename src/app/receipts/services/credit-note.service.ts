import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { Observable } from "rxjs";
import { IServiceResult, IResultVM, IResult } from "@shared/interfaces/results";
import { catchError } from "rxjs/operators";
import { SearchField, SearchModel } from "@shared/interfaces/search-model";
import { PagedList } from "@shared/interfaces/paged-list";
import { Operators } from "@shared/models/Operators";
import { GetCreditNoteModel } from "../models/creditNote/get-credit-note.model";

@Injectable({
  providedIn: "root",
})
export class CreditNoteService {
  //?api-version=1
  serviceUrl = `${environment.financeSectorAPIURL}`;
  customerUrl = `${environment.financeSectorAPIURL}/MasterData/Customer`;
  ContractUrl = `${environment.financeSectorAPIURL}/MasterData/Contract`;

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getPagedList(searchModel: SearchModel): Observable<PagedList> {

    return this._http.post<PagedList>(`${this.serviceUrl}/v1/CreditNote/GetPagedList`, searchModel)
  }

  getById(id: any): Observable<GetCreditNoteModel> {
    return this._http.get<GetCreditNoteModel>(`${this.serviceUrl}/v1/CreditNote/Details/${id}`)
  }

  create(postedVM: any): Observable<any> {
      return this._http.post(`${this.serviceUrl}/v1/CreditNote/Create`, postedVM)
  }

  getVouchers(entityCode: any): Observable<any> {
    return this._http.get(`${this.serviceUrl}/v1/Voucher/GetVouchersById?entityCode=${entityCode}`);
  }


  getCostElements():Observable<any>{
    return this._http.get(`${this.serviceUrl}/v1/CostElement/GetSelectList?sectorId=${this._globalService.getSectorType()}`)
  }
}

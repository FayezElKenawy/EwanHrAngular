import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { Observable } from "rxjs";
import { IServiceResult, IResultVM } from "@shared/interfaces/results";
import { catchError } from "rxjs/operators";
import { ReceiptsModule } from "../receipts.module";
import { SearchModel } from "@shared/interfaces/search-model";
import { PagedList } from "@shared/interfaces/paged-list";
@Injectable({
  providedIn: "root",
})
export class DebitNoteService {
  serviceUrl = `${environment.financeSectorAPIURL}/v1/DebitNote`;
  ContractUrl = `${environment.financeSectorAPIURL}/Sales/Contract`;
  customerUrl = `${environment.financeSectorAPIURL}/MasterData/Customer`;

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) { }

  getAll(searchModel: SearchModel): Observable<PagedList> {
    return this._http.post<PagedList>(`${this.serviceUrl}/GetPagedList`, searchModel)
  }

  getById(id: any): Observable<PagedList> {
    return this._http.get<PagedList>(`${this.serviceUrl}/Details/${id}`)
  }

  create(postedVM: any): Observable<any> {
    return this._http.post(`${this.serviceUrl}/Create`, postedVM)
  }


}


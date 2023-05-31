import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { GlobalService, MessageType } from '@shared/services/global.service';
import { Observable } from 'rxjs';
import { SearchModel } from '@shared/interfaces/search-model';
import { PagedList } from '@shared/interfaces/paged-list';

@Injectable({
  providedIn: 'root'
})
export class CreditInvoiceService { serviceUrl = `${environment.financeSectorAPIURL}/v1/CreditInvoice`;
constructor(
  private _http: HttpClient,
  private _globalService: GlobalService
) { }

GetPagedList(searchModel: SearchModel): Observable<PagedList> {
  return this._http.post<PagedList>(`${this.serviceUrl}/GetPagedList`, searchModel)
}

getDetails(id: any): Observable<PagedList> {
  return this._http.get<PagedList>(`${this.serviceUrl}/Details/${id}`)
}

create(postedVM: any): Observable<any> {
  return this._http.post(`${this.serviceUrl}/Create`, postedVM)
}


}

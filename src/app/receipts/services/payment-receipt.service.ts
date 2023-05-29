import { Injectable, ɵbypassSanitizationTrustStyle } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { Observable } from "rxjs";
import { IServiceResult, IResultVM } from "@shared/interfaces/results";
import { catchError } from "rxjs/operators";
import { SearchModel } from "@shared/interfaces/search-model";
import { PagedList } from "@shared/interfaces/paged-list";

@Injectable({
  providedIn: "root",
})
export class PaymentReceiptService {
  serviceUrl = `${environment.financeSectorAPIURL}/v1/PaymentReceipt`;
  ContractUrl = `${environment.financeSectorAPIURL}/Sales/Contract`;
  customerUrl = `${environment.financeSectorAPIURL}/MasterData/Customer`;
  serviceVoucherUrl = `${environment.financeSectorAPIURL}/v1/Voucher`;
  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) {}

  getPagedList(searchModel: SearchModel): Observable<PagedList> {
    return this._http.post<PagedList>(`${this.serviceUrl}/GetPagedList`, searchModel)
  }

  create(postedVM: any): Observable<any> {
    return this._http.post(`${this.serviceUrl}/Create`, postedVM)
  }

  edit(postedVM: any): Observable<any> {
    return this._http .post(`${this.serviceUrl}/Update`, postedVM)
  }

  getVouchers(entityCode: any): Observable<any> {
    return this._http.get(`${this.serviceVoucherUrl}/GetVouchersById?entityCode=${entityCode}`);
  }

  details(paymentId: string): Observable<any>  {
    return this._http.get(`${this.serviceUrl}/Details/${paymentId}`)
  }

}

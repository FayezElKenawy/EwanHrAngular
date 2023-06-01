import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { GlobalService } from "@shared/services/global.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CostElementService {

  serviceUrl = `${environment.financeSectorAPIURL}/v1/CostElement`;

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) { }


  getSelectListCostElementsBySectorId(searchTerm:string): Observable<any> {
    return this._http.get<any>(`${this.serviceUrl}/GetSelectList`, {
      params: { sectorId: this._globalService.getSectorType() , searchTerm: searchTerm },
    });
  }

}

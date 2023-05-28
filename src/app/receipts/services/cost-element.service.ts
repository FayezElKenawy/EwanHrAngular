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


  getCostElements(): Observable<any> {
    return this._http.get(`${this.serviceUrl}/GetSelectList?sectorId=${this._globalService.getSectorType()}`)
  }

}

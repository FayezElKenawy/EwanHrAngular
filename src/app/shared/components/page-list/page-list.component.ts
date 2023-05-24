import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LangChangeEvent } from '@ngx-translate/core';
import { PagedList } from '@shared/interfaces/paged-list';
import { PagingMetaData } from '@shared/interfaces/paging-meta-data';
import { SearchModel } from '@shared/interfaces/search-model';
import { PageListConfig } from '@shared/models/page-list-config.model';
import { DynamicSearchService } from '@shared/services/dynamic-search.service';
import { GlobalService } from '@shared/services/global.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.scss'],
})
export class PageListComponent implements OnInit {
  @Input() pageListConfig: PageListConfig;

  selectedItem: any;
  progressSpinner = true;
  pagingMetaData: PagingMetaData;
  searchForm: FormGroup;
  searchModel: SearchModel = {};
  operators: string[];
  dataItems: any[] = [];

  constructor(
    public _dynamicSearchService: DynamicSearchService,
    private _http: HttpClient,
    private _globalService: GlobalService
  ) { }

  ngOnInit() {
    this._globalService
      .languageOnChange()
      .subscribe((event: LangChangeEvent) => {
        this.getPagedList()
      });

    this.searchForm = this._dynamicSearchService.buildSearchForm(
      this.pageListConfig?.cols
    );
    this.operators = this._dynamicSearchService.operators;

    this.searchModel.searchFields = [];
  }

  getPagedList() {

    if (this.pageListConfig.defaultOrder && !this.searchModel.orderBy) {
      this.searchModel.orderBy = this.pageListConfig.defaultOrder;
      this.searchModel.orderType = this.pageListConfig.defaultOrderType;
    }

    this.pageListConfig.searchFields.forEach((field) => {
      this.searchModel.searchFields.push({
        fieldName: field.fieldName,
        operator: field.operator,
        value: field.value,
      });
    });

    this._http
      .post<PagedList>(`${this.pageListConfig.getDataAPIURL}`, this.searchModel)
      .subscribe((result: PagedList) => {
        this.dataItems = result.entities;
        this.pagingMetaData = result.pagingData;
      });
  }
}

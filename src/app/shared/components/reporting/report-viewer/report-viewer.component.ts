import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Filter } from '@shared/models/Filter';
import { Sorting } from '@shared/models/Sorting';
import { environment } from '@environments/environment';
import { Page } from '@shared/models/Page';
import { DomSanitizer } from '@angular/platform-browser';
import { ReportService } from '@shared/services/report.service';
import { PagingType } from '@shared/models/Operators';

@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss']
})
export class ReportViewerComponent implements OnInit {
  from: FormGroup;
  @Input() reportId: string;
  @Input() filters: Filter[];
  @Input() sorting: Sorting[];
  @Input() params: object[];
  @Input() paging: boolean;

  load = false;
  progressSpinner = false;
  serviceUrl = `${environment.reportingApiUrl}`;
  paginationInfo: Page;
  Url: string;
  reportURL: any;
  exportItems: string;
  hidden: boolean;
  constructor(
    private sanitizer: DomSanitizer,
    private _reportService: ReportService
  ) { }

  ngOnInit() {
    this.sanitizer.bypassSecurityTrustResourceUrl('');
    this.paginationInfo = { pageNo: 1, pageSize: 500 };
  }

  showReport() {
    this.progressSpinner = true;
    this.Url =
      this.serviceUrl +
      `/Report/GetReport?id=${this.reportId}&pageSize=${this.paginationInfo.pageSize}`;
    this.UpdatePaging();

    this._reportService
      .getPaginationInfo(
        this.reportId,
        this.paginationInfo.pageSize,
        this.filterString
      )
      .subscribe(
        result => {
          if (result.isSuccess) {
            this.paginationInfo.totalPages =
              result.data.TotalRecords === 0
                ? 1
                : Math.ceil(result.data.TotalRecords / result.data.PageSize);
            this.paginationInfo.pageSize = result.data.PageSize;
          }
        },
        null,
        () => { }
      );
  }

  private get filterString(): string {
    let filterString = '';
    let index = 1;
    if (this.filters) {
      this.filters.forEach(filter => {
        if (filter.value) {
          filterString += `&${filter.dataSourceName}_Filter${index}=${filter.logicalOperator},${filter.fieldName},${filter.operator},${filter.value}`;
          index++;
        }
      });
    }
    return filterString;
  }

  private get SortString(): string {
    let queryString = '';
    let index = 1;
    if (this.sorting) {
      this.sorting.forEach(sort => {
        queryString += `&${sort.dataSourceName}_Sort${index}=${sort.fieldName},${sort.sortOperator}`;
        index++;
      });
    }
    return queryString;
  }

  private get paramString(): string {
    let paramString = '';
    if (this.params) {
      this.params.forEach(param => {
        for (const key in param) {
          if (param.hasOwnProperty(key)) {
            const value = param[key];
            paramString += `&${key}=${value}`;
          }
        }
      });
    }

    this.filters
      .filter(f => f.isParam)
      .forEach(field => {

        if (field.paramName) {
          paramString += `&${field.paramName}=${field.value}`;
        }
      });
    return paramString;
  }

  UpdatePaging() {
    this.reportURL = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.Url +
      '&pageNo=' +
      this.paginationInfo.pageNo +
      this.filterString +
      this.SortString +
      this.paramString
    );
    const exportURL =
      this.Url +
      '&pageNo=' +
      this.paginationInfo.pageNo +
      this.filterString +
      this.SortString +
      this.paramString;
    this.exportItems = `<li><a href="${exportURL}&exportType=excel"> Excel </a></li>
    <li><a href="${exportURL}&exportType=word" > Word </a></li>
    <li><a href="${exportURL}&exportType=pdf" > PDF </a></li>`;
  }

  paginate(pagingType: PagingType) {
    if (this.paginationInfo.pageNo <= 1) {
      return;
    }
    if (this.paginationInfo.pageNo <= 1) {
      return;
    }
    this.progressSpinner = true;
    switch (pagingType) {
      case PagingType.First:
        this.paginationInfo.pageNo = 1;
        break;
      case PagingType.Last:
        this.paginationInfo.pageNo = this.paginationInfo.totalPages;
        break;
      case PagingType.Next:
        this.paginationInfo.pageNo++;
        break;
      case PagingType.Previous:
        this.paginationInfo.pageNo--;
        break;
      default:
        break;
    }
    this.UpdatePaging();
  }

  onLoad() {
    this.hidden = false;
    this.progressSpinner = false;
  }

  onLoadStart() {
    this.hidden = true;
  }

  public get pagingType() {
    return PagingType;
  }
}

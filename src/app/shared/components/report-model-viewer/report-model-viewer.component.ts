import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '@environments/environment';
import { ReportService } from '@shared/services/report.service';

@Component({
  selector: 'app-report-model-viewer',
  templateUrl: './report-model-viewer.component.html',
  styleUrls: ['./report-model-viewer.component.scss']
})
export class ReportModelViewerComponent implements OnInit {
  reportName: string;
  progressSpinner = false;
  serviceUrl = `${environment.reportingApiUrl}`;
  fileUrl: any = '';
  pageNo: any = 1;
  pageSize: any = 500;
  totalPages: any;
  paginationInfo: any;
  load = false;
  queryString: string;
  hidden = true;
  reportId: any;
  exportType = '';
  exportItems: any;
  Url: string;
  //
  paging = false;
  constructor(
    private sanitizer: DomSanitizer,
    private _reportService: ReportService
  ) {}

  ngOnInit() {
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  showReprot(reportId: any, queryString: string, paging: boolean) {
    this.paging = paging;
    this.hidden = true;
    this.reportId = reportId;
    this.progressSpinner = true;
    this.queryString = queryString;
    this.Url =
      this.serviceUrl +
      `/Report/GetReport?id=${this.reportId}&pageSize=${this.pageSize}`;
    this.UpdatePaging(this.queryString);
    this._reportService
      .getPaginationInfo(reportId, this.pageSize, this.queryString)
      .subscribe(
        result => {
          if (result.isSuccess) {
            this.totalPages =
              result.data.TotalRecords === 0
                ? 1
                : Math.ceil(result.data.TotalRecords / result.data.PageSize);
            this.pageSize = result.data.PageSize;
          }
        },
        null,
        () => {}
      );
  }

  onLoad() {
    this.hidden = false;
    this.progressSpinner = false;
  }

  onLoadStart() {
    this.hidden = true;
  }

  First() {
    if (this.pageNo <= 1) {
      return;
    }
    this.progressSpinner = true;
    this.pageNo = 1;
    this.UpdatePaging(this.queryString + '&pageNo=' + this.pageNo);
  }

  Next() {
    if (this.pageNo >= this.totalPages) {
      return;
    }
    this.progressSpinner = true;
    this.pageNo++;
    this.UpdatePaging(this.queryString + '&pageNo=' + this.pageNo);
  }

  Last() {
    if (this.pageNo >= this.totalPages) {
      return;
    }
    this.progressSpinner = true;
    this.pageNo = this.totalPages;
    this.UpdatePaging(this.queryString + '&pageNo=' + this.pageNo);
  }

  Previous() {
    if (this.pageNo <= 1) {
      return;
    }
    this.progressSpinner = true;
    this.pageNo--;
    this.UpdatePaging(this.queryString + '&pageNo=' + this.pageNo);
  }

  UpdatePaging(queryString: string) {
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.Url + queryString
    );

    this.exportItems = `<li><a href="${this.Url}${queryString}&exportType=excel"> Excel </a></li>
    <li><a href="${this.Url}${queryString}&exportType=word" > Word </a></li>
    <li><a href="${this.Url}${queryString}&exportType=pdf" > PDF </a></li>`;
  }
}

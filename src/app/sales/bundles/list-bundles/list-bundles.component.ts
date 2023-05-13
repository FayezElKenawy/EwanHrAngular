import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MenuItem } from "primeng/api";
import { BundleService } from "../bundle.service";
import { EditBundleComponent } from "../edit-bundle/edit-bundle.component";
import { DynamicSearchService } from "@shared/services/dynamic-search.service";
import { PagingMetaData } from "@shared/interfaces/paging-meta-data";
import { FormGroup } from "@angular/forms";
import { SearchModel } from "@shared/interfaces/search-model";

declare let $: any;

@Component({
  selector: "app-list-bundles",
  templateUrl: "./list-bundles.component.html",
  styleUrls: ["./list-bundles.component.scss"]
})
export class ListBundlesComponent implements OnInit {
  dataItems: any[];
  cols: any;
  menuItems: MenuItem[];
  selectedItem: any;
  progressSpinner = true;
  pagingMetaData: PagingMetaData;
  searchForm: FormGroup;
  searchModel: SearchModel = {};
  operators: string[];
  constructor(
    private _bundleService: BundleService,
    public _dynamicSearchService: DynamicSearchService
  ) { }

  ngOnInit() {
    this.cols = [
      // { field: 'ActionButtons', header: '', hidden: false, searchable: false },
      {
        field: "Id",
        header: "Sales.Fields.BundleId",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "ArabicName",
        header: "Sales.Fields.BundleName",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "NationalityName",
        header: "App.Fields.Nationality",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "ProfessionName",
        header: "App.Fields.Profession",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "Period",
        header: "Sales.Fields.BundlePeriod",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "ValidFrom",
        header: "Sales.Fields.ActivationDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
        searchable: true,
        searchType: "date"
      },
      {
        field: "ValidTo",
        header: "Sales.Fields.DeactivationDate",
        hidden: false,
        pipe: "date",
        pipeFormat: "yyyy-MM-dd",
        searchable: true,
        searchType: "date"
      },
      {
        field: "NoInstallment",
        header: "Sales.Fields.NoInstallment",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "MonthlyCost",
        header: "Sales.Fields.MonthlyCost",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "Downpayment",
        header: "Sales.Fields.DownPayment",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "NetVal",
        header: "Sales.Fields.BundleNetVal",
        hidden: false,
        searchable: true,
        searchType: "text"
      },
      {
        field: "IsInactive",
        header: "App.Fields.Status",
        hidden: false,
        searchable: false
      }
    ];
    // build form for search
    this.searchForm = this._dynamicSearchService.buildSearchForm(this.cols);
    this.operators = this._dynamicSearchService.operators;
  }

  getData() {
    this.progressSpinner = true;
    this._bundleService.getListPage(this.searchModel).subscribe(
      result => {
        if (result.isSuccess) {
          this.dataItems = result.data.BundleItems;
          ;
          this.pagingMetaData = result.data.PagingMetaData;
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }
}

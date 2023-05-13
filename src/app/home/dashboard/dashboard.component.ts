import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home.service';
import { IServiceResult } from '@shared/interfaces/results';
import { GlobalService } from '@shared/services/global.service';

declare let $;
@Component({
  selector: 'app-about',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class AboutComponent implements OnInit {
  viewModel: any;
  circleChartColors: string[];
  progressSpinner: boolean;
  charts: any;
  $window;
  showChart: boolean;
  constructor(
    private _homeService: HomeService,
    private _globalService: GlobalService
  ) {}

  ngOnInit() {
    this.circleChartColors = [
      '#B89F5D',
      '#5A7670',
      '#FA292A',
      '#3CBCC3',
      '#EBA63F',
      '#438945',
      '#151516',
      '#E60576',
      '#5626C4',
      '#FACD3D',
      '#E56B1F',
      '#32064A',
      '#EBA63F',
      '#22223A',
      '#92A332',
      '#FB9985'
    ];
    this.getData();
    this._globalService.documentLoaded.subscribe(loaded => {
      this.showChart = loaded;
    });
  }

  getData() {
    this.progressSpinner = true;
    this._homeService.getDashboard().subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          this.charts = {};
          this.viewModel = result.data;
          const ServiceRequestsStatuses = result.data.ServiceRequestChart.map(
            l => l.ArabicName
          );
          const ServiceRequestsData = result.data.ServiceRequestChart.map(
            l => l.ServiceRequestsCount
          );
          result.data.ServiceRequestStatuses.forEach(e => {
            if (!ServiceRequestsStatuses.includes(e.ArabicName)) {
              ServiceRequestsStatuses.push(e.ArabicName);
              ServiceRequestsData.push(0);
            }
          });

          const contrcactStatuses = result.data.ContractsChart.map(
            l => l.ArabicName
          );
          const contrcactStatusesData = result.data.ContractsChart.map(
            l => l.ContractsCount
          );
          result.data.ContractStatuses.forEach(e => {
            if (!contrcactStatuses.includes(e.ArabicName)) {
              contrcactStatuses.push(e.ArabicName);
              contrcactStatusesData.push(0);
            }
          });

          this.setChartData(
            'serviceRequestChart',
            ServiceRequestsData,
            ServiceRequestsStatuses,
            'label'
          );
          this.setChartData(
            'contractsChart',
            contrcactStatusesData,
            contrcactStatuses,
            'label'
          );
          this.setChartData(
            'financialChart',
            [result.data.CreditBalance, result.data.DebitBalance],
            ['الصادرات(Debit)', 'الواردات (Credit)'],
            'label'
          );

          this.setChartData(
            'BundlesChart',
            [result.data.BundlesCount, result.data.DebitReceivableCRCount],
            [
              'عدد الباقات المفعله(Active Bundles)',
              'الفواتير (CreditReceivables)'
            ],
            'label'
          );
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }
  setChartData(source, data, labels, label) {
    this.charts[source] = {
      datasets: [
        {
          data: data,
          backgroundColor: this.circleChartColors,
          label: label
        }
      ],
      labels: labels
    };
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

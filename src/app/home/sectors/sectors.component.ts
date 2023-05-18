import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';
@Component({
  selector: 'app-sectors',
  templateUrl: './sectors.component.html',
  styleUrls: ['./sectors.component.scss'],
})
export class SectorsComponent implements OnInit {
  modules: any[] = [];

  constructor() {}

  ngOnInit() {
    this.getModules();
  }

  getModules() {
    this.modules = [
      {
        URLPath: '/',
        Icon: 'assets/images/cards/hour.png',
        Name: 'App.Titles.mymaidSector',
        Description: 'App.Titles.mymaidSectorDesc',
        onClick:()=>{
          sessionStorage.removeItem("SectorType")
          sessionStorage.setItem("SectorType",'01-01')
        }
      },
      {
        URLPath: '/',
        Icon: 'assets/images/cards/individual.png',
        Name: 'App.Titles.individualSector',
        Description: 'App.Titles.individualSectorDesc',
        onClick:()=>{
          sessionStorage.removeItem("SectorType")
          sessionStorage.setItem("SectorType",'01-02')
        }
      },
      {
        URLPath: '/',
        Icon: 'assets/images/cards/bus.png',
        Name: 'App.Titles.businessSector',
        Description: 'App.Titles.businessSectorDesc',
        onClick:()=>{
          sessionStorage.removeItem("SectorType")
          sessionStorage.setItem("SectorType",'01-03')
        }
      },
    ];
  }
}

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
        URLPath: '/dashboard',
        Icon: 'assets/images/cards/hour.png',
        Name: 'App.Titles.HrSector',
        Description: 'App.Titles.HrSectorDesc',
        onClick:()=>{
          sessionStorage.removeItem("SectorType")
          sessionStorage.setItem("SectorType",'01-01')
        }
      },

    ];
  }
}

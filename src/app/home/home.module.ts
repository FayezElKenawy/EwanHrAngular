import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { AboutComponent } from './dashboard/dashboard.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, SharedModule, HomeRoutingModule],
  exports: [AboutComponent]
})
export class HomeModule {}

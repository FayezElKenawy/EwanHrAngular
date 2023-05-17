import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HouseReceiptsRoutingModule } from './house-receipts-routing.module';
import { HomeModule } from '../home/home.module';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { CreateCreditNotesComponent } from './components/credit-notes/create-credit-notes/create-credit-notes.component';
import { ListCreditNotesComponent } from './components/credit-notes/list-credit-notes/list-credit-notes.component';


@NgModule({
  declarations: [
    CreateCreditNotesComponent,
    ListCreditNotesComponent
  ],
  imports: [
    CommonModule,
    HouseReceiptsRoutingModule,
    HomeModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    TableModule,
    CalendarModule
  ]
})
export class HouseReceiptsModule { }

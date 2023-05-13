import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { SalesRoutingModule } from "./sales-routing.module";
import { ListBundlesComponent } from "./bundles/list-bundles/list-bundles.component";
import { CreateBundleComponent } from "./bundles/create-bundle/create-bundle.component";
import { EditBundleComponent } from "./bundles/edit-bundle/edit-bundle.component";
import { ListRequestsServicesComponent } from "./requests-services/list-requests-services/list-requests-services.component";
import { CreateRequestServiceComponent } from "./requests-services/create-request-service/create-request-service.component";
import { EditRequestServiceComponent } from "./requests-services/edit-request-service/edit-request-service.component";
import { ListContractsComponent } from "./contracts/list-contracts/list-contracts.component";
import { CreateContractComponent } from "./contracts/create-contract/create-contract.component";
import { EditContractComponent } from "./contracts/edit-contract/edit-contract.component";
import { HomeModule } from "../home/home.module";
import { SharedModule } from "@shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ToastModule } from "primeng/toast";
import { TableModule } from "primeng/table";
import { CalendarModule } from "primeng/calendar";
import {TabViewModule} from 'primeng/tabview';
import { ReceiptsModule } from "../receipts/receipts.module";
import { ContractAttachmentsComponent } from "./contracts/contract-attachments/contract-attachments.component";
import { TerminateContractComponent } from "./contracts/terminate-contract/terminate-contract.component";
import { CreateContractExtentionComponent } from "./contracts/create-contract-extention/create-contract-extention.component";
import { ContractPenalitiesComponent } from "./contracts/contract-penalities/contract-penalities.component";
import { ContractDetailsComponent } from "./contracts/contract-details/contract-details.component";
import { LaborerDetailsComponent } from "./requests-services/laborer-details/laborer-details.component";
import { EditContractSettingsComponent } from "./contracts/contract-settings/edit-contract-settings/edit-contract-settings.component";
import { AssignLaborToServiceRequestComponent } from './assign-labor-to-service-request/assign-labor-to-service-request.component';
import { OtherBranchLaborsComponent } from './other-branch-labors/other-branch-labors.component';
import { LaborReplacementComponent } from './contracts/labor-replacement/labor-replacement.component';
import { HoldContractComponent } from './contracts/hold-contract/hold-contract.component';
import { AvailableLaborsForHoldingComponent } from './contracts/available-labors-for-holding/available-labors-for-holding.component';

@NgModule({
  declarations: [
    ListBundlesComponent,
    CreateBundleComponent,
    EditBundleComponent,
    ListRequestsServicesComponent,
    CreateRequestServiceComponent,
    EditRequestServiceComponent,
    ListContractsComponent,
    CreateContractComponent,
    EditContractComponent,
    ContractAttachmentsComponent,
    TerminateContractComponent,
    CreateContractExtentionComponent,
    ContractPenalitiesComponent,
    ContractDetailsComponent,
    LaborerDetailsComponent,
    EditContractSettingsComponent,
    AssignLaborToServiceRequestComponent,
    OtherBranchLaborsComponent,
    LaborReplacementComponent,
    HoldContractComponent,
    AvailableLaborsForHoldingComponent,
  ],
  entryComponents:[AssignLaborToServiceRequestComponent],
  imports: [
    CommonModule,
    HomeModule,
    SharedModule,
    SalesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    TableModule,
    CalendarModule,
    ReceiptsModule,
    TabViewModule,
  ],
  providers: [DatePipe],
})
export class SalesModule {}

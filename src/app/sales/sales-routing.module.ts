import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutComponent } from '../home/dashboard/dashboard.component';
import { ListBundlesComponent } from './bundles/list-bundles/list-bundles.component';
import { ListContractsComponent } from './contracts/list-contracts/list-contracts.component';
import { ListRequestsServicesComponent } from './requests-services/list-requests-services/list-requests-services.component';
import { CreateRequestServiceComponent } from './requests-services/create-request-service/create-request-service.component';
import { EditRequestServiceComponent } from './requests-services/edit-request-service/edit-request-service.component';
import { CreateContractComponent } from './contracts/create-contract/create-contract.component';
import { EditContractComponent } from './contracts/edit-contract/edit-contract.component';
import { CoreLayoutComponent } from '@shared/layouts/core-layout/core-layout.component';
import { CreateBundleComponent } from './bundles/create-bundle/create-bundle.component';
import { EditBundleComponent } from './bundles/edit-bundle/edit-bundle.component';
import { ContractAttachmentsComponent } from './contracts/contract-attachments/contract-attachments.component';
import { CreateContractExtentionComponent } from './contracts/create-contract-extention/create-contract-extention.component';
import { ContractDetailsComponent } from './contracts/contract-details/contract-details.component';
import { LaborerDetailsComponent } from './requests-services/laborer-details/laborer-details.component';
import { EditContractSettingsComponent } from './contracts/contract-settings/edit-contract-settings/edit-contract-settings.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: AboutComponent },
      {
        path: 'edit-contract-settings',
        component: EditContractSettingsComponent
      },
      { path: 'list-bundles', component: ListBundlesComponent },
      { path: 'list-contracts', component: ListContractsComponent },
      {
        path: 'list-requests-services',
        component: ListRequestsServicesComponent
      },
      {
        path: 'create-request-service',
        component: CreateRequestServiceComponent
      },
      {
        path: 'edit-request-service/:id',
        component: EditRequestServiceComponent
      },
      {
        path: 'laborer-details/:id',
        component: LaborerDetailsComponent
      },
      {
        path: 'create-bundle',
        component: CreateBundleComponent
      },
      {
        path: 'edit-bundle/:id',
        component: EditBundleComponent
      },

      { path: 'create-contract/:id', component: CreateContractComponent },
      { path: 'edit-contract/:id', component: EditContractComponent },
      { path: 'contract-details/:id', component: ContractDetailsComponent },
      {
        path: 'contract-attachments/:id',
        component: ContractAttachmentsComponent
      },
      {
        path: 'create-contract-extention/:id',
        component: CreateContractExtentionComponent
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ],
    component: CoreLayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule {}

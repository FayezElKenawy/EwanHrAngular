import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from '../home/dashboard/dashboard.component';
import { CoreLayoutComponent } from '@shared/layouts/core-layout/core-layout.component';
import { ListCreditInvoicesComponent } from './credit-invoices/list-credit-invoices/list-credit-invoices.component';
import { ListCreditNotesComponent } from './credit-notes/list-credit-notes/list-credit-notes.component';
import { ListDebitNotesComponent } from './debit-notes/list-debit-notes/list-debit-notes.component';
import { ListPaymentReceiptsComponent } from './payment-receipts/list-payment-receipts/list-payment-receipts.component';
import { ListReturnedPaymentReceiptsComponent } from './returned-payment-receipts/list-returned-payment-receipts/list-returned-payment-receipts.component';
import { CreatePaymentReceiptComponent } from './payment-receipts/create-payment-receipt/create-payment-receipt.component';
import { CreateReturnedPaymentReceiptComponent } from './returned-payment-receipts/create-returned-payment-receipt/create-returned-payment-receipt.component';
import { EditPaymentReceiptComponent } from './payment-receipts/edit-payment-receipt/edit-payment-receipt.component';
import { EditReturnedPaymentReceiptComponent } from './returned-payment-receipts/edit-returned-payment-receipt/edit-returned-payment-receipt.component';
import { CreateCreditNoteComponent } from './credit-notes/create-credit-note/create-credit-note.component';
import { DetailCreditInvoiceComponent } from './credit-invoices/detail-credit-invoice/detail-credit-invoice.component';
import { CreateDebitNoteComponent } from './debit-notes/create-debit-note/create-debit-note.component';
import { ListCustomerAccountComponent } from './customer-accounts/list-customer-account/list-customer-account.component';
import { DetailsCustomerAccountComponent } from './customer-accounts/details-customer-account/details-customer-account.component';
import { EditCreditNoteComponent } from './credit-notes/edit-credit-note/edit-credit-note.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: AboutComponent },
      { path: 'credit-invoices', component: ListCreditInvoicesComponent },
      {
        path: 'details-credit-invoices',
        component: DetailCreditInvoiceComponent,
      },
      {
        path: 'credit-notes',
        component: ListCreditNotesComponent,
      },
      {
        path: 'create-credit-note',
        component: CreateCreditNoteComponent,
      },
      {
        path: 'details-credit-note/:id',
        component: EditCreditNoteComponent,
      },
      {
        path: 'debit-notes',
        component: ListDebitNotesComponent,
      },
      {
        path: 'payment-receipts',
        component: ListPaymentReceiptsComponent,
      },
      {
        path: 'returned-payment-receipts',
        component: ListReturnedPaymentReceiptsComponent,
      },
      {
        path: 'create-payment-receipts',
        component: CreatePaymentReceiptComponent,
      },
      {
        path: 'edit-payment-receipts/:id',
        component: EditPaymentReceiptComponent,
      },
      {
        path: 'create-returned-payment-receipts',
        component: CreateReturnedPaymentReceiptComponent,
      },
      {
        path: 'edit-return-payment-receipts/:id',
        component: EditReturnedPaymentReceiptComponent,
      },
      {
        path: 'create-debit-note',
        component: CreateDebitNoteComponent,
      },
      {
        path: 'customers-accounts',
        component: ListCustomerAccountComponent,
      },
      {
        path: 'details-customer-account',
        component: DetailsCustomerAccountComponent,
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
    component: CoreLayoutComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReceiptsRoutingModule {}

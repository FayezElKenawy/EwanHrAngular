import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReceiptsRoutingModule } from './receipts-routing.module';
import { CreatePaymentReceiptComponent } from './payment-receipts/create-payment-receipt/create-payment-receipt.component';
import { EditPaymentReceiptComponent } from './payment-receipts/edit-payment-receipt/edit-payment-receipt.component';
import { ListPaymentReceiptsComponent } from './payment-receipts/list-payment-receipts/list-payment-receipts.component';
import { ListReturnedPaymentReceiptsComponent } from './returned-payment-receipts/list-returned-payment-receipts/list-returned-payment-receipts.component';
import { CreateReturnedPaymentReceiptComponent } from './returned-payment-receipts/create-returned-payment-receipt/create-returned-payment-receipt.component';
import { EditReturnedPaymentReceiptComponent } from './returned-payment-receipts/edit-returned-payment-receipt/edit-returned-payment-receipt.component';
import { CreateDebitNoteComponent } from './debit-notes/create-debit-note/create-debit-note.component';
import { ListDebitNotesComponent } from './debit-notes/list-debit-notes/list-debit-notes.component';
import { ListCreditNotesComponent } from './credit-notes/list-credit-notes/list-credit-notes.component';
import { CreateCreditNoteComponent } from './credit-notes/create-credit-note/create-credit-note.component';
import { ListCreditInvoicesComponent } from './credit-invoices/list-credit-invoices/list-credit-invoices.component';
import { HomeModule } from '../home/home.module';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { CreateDownpaymentReceiptComponent } from './downpayment-receipt/create-downpayment-receipt/create-downpayment-receipt.component';
import { DetailCreditInvoiceComponent } from './credit-invoices/detail-credit-invoice/detail-credit-invoice.component';
import { ListCustomerAccountComponent } from './customer-accounts/list-customer-account/list-customer-account.component';
import { DetailsCustomerAccountComponent } from './customer-accounts/details-customer-account/details-customer-account.component';
import { EditCreditNoteComponent } from './credit-notes/edit-credit-note/edit-credit-note.component';
import { CustomerAccountLogComponent } from './customer-accounts/customer-account-log/customer-account-log.component';

@NgModule({
  declarations: [
    CreatePaymentReceiptComponent,
    EditPaymentReceiptComponent,
    ListPaymentReceiptsComponent,

    ListReturnedPaymentReceiptsComponent,
    CreateReturnedPaymentReceiptComponent,
    EditReturnedPaymentReceiptComponent,

    CreateDebitNoteComponent,
    ListDebitNotesComponent,

    ListCreditNotesComponent,
    CreateCreditNoteComponent,
    EditCreditNoteComponent,

    ListCreditInvoicesComponent,
    CreateDownpaymentReceiptComponent,
    DetailCreditInvoiceComponent,
    ListCustomerAccountComponent,
    DetailsCustomerAccountComponent,
    CustomerAccountLogComponent
  ],
  imports: [
    CommonModule,
    ReceiptsRoutingModule,
    HomeModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    TableModule,
    CalendarModule
  ],
  exports: [CreateDownpaymentReceiptComponent]
})
export class ReceiptsModule {}

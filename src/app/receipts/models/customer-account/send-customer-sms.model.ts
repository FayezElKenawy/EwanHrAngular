export interface SendCustomerSMSModel {
  message: string;
  notificationType: string;
  customerId: number;
  customerCode: string;
  debitValue: number;
  creditValue: number;
  contractId: string;
}

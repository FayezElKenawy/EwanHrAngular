export interface GetPaymentTransactionModel {
  debitReceivableId: number | null;
  debitReceivableCode: string;
  debitReceivableVoucherTypeId: string;
  voucherTypeName: string;
  netValueAfterTax: number;
  paidAmount: number;
  currentBalance: number;
  canBePay: number;
}

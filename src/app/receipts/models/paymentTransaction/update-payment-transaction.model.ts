export interface UpdatePaymentTransactionModel {
  debitReceivableId: number | null;
  creditReceivableId: number | null;
  creditReceivableVoucherTypeId: string;
  debitReceivableVoucherTypeId: string;
  netValueAfterTax: number;
  paidAmount: number;
  currentBalance: number;
  canBePay: number;
}

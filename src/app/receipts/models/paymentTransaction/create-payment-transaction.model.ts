export interface CreatePaymentTransactionModel {
  debitReceivableId: number | null;
  creditReceivableId?: number | null;
  creditReceivableVoucherTypeId?: string;
  debitReceivableVoucherTypeId: string;
  paidAmount: number;
}

import { CreatePaymentTransactionModel } from "../paymentTransaction/create-payment-transaction.model";

export interface CreatePaymentReceiptModel {
  documentDate: string;
  refNumber: string;
  customerId: number | null;
  entityCode: string;
  arabicRemarks: string;
  englishRemarks: string;
  creditCardTypeId: string;
  isBankDeposit: boolean;
  bankAccountId: string;
  bankDepositAmount: number;
  isCashBox: boolean;
  cashBoxId: string;
  cashBoxAmount: number;
  netValue: number;
  sectorTypeId: string;
  paymentsTransactions: CreatePaymentTransactionModel[];
}

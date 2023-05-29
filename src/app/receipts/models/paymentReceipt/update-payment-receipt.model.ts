import { UpdatePaymentTransactionModel } from "../paymentTransaction/update-payment-transaction.model";

export class UpdatePaymentReceiptModel {
  id: number;
  documentDate: string;
  refNumber: string;
  customerId: number ;
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
  taxAmount: number;
  netValueAfterTax: number;
  tolalPaid: number;
  paymentsTransactions: UpdatePaymentTransactionModel[];
}

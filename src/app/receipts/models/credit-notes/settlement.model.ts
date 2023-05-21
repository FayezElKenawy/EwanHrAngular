export class Settlement{
  id:number;
  debitReceivableId:number;
  debitReceivableVoucherTypeId:string;
  paidAmount:number;
  netValueAfterTax:number;
  voucherTypeArabicName:string;
  currentBalance:number;
  canBePay:number;
  voucherCode:string;
}

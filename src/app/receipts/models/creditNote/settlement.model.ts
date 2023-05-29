export class SettlementModel{
  id:number;
  debitReceivableId:number;
  debitReceivableVoucherTypeId:string;
  paidAmount:number;
  netValueAfterTax:number;
  voucherTypeArabicName:string;
  currentBalance:number;
  canBePay:number;
  voucherCode:string;
  voucherTypeId?:string;
  voucherTypeName?:string;
}

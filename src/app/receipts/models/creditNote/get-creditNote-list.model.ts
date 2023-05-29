export interface GetCreditNoteListModel {
  id: number;
  code: string;
  creditReceivableId: string;
  documentDate: string;
  refNumber: string;
  createdBy: string;
  branchName: string;
  voucherTypeName: string;
  customerId: number;
  customerCode: string;
  customerFullName: string;
  entityCode: string;
  creditCardTypeId: string;
  netValueAfterTax: number;
  tolalPaid: number;
  totalRefund: number;
}

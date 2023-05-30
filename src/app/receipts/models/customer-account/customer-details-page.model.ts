import { CustomerAccountModel } from "./customer-account.model";
import { VoucherModel } from "./voucher.model";

export interface CustomerDetailsPageModel {
  customerAccount: CustomerAccountModel;
  credits: VoucherModel[];
  debits: VoucherModel[];
  isExtentionContract: boolean;
}

export interface CreateCostElementItemModel {
  id: string;
  arabicName: string;
  englishName: string;
  taxId: string;
  taxArabicName: string;
  taxEnglishName: string;
  taxRatio: number;
  ignoreTax: boolean;
  amount: number;
  totalAmount: number;
  taxAmount: number;
  isInactive: boolean;
  fullArabicName: string;
  nonDeductible: boolean;
  fullName: string;
  name: string;
  taxName: string;
  sectorTypeId: string;
}

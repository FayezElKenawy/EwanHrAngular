import { PenalityFieldVM } from './PenalityFieldVM.model';

export interface ContractPenalityValueVM {
  Id: number;
  PenalityFieldId: string;
  ContractId: number;
  Value: string;
  PenalityField: PenalityFieldVM;
}

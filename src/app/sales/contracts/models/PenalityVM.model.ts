import { PenalityFieldVM } from './PenalityFieldVM.model';

export interface PenalityVM {
  Id: string;
  Name: string;
  IsSelected: boolean;
  Checked: boolean;
  PenalityFields: PenalityFieldVM[];
}

import { ColumnPipeType } from "@shared/enum/column-pipe.enum";
import { ColumnPipeFormat } from "@shared/enum/columns-pipe-format.enum";
import { SearchType } from "@shared/enum/searchType.enum";

export class ColumnType {
    field: string;
    header: string;
    hidden?: boolean;
    pipe?: ColumnPipeType;
    pipeFormat?: ColumnPipeFormat;
    searchable?: boolean;
    searchType?: SearchType;
    customSearchField?:string;
    isLocalized?:boolean;
  }
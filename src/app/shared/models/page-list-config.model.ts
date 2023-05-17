import { ListAction } from "./action";
import { ColumnType } from "./column-type.model";

export class PageListConfig {
    pageAuthorization:string
    pageTitle:string;
    createLink:string;
    createAuthorization:string;
    createButtonTitle:string;
    getDataAPIURL:string;
    cols:ColumnType[]=[];
    actions:ListAction[]=[]
}
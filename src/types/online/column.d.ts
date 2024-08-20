import { ANY_OBJECT } from '../generic';

export interface ColumnInfo {
  autoIncrement: boolean;
  columnComment: string;
  columnName: string;
  columnShowOrder: number;
  columnType: string;
  dblinkType: number;
  extra: string;
  fullColumnType: string;
  nullable: boolean;
  numericPrecision: number;
  primaryKey: boolean;

  columnId: string;
  deptFilter: boolean;
  filterType: number;
  objectFieldName: string;
  objectFieldType: string;
  parentKey: boolean;
  tableId: string;
  uploadFileSystemType: number;
  userFilter: boolean;

  fieldKind: number;
  maxFileCount: number;
  dictId: string;
  maskFieldType: number;
  encodedRule: ANY_OBJECT | string | undefined;
}

import { ANY_OBJECT } from '../generic';

export interface TableInfo {
  tableId: string;
  dblinkId: string;
  tableComment: string;
  tableName: string;
  relationType: number;
  tag: ANY_OBJECT;
}

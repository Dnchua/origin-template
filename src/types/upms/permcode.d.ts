import { ANY_OBJECT } from '../generic';

export interface PermCode {
  permCodeId: string;
  showName: string;
  permCode: string;
  permCodeKind: number;
  permCodeType: number;
  parentId: string;
  showOrder: number;
  sysPermCodePermList: ANY_OBJECT[];
  permIdList: (string | number)[];
}

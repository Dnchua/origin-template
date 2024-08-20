import { ANY_OBJECT } from '../generic';

export interface PermData {
  dataPermId: string;
  dataPermName: string;
  ruleType: number;
  dataPermMobileEntryList: ANY_OBJECT[];
  dataPermMenuList: ANY_OBJECT[];
  bannerCount: number;
  sodukuCount: number;
  dataPermDeptList?: ANY_OBJECT[];
}

import { ANY_OBJECT } from '../generic';

export interface Dict {
  dictId?: string;
  dblinkId?: string;
  dictName?: string;
  dictType?: number;
  dictListUrl?: string;
  staticDictName?: string;
  tableName?: string;
  // 字典父字段名称
  parentKeyColumnName?: string;
  // 字典键字段名称
  keyColumnName?: string;
  // 字典值字段名称
  valueColumnName?: string;
  // 逻辑删除字段名称
  deletedColumnName?: string;
  // 用户过滤字段名称
  userFilterColumnName?: string;
  // 部门过滤字段名称
  deptFilterColumnName?: string;
  // 租户过滤字段名称
  tenantFilterColumnName?: string;
  // 树状字典
  treeFlag: boolean;
  // 编码字典code
  dictCode?: string;
  dictDataJson?: string;
  [key: string]: string | undefined;
}

export interface DictData {
  id?: string & number;
  type: string;
  name?: string;
}

import { CascaderOption } from 'element-plus';

/**
 * 权限模块
 */
export interface PermModule extends CascaderOption {
  createTime?: string;
  createUserId?: string;
  moduleId?: string;
  moduleName?: string;
  moduleType?: number;
  parentId?: string;
  showOrder?: number;
  updateTime?: string;
  updateUserId?: string;
  isAll?: boolean;
  children?: PermModule[];
}

export interface Perm {
  permId: string;
  moduleId: string | string[];
  permName: string;
  url: string;
  showOrder: number;
  moduleIdDictMap: {
    id: string;
    name: string;
  };
}

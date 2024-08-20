/**
 * 系统菜单
 * @param children 为动态属性
 */
export interface MenuItem {
  menuId: string;
  parentId?: string;
  menuName: string;
  menuType?: DictDataIdType;
  formRouterName?: string;
  icon: string;
  showOrder: number;
  createTime: string;
  createUserId: string;
  updateTime: string;
  updateUserId: string;
  children?: Array<MenuItem>;
  extraData?: string;
  bindType: number;
  onlineFormId?: string;
  onlineFlowEntryId?: string;
  reportPageId?: string;
  targetUrl?: string;
  deletedFlag: number;
  permCodeIdList: Array;
}

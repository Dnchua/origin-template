/**
 * 列表数据
 *
 * @param dataList 数据集合
 */
export interface ListData<T> {
  dataList: T[];
}
/**
 * 下拉列表初始化参数
 * @param loadData 加载数据函数
 * @param isTree 是否树型数据
 * @param idKey ID字段名，默认：id
 * @param parentIdKey 父ID字段名，默认：parentId
 */
export interface DropdownOptions<T> {
  loadData: () => Promise<ListData<T>>;
  isTree?: boolean;
  idKey?: string;
  parentIdKey?: string;
}

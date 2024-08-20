/**
 * 分页参数
 * @param pageNum 查询页
 * @param pagesize 分页大小
 */
export interface PageParam {
  pageNum: number;
  pageSize: number;
}
/**
 * 排序参数
 * @param fieldName 排序字段名
 * @param asc 是否正序
 * @param dateAggregateBy 默认排序字段的日期统计类型
 */
export interface OrderInfo {
  fieldName?: string;
  asc?: boolean;
  dateAggregateBy?: string;
}

/**
 * 分页查询请求参数
 * @param pageParam 分页参数
 * @param orderParam 排序参数
 */
export interface RequestParam {
  pageParam?: PageParam;
  orderParam?: OrderInfo[];
}

/**
 * 表格初始化参数
 *
 * @param loadTableData  表数据获取函数，返回Promise
 * @param verifyTableParameter 表数据获取检验函数
 * @param paged 是否支持分页
 * @param rowSelection 是否支持行选择
 * @param orderFieldName 默认排序字段
 * @param ascending 默认排序方式（true为正序，false为倒序），默认值：true
 * @param dateAggregateBy 默认排序字段的日期统计类型
 * @param pageSize 分页大小，默认值：10
 */
export type TableOptions<T> = {
  loadTableData: (params: RequestParam) => Promise<TableData<T>>;
  verifyTableParameter?: () => boolean;
  paged?: boolean;
  rowSelection?: boolean;
  orderFieldName?: string;
  ascending?: boolean;
  dateAggregateBy?: string;
  pageSize?: number;
};

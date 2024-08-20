import { ListData } from './list';

/**
 * 表格数据
 *
 * @param dataList 数据集合
 * @param totalCount 数据集合总数
 */
export interface TableData<T> extends ListData<T> {
  totalCount: number;
}

/*
 * 表格数据（分页）钩子
 * 提供表格数据查询、分页基础数据和回调方法
 */
import { ElMessage } from 'element-plus';
import { OrderInfo, RequestParam, TableOptions } from '../types/pagination';
import { SortInfo } from '../types/sortinfo';

// 默认分页大小
const DEFAULT_PAGE_SIZE = 10;

export const useTable = <T>(options: TableOptions<T>) => {
  const orderInfo: OrderInfo = {
    fieldName: options.orderFieldName,
    asc: options.ascending || false,
    dateAggregateBy: options.dateAggregateBy,
  };
  const loading = ref(false);
  const currentPage = ref(1);
  const totalCount = ref(0);
  const dataList: Ref<T[]> = ref([]);
  const pageSize: Ref<number> = ref(options.pageSize || DEFAULT_PAGE_SIZE);
  if (!options.verifyTableParameter) {
    options.verifyTableParameter = () => true;
  }
  const { loadTableData, paged, verifyTableParameter } = options;

  let oldPage = 0;
  let oldPageSize: number = options.pageSize || DEFAULT_PAGE_SIZE;

  if (pageSize.value <= 0) {
    console.warn(`pagesize的值不能小于等于0，被设置为默认值：${DEFAULT_PAGE_SIZE}`);
    pageSize.value = DEFAULT_PAGE_SIZE;
  }

  // 监听pageSize变化
  watch(pageSize, (newVal, oldVal) => {
    if (newVal != oldVal) {
      loadData(1, newVal)
        .then(() => {
          oldPage = 1;
          oldPageSize = newVal;
          currentPage.value = 1;
        })
        .catch(() => {
          currentPage.value = oldPage;
          pageSize.value = oldVal;
        });
    }
  });
  // 监听currentPage变化
  watch(currentPage, (newVal, oldVal) => {
    if (newVal != oldVal) {
      loadData(newVal, pageSize.value)
        .then(() => {
          oldPage = newVal;
        })
        .catch(() => {
          currentPage.value = oldVal;
        });
    }
  });

  /**
   * 获取表格数据
   * @param pageNum 当前分页
   * @param pageSize 每页数量
   * @param reload 是否重新获取数据
   */
  const loadData = (pageNum: number, pageSize: number, reload = false): Promise<void> => {
    if (paged && !reload && oldPage == pageNum && oldPageSize == pageSize) {
      return Promise.resolve();
    }

    const params = {} as RequestParam;
    if (orderInfo.fieldName != null) params.orderParam = [orderInfo];
    if (paged) {
      params.pageParam = {
        pageNum,
        pageSize,
      };
    }
    return new Promise((resolve, reject) => {
      loading.value = true;
      loadTableData(params)
        .then(res => {
          // vxetable需要用到对象的hasOwnerProperty方法，因此需要重新构造对象
          dataList.value = res.dataList.map((item: T) => {
            return { ...item };
          });
          totalCount.value = res.totalCount;
          resolve();
        })
        .catch(e => {
          reject(e);
        })
        .finally(() => {
          loading.value = false;
        });
    });
  };

  const onPageSizeChange = (size: number) => {
    pageSize.value = size;
  };

  const onCurrentPageChange = (newVal: number) => {
    currentPage.value = newVal;
  };

  /**
   * 表格排序字段变化
   * @param {String} prop 排序字段的字段名
   * @param {string} field 排序字段的字段名
   * @param {String} order 正序还是倒序
   */
  const onSortChange = ({ prop, field, order }: SortInfo) => {
    orderInfo.fieldName = prop || field;
    orderInfo.asc = order == 'ascending' || order == 'asc';
    refreshTable();
  };
  /**
   * 刷新表格数据
   * @param {Boolean} research 是否按照新的查询条件重新查询（调用verify函数）
   * @param {Integer} pageNum 当前页面
   * @param showMsg 是否显示查询结果成功与否消息
   */
  const refreshTable = (research = false, pageNum = 0, showMsg = false) => {
    let reload = false;
    if (research) {
      if (!verifyTableParameter()) return;
      reload = true;
    }

    if (pageNum && pageNum != currentPage.value) {
      loadData(pageNum, pageSize.value, reload)
        .then(() => {
          oldPage = currentPage.value = pageNum;
          if (showMsg) ElMessage.success('查询成功');
        })
        .catch((e: Error) => {
          console.warn('获取表格数据出错了', e);
          currentPage.value = oldPage;
          if (showMsg) ElMessage.error('查询失败' + e.message);
        });
    } else {
      loadData(currentPage.value, pageSize.value, true)
        .then(() => {
          if (showMsg) ElMessage.success('查询成功');
        })
        .catch((e: Error) => {
          console.warn('获取表格数据出错了', e);
          if (showMsg) ElMessage.error('查询失败' + e.message);
        });
    }
  };
  /**
   * 获取每一行的index信息
   * @param {Integer} index 表格在本页位置
   */
  const getTableIndex = (index: number) => {
    return paged ? (currentPage.value - 1) * pageSize.value + (index + 1) : index + 1;
  };

  const clearTable = () => {
    oldPage = 0;
    currentPage.value = 1;
    totalCount.value = 0;
    dataList.value = [];
  };

  return {
    loading,
    currentPage,
    totalCount,
    pageSize,
    dataList,
    clearTable,
    getTableIndex,
    onPageSizeChange,
    onCurrentPageChange,
    onSortChange,
    refreshTable,
  };
};

import { DropdownOptions } from '../types/list';
import { treeDataTranslate } from '../utils';

const defaultOptions = {
  isTree: false,
  idKey: 'id',
  parentIdKey: 'parentId',
};

export const useDropdown = <T>(options: DropdownOptions<T>) => {
  const loading = ref(false);
  let loaded = false;
  const dropdownList: Ref<T[]> = ref([]);

  const finalOptions = { ...defaultOptions, ...options };

  const { loadData, isTree, idKey, parentIdKey } = finalOptions;

  const loadDropdownData = (): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      if (!loaded && !loading.value) {
        loadData()
          .then(res => {
            loaded = true;
            dropdownList.value = isTree
              ? treeDataTranslate(res.dataList, idKey, parentIdKey)
              : res.dataList;
            resolve(dropdownList.value);
          })
          .catch(e => {
            reject(e);
          })
          .finally(() => {
            loading.value = false;
          });
      } else {
        resolve(dropdownList.value);
      }
    });
  };

  /**
   * 下拉框显示或隐藏时调用
   * @param {Boolean} isShow 正在显示或者隐藏
   */
  const onVisibleChange = (isShow: boolean): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      if (isShow && !loaded && !loading.value) {
        loadDropdownData()
          .then(res => {
            resolve(res);
          })
          .catch(e => {
            resolve([]);
          });
      } else {
        resolve(dropdownList.value);
      }
    });
  };

  /**
   * 刷新列表
   * @param immediate 是否立即刷新，默认为true
   * @return Promise<T[] | void> 立即执行时返回最新数据
   */
  const refresh = (immediate = true): Promise<T[] | void> => {
    loaded = false;
    if (immediate) {
      return loadDropdownData();
    }
    dropdownList.value = [];
    return Promise.resolve();
  };

  const setDirty = dirty => {
    if (dirty) {
      dropdownList.value = [];
    }
    loaded = !dirty;
  };

  return {
    loading,
    dropdownList,
    onVisibleChange,
    refresh,
    setDirty,
  };
};

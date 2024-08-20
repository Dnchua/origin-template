import { getCurrentInstance } from 'vue';
import { Delete, Search, Edit, Plus, Refresh, Picture } from '@element-plus/icons-vue';
import { useDate } from '@/common/hooks/useDate';
import { usePermissions } from '@/common/hooks/usePermission';
import { Dialog } from '@/components/Dialog';
import { useDropdown } from '@/common/hooks/useDropdown';
import { useTable } from '@/common/hooks/useTable';

/**
 * 大部分管理页面需要的组件及公共属性和方法
 *
 * @returns 图标（Plus、Delete、Edit、Search）、对话框组件（Dialog）、defaultFormItemSize、mainContextHeight、checkPermCodeExist、下拉数据勾子（useDropdown）、表格数据勾子（useTable）
 */
export const useCommon = () => {
  const mainContextHeight = inject('mainContextHeight', ref(200));
  const clientHeight = inject('documentClientHeight', ref(200));

  const { checkPermCodeExist } = usePermissions();
  const { formatDateByStatsType, getDateRangeFilter } = useDate();

  /**
   * 将输入的值转换成指定的类型
   * @param {Any} value
   * @param {String} type 要转换的类型（integer、float、boolean、string）
   */
  function parseParams(value: number | string | boolean | undefined, type = 'string') {
    if (value == null) return value;
    switch (type) {
      case 'integer':
        return Number.parseInt(value as string);
      case 'float':
        return Number.parseFloat(value as string);
      case 'boolean':
        return value === 'true' || value;
      default:
        return String(value);
    }
  }

  /**
   * 将输入值转换为执行的类型数组
   * @param {Array} value 输入数组
   * @param {String} type 要转换的类型（integer、float、boolean、string）
   */
  function parseArrayParams(value: Array<number | string | boolean>, type = 'string') {
    if (Array.isArray(value)) {
      return value.map(item => {
        return parseParams(item, type);
      });
    } else {
      return [];
    }
  }

  return {
    Delete,
    Search,
    Edit,
    Plus,
    Refresh,
    Picture,
    Dialog,
    mainContextHeight,
    clientHeight,
    checkPermCodeExist,
    formatDateByStatsType,
    getDateRangeFilter,
    useDropdown,
    useTable,
    parseParams,
    parseArrayParams,
  };
};

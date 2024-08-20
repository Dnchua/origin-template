import { EpPropMergeType } from 'element-plus/es/utils/vue/props';
import { MenuItem } from '@/types/upms/menu';
import { SysMenuType } from '@/common/staticDict';

export const useMenuTools = () => {
  const getMenuType = (
    row: MenuItem,
  ): EpPropMergeType<
    StringConstructor,
    'primary' | 'success' | 'info' | 'warning' | 'danger',
    unknown
  > => {
    if (row.menuType === SysMenuType.DIRECTORY) {
      return 'primary';
    } else if (row.menuType === SysMenuType.MENU) {
      return 'info';
    } else if (row.menuType === SysMenuType.FRAGMENT) {
      return 'danger';
    } else if (row.menuType === SysMenuType.BUTTON) {
      return 'warning';
    }
    return 'primary';
  };

  return { getMenuType };
};

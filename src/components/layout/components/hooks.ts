import { SysMenuBindType } from '@/common/staticDict';
import { getToken } from '@/common/utils';
import { useLayoutStore } from '@/store';
import { findMenuItemById } from '@/store/utils';
import { MenuItem } from '@/types/upms/menu';

export const useSelectMenu = () => {
  const layoutStore = useLayoutStore();

  /**
   * 选择菜单，跳转到目标页面
   * 外链弹出新窗口
   *
   * @param menuId 菜单ID
   */
  const selectMenuById = (menuId: string) => {
    const menuItem: MenuItem | null = findMenuItemById(menuId, layoutStore.menuList);
    if (menuItem) selectMenu(menuItem);
  };

  /**
   * 选择菜单，跳转到目标页面
   * 外链弹出新窗口
   *
   * @param menu 菜单项
   */
  const selectMenu = (menu: MenuItem) => {
    // TODO 外链暂时直接弹出新窗口，有其它规则时，可以从这里开始修改
    if (
      menu != null &&
      menu.bindType === SysMenuBindType.THRID_URL &&
      menu.targetUrl != null &&
      menu.targetUrl !== ''
    ) {
      const token = getToken();
      let targetUrl = menu.targetUrl;
      if (targetUrl.indexOf('?') === -1) {
        targetUrl = targetUrl + '?';
      }
      targetUrl = targetUrl + 'token=' + token;
      window.open(targetUrl);
      return;
    }
    layoutStore.setCurrentMenu(menu);
  };

  return {
    selectMenuById,
    selectMenu,
  };
};

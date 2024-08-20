import { defineStore } from 'pinia';
import type { ComponentSize } from 'element-plus';
import type { MenuItem } from '@/types/upms/menu';
import { findItemFromList } from '@/common/utils';
import { ANY_OBJECT } from '@/types/generic';
import { processMenu, findMenuItem, findMenuItemById } from './utils';

export default defineStore('layout', {
  state: () => {
    return {
      // 首页路由名称
      indexName: 'welcome',
      // 侧边栏是否折叠
      collapsed: false,
      // 是否多栏目
      supportColumn: false,
      // 是否多标签
      supportTags: true,
      // 标签列表
      tagList: new Array<MenuItem>(),
      // 菜单列表
      menuList: new Array<MenuItem>(),
      // 页面缓存列表
      cachePages: new Array<string>(),
      // 当前菜单
      currentMenu: {} as MenuItem,
      // 当前栏目
      currentColumn: {} as MenuItem,
      // 当前formSize
      defaultFormItemSize: 'default' as ComponentSize,
      documentClientHeight: 200,
      mainContextHeight: 200,
    };
  },
  getters: {
    currentMenuPath(): Array<MenuItem> {
      const menuPath: Array<MenuItem> = [];
      this.menuList.forEach(menu => {
        findMenuItem(menu, this.currentMenu.menuId, menuPath);
      });
      return menuPath;
    },
    currentMenuId(): string {
      return this.currentMenu.menuId;
    },
    currentColumnId(): string {
      return this.currentColumn.menuId;
    },
    currentFormSize(): string {
      return this.defaultFormItemSize;
    },
  },
  actions: {
    setCollapsed(val: boolean) {
      this.collapsed = val;
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    setMenuList(menuList: Array<MenuItem>) {
      menuList.forEach(item => {
        processMenu(item);
      });
      this.menuList = menuList;
      if (this.supportColumn && menuList && menuList.length) {
        this.currentColumn = menuList[0];
      }
    },
    setCurrentMenu(menu: MenuItem | null) {
      if (menu == null || menu.menuId == null) {
        this.currentMenu = {} as MenuItem;
      } else {
        this.currentMenu = menu;
        // 添加标签：标签列表中不存在时添加到标签列表中
        if (this.supportTags) {
          const item: ANY_OBJECT | null = findItemFromList(this.tagList, menu.menuId, 'menuId');
          if (item == null) {
            this.tagList.push(menu);
          }
          // 添加页面缓存
          if (menu.formRouterName && this.cachePages.indexOf(menu.formRouterName) === -1) {
            this.cachePages.push(menu.formRouterName);
          }
        }
        // 设置当前栏目
        if (this.supportColumn) {
          for (const m of this.menuList) {
            if (m.children) {
              const item = findMenuItemById(menu.menuId, m.children);
              if (item && this.currentColumn.menuId != m.menuId) {
                this.currentColumn = m;
                break;
              }
            }
          }
        }
      }
    },
    removeTag(id: string) {
      let pos = -1;
      for (let i = 0; i < this.tagList.length; i++) {
        if (this.tagList[i].menuId == id) {
          this.tagList.splice(i, 1);
          pos = Math.min(i, this.tagList.length - 1);
          break;
        }
      }
      if (this.currentMenuId == id) {
        this.setCurrentMenu(this.tagList[pos]);
      }
      // 移除页面缓存
      const pages = this.tagList.map(item => item.formRouterName).filter(item => item != null);
      this.cachePages = this.cachePages.filter(item => {
        return pages.indexOf(item) !== -1;
      });
    },
    closeOtherTags(id: string) {
      // 关闭其它标签
      this.tagList = this.tagList.filter(item => {
        return item.menuId === id;
      });
      const menu = this.tagList[0];
      if (menu && (menu.onlineFormId == null || menu.onlineFormId === '') && menu.formRouterName) {
        this.cachePages = [menu.formRouterName];
        this.setCurrentMenu(menu);
      }
    },
    clearAllTags() {
      // 关闭所有标签
      this.tagList = [];
      this.cachePages = [];
      this.setCurrentMenu(null);
    },
    setCurrentColumn(column: MenuItem) {
      this.currentColumn = column;
    },
    removeCachePage(name: string) {
      const pos = this.cachePages.indexOf(name);
      if (pos !== -1) {
        this.cachePages.splice(pos, 1);
      }
    },
    setCurrentFormSize(size: ComponentSize) {
      this.defaultFormItemSize = size;
    },
  },
  persist: {
    // 开启持久存储
    enabled: true,
    // 指定哪些state的key需要进行持久存储
    // storage默认是 sessionStorage存储
    // paths需要持久存储的key
    strategies: [
      { key: 'tags', paths: ['tagList'] },
      { key: 'menu', paths: ['currentColumn', 'currentMenu', 'menuList'] },
      { key: 'cachePages', paths: ['cachePages'] },
    ],
  },
});

<template>
  <div class="tab-dialog-box" style="position: relative; margin-top: -15px">
    <el-tabs v-model="activeFragmentId">
      <el-tab-pane label="用户查询" name="fragmentSysPermUser" style="width: 100%">
        <el-form
          :label-width="labelWidth"
          :size="formItemSize"
          @submit.prevent
          label-position="left"
        >
          <filter-box
            :item-width="350"
            @search="refreshFragmentSysPermUser(true)"
            :hasReset="false"
            style="padding: 0; margin: 0"
          >
            <el-form-item label="用户名称">
              <el-input
                class="filter-item"
                v-model="fragmentSysPermUser.formFilter.loginName"
                clearable
                placeholder=""
              />
            </el-form-item>
          </filter-box>
        </el-form>
        <el-row>
          <el-col :span="24">
            <vxe-table
              :data="fragmentSysPermUser.SysUser.impl.dataList"
              :size="formItemSize"
              :height="getTableHeight + 'px'"
              :row-config="{ isHover: true }"
              @sort-change="fragmentSysPermUser.SysUser.impl.onSortChange"
              header-cell-class-name="table-header-gray"
            >
              <vxe-column
                title="序号"
                type="seq"
                width="55px"
                :index="fragmentSysPermUser.SysUser.impl.getTableIndex"
              />
              <vxe-column title="用户名" field="loginName" />
              <vxe-column title="用户昵称" field="showName" />
              <vxe-column title="用户角色" field="roleName" />
              <vxe-column title="权限字" field="permCode" />
              <template v-slot:empty>
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png" />
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="角色查询" name="fragmentSysPermRole" style="width: 100%">
        <el-form
          :label-width="labelWidth"
          :size="formItemSize"
          @submit.prevent
          label-position="left"
        >
          <filter-box
            :item-width="350"
            @search="refreshFragmentSysPermRole(true)"
            :hasReset="false"
            style="padding: 0; margin: 0"
          >
            <el-form-item label="角色名称">
              <el-input
                class="filter-item"
                v-model="fragmentSysPermRole.formFilter.roleName"
                clearable
                placeholder=""
              />
            </el-form-item>
          </filter-box>
        </el-form>
        <el-row>
          <el-col :span="24">
            <vxe-table
              :data="fragmentSysPermRole.SysRole.impl.dataList"
              :size="formItemSize"
              :height="getTableHeight + 'px'"
              :row-config="{ isHover: true }"
              @sort-change="fragmentSysPermRole.SysRole.impl.onSortChange"
              header-cell-class-name="table-header-gray"
            >
              <vxe-column
                title="序号"
                type="seq"
                width="55px"
                :index="fragmentSysPermRole.SysRole.impl.getTableIndex"
              />
              <vxe-column title="菜单">
                <template v-slot="scope">
                  <span>{{
                    getMenuPathString(getMenuPathById(scope.row.menuId)) || scope.row.menuName
                  }}</span>
                </template>
              </vxe-column>
              <vxe-column title="菜单类型" field="permCodeType">
                <template v-slot="scope">
                  <el-tag :size="formItemSize" :type="getMenuType(scope.row)">{{
                    SysMenuType.getValue(scope.row.menuType)
                  }}</el-tag>
                </template>
              </vxe-column>
              <vxe-column title="角色名称" field="roleName" />
              <vxe-column title="权限字" field="permCode" />
              <template v-slot:empty>
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png" />
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="菜单查询" name="fragmentSysPermMenu" style="width: 100%">
        <el-form
          :label-width="labelWidth"
          :size="formItemSize"
          @submit.prevent
          label-position="left"
        >
          <filter-box
            :item-width="350"
            @search="refreshFragmentSysPermMenu(true)"
            :hasReset="false"
            style="padding: 0; margin: 0"
          >
            <el-form-item label="菜单名称">
              <el-input
                class="filter-item"
                v-model="fragmentSysPermMenu.formFilter.menuName"
                clearable
                placeholder=""
              />
            </el-form-item>
          </filter-box>
        </el-form>
        <el-row>
          <el-col :span="24">
            <vxe-table
              :data="fragmentSysPermMenu.SysMenu.impl.dataList"
              :size="formItemSize"
              :height="getTableHeight + 'px'"
              :row-config="{ isHover: true }"
              @sort-change="fragmentSysPermMenu.SysMenu.impl.onSortChange"
              header-cell-class-name="table-header-gray"
            >
              <vxe-column
                title="序号"
                type="seq"
                width="55px"
                :index="fragmentSysPermMenu.SysMenu.impl.getTableIndex"
              />
              <vxe-column title="菜单">
                <template v-slot="scope">
                  <span>{{
                    getMenuPathString(getMenuPathById(scope.row.menuId)) || scope.row.menuName
                  }}</span>
                </template>
              </vxe-column>
              <vxe-column title="菜单类型" field="menuType">
                <template v-slot="scope">
                  <el-tag :size="formItemSize" :type="getMenuType(scope.row)">{{
                    SysMenuType.getValue(scope.row.menuType)
                  }}</el-tag>
                </template>
              </vxe-column>
              <vxe-column title="权限字" field="permCode" />
              <template v-slot:empty>
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png" />
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import { VxeTable, VxeColumn } from 'vxe-table';
import { ANY_OBJECT } from '@/types/generic';
import { SysMenuType } from '@/common/staticDict';
import { MenuItem } from '@/types/upms/menu';
import { PermController, SystemMenuController } from '@/api/system';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { useLayoutStore } from '@/store';
import { useMenuTools } from '../formSysMenu/hooks';
const layoutStore = useLayoutStore();

const props = defineProps<{
  permId: string;
  mainContextHeight: Ref<number>;
}>();

const activeFragmentId = ref('fragmentSysPermUser');
const labelWidth = computed(() => {
  return layoutStore.defaultFormItemSize == 'default' ? '65px' : '75px';
});
const getTableHeight = computed(() => {
  return props.mainContextHeight.value - 150;
});
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const menuMap = new Map();

const { getMenuType } = useMenuTools();
// const getMenuType = (row: MenuItem) => {
//   if (row.menuType === 0) {
//     return '';
//   } else if (row.menuType === 1) {
//     return 'success';
//   } else if (row.menuType === 2) {
//     return 'danger';
//   } else if (row.menuType === 3) {
//     return 'warning';
//   }
// };

/**
 * 获取所有菜单项
 */
const loadSysMenuData = () => {
  SystemMenuController.getMenuPermList({})
    .then(res => {
      res.data.forEach(item => {
        menuMap.set(item.menuId, item);
      });
    })
    .catch(e => {
      console.warn(e);
    });
};
const getMenuPathById = (menuId: string | null) => {
  if (menuId == null || menuId === '') return null;
  let menuPath = [];
  do {
    let menuItem = menuMap.get(menuId);
    if (menuItem != null) {
      menuPath.unshift(menuItem);
      menuId = menuItem.parentId;
    } else {
      menuId = null;
    }
  } while (menuId != null);

  return menuPath;
};
const getMenuPathString = (menuPath: MenuItem[] | null) => {
  if (Array.isArray(menuPath) && menuPath.length > 0) {
    return menuPath.map(item => item.menuName).join(' / ');
  } else {
    return null;
  }
};

/**
 * 获取用户函数，返回Promise
 */
const loadSysUserData = (params: ANY_OBJECT) => {
  params.permId = props.permId;
  params.loginName = fragmentSysPermUser.formFilterCopy.loginName;
  return new Promise((resolve, reject) => {
    PermController.listSysUserByPermIdWithDetail(params)
      .then(res => {
        resolve({
          dataList: res.data.map(item => {
            return { ...item };
          }),
          totalCount: res.data.length,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 用户获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysUserVerify = () => {
  if (
    fragmentSysPermUser.formFilter.loginName == null ||
    fragmentSysPermUser.formFilter.loginName === ''
  ) {
    ElMessage.error('请输入用户名！');
    return false;
  }
  fragmentSysPermUser.formFilterCopy.loginName = fragmentSysPermUser.formFilter.loginName;
  return true;
};
/**
 * 更新用户
 */
const refreshFragmentSysPermUser = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    fragmentSysPermUser.SysUser.impl.refreshTable(true, 1);
  } else {
    fragmentSysPermUser.SysUser.impl.refreshTable();
  }
};

const tableUserOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadSysUserData,
  verifyTableParameter: loadSysUserVerify,
};

const fragmentSysPermUser = reactive({
  formFilter: {
    loginName: undefined,
  },
  formFilterCopy: {
    loginName: undefined,
  },
  SysUser: {
    impl: useTable(tableUserOptions),
  },
});

/**
 * 获取角色函数，返回Promise
 */
const loadSysRoleData = (params: ANY_OBJECT) => {
  params.permId = props.permId;
  params.roleName = fragmentSysPermRole.formFilterCopy.roleName;
  return new Promise((resolve, reject) => {
    PermController.listSysRoleByPermIdWithDetail(params)
      .then(res => {
        resolve({
          dataList: res.data.map(item => {
            return { ...item };
          }),
          totalCount: res.data.length,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 角色获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysRoleVerify = () => {
  fragmentSysPermRole.formFilterCopy.roleName = fragmentSysPermRole.formFilter.roleName;
  return true;
};
/**
 * 更新角色
 */
const refreshFragmentSysPermRole = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    fragmentSysPermRole.SysRole.impl.refreshTable(true, 1);
  } else {
    fragmentSysPermRole.SysRole.impl.refreshTable();
  }
};

const tableRoleOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadSysRoleData,
  verifyTableParameter: loadSysRoleVerify,
};

const fragmentSysPermRole = reactive({
  formFilter: {
    roleName: undefined,
  },
  formFilterCopy: {
    roleName: undefined,
  },
  SysRole: {
    impl: useTable(tableRoleOptions),
  },
});

/**
 * 获取菜单函数，返回Promise
 */
const loadPermSysMenuData = (params: ANY_OBJECT) => {
  params.permId = props.permId;
  params.menuName = fragmentSysPermMenu.formFilterCopy.menuName;
  return new Promise((resolve, reject) => {
    PermController.listSysMenuByPermIdWithDetail(params)
      .then(res => {
        resolve({
          dataList: res.data.map(item => {
            return { ...item };
          }),
          totalCount: res.data.length,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 角色获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadPermSysMenuVerify = () => {
  fragmentSysPermMenu.formFilterCopy.menuName = fragmentSysPermMenu.formFilter.menuName;
  return true;
};
/**
 * 更新角色
 */
const refreshFragmentSysPermMenu = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    fragmentSysPermMenu.SysMenu.impl.refreshTable(true, 1);
  } else {
    fragmentSysPermMenu.SysMenu.impl.refreshTable();
  }
};

const tableMenuOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadPermSysMenuData,
  verifyTableParameter: loadPermSysMenuVerify,
};

const fragmentSysPermMenu = reactive({
  formFilter: {
    menuName: undefined,
  },
  formFilterCopy: {
    menuName: undefined,
  },
  SysMenu: {
    impl: useTable(tableMenuOptions),
  },
});

onMounted(() => {
  loadSysMenuData();
});
</script>

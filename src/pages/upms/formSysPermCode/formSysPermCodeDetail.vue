<template>
  <div class="tab-dialog-box" style="position: relative; margin-top: -15px">
    <el-tabs v-model="activeFragmentId">
      <el-tab-pane label="用户查询" name="fragmentSysPermCodeUser" style="width: 100%">
        <el-form
          :label-width="formItemSize == 'default' ? '65px' : '75px'"
          :size="formItemSize"
          @submit.prevent
          label-position="left"
        >
          <filter-box
            :item-width="350"
            @search="refreshFragmentSysPermCodeUser(true)"
            :hasReset="false"
            style="padding: 0; margin: 0"
          >
            <el-form-item label="用户名称">
              <el-input
                class="filter-item"
                v-model="fragmentSysPermCodeUser.formFilter.loginName"
                clearable
                placeholder=""
              />
            </el-form-item>
          </filter-box>
        </el-form>
        <el-row>
          <el-col :span="24">
            <vxe-table
              :data="fragmentSysPermCodeUser.SysUser.impl.dataList"
              :size="formItemSize"
              :height="getTableHeight + 'px'"
              :row-config="{ isHover: true }"
              @sort-change="fragmentSysPermCodeUser.SysUser.impl.onSortChange"
              header-cell-class-name="table-header-gray"
            >
              <vxe-column
                title="序号"
                type="seq"
                width="55px"
                :index="fragmentSysPermCodeUser.SysUser.impl.getTableIndex"
              />
              <vxe-column title="用户名" field="loginName" />
              <vxe-column title="用户昵称" field="showName" />
              <vxe-column title="用户角色" field="roleName" />
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
      <el-tab-pane label="角色查询" name="fragmentSysPermCodeRole" style="width: 100%">
        <el-form
          :label-width="formItemSize == 'default' ? '65px' : '75px'"
          :size="formItemSize"
          @submit.prevent
          label-position="left"
        >
          <filter-box
            :item-width="350"
            @search="refreshFragmentSysPermCodeRole(true)"
            :hasReset="false"
            style="padding: 0; margin: 0"
          >
            <el-form-item label="角色名称">
              <el-input
                class="filter-item"
                v-model="fragmentSysPermCodeRole.formFilter.roleName"
                clearable
                placeholder=""
              />
            </el-form-item>
          </filter-box>
        </el-form>
        <el-row>
          <el-col :span="24">
            <vxe-table
              :data="fragmentSysPermCodeRole.SysRole.impl.dataList"
              :size="formItemSize"
              :height="getTableHeight + 'px'"
              :row-config="{ isHover: true }"
              @sort-change="fragmentSysPermCodeRole.SysRole.impl.onSortChange"
              header-cell-class-name="table-header-gray"
            >
              <vxe-column
                title="序号"
                type="seq"
                width="55px"
                :index="fragmentSysPermCodeRole.SysRole.impl.getTableIndex"
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
import { VxeTable, VxeColumn } from 'vxe-table';
import { ElMessage } from 'element-plus';
import { SysMenuType } from '@/common/staticDict';
import { ANY_OBJECT } from '@/types/generic';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { User } from '@/types/upms/user';
import { Role } from '@/types/upms/role';
import { PermCodeController, SystemMenuController } from '@/api/system';
import { MenuItem } from '@/types/upms/menu';
import { useLayoutStore } from '@/store';
import { useMenuTools } from '../formSysMenu/hooks';
const layoutStore = useLayoutStore();

const props = defineProps<{
  permCodeId: string;
  mainContextHeight: Ref<number>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});

const getTableHeight = computed(() => {
  return props.mainContextHeight.value - 150;
});
const activeFragmentId = ref('fragmentSysPermCodeUser');

/**
 * 获取用户函数，返回Promise
 */
const loadSysUserData = (params: ANY_OBJECT): Promise<TableData<User>> => {
  params.permCodeId = props.permCodeId;
  params.loginName = fragmentSysPermCodeUser.formFilterCopy.loginName;
  return new Promise((resolve, reject) => {
    PermCodeController.listSysUserByPermCodeIdWithDetail(params)
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
  if (!fragmentSysPermCodeUser.formFilter.loginName) {
    ElMessage.error('请输入用户名！');
    return false;
  }
  fragmentSysPermCodeUser.formFilterCopy.loginName = fragmentSysPermCodeUser.formFilter.loginName;
  return true;
};

const tableUserOptions: TableOptions<User> = {
  loadTableData: loadSysUserData,
  verifyTableParameter: loadSysUserVerify,
};

/**
 * 获取角色函数，返回Promise
 */
const loadSysRoleData = (params: ANY_OBJECT) => {
  params.permCodeId = props.permCodeId;
  params.roleName = fragmentSysPermCodeRole.formFilterCopy.roleName;
  return new Promise((resolve, reject) => {
    PermCodeController.listSysRoleByPermCodeIdWithDetail(params)
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
  fragmentSysPermCodeRole.formFilterCopy.roleName = fragmentSysPermCodeRole.formFilter.roleName;
  return true;
};

const tableRoleOptions: TableOptions<Role> = {
  loadTableData: loadSysRoleData,
  verifyTableParameter: loadSysRoleVerify,
};

const fragmentSysPermCodeUser = reactive({
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
const fragmentSysPermCodeRole = reactive({
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

const { getMenuType } = useMenuTools();
// const getMenuType = (row: ANY_OBJECT) => {
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

const menuMap = new Map();
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

const getMenuPathById = (menuId: ANY_OBJECT | null): MenuItem[] => {
  if (!menuId) return [];
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

const getMenuPathString = (menuPath: MenuItem[]) => {
  if (Array.isArray(menuPath) && menuPath.length > 0) {
    return menuPath.map(item => item.menuName).join(' / ');
  } else {
    return null;
  }
};

/**
 * 更新用户
 */
const refreshFragmentSysPermCodeUser = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    fragmentSysPermCodeUser.SysUser.impl.refreshTable(true, 1);
  } else {
    fragmentSysPermCodeUser.SysUser.impl.refreshTable();
  }
};

/**
 * 更新角色
 */
const refreshFragmentSysPermCodeRole = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    fragmentSysPermCodeRole.SysRole.impl.refreshTable(true, 1);
  } else {
    fragmentSysPermCodeRole.SysRole.impl.refreshTable();
  }
};

onMounted(() => {
  loadSysMenuData();
  //refreshFragmentSysPermCodeRole(true);
  //refreshFragmentSysPermCodeUser(true);
});
</script>

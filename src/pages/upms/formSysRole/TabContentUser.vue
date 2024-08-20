<template>
  <div class="tab-content-box" :style="'min-height:' + (mainContextHeight - 76) + 'px'">
    <el-form
      ref="form"
      :model="fragmentSysRoleUser"
      label-width="75px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box
        :item-width="350"
        @search="refreshFragmentSysRoleUser(true)"
        @reset="onResetRoleUser"
      >
        <el-form-item label="用户角色">
          <el-select
            class="filter-item"
            v-model="fragmentSysRoleUser.formFilter.sysRoleId"
            clearable
            placeholder="用户角色"
            :loading="fragmentSysRoleUser.sysRole.impl.loading"
            @visible-change="
              value => {
                if (value) fragmentSysRoleUser.sysRole.impl.refresh();
              }
            "
            @change="onRoleChange"
          >
            <el-option
              v-for="item in fragmentSysRoleUser.sysRole.impl.dropdownList"
              :key="item.roleId"
              :value="item.roleId"
              :label="item.roleName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="formFilter.sysUserLoginName">
          <el-input
            class="filter-item"
            v-model="fragmentSysRoleUser.formFilter.sysUserLoginName"
            :clearable="true"
            placeholder="输入用户名 / 昵称查询"
            @change="refreshFragmentSysRoleUser(true)"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      :data="fragmentSysRoleUser.SysUser.impl.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="fragmentSysRoleUser.SysUser.impl.onSortChange"
      @refresh="refreshFragmentSysRoleUser(true)"
      :seq-config="{
        startIndex:
          (fragmentSysRoleUser.SysUser.impl.currentPage - 1) *
          fragmentSysRoleUser.SysUser.impl.pageSize,
      }"
    >
      <template v-slot:operator>
        <el-button
          type="primary"
          :icon="Plus"
          :size="layoutStore.defaultFormItemSize"
          @click="onAddRow()"
          :disabled="
            !checkPermCodeExist('formSysRole:fragmentSysRoleUser:addUserRole') ||
            fragmentSysRoleUser.formFilter.sysRoleId == null ||
            fragmentSysRoleUser.formFilter.sysRoleId === ''
          "
        >
          添加用户
        </el-button>
      </template>
      <vxe-column
        title="序号"
        type="seq"
        width="50px"
        :index="fragmentSysRoleUser.SysUser.impl.getTableIndex"
      />
      <vxe-column title="用户名" field="loginName"> </vxe-column>
      <vxe-column title="昵称" field="showName"> </vxe-column>
      <vxe-column title="账号类型">
        <template v-slot="scope">
          <span>{{ SysUserType.getValue(scope.row.userType) }}</span>
        </template>
      </vxe-column>
      <vxe-column title="状态">
        <template v-slot="scope">
          <el-tag
            :type="getUserStatusType(scope.row.userStatus)"
            :size="layoutStore.defaultFormItemSize"
          >
            {{ SysUserStatus.getValue(scope.row.userStatus) }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="操作" fixed="right" width="80px">
        <template v-slot="scope">
          <el-button
            link
            type="danger"
            :size="layoutStore.defaultFormItemSize"
            :disabled="!checkPermCodeExist('formSysRole:fragmentSysRoleUser:deleteUserRole')"
            @click="onDeleteRow(scope.row)"
          >
            移除
          </el-button>
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="fragmentSysRoleUser.SysUser.impl.totalCount"
            :current-page="fragmentSysRoleUser.SysUser.impl.currentPage"
            :page-size="fragmentSysRoleUser.SysUser.impl.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="fragmentSysRoleUser.SysUser.impl.onCurrentPageChange"
            @size-change="fragmentSysRoleUser.SysUser.impl.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
  </div>
</template>

<script setup lang="ts">
import { inject, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { usePermissions } from '@/common/hooks/usePermission';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import { SystemRoleController } from '@/api/system';
import { ANY_OBJECT } from '@/types/generic';
import { useDialog } from '@/components/Dialog/useDialog';
import { Role } from '@/types/upms/role';
import { SysUserStatus, SysUserType } from '@/common/staticDict';
import { User } from '@/types/upms/user';
import { useLayoutStore } from '@/store';
import FormSetRoleUser from './formSetRoleUser.vue';

const Dialog = useDialog();
const layoutStore = useLayoutStore();
const mainContextHeight = inject('mainContextHeight', 200);
const { checkPermCodeExist } = usePermissions();

const form = ref();

const onResetRoleUser = () => {
  form.value.resetFields();
  refreshFragmentSysRoleUser(true);
};
const onRoleChange = () => {
  refreshFragmentSysRoleUser(true);
};
const refreshFragmentSysRoleUser = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    fragmentSysRoleUser.SysUser.impl.refreshTable(true, 1);
  } else {
    fragmentSysRoleUser.SysUser.impl.refreshTable();
  }
  fragmentSysRoleUser.sysRole.impl.onVisibleChange(true).catch(e => {
    console.warn(e);
  });
  fragmentSysRoleUser.isInit = true;
};
/**
 * 角色下拉数据获取函数
 */
const loadSysRoleDropdownList = (): Promise<ListData<Role>> => {
  return new Promise((resolve, reject) => {
    let params = {};
    SystemRoleController.getRoleList(params)
      .then(res => {
        resolve({ dataList: res.data.dataList });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const dropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadSysRoleDropdownList,
  idKey: 'roleId',
};
/**
 * 用户管理数据获取函数，返回Primise
 */
const loadSysUserData = (params: ANY_OBJECT): Promise<TableData<User>> => {
  return new Promise((resolve, reject) => {
    if (!fragmentSysRoleUser.formFilter.sysRoleId) {
      ElMessage.error('请选择角色');
      resolve({
        dataList: [],
        totalCount: 0,
      });
      return;
    }
    params.roleId = fragmentSysRoleUser.formFilter.sysRoleId;
    params.sysUserDtoFilter = {
      loginName: fragmentSysRoleUser.formFilter.sysUserLoginName,
    };
    SystemRoleController.listRoleUser(params)
      .then(res => {
        resolve({
          dataList: res.data.dataList.map(item => {
            return { ...item };
          }),
          totalCount: res.data.totalCount,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 用户管理数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysUserVerify = () => {
  if (
    fragmentSysRoleUser.formFilter.sysRoleId == null ||
    fragmentSysRoleUser.formFilter.sysRoleId === ''
  ) {
    ElMessage.error('请选择角色');
    return false;
  }
  return true;
};
const tableOptions: TableOptions<Role> = {
  loadTableData: loadSysUserData,
  verifyTableParameter: loadSysUserVerify,
  paged: true,
};
const fragmentSysRoleUser = reactive({
  formFilter: {
    sysRoleId: undefined,
    sysUserLoginName: undefined,
  },
  sysRole: {
    impl: useDropdown(dropdownOptions),
  },
  SysUser: {
    impl: useTable(tableOptions),
  },
  isInit: false,
});

const getUserStatusType = (status: number) => {
  if (status === SysUserStatus.NORMAL) {
    return 'success';
  } else if (status === SysUserStatus.LOCKED) {
    return 'danger';
  } else {
    return 'info';
  }
};
const onAddRow = () => {
  if (
    fragmentSysRoleUser.formFilter.sysRoleId == null ||
    fragmentSysRoleUser.formFilter.sysRoleId === ''
  ) {
    ElMessage.error('请选择角色');
    return false;
  }
  Dialog.show(
    '角色用户授权',
    FormSetRoleUser,
    {
      area: ['1200px', 'auto'],
      end: () => {
        refreshFragmentSysRoleUser(true);
      },
    },
    {
      roleId: fragmentSysRoleUser.formFilter.sysRoleId,
    },
  ).catch(e => {
    console.warn(e);
  });
};
const onDeleteRow = (row: User) => {
  ElMessageBox.confirm(`是否移除用户【${row.showName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {
        roleId: fragmentSysRoleUser.formFilter.sysRoleId,
        userId: row.userId,
      };
      return SystemRoleController.deleteRoleUser(params);
    })
    .then(() => {
      ElMessage.success('移除成功');
      refreshFragmentSysRoleUser(true);
    })
    .catch(e => {
      console.warn(e);
    });
};
</script>

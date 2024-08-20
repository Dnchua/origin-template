<template>
  <div>
    <el-form
      :inline="true"
      :model="formSysUser"
      ref="form"
      label-width="75px"
      label-position="right"
      :size="layoutStore.defaultFormItemSize"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFormSysUser(true)" @reset="onReset">
        <el-form-item label="所属部门" prop="formFilter.deptId">
          <el-cascader
            class="filter-item"
            v-model="deptIdPath"
            :clearable="true"
            placeholder="所属部门"
            :loading="formSysUser.deptId.impl.loading"
            :props="deptOptions"
            @visible-change="onDeptIdVisibleChange"
            :options="formSysUser.deptId.impl.dropdownList"
            @change="onDeptIdValueChange"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="登录名称" prop="formFilter.sysUserLoginName">
          <el-input
            class="filter-item"
            v-model="formSysUser.formFilter.sysUserLoginName"
            :clearable="true"
            placeholder="登录名称"
          />
        </el-form-item>
        <el-form-item label="用户昵称" prop="formFilter.showName">
          <el-input
            class="filter-item"
            v-model="formSysUser.formFilter.showName"
            :clearable="true"
            placeholder="用户昵称"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      :data="formSysUser.SysUser.impl.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="formSysUser.SysUser.impl.onSortChange"
      @refresh="refreshFormSysUser(true)"
      :seq-config="{
        startIndex: (formSysUser.SysUser.impl.currentPage - 1) * formSysUser.SysUser.impl.pageSize,
      }"
    >
      <template v-slot:operator>
        <el-button
          type="primary"
          :size="layoutStore.defaultFormItemSize"
          :icon="Plus"
          :disabled="!checkPermCodeExist('formSysUser:fragmentSysUser:add')"
          @click="onAddRow()"
          >新建</el-button
        >
      </template>
      <vxe-column title="序号" type="seq" width="50px" />
      <vxe-column title="用户名" field="loginName" sortable> </vxe-column>
      <vxe-column title="昵称" field="showName"> </vxe-column>
      <vxe-column title="账号类型" field="userTypeDictMap.name" />
      <vxe-column title="所属部门" field="deptIdDictMap.name" />
      <vxe-column title="状态">
        <template v-slot="scope">
          <el-tag
            :type="getUserStatusType(scope.row.userStatus)"
            :size="layoutStore.defaultFormItemSize"
            >{{ SysUserStatus.getValue(scope.row.userStatus) }}</el-tag
          >
        </template>
      </vxe-column>
      <vxe-column title="创建时间">
        <template v-slot="scope">
          <span class="vxe-cell--label">{{
            formatDateByStatsType(scope.row.createTime, 'day')
          }}</span>
        </template>
      </vxe-column>
      <vxe-column title="操作" fixed="right" width="250px">
        <template v-slot="scope">
          <el-button
            type="primary"
            link
            :size="layoutStore.defaultFormItemSize"
            @click="onEditRow(scope.row)"
            :disabled="
              isAdmin(scope.row) || !checkPermCodeExist('formSysUser:fragmentSysUser:update')
            "
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            :size="layoutStore.defaultFormItemSize"
            @click="onDeleteRow(scope.row)"
            :disabled="
              isAdmin(scope.row) || !checkPermCodeExist('formSysUser:fragmentSysUser:delete')
            "
          >
            删除
          </el-button>
          <el-button
            link
            type="primary"
            :size="layoutStore.defaultFormItemSize"
            @click="onResetPassword(scope.row)"
            :disabled="!checkPermCodeExist('formSysUser:fragmentSysUser:resetPassword')"
          >
            重置密码
          </el-button>
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="formSysUser.SysUser.impl.totalCount"
            :current-page="formSysUser.SysUser.impl.currentPage"
            :page-size="formSysUser.SysUser.impl.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="pageNum => formSysUser.SysUser.impl.onCurrentPageChange(pageNum)"
            @size-change="pageSize => formSysUser.SysUser.impl.onPageSizeChange(pageSize)"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
  </div>
</template>

<script lang="ts">
export default {
  name: 'formSysUser',
};
</script>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import {
  CascaderNodePathValue,
  CascaderNodeValue,
  CascaderValue,
  ElMessage,
  ElMessageBox,
} from 'element-plus';
import SystemUserController from '@/api/system/UserController';
import TableBox from '@/components/TableBox/index.vue';
import { treeDataTranslate } from '@/common/utils';
import { SysUserStatus, SysUserType } from '@/common/staticDict/index';
import { User, UserInfo } from '@/types/upms/user';
import { usePermissions } from '@/common/hooks/usePermission';
import { ANY_OBJECT } from '@/types/generic';
import { DictionaryController } from '@/api/system';
import { useDialog } from '@/components/Dialog/useDialog';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import { useDate } from '@/common/hooks/useDate';
import { useLayoutStore } from '@/store';
import EditUserForm from '../formEditSysUser/index.vue';
const layoutStore = useLayoutStore();

const Dialog = useDialog();
const mainContextHeight = inject('mainContextHeight', 200);
const form = ref();
const deptIdPath = ref<Array<string | number>>([]);

const deptOptions = { value: 'id', label: 'name', checkStrictly: true };

const onReset = () => {
  form.value.resetFields();
  deptIdPath.value = [];
  refreshFormSysUser(true);
};

const isAdmin = (row: UserInfo) => {
  return row.userType === SysUserType.ADMIN;
};

const loadSysUserData = (params: ANY_OBJECT): Promise<TableData<User>> => {
  params.sysUserDtoFilter = {
    deptId: formSysUser.formFilterCopy.deptId,
    loginName: formSysUser.formFilterCopy.sysUserLoginName,
    showName: formSysUser.formFilterCopy.showName,
    userStatus: formSysUser.formFilterCopy.sysUserStatus,
  };
  return new Promise((resolve, reject) => {
    SystemUserController.getUserList(params)
      .then(res => {
        resolve({
          dataList: treeDataTranslate<User>(res.data.dataList, 'userId'),
          totalCount: res.data.totalCount,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};

/**
 * 用户数据数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysUserVerify = () => {
  formSysUser.formFilterCopy.deptId = formSysUser.formFilter.deptId;
  formSysUser.formFilterCopy.sysUserLoginName = formSysUser.formFilter.sysUserLoginName;
  formSysUser.formFilterCopy.showName = formSysUser.formFilter.showName;
  formSysUser.formFilterCopy.sysUserStatus = formSysUser.formFilter.sysUserStatus;
  return true;
};

const tableOptions: TableOptions<User> = {
  loadTableData: loadSysUserData,
  verifyTableParameter: loadSysUserVerify,
  paged: true,
  orderFieldName: 'createTime',
  ascending: true,
};

const loadDeptIdDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    let params = {};
    DictionaryController.dictSysDept(params)
      .then(res => {
        resolve({
          dataList: treeDataTranslate(res.getList(), 'id'),
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const dropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadDeptIdDropdownList,
  idKey: 'deptId',
};

// 加载用户数据
const formSysUser = reactive({
  formFilter: {
    deptId: undefined as CascaderNodeValue | CascaderNodePathValue | undefined,
    sysUserStatus: undefined,
    sysUserLoginName: undefined,
    showName: undefined,
  },
  formFilterCopy: {
    deptId: undefined as CascaderNodeValue | CascaderNodePathValue | undefined,
    sysUserStatus: undefined,
    sysUserLoginName: undefined,
    showName: undefined,
  },
  deptId: {
    impl: useDropdown(dropdownOptions),
  },
  SysUser: {
    impl: useTable(tableOptions),
  },
  isInit: false,
});

const { checkPermCodeExist } = usePermissions();
const { formatDateByStatsType } = useDate();

const refreshFormSysUser = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    formSysUser.SysUser.impl.refreshTable(true, 1);
  } else {
    formSysUser.SysUser.impl.refreshTable();
  }
  formSysUser.isInit = true;
};

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
  Dialog.show('新建用户', EditUserForm, {
    area: '600px',
  })
    .then(() => {
      refreshFormSysUser();
    })
    .catch(e => {
      console.warn(e);
    });
};

const onEditRow = (row: User) => {
  var params = {
    userId: row.userId,
  };

  SystemUserController.getUser(params)
    .then(res => {
      Dialog.show(
        '编辑用户',
        EditUserForm,
        {
          area: '600px',
        },
        {
          rowData: res.data,
        },
      )
        .then(() => {
          refreshFormSysUser();
        })
        .catch(e => {
          console.warn(e);
        });
    })
    .catch(e => {
      console.warn(e);
    });
};

const onDeleteRow = (row: User) => {
  let params = {
    userId: row.userId,
  };
  ElMessageBox.confirm(`是否删除用户【${row.showName || row.loginName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      SystemUserController.deleteUser(params)
        .then(() => {
          refreshFormSysUser();
        })
        .catch(e => {
          console.log(e);
        });
    })
    .catch(e => {
      console.log(e);
    });
};

const onResetPassword = (row: User) => {
  ElMessageBox.confirm('是否重置用户密码？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      return SystemUserController.resetUserPassword({ userId: row.userId });
    })
    .then(() => {
      ElMessage.success('重置密码成功');
    })
    .catch(e => {
      console.warn(e);
    });
};

const onDeptIdVisibleChange = (show: boolean) => {
  formSysUser.deptId.impl.onVisibleChange(show).catch(e => {
    console.warn(e);
  });
};

const onDeptIdValueChange = (value: CascaderValue) => {
  formSysUser.formFilter.deptId = Array.isArray(value) ? value[value.length - 1] : undefined;
};

onMounted(() => {
  refreshFormSysUser();
});
</script>

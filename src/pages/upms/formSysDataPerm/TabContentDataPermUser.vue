<template>
  <div class="tab-content-box" :style="'min-height:' + (mainContextHeight - 76) + 'px'">
    <el-form
      ref="form"
      :model="fragmentSysDataPermUser"
      label-width="75px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box
        :item-width="350"
        @search="refreshFragmentSysDataPermUser(true)"
        @reset="onResetDataPermUser"
      >
        <el-form-item label="数据权限" prop="formFilter.dataPermId">
          <el-select
            class="filter-item"
            v-model="fragmentSysDataPermUser.formFilter.dataPermId"
            clearable
            placeholder="数据权限"
            :loading="fragmentSysDataPermUser.dataPermId.impl.loading"
            @visible-change="fragmentSysDataPermUser.dataPermId.impl.onVisibleChange"
            @change="onDataPermChange"
          >
            <el-option
              v-for="item in fragmentSysDataPermUser.dataPermId.impl.dropdownList"
              :key="item.dataPermId"
              :value="item.dataPermId"
              :label="item.dataPermName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="formFilter.searchString">
          <el-input
            class="filter-item"
            v-model="fragmentSysDataPermUser.formFilter.searchString"
            :clearable="true"
            placeholder="输入用户名 / 昵称查询"
            @change="refreshFragmentSysDataPermUser(true)"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      :data="fragmentSysDataPermUser.SysDataPermUserList.impl.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="fragmentSysDataPermUser.SysDataPermUserList.impl.onSortChange"
      :seq-config="{
        startIndex:
          (fragmentSysDataPermUser.SysDataPermUserList.impl.currentPage - 1) *
          fragmentSysDataPermUser.SysDataPermUserList.impl.pageSize,
      }"
      @refresh="refreshFragmentSysDataPermUser(true)"
    >
      <template v-slot:operator>
        <el-button
          type="primary"
          :icon="Plus"
          :size="layoutStore.defaultFormItemSize"
          @click="onAddDataPermUserClick()"
          :disabled="
            !checkPermCodeExist('formSysDataPerm:fragmentSysDataPermUser:addDataPermUser') ||
            !fragmentSysDataPermUser.formFilter.dataPermId
          "
        >
          添加用户
        </el-button>
      </template>
      <vxe-column
        title="序号"
        type="seq"
        width="55px"
        :index="fragmentSysDataPermUser.SysDataPermUserList.impl.getTableIndex"
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
            >{{ SysUserStatus.getValue(scope.row.userStatus) }}</el-tag
          >
        </template>
      </vxe-column>
      <vxe-column title="操作" fixed="right" width="80px">
        <template v-slot="scope">
          <el-button
            link
            type="danger"
            :size="layoutStore.defaultFormItemSize"
            :disabled="
              !checkPermCodeExist('formSysDataPerm:fragmentSysDataPermUser:deleteDataPermUser')
            "
            @click="onDeleteRow(scope.row)"
            >移除</el-button
          >
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="fragmentSysDataPermUser.SysDataPermUserList.impl.totalCount"
            :current-page="fragmentSysDataPermUser.SysDataPermUserList.impl.currentPage"
            :page-size="fragmentSysDataPermUser.SysDataPermUserList.impl.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="fragmentSysDataPermUser.SysDataPermUserList.impl.onCurrentPageChange;"
            @size-change="fragmentSysDataPermUser.SysDataPermUserList.impl.onPageSizeChange;"
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
import { SysDataPermController } from '@/api/system';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import { ANY_OBJECT } from '@/types/generic';
import { useDialog } from '@/components/Dialog/useDialog';
import { SysUserType, SysUserStatus } from '@/common/staticDict';
import { User } from '@/types/upms/user';
import { PermData } from '@/types/upms/permdata';
import { useLayoutStore } from '@/store';
import FormSetSysDataPermUser from './formSetSysDataPermUser.vue';

const Dialog = useDialog();
const layoutStore = useLayoutStore();
const mainContextHeight = inject('mainContextHeight', 200);
const { checkPermCodeExist } = usePermissions();

const form = ref();

const loadDataPermDropdownList = (): Promise<ListData<PermData>> => {
  return new Promise((resolve, reject) => {
    let params = {};
    SysDataPermController.list(params)
      .then(res => {
        resolve({ dataList: res.data.dataList });
      })
      .catch(e => {
        reject(e);
      });
  });
};

const dropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadDataPermDropdownList,
};

/**
 * 用户列表数据获取函数，返回Primise
 */
const loadSysDataPermUserListData = (params: ANY_OBJECT): Promise<TableData<User>> => {
  return new Promise((resolve, reject) => {
    if (!fragmentSysDataPermUser.formFilter.dataPermId) {
      ElMessage.error('请选择数据权限');
      resolve({
        dataList: [],
        totalCount: 0,
      });
      return;
    }

    params.dataPermId = fragmentSysDataPermUser.formFilter.dataPermId;
    params.searchString = fragmentSysDataPermUser.formFilter.searchString;
    SysDataPermController.listDataPermUser(params)
      .then(res => {
        resolve({
          dataList: res.data.dataList,
          totalCount: res.data.totalCount,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 用户列表数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysDataPermUserListVerify = () => {
  return true;
};

const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadSysDataPermUserListData,
  verifyTableParameter: loadSysDataPermUserListVerify,
  paged: true,
  //orderFieldName: 'createTime',
  //ascending: true,
};

const fragmentSysDataPermUser = reactive({
  formFilter: {
    dataPermId: undefined,
    searchString: undefined,
  },
  dataPermId: {
    impl: useDropdown(dropdownOptions),
  },
  SysDataPermUserList: {
    impl: useTable(tableOptions),
  },
  isInit: false,
});

/**
 * 更新数据权限授权
 */
const refreshFragmentSysDataPermUser = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    fragmentSysDataPermUser.SysDataPermUserList.impl.refreshTable(true, 1);
  } else {
    fragmentSysDataPermUser.SysDataPermUserList.impl.refreshTable();
  }
  fragmentSysDataPermUser.isInit = true;
};

const onResetDataPermUser = () => {
  form.value.resetFields();
  refreshFragmentSysDataPermUser(true);
};

const onDataPermChange = () => {
  refreshFragmentSysDataPermUser(true);
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

/**
 * 授权用户
 */
const onAddDataPermUserClick = () => {
  let params = {
    dataPermId: fragmentSysDataPermUser.formFilter.dataPermId,
  };

  Dialog.show(
    '授权用户',
    FormSetSysDataPermUser,
    {
      area: ['1100px'],
      end: () => {
        refreshFragmentSysDataPermUser(true);
      },
    },
    params,
  )
    .then(() => {
      refreshFragmentSysDataPermUser(true);
    })
    .catch(() => {
      refreshFragmentSysDataPermUser(true);
    });
};

const onDeleteRow = (row: User) => {
  ElMessageBox.confirm(`是否移除用户【${row.showName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    let params = {
      dataPermId: fragmentSysDataPermUser.formFilter.dataPermId,
      userId: row.userId,
    };

    SysDataPermController.deleteDataPermUser(params)
      .then(() => {
        refreshFragmentSysDataPermUser(true);
        ElMessage.success('移除成功');
      })
      .catch(e => {
        console.log(e);
      });
  });
};
</script>

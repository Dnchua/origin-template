<template>
  <div style="height: 490px">
    <el-form
      ref="form"
      :model="formSysUser"
      label-width="75px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
      style="overflow: hidden"
    >
      <filter-box
        :item-width="325"
        @search="refreshFormSysUser(true)"
        @reset="onReset"
        style="padding: 0; margin: 0"
      >
        <el-form-item label="用户状态" prop="formFilter.sysUserStatus">
          <el-select
            class="filter-item"
            v-model="formSysUser.formFilter.sysUserStatus"
            :clearable="true"
            placeholder="用户状态"
          >
            <el-option
              v-for="item in SysUserStatus.getList()"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="formFilter.sysUserLoginName">
          <el-input
            class="filter-item"
            v-model="formSysUser.formFilter.sysUserLoginName"
            :clearable="true"
            placeholder="用户名"
          />
        </el-form-item>
        <template #operation>
          <el-button
            style="float: right"
            :size="formItemSize"
            type="primary"
            :plain="false"
            @click="onSetUser"
            :disabled="selectUsers == null || selectUsers.length <= 0"
            >授权人员</el-button
          >
        </template>
      </filter-box>
    </el-form>
    <el-row>
      <el-col :span="24">
        <vxe-table
          :data="formSysUser.SysUser.impl.dataList"
          header-cell-class-name="table-header-gray"
          height="400px"
          :size="tableSize"
          ref="userTable"
          :row-config="{ isHover: true }"
          :seq-config="{
            startIndex:
              (formSysUser.SysUser.impl.currentPage - 1) * formSysUser.SysUser.impl.pageSize,
          }"
          @checkbox-change="onTableSelectionChange"
          @checkbox-all="onTableSelectionChange"
        >
          <vxe-column
            header-align="center"
            align="center"
            type="checkbox"
            width="50px"
            :reserve-selection="true"
          />
          <vxe-column title="序号" type="seq" width="50px" />
          <vxe-column title="用户名" field="loginName"> </vxe-column>
          <vxe-column title="昵称" field="showName"> </vxe-column>
          <vxe-column title="账号类型">
            <template v-slot="scope">
              <span>{{ SysUserType.getValue(scope.row.userType) }}</span>
            </template>
          </vxe-column>
          <vxe-column title="状态">
            <template v-slot="scope">
              <el-tag :type="getUserStatusType(scope.row.userStatus)" :size="formItemSize">{{
                SysUserStatus.getValue(scope.row.userStatus)
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
        <el-col :span="24">
          <el-row type="flex" justify="end" style="margin-top: 16px">
            <el-pagination
              :total="formSysUser.SysUser.impl.totalCount"
              :current-page="formSysUser.SysUser.impl.currentPage"
              :page-size="formSysUser.SysUser.impl.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, prev, pager, next, sizes"
              @current-change="formSysUser.SysUser.impl.onCurrentPageChange"
              @size-change="formSysUser.SysUser.impl.onPageSizeChange"
            >
            </el-pagination>
          </el-row>
        </el-col>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { inject, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { SizeType, VxeColumn, VxeTable } from 'vxe-table';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { SysDataPermController } from '@/api/system';
import { ANY_OBJECT } from '@/types/generic';
import { SysUserStatus, SysUserType } from '@/common/staticDict';
import { User } from '@/types/upms/user';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  dataPermId: string | number;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const form = ref();
const userTable = ref();
const selectUsers: Ref<User[]> = ref([]);

const tableSize = computed(() => {
  return formItemSize.value as SizeType;
});

const loadSysUserData = (params: ANY_OBJECT): Promise<TableData<User>> => {
  params.dataPermId = props.dataPermId;
  params.sysUserDtoFilter = {
    loginName: formSysUser.formFilterCopy.sysUserLoginName,
    userStatus: formSysUser.formFilterCopy.sysUserStatus,
  };
  userTable.value.clearCheckboxRow();
  return new Promise((resolve, reject) => {
    SysDataPermController.listNotInDataPermUser(params)
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
 * 获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysUserVerify = () => {
  formSysUser.formFilterCopy.sysUserLoginName = formSysUser.formFilter.sysUserLoginName;
  formSysUser.formFilterCopy.sysUserStatus = formSysUser.formFilter.sysUserStatus;
  return true;
};
const tableOptions: TableOptions<User> = {
  loadTableData: loadSysUserData,
  verifyTableParameter: loadSysUserVerify,
  paged: true,
};
const formSysUser = reactive({
  formFilter: {
    sysUserStatus: undefined,
    sysUserLoginName: undefined,
  },
  formFilterCopy: {
    sysUserStatus: undefined,
    sysUserLoginName: undefined,
  },
  SysUser: {
    impl: useTable(tableOptions),
  },
  isInit: false,
});

const refreshFormSysUser = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    formSysUser.SysUser.impl.refreshTable(true, 1);
  } else {
    formSysUser.SysUser.impl.refreshTable();
  }
  formSysUser.isInit = true;
};

const onReset = () => {
  form.value.resetFields();
  refreshFormSysUser(true);
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

const onTableSelectionChange = () => {
  if (userTable.value) {
    selectUsers.value = userTable.value.getCheckboxRecords(true);
  }
  //console.log('selectUsers', selectUsers);
};

const onSetUser = () => {
  let params = {
    dataPermId: props.dataPermId,
    userIdListString: selectUsers.value
      .map(item => {
        return item.userId;
      })
      .join(','),
  };

  SysDataPermController.addDataPermUser(params)
    .then(() => {
      ElMessage.success('授权成功');
      refreshFormSysUser(true);
      userTable.value.clearCheckboxRow();
      selectUsers.value = [];
    })
    .catch(e => {
      console.warn(e);
    });
};

onMounted(() => {
  refreshFormSysUser(true);
});
</script>

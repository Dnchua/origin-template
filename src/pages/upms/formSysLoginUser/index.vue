<template>
  <div style="position: relative">
    <el-form
      ref="form"
      :model="formSysLoginUser"
      label-width="80px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFormOperationType(true)" @reset="onReset">
        <el-form-item label="登录名称" prop="formFilter.loginName">
          <el-input
            class="filter-item"
            v-model="formSysLoginUser.formFilter.loginName"
            :clearable="true"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      ref="teacher"
      :data="formSysLoginUser.loginUser.impl.dataList"
      @sort-change="formSysLoginUser.loginUser.impl.onSortChange"
      @refresh="refreshFormOperationType"
      :hasExtend="false"
      :seq-config="{
        startIndex:
          (formSysLoginUser.loginUser.impl.currentPage - 1) *
          formSysLoginUser.loginUser.impl.pageSize,
      }"
    >
      <vxe-column
        title="序号"
        type="seq"
        width="55px"
        :index="formSysLoginUser.loginUser.impl.getTableIndex"
      />
      <vxe-column title="登录名称" field="loginName" />
      <vxe-column title="用户昵称" field="showName" />
      <vxe-column title="登录 IP" field="loginIp" />
      <vxe-column title="登录时间" field="loginTime" />
      <vxe-column title="操作" fixed="right" width="80px">
        <template v-slot="scope">
          <el-button
            link
            type="danger"
            size="default"
            :disabled="!checkPermCodeExist('formSysLoginUser:fragmentLoginUser:delete')"
            @click.stop="onDeleteLoginUserClick(scope.row)"
          >
            强退
          </el-button>
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="formSysLoginUser.loginUser.impl.totalCount"
            :current-page="formSysLoginUser.loginUser.impl.currentPage"
            :page-size="formSysLoginUser.loginUser.impl.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="formSysLoginUser.loginUser.impl.onCurrentPageChange"
            @size-change="formSysLoginUser.loginUser.impl.onPageSizeChange"
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
import { LoginUserController } from '@/api/system/index';
import { ANY_OBJECT } from '@/types/generic';
import TableBox from '@/components/TableBox/index.vue';
import { usePermissions } from '@/common/hooks/usePermission';
import { treeDataTranslate } from '@/common/utils';
import { OnlineUser } from '@/types/upms/user';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';

const form = ref();
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();
const { checkPermCodeExist } = usePermissions();

//const { pageSize, totalCount, currentPage, dataList } = useTable({} as TableOptions<ANY_OBJECT>);

const onReset = () => {
  form.value.resetFields();
  refreshFormOperationType(true);
};
/**
 * 登录用户数据数据获取函数，返回Promise
 */
const loadLoginUserWidgetData = (params: ANY_OBJECT): Promise<TableData<OnlineUser>> => {
  if (params == null) params = {};
  params = {
    ...params,
    loginName: formSysLoginUser.formFilterCopy.loginName,
  };
  return new Promise((resolve, reject) => {
    LoginUserController.listSysLoginUser(params)
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
 * 登录用户数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadLoginUserVerify = () => {
  formSysLoginUser.formFilterCopy = { ...formSysLoginUser.formFilter };
  return true;
};

const tableOptions: TableOptions<OnlineUser> = {
  loadTableData: loadLoginUserWidgetData,
  verifyTableParameter: loadLoginUserVerify,
  paged: true,
};

const formSysLoginUser = reactive({
  formFilter: {
    loginName: undefined,
  },
  formFilterCopy: {
    loginName: undefined,
  },
  loginUser: {
    impl: useTable(tableOptions),
  },
});
/**
 * 强制踢出登录用户
 */
const onDeleteLoginUserClick = (row: ANY_OBJECT) => {
  ElMessageBox.confirm(
    `是否强制将用户【${row.showName || row.loginName}】从【${row.loginIp}】退出登录？`,
    '',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(() => {
      LoginUserController.deleteSysLoginUser({ sessionId: row.sessionId })
        .then(() => {
          ElMessage.success('删除成功');
          formSysLoginUser.loginUser.impl.refreshTable(true);
        })
        .catch(e => {
          console.log(e);
        });
    })
    .catch(e => {
      console.log(e);
    });
};
/**
 * 更新操作日志
 */
const refreshFormOperationType = (reloadData = false) => {
  formSysLoginUser.loginUser.impl.refreshTable(reloadData, reloadData ? 1 : undefined, false);
};

onMounted(() => {
  refreshFormOperationType(true);
});
</script>

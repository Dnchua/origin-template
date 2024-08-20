<template>
  <el-form
    ref="form"
    :model="formPerm"
    label-width="75px"
    :size="layoutStore.defaultFormItemSize"
    label-position="right"
    @submit.prevent
  >
    <filter-box :item-width="350" @search="refreshFormPerm(true)" @reset="onReset">
      <el-form-item label="关联URL" prop="formFilter.url">
        <el-input
          class="filter-item"
          placeholder="URL模糊搜索"
          v-model="formPerm.formFilter.url"
          :size="layoutStore.defaultFormItemSize"
          clearable
        />
      </el-form-item>
    </filter-box>
  </el-form>
  <table-box
    class="page-table"
    :data="formPerm.SysPerm.impl.dataList"
    :size="layoutStore.defaultFormItemSize"
    @sort-change="formPerm.SysPerm.impl.onSortChange"
    @refresh="refreshFormPerm(true)"
    :seq-config="{
      startIndex: (formPerm.SysPerm.impl.currentPage - 1) * formPerm.SysPerm.impl.pageSize,
    }"
  >
    <template v-slot:operator>
      <el-button
        type="primary"
        :icon="Plus"
        :size="layoutStore.defaultFormItemSize"
        :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:addPerm')"
        @click="onCreateClick()"
      >
        新建
      </el-button>
    </template>
    <vxe-column title="序号" type="seq" width="50px" :index="formPerm.SysPerm.impl.getTableIndex" />
    <vxe-column title="权限名称" field="permName" width="150px"> </vxe-column>
    <vxe-column title="权限模块" field="moduleIdDictMap.name" width="150px"> </vxe-column>
    <vxe-column title="关联URL" field="url" min-width="250px"> </vxe-column>
    <vxe-column title="操作" fixed="right" width="180px">
      <template v-slot="scope">
        <el-button
          @click="onEditClick(scope.row)"
          link
          type="primary"
          :size="layoutStore.defaultFormItemSize"
          :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:updatePerm')"
        >
          编辑
        </el-button>
        <el-button
          @click="onDeleteClick(scope.row)"
          link
          type="danger"
          :size="layoutStore.defaultFormItemSize"
          :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:deletePerm')"
        >
          删除
        </el-button>
        <el-button
          type="primary"
          link
          :size="layoutStore.defaultFormItemSize"
          v-if="checkPermCodeExist('formSysPerm:fragmentSysPerm:listSysPermPermDetail')"
          @click="onDetailClick(scope.row)"
        >
          权限详情
        </el-button>
      </template>
    </vxe-column>
    <template v-slot:pagination>
      <el-row type="flex" justify="end" style="margin-top: 16px">
        <el-pagination
          :total="formPerm.SysPerm.impl.totalCount"
          :current-page="formPerm.SysPerm.impl.currentPage"
          :page-size="formPerm.SysPerm.impl.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          @current-change="formPerm.SysPerm.impl.onCurrentPageChange"
          @size-change="formPerm.SysPerm.impl.onPageSizeChange"
        >
        </el-pagination>
      </el-row>
    </template>
  </table-box>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { usePermissions } from '@/common/hooks/usePermission';
import { ANY_OBJECT } from '@/types/generic';
import { PermController } from '@/api/system';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { Perm, PermModule } from '@/types/upms/perm';
import { useDialog } from '@/components/Dialog/useDialog';
import { useLayoutStore } from '@/store';
import FormEditSysPerm from '../formEditSysPerm/index.vue';
import FormSysPermDetail from './SysPermDetail.vue';

const props = defineProps<{ permModuleId?: string; permModuleList: PermModule[] }>();
const Dialog = useDialog();
const layoutStore = useLayoutStore();
const mainContextHeight = inject('mainContextHeight', 200);
const { checkPermCodeExist } = usePermissions();

const form = ref();

/**
 * 权限数据获取函数，返回Primise
 */
const loadSysPermData = (params: ANY_OBJECT): Promise<TableData<Perm>> => {
  params.sysPermDtoFilter = {
    url: formPerm.formFilterCopy.url == '' ? undefined : formPerm.formFilterCopy.url,
    moduleId:
      formPerm.formFilterCopy.permModuleId == '' ? undefined : formPerm.formFilterCopy.permModuleId,
  };
  return new Promise((resolve, reject) => {
    PermController.getPermList(params)
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
 * 权限数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysPermVerify = () => {
  formPerm.formFilterCopy.url = formPerm.formFilter.url;
  formPerm.formFilterCopy.permModuleId = props.permModuleId;
  return true;
};

const tableOptions: TableOptions<Perm> = {
  loadTableData: loadSysPermData,
  verifyTableParameter: loadSysPermVerify,
  paged: true,
};

const formPerm = reactive({
  formFilter: {
    permModuleId: undefined as string | undefined,
    url: undefined as string | undefined,
  },
  formFilterCopy: {
    permModuleId: undefined as string | undefined,
    url: undefined as string | undefined,
  },
  SysPerm: {
    impl: useTable(tableOptions),
  },
});

const onReset = () => {
  form.value.resetFields();
  refreshFormPerm(true);
};

/**
 * 更新权限管理
 */
const refreshFormPerm = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    formPerm.SysPerm.impl.refreshTable(true, 1);
  } else {
    formPerm.SysPerm.impl.refreshTable();
  }
};
/**
 * 新建
 */
const onCreateClick = () => {
  let params = {
    currentPermGroupId: formPerm.formFilterCopy.permModuleId,
    permModuleList: props.permModuleList,
  };

  Dialog.show(
    '新建',
    FormEditSysPerm,
    {
      area: ['600px'],
    },
    params,
  )
    .then(() => {
      refreshFormPerm();
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 编辑
 */
const onEditClick = (row: Perm) => {
  let params = {
    moduleId: row.moduleId,
    permId: row.permId,
    rowData: row,
    permModuleList: props.permModuleList,
  };

  Dialog.show(
    '编辑',
    FormEditSysPerm,
    {
      area: ['600px'],
    },
    params,
  )
    .then(() => {
      formPerm.SysPerm.impl.refreshTable();
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 删除
 */
const onDeleteClick = (row: Perm) => {
  let params = {
    permId: row.permId,
  };

  ElMessageBox.confirm(`是否删除权限【${row.permName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      PermController.deletePerm(params)
        .then(() => {
          ElMessage.success('删除成功');
          formPerm.SysPerm.impl.refreshTable();
        })
        .catch(e => {
          console.warn(e);
        });
    })
    .catch(e => {
      console.warn(e);
    });
};

const onDetailClick = (row: Perm) => {
  Dialog.show(
    '权限详情',
    FormSysPermDetail,
    {
      area: '1200px',
      offset: '30px',
    },
    {
      permId: row.permId,
      mainContextHeight: mainContextHeight,
    },
  )
    .then(() => {
      // do nothing
    })
    .catch(e => {
      console.warn(e);
    });
};

watch(
  () => props.permModuleId,
  () => {
    refreshFormPerm(true);
  },
);

onMounted(() => {
  refreshFormPerm();
});
</script>

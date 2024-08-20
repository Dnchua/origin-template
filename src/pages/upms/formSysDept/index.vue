<template>
  <div>
    <el-form
      ref="form"
      :model="formSysDept"
      label-width="75px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFormSysDept(true)" @reset="onReset">
        <el-form-item label="部门名称" prop="formFilter.deptName">
          <el-input
            class="filter-item"
            v-model="formSysDept.formFilter.deptName"
            :clearable="true"
            placeholder="部门名称"
          />
        </el-form-item>
      </filter-box>
    </el-form>

    <table-box
      class="border-bottom-0 page-table"
      :data="formSysDept.SysDeptList.impl.dataList"
      :tree-config="{ rowField: 'deptId', parentField: 'parentId' }"
      @refresh="refreshFormSysDept(true)"
    >
      <template v-slot:operator>
        <el-button
          type="primary"
          :icon="Plus"
          :size="layoutStore.defaultFormItemSize"
          :disabled="!checkPermCodeExist('formSysDept:fragmentSysDept:add')"
          @click="onCreateSysDeptClick()"
          >新建</el-button
        >
      </template>
      <vxe-column title="序号" type="seq" width="80px" tree-node> </vxe-column>
      <vxe-column title="部门名称" field="deptName"> </vxe-column>
      <vxe-column title="操作" fixed="right" width="150px">
        <template v-slot="scope">
          <el-button
            @click="onEditSysDeptClick(scope.row)"
            type="primary"
            link
            size="default"
            :disabled="!checkPermCodeExist('formSysDept:fragmentSysDept:update')"
          >
            编辑
          </el-button>
          <el-button
            @click="onEditSysDeptPostClick(scope.row)"
            type="primary"
            link
            size="default"
            :disabled="
              !(
                checkPermCodeExist('formSysDept:fragmentSysDept:editPost') ||
                checkPermCodeExist('formSysDept:fragmentSysDept:viewPost')
              )
            "
          >
            岗位
          </el-button>
          <el-button
            @click="onDeleteClick(scope.row)"
            link
            type="danger"
            size="default"
            :disabled="!checkPermCodeExist('formSysDept:fragmentSysDept:delete')"
          >
            删除
          </el-button>
        </template>
      </vxe-column>
    </table-box>
  </div>
</template>

<script lang="ts">
export default {
  name: 'formSysDept',
};
</script>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useLayoutStore } from '@/store';
import { usePermissions } from '@/common/hooks/usePermission';
import { TableOptions } from '@/common/types/pagination';
import { SysDept } from '@/types/upms/department';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { ANY_OBJECT } from '@/types/generic';
import { SysDeptController } from '@/api/system';
import { treeDataTranslate } from '@/common/utils';
import { useDialog } from '@/components/Dialog/useDialog';
import FormEditSysDept from '../formEditSysDept/index.vue';

const Dialog = useDialog();
const layoutStore = useLayoutStore();
const { checkPermCodeExist } = usePermissions();

const form = ref();
const router = useRouter();

const onReset = () => {
  form.value.resetFields();
  refreshFormSysDept(true);
};

/**
 * 部门列表数据获取函数
 */
const loadSysDeptListData = (params: ANY_OBJECT): Promise<TableData<SysDept>> => {
  params.sysDeptDtoFilter = {
    deptName: formSysDept.formFilterCopy.deptName,
  };
  // 按照显示顺序排序
  params.orderParam = [
    {
      fieldName: 'showOrder',
      asc: true,
    },
  ];
  return new Promise((resolve, reject) => {
    SysDeptController.list(params)
      .then(res => {
        resolve({
          dataList: treeDataTranslate<SysDept>(res.data.dataList, 'deptId', 'parentId'),
          totalCount: res.data.totalCount,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 部门列表数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysDeptListVerify = () => {
  formSysDept.formFilterCopy.deptName = formSysDept.formFilter.deptName;
  return true;
};

const tableOptions: TableOptions<SysDept> = {
  loadTableData: loadSysDeptListData,
  verifyTableParameter: loadSysDeptListVerify,
  paged: false,
};

const formSysDept = reactive({
  formFilter: {
    deptName: undefined,
  },
  formFilterCopy: {
    deptName: undefined,
  },
  SysDeptList: {
    impl: useTable(tableOptions),
  },
});

/**
 * 更新部门管理
 */
const refreshFormSysDept = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    formSysDept.SysDeptList.impl.refreshTable(true, 1);
  } else {
    formSysDept.SysDeptList.impl.refreshTable();
  }
};

/**
 * 新建
 */
const onCreateSysDeptClick = () => {
  let params = {};

  Dialog.show(
    '新建部门',
    FormEditSysDept,
    {
      area: ['500px'],
    },
    params,
  )
    .then(() => {
      refreshFormSysDept();
    })
    .catch(e => {
      console.warn(e);
    });
};

/**
 * 编辑部门
 */
const onEditSysDeptClick = (row: SysDept) => {
  let params = {
    deptId: row.deptId,
  };

  Dialog.show(
    '编辑部门',
    FormEditSysDept,
    {
      area: ['500px'],
    },
    params,
  )
    .then(() => {
      formSysDept.SysDeptList.impl.refreshTable();
    })
    .catch(e => {
      console.warn(e);
    });
};

/**
 * 岗位
 */
const onEditSysDeptPostClick = (row: SysDept) => {
  let params = {
    deptId: row.deptId,
    closeVisible: 1,
  };
  router.push({ name: 'formSysDeptPost', query: params });
};

/**
 * 删除
 */
const onDeleteClick = (row: SysDept) => {
  let params = {
    deptId: row.deptId,
  };

  ElMessageBox.confirm(`是否删除部门【${row.deptName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    SysDeptController.delete(params)
      .then(() => {
        ElMessage.success('删除成功');
        refreshFormSysDept();
      })
      .catch(e => {
        console.warn(e);
      });
  });
};

const formInit = () => {
  refreshFormSysDept();
};

onMounted(() => {
  formInit();
});
</script>

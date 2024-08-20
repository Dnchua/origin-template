<template>
  <div style="position: relative">
    <el-form
      ref="form"
      :model="formFlowCategory"
      label-width="80px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFormFlowCategory(true)" @reset="onReset">
        <el-form-item label="分类名称" prop="formFilter.name">
          <el-input
            class="filter-item"
            v-model="formFlowCategory.formFilter.name"
            :clearable="true"
            placeholder="流程分类名称"
          />
        </el-form-item>
        <el-form-item label="分类编码" prop="formFilter.code">
          <el-input
            class="filter-item"
            v-model="formFlowCategory.formFilter.code"
            :clearable="true"
            placeholder="分类编码"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      ref="flowCategory"
      :data="flowCategoryWidget.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="flowCategoryWidget.onSortChange"
      @refresh="refreshFormFlowCategory(true)"
      :seq-config="{
        startIndex: (flowCategoryWidget.currentPage - 1) * flowCategoryWidget.pageSize,
      }"
    >
      <template v-slot:operator>
        <el-button
          type="primary"
          :icon="ElIconPlus"
          :size="layoutStore.defaultFormItemSize"
          @click="onAddFlowCategoryClick()"
          >新建</el-button
        >
      </template>
      <vxe-column title="序号" type="seq" width="70px" :index="flowCategoryWidget.getTableIndex" />
      <vxe-column title="流程分类名称" field="name"> </vxe-column>
      <vxe-column title="分类编码" field="code"> </vxe-column>
      <vxe-column title="显示顺序" field="showOrder" sortable> </vxe-column>
      <vxe-column title="创建时间" field="createTime" sortable>
        <template v-slot="scope">
          <span>{{ formatDateByStatsType(scope.row.createTime, 'day') }}</span>
        </template>
      </vxe-column>
      <vxe-column title="操作" fixed="right" width="100px">
        <template v-slot="scope">
          <el-button
            link
            type="primary"
            :size="layoutStore.defaultFormItemSize"
            @click.stop="onEditFlowCategoryClick(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            :size="layoutStore.defaultFormItemSize"
            @click.stop="onDeleteFlowCategoryClick(scope.row)"
          >
            删除
          </el-button>
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="flowCategoryWidget.totalCount"
            :current-page="flowCategoryWidget.currentPage"
            :page-size="flowCategoryWidget.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="flowCategoryWidget.onCurrentPageChange"
            @size-change="flowCategoryWidget.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
  </div>
</template>

<script setup lang="ts">
import { Plus as ElIconPlus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Dialog } from '@/components/Dialog';
import { useTable } from '@/common/hooks/useTable';
import { TableOptions } from '@/common/types/pagination';
import { ANY_OBJECT } from '@/types/generic';
import FlowCategoryController from '@/api/flow/FlowCategoryController';
import { usePermissions } from '@/common/hooks/usePermission';
import { useDate } from '@/common/hooks/useDate';
import { useLayoutStore } from '@/store';
import formEditFlowCategory from './formEditFlowCategory.vue';

const layoutStore = useLayoutStore();
const { formatDateByStatsType } = useDate();

const form = ref();
const formFlowCategory = reactive<ANY_OBJECT>({
  formFilter: {
    name: undefined,
    code: undefined,
  },
  formFilterCopy: {
    name: undefined,
    code: undefined,
  },
  isInit: false,
});

/**
 * FlowCategory数据获取函数，返回Promise
 */
const loadFlowCategoryWidgetData = (params: ANY_OBJECT) => {
  if (params == null) params = {};
  params = {
    ...params,
    flowCategoryDtoFilter: {
      name: formFlowCategory.formFilterCopy.name,
      code: formFlowCategory.formFilterCopy.code,
    },
  };
  return new Promise((resolve, reject) => {
    FlowCategoryController.list(params)
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
 * FlowCategory数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadFlowCategoryVerify = () => {
  formFlowCategory.formFilterCopy.name = formFlowCategory.formFilter.name;
  formFlowCategory.formFilterCopy.code = formFlowCategory.formFilter.code;
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadFlowCategoryWidgetData,
  verifyTableParameter: loadFlowCategoryVerify,
  paged: true,
  orderFieldName: 'showOrder',
  ascending: true,
};

const flowCategoryWidget = reactive(useTable(tableOptions));

/**
 * 更新流程分类管理
 */
const refreshFormFlowCategory = (reloadData = false) => {
  if (reloadData) {
    flowCategoryWidget.refreshTable(true, 1);
  } else {
    flowCategoryWidget.refreshTable();
  }
  if (!formFlowCategory.isInit) {
    // 初始化下拉数据
  }
  formFlowCategory.isInit = true;
};

const refreshData = () => {
  refreshFormFlowCategory();
};
const onReset = () => {
  form.value.resetFields();
  refreshFormFlowCategory(true);
};

/**
 * 新建
 */
const onAddFlowCategoryClick = () => {
  Dialog.show(
    '新建',
    formEditFlowCategory,
    {
      area: '500px',
    },
    {
      //path: 'thirdAddFormFlowCategory',
    },
    {
      width: '500px',
      height: '300px',
      pathName: '/thirdParty/thirdAddFormFlowCategory',
    },
  )
    .then(() => {
      refreshFormFlowCategory();
    })
    .catch(e => {
      console.log(e);
    });
};
/**
 * 编辑
 */
const onEditFlowCategoryClick = (row: ANY_OBJECT) => {
  Dialog.show(
    '编辑',
    formEditFlowCategory,
    {
      area: '500px',
    },
    {
      categoryId: row.categoryId,
      //path: 'thirdAddFormFlowCategory',
    },
    {
      width: '500px',
      height: '280px',
      pathName: '/thirdParty/thirdAddFormFlowCategory',
    },
  )
    .then(() => {
      flowCategoryWidget.refreshTable();
    })
    .catch(e => {
      console.log(e);
    });
};
/**
 * 删除
 */
const onDeleteFlowCategoryClick = (row: ANY_OBJECT) => {
  if (row.categoryId == null) {
    ElMessage.error('请求失败，发现必填参数为空！');
    return;
  }
  let params = {
    categoryId: row.categoryId,
  };

  ElMessageBox.confirm('是否删除此流程分类？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      FlowCategoryController.delete(params)
        .then(() => {
          ElMessage.success('删除成功');
          flowCategoryWidget.refreshTable();
        })
        .catch(e => {
          console.warn(e);
        });
    })
    .catch(e => {
      console.warn(e);
    });
};
const onResume = () => {
  refreshFormFlowCategory();
};
const formInit = () => {
  refreshFormFlowCategory();
};

onMounted(() => {
  // 初始化页面数据
  formInit();
});

defineExpose({
  refreshData,
  onResume,
});
</script>

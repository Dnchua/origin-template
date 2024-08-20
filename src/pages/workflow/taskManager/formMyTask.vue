<template>
  <!-- 待办任务 -->
  <div style="position: relative">
    <el-form
      ref="form"
      :model="formMyTask"
      label-width="80px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshMyTask(true)" @reset="onReset">
        <el-form-item label="流程名称" prop="formFilter.processDefinitionName">
          <el-input
            class="filter-item"
            v-model="formMyTask.formFilter.processDefinitionName"
            :clearable="true"
            placeholder="流程名称"
          />
        </el-form-item>
        <el-form-item label="流程标识" prop="formFilter.processDefinitionKey">
          <el-input
            class="filter-item"
            v-model="formMyTask.formFilter.processDefinitionKey"
            :clearable="true"
            placeholder="流程标识"
          />
        </el-form-item>
        <el-form-item label="任务名称" prop="formFilter.taskName">
          <el-input
            class="filter-item"
            v-model="formMyTask.formFilter.taskName"
            :clearable="true"
            placeholder="任务名称"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      :data="formMyTask.taskWidget.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="formMyTask.taskWidget.onSortChange"
      @refresh="refreshMyTask(true)"
      :seq-config="{
        startIndex: (formMyTask.taskWidget.currentPage - 1) * formMyTask.taskWidget.pageSize,
      }"
      :hasExtend="false"
    >
      <vxe-column
        title="序号"
        type="seq"
        width="70px"
        :index="formMyTask.taskWidget.getTableIndex"
      />
      <vxe-column title="流程名称" field="processDefinitionName" />
      <vxe-column title="当前任务" field="taskName" />
      <vxe-column title="发起人登录名" field="processInstanceInitiator" />
      <vxe-column title="发起人昵称" field="showName" />
      <vxe-column title="任务发起时间" field="processInstanceStartTime" />
      <vxe-column title="操作" width="80px">
        <template v-slot="scope">
          <el-button
            :size="layoutStore.defaultFormItemSize"
            link
            type="primary"
            @click="onSubmit(scope.row)"
            >办理</el-button
          >
        </template>
      </vxe-column>
      <template #pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="formMyTask.taskWidget.totalCount"
            :current-page="formMyTask.taskWidget.currentPage"
            :page-size="formMyTask.taskWidget.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="formMyTask.taskWidget.onCurrentPageChange"
            @size-change="formMyTask.taskWidget.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { FlowOperationController } from '@/api/flow';
import { useTable } from '@/common/hooks/useTable';
import { TableOptions } from '@/common/types/pagination';
import { ANY_OBJECT } from '@/types/generic';
import { SysFlowTaskOperationType } from '@/common/staticDict/flow';

const router = useRouter();
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();
const form = ref();

const loadTaskData = (params: ANY_OBJECT) => {
  if (params == null) params = {};
  params = {
    processDefinitionName: formMyTask.value.formFilterCopy.processDefinitionName,
    processDefinitionKey: formMyTask.value.formFilterCopy.processDefinitionKey,
    taskName: formMyTask.value.formFilterCopy.taskName,
    ...params,
  };
  return new Promise((resolve, reject) => {
    FlowOperationController.listRuntimeTask(params)
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
const loadTaskDataVerify = () => {
  formMyTask.value.formFilterCopy.processDefinitionName =
    formMyTask.value.formFilter.processDefinitionName;
  formMyTask.value.formFilterCopy.processDefinitionKey =
    formMyTask.value.formFilter.processDefinitionKey;
  formMyTask.value.formFilterCopy.taskName = formMyTask.value.formFilter.taskName;
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadTaskData,
  verifyTableParameter: loadTaskDataVerify,
  paged: true,
  orderFieldName: 'entryId',
  ascending: true,
};
const formMyTask = ref({
  formFilter: {
    processDefinitionName: undefined,
    processDefinitionKey: undefined,
    taskName: undefined,
  },
  formFilterCopy: {
    processDefinitionName: undefined,
    processDefinitionKey: undefined,
    taskName: undefined,
  },
  taskWidget: useTable(tableOptions),
  isInit: false,
});

const refreshMyTask = (reloadData = false) => {
  if (reloadData) {
    formMyTask.value.taskWidget.refreshTable(true, 1);
  } else {
    formMyTask.value.taskWidget.refreshTable();
  }
};
const onReset = () => {
  form.value.resetFields();
  refreshMyTask(true);
};
const onResume = () => {
  refreshMyTask();
};
const formInit = () => {
  refreshMyTask();
};

const onSubmit = (row: ANY_OBJECT) => {
  let params = {
    processInstanceId: row.processInstanceId,
    processDefinitionId: row.processDefinitionId,
    taskId: row.taskId,
  };

  FlowOperationController.viewRuntimeTaskInfo(params)
    .then(res => {
      console.log('......', res);
      if (res.data) {
        router.push({
          name: res.data.routerName || 'handlerFlowTask',
          query: {
            isRuntime: 'true',
            isDraft: row.isDraft,
            taskId: row.taskId,
            processDefinitionKey: row.processDefinitionKey,
            processInstanceId: row.processInstanceId,
            processDefinitionId: row.processDefinitionId,
            formId: res.data.formId,
            routerName: res.data.routerName,
            readOnly: res.data.readOnly,
            taskName: row.taskName,
            flowEntryName: row.processDefinitionName,
            processInstanceInitiator: row.showName,
            // 过滤掉加签、减签操作，加签、减签只有在已完成任务里可以操作
            operationList: JSON.stringify(
              (res.data.operationList || []).filter((item: ANY_OBJECT) => {
                return (
                  item.type !== SysFlowTaskOperationType.CO_SIGN &&
                  item.type !== SysFlowTaskOperationType.REVOKE &&
                  item.type !== SysFlowTaskOperationType.SIGN_REDUCTION
                );
              }),
            ),
            variableList: JSON.stringify(res.data.variableList),
          },
        });
      }
    })
    .catch(e => {
      console.warn(e);
    });
};

onMounted(() => {
  // 初始化页面数据
  formInit();
});

defineExpose({ onResume });
</script>

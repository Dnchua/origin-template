<template>
  <!-- 已办任务 -->
  <div style="position: relative">
    <el-form
      ref="form"
      :model="formFilter"
      label-width="80px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFormMyApprovedTask(true)" @reset="onReset">
        <el-form-item label="流程名称" prop="processDefinitionName">
          <el-input
            class="filter-item"
            v-model="formFilter.processDefinitionName"
            :clearable="true"
            placeholder="流程名称"
          />
        </el-form-item>
        <el-form-item label="发起时间" prop="createDate">
          <date-range
            class="filter-item"
            v-model:value="formFilter.createDate"
            :clearable="true"
            :allowTypes="['day']"
            align="left"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      :data="handlerTaskWidget.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="handlerTaskWidget.onSortChange"
      @refresh="refreshFormMyApprovedTask(true)"
      :seq-config="{ startIndex: (handlerTaskWidget.currentPage - 1) * handlerTaskWidget.pageSize }"
      :hasExtend="false"
    >
      <vxe-column title="序号" type="seq" width="70px" :index="handlerTaskWidget.getTableIndex" />
      <vxe-column title="流程名称" field="processDefinitionName" />
      <vxe-column title="流程标识" field="processDefinitionKey" />
      <vxe-column title="任务名称" field="name" />
      <vxe-column title="执行操作">
        <template v-slot="scope">
          <span class="vxe-cell--label">{{
            SysFlowTaskOperationType.getValue(scope.row.approvalType)
          }}</span>
        </template>
      </vxe-column>
      <vxe-column title="发起人登录名" field="startUser" />
      <vxe-column title="发起人昵称" field="showName" />
      <vxe-column title="任务发起时间" field="createTime" />
      <vxe-column title="操作" width="80px">
        <template v-slot="scope">
          <el-button
            :size="layoutStore.defaultFormItemSize"
            link
            type="primary"
            @click="onTaskDetail(scope.row)"
            >详情</el-button
          >
        </template>
      </vxe-column>
      <template #pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="handlerTaskWidget.totalCount"
            :current-page="handlerTaskWidget.currentPage"
            :page-size="handlerTaskWidget.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="handlerTaskWidget.onCurrentPageChange"
            @size-change="handlerTaskWidget.onPageSizeChange"
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

const form = ref();
const router = useRouter();
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

/**
 * 获取已办任务列表
 */
const loadHandlerTaskData = (params: ANY_OBJECT) => {
  if (params == null) params = {};
  params = {
    ...params,
    processDefinitionName: formFilterCopy.processDefinitionName,
    beginDate: formFilterCopy.createDate[0],
    endDate: formFilterCopy.createDate[1],
  };
  return new Promise((resolve, reject) => {
    FlowOperationController.listHistoricTask(params)
      .then(res => {
        resolve({
          dataList: res.data.dataList.map(item => {
            let formInfo = JSON.parse(item.formKey);
            return {
              ...item,
              formInfo,
            };
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
 * 校验已办任务过滤参数
 */
const loadHandlerTaskVerify = () => {
  formFilterCopy.processDefinitionName = formFilter.value.processDefinitionName;
  formFilterCopy.createDate = Array.isArray(formFilter.value.createDate)
    ? [...formFilter.value.createDate]
    : [];
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadHandlerTaskData,
  verifyTableParameter: loadHandlerTaskVerify,
  paged: true,
};
const formFilter = ref<ANY_OBJECT>({
  processDefinitionName: undefined,
  createDate: [],
});
const formFilterCopy: ANY_OBJECT = {
  processDefinitionName: undefined,
  createDate: [],
};
const handlerTaskWidget = reactive(useTable(tableOptions));

/**
 * 刷新已办任务列表
 */
const refreshFormMyApprovedTask = (reloadData = false) => {
  if (reloadData) {
    handlerTaskWidget.refreshTable(true, 1);
  } else {
    handlerTaskWidget.refreshTable();
  }
};
const onReset = () => {
  form.value.resetFields();
  refreshFormMyApprovedTask(true);
};
/**
 * 详情
 */
const onTaskDetail = (row: ANY_OBJECT) => {
  let params = {
    taskId: row.id,
    processDefinitionId: row.processDefinitionId,
    processInstanceId: row.processInstanceId,
  };

  FlowOperationController.viewHistoricTaskInfo(params).then(res => {
    router.push({
      name: res.data.routerName || 'handlerFlowTask',
      query: {
        processDefinitionKey: row.processDefinitionKey,
        taskId: row.id,
        processInstanceId: row.processInstanceId,
        processDefinitionId: row.processDefinitionId,
        formId: (row.formInfo || {}).formId,
        routerName: row.routerName,
        readOnly: 'true',
        flowEntryName: row.processDefinitionName,
        processInstanceInitiator: row.showName,
        // 在已办理任务中仅显示加签、减签和撤销操作
        operationList: JSON.stringify(
          (res.data.operationList || []).filter((item: ANY_OBJECT) => {
            return (
              item.type === SysFlowTaskOperationType.CO_SIGN ||
              item.type === SysFlowTaskOperationType.REVOKE ||
              item.type === SysFlowTaskOperationType.SIGN_REDUCTION
            );
          }),
        ),
      },
    });
  });
};
const onResume = () => {
  refreshFormMyApprovedTask();
};
const formInit = () => {
  refreshFormMyApprovedTask();
};

onMounted(() => {
  formInit();
});

defineExpose({ onResume });
</script>

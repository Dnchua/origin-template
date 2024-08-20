<template>
  <!-- 流程实例 -->
  <div style="position: relative">
    <el-form
      ref="form"
      :model="formFilter"
      label-width="80px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFormAllInstance(true)" @reset="onReset">
        <el-form-item label="流程名称" prop="processDefinitionName">
          <el-input
            class="filter-item"
            v-model="formFilter.processDefinitionName"
            :clearable="true"
            placeholder="流程名称"
          />
        </el-form-item>
        <el-form-item label="发起人" prop="startUser">
          <el-input
            class="filter-item"
            v-model="formFilter.startUser"
            :clearable="true"
            placeholder="发起人"
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
      :data="formAllInstanceWidget.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="formAllInstanceWidget.onSortChange"
      @refresh="refreshFormAllInstance(true)"
      :seq-config="{
        startIndex: (formAllInstanceWidget.currentPage - 1) * formAllInstanceWidget.pageSize,
      }"
      :hasExtend="false"
    >
      <vxe-column
        title="序号"
        type="seq"
        width="70px"
        :index="formAllInstanceWidget.getTableIndex"
      />
      <vxe-column title="流程名称" field="processDefinitionName" />
      <vxe-column title="流程标识" field="processDefinitionKey" />
      <vxe-column title="任务发起人" field="startUserId" />
      <vxe-column title="任务发起时间" field="startTime" />
      <vxe-column title="任务结束时间" field="endTime" />
      <vxe-column title="操作" width="190px">
        <template v-slot="scope">
          <el-button
            :size="layoutStore.defaultFormItemSize"
            type="primary"
            link
            @click="onShowProcessViewer(scope.row)"
            >流程图</el-button
          >
          <el-button
            :size="layoutStore.defaultFormItemSize"
            type="danger"
            link
            :disabled="
              scope.row.endTime != null ||
              !checkPermCodeExist('formAllInstance:formAllInstance:stop')
            "
            @click="onStopTask(scope.row)"
          >
            终止
          </el-button>
          <el-button
            :size="layoutStore.defaultFormItemSize"
            type="danger"
            link
            :disabled="
              scope.row.endTime == null ||
              !checkPermCodeExist('formAllInstance:formAllInstance:delete')
            "
            @click="onDeleteTask(scope.row)"
          >
            删除
          </el-button>
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="formAllInstanceWidget.totalCount"
            :current-page="formAllInstanceWidget.currentPage"
            :page-size="formAllInstanceWidget.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="formAllInstanceWidget.onCurrentPageChange"
            @size-change="formAllInstanceWidget.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { Dialog } from '@/components/Dialog';
import { useTable } from '@/common/hooks/useTable';
import { TableOptions } from '@/common/types/pagination';
import { FlowOperationController } from '@/api/flow';
import { ANY_OBJECT } from '@/types/generic';
import { usePermissions } from '@/common/hooks/usePermission';
import { useLayoutStore } from '@/store';
import FormTaskProcessViewer from './formTaskProcessViewer.vue';
import StopTask from './stopTask.vue';

const layoutStore = useLayoutStore();
const { checkPermCodeExist } = usePermissions();

const form = ref();
const formFilter = reactive({
  processDefinitionName: undefined,
  startUser: undefined,
  createDate: [],
});
const formFilterCopy = reactive({
  processDefinitionName: undefined,
  startUser: undefined,
  createDate: [],
});

/**
 * 获取所有流程实例
 */
const loadAllTaskData = (params: ANY_OBJECT) => {
  if (params == null) params = {};
  params = {
    ...params,
    processDefinitionName: formFilterCopy.processDefinitionName,
    startUser: formFilterCopy.startUser,
    beginDate: formFilterCopy.createDate[0],
    endDate: formFilterCopy.createDate[1],
  };

  return new Promise((resolve, reject) => {
    FlowOperationController.listAllHistoricProcessInstance(params)
      .then(res => {
        res.data.dataList.forEach(item => {
          item.taskId =
            Array.isArray(item.runtimeTaskInfoList) && item.runtimeTaskInfoList.length > 0
              ? item.runtimeTaskInfoList[0].taskId
              : undefined;
        });
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
const loadAllTaskVerify = () => {
  formFilterCopy.processDefinitionName = formFilter.processDefinitionName;
  formFilterCopy.startUser = formFilter.startUser;
  formFilterCopy.createDate = Array.isArray(formFilter.createDate)
    ? [...formFilter.createDate]
    : [];
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadAllTaskData,
  verifyTableParameter: loadAllTaskVerify,
  paged: true,
  orderFieldName: 'showOrder',
  ascending: true,
};
const formAllInstanceWidget = reactive(useTable(tableOptions));

const refreshFormAllInstance = (reloadData = false) => {
  if (reloadData) {
    formAllInstanceWidget.refreshTable(true, 1);
  } else {
    formAllInstanceWidget.refreshTable();
  }
};
const onReset = () => {
  form.value.resetFields();
  refreshFormAllInstance(true);
};
const onShowProcessViewer = (row: ANY_OBJECT) => {
  Dialog.show(
    '流程图',
    FormTaskProcessViewer,
    {
      area: ['1200px', '750px'],
    },
    {
      processDefinitionId: row.processDefinitionId,
      processInstanceId: row.processInstanceId,
    },
    {
      width: '1200px',
      height: '750px',
      pathName: '/thirdParty/thirdFormTaskProcessViewer',
    },
  ).catch(e => {
    console.warn(e);
  });
};
const onStopTask = (row: ANY_OBJECT) => {
  Dialog.show(
    '终止任务',
    StopTask,
    {
      area: '500px',
    },
    {
      processInstanceId: row.processInstanceId,
      taskId: row.taskId,
    },
    {
      width: '500px',
      height: '200px',
      pathName: '/thirdParty/thirdFormStopTaskInstance',
    },
  )
    .then(() => {
      formAllInstanceWidget.refreshTable();
    })
    .catch(e => {
      console.warn(e);
    });
};
const onDeleteTask = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此流程实例？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      return FlowOperationController.deleteProcessInstance({
        processInstanceId: row.processInstanceId,
      });
    })
    .then(() => {
      ElMessage.success('删除成功');
      formAllInstanceWidget.refreshTable();
    })
    .catch(e => {
      console.warn(e);
    });
};
const formInit = () => {
  refreshFormAllInstance();
};
onMounted(() => {
  // 初始化页面数据
  formInit();
});

const refreshData = () => {
  refreshFormAllInstance();
};
const onResume = () => {
  refreshFormAllInstance();
};
defineExpose({
  refreshData,
  onResume,
});
</script>

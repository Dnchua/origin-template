<template>
  <div
    class="online-workflow-order-form"
    :style="{ height: height ? height : '100%' }"
    v-show="isReady"
  >
    <el-form
      class="query-filter-box"
      ref="onlineWorkOrder"
      :model="formFilter"
      label-width="80px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="330" @search="onSearch()" @reset="onReset">
        <el-form-item label="工单状态" prop="flowStatus">
          <el-select
            class="filter-item"
            v-model="formFilter.flowStatus"
            :clearable="true"
            placeholder="工单状态"
          >
            <el-option
              v-for="item in SysFlowWorkOrderStatus.getList()"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建日期" prop="createTime">
          <date-range
            class="filter-item"
            v-model:value="formFilter.createTime"
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
        <el-form-item label="工单编号" prop="workOrderCode">
          <el-input
            class="filter-item"
            v-model="formFilter.workOrderCode"
            :clearable="true"
            placeholder="工单编号"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <el-row
      type="flex"
      justify="space-between"
      style="padding: 16px 24px 0; background-color: white"
    >
      <el-button
        type="primary"
        :icon="Plus"
        :size="layoutStore.defaultFormItemSize"
        :disabled="processDefinitionKey == null"
        @click="onStartFlow()"
      >
        新建
      </el-button>
    </el-row>
    <div class="online-query-form">
      <div
        class="query-table-box custom-widget-item widget-item"
        :class="{ active: isEdit && currentWidget === queryTable }"
        :style="{
          padding: isEdit && currentWidget === queryTable ? '2px' : '0px',
        }"
        @click.stop="onTableClick"
      >
        <OnlineCustomWorkFlowTable
          v-if="isReady"
          :dataList="queryTableWidget.dataList"
          :isEdit="isEdit"
          :widget="queryTable"
          :getTableIndex="queryTableWidget.getTableIndex"
          :sortChange="queryTableWidget.onSortChange"
          @viewWorkOrder="onView"
          @handlerWorkOrder="onSubmit"
          @cancelWorkOrder="onCancelWorkOrder"
          @handlerRemind="onRemindClick"
        />
      </div>
      <el-row
        type="flex"
        justify="end"
        style="margin-top: 16px"
        v-if="queryTable && queryTable.props.paged"
      >
        <el-pagination
          :total="queryTableWidget.totalCount"
          :current-page="queryTableWidget.currentPage"
          :page-size="queryTableWidget.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          @current-change="queryTableWidget.onCurrentPageChange"
          @size-change="queryTableWidget.onPageSizeChange"
        />
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import OnlineCustomWorkFlowTable from '@/online/components/OnlineCustomWorkFlowTable.vue';
import { useTable } from '@/common/hooks/useTable';
import { TableOptions } from '@/common/types/pagination';
import { ANY_OBJECT } from '@/types/generic';
import { OnlineFormEventType } from '@/common/staticDict';
import {
  SysFlowTaskOperationType,
  SysFlowTaskType,
  SysFlowWorkOrderStatus,
} from '@/common/staticDict/flow';
import { FlowEntryController, FlowOperationController } from '@/api/flow';
import widgetData from '@/online/config/index';
import { useLayoutStore } from '@/store';
import { useForm } from '../hooks/useForm';
import { useFormExpose } from '../hooks/useFormExpose';

const emit = defineEmits<{
  tableClick: [ANY_OBJECT];
}>();

const router = useRouter();
console.log('router router router', router);

const props = withDefaults(
  defineProps<{
    entryId?: string;
    formConfig: ANY_OBJECT;
    height?: string;
    // 主表数据
    masterTableData?: ANY_OBJECT;
    // 是否表单编辑模式
    isEdit?: boolean;
    // 当前选中组件
    currentWidget?: ANY_OBJECT | null;
    mode?: string;
  }>(),
  {
    isEdit: false,
  },
);

const layoutStore = useLayoutStore();

const {
  isReady,
  dialogParams,
  form,
  formData,
  checkOperationPermCode,
  checkOperationDisabled,
  checkOperationVisible,
  initPage,
  initFormWidgetList,
} = useForm(props);

provide('form', () => {
  console.log('provide form7', props, form);
  return {
    ...form.value,
    mode: props.mode || 'pc',
    isEdit: dialogParams.value.isEdit,
    checkOperationPermCode: checkOperationPermCode,
    checkOperationDisabled: checkOperationDisabled,
    checkOperationVisible: checkOperationVisible,
    isActive: (widget: ANY_OBJECT) => {
      return props.currentWidget === widget;
    },
    getWidgetObject: widgetData.getWidgetObject,
    instanceData: () => useFormExpose(formData),
  };
});

const processDefinitionKey = ref<string>();
const processDefinitionName = ref<string>();
const formFilter = reactive<ANY_OBJECT>({
  createTime: [],
  workOrderCode: undefined,
  flowStatus: undefined,
});
const queryTable = computed(() => {
  return form.value.tableWidget;
});

const loadTableData = (params: ANY_OBJECT) => {
  return new Promise((resolve, reject) => {
    params = {
      ...params,
      flowWorkOrderDtoFilter: {
        flowStatus: formFilter.flowStatus,
        workOrderCode: formFilter.workOrderCode,
        createTimeStart: Array.isArray(formFilter.createTime)
          ? formFilter.createTime[0]
          : undefined,
        createTimeEnd: Array.isArray(formFilter.createTime) ? formFilter.createTime[1] : undefined,
      },
    };
    if (params == null) {
      reject();
      return;
    }
    FlowOperationController.listWorkOrder(params, {
      processDefinitionKey: processDefinitionKey.value,
    })
      .then(res => {
        res.data.dataList = res.data.dataList.map(item => {
          let initTaskInfo = item.initTaskInfo == null ? {} : JSON.parse(item.initTaskInfo);
          let runtimeTaskInfo =
            Array.isArray(item.runtimeTaskInfoList) && item.runtimeTaskInfoList.length > 0
              ? item.runtimeTaskInfoList[0]
              : {};
          return {
            ...item,
            flowStatusShowName: SysFlowWorkOrderStatus.getValue(item.flowStatus),
            initTaskInfo,
            runtimeTaskInfo,
          };
        });
        resolve({
          dataList: res.data.dataList,
          totalCount: res.data.totalCount,
        });
      })
      .catch((e: Error) => {
        reject(e);
      });
  });
};
const loadTableDataVerify = () => {
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadTableData,
  verifyTableParameter: loadTableDataVerify,
  paged: props.formConfig.tableWidget.props.paged,
};
const queryTableWidget = reactive(useTable(tableOptions));

const onTableClick = () => {
  emit('tableClick', queryTable.value);
};
const onStartFlow = () => {
  if (props.isEdit || processDefinitionKey.value == null) return;
  let params = {
    processDefinitionKey: processDefinitionKey.value,
  };
  FlowOperationController.viewInitialTaskInfo(params)
    .then(res => {
      if (res.data && res.data.taskType === SysFlowTaskType.USER_TASK && res.data.assignedMe) {
        router.push({
          name: res.data.routerName || 'handlerFlowTask',
          query: {
            processDefinitionKey: processDefinitionKey.value,
            formId: res.data.formId,
            routerName: res.data.routerName,
            readOnly: res.data.readOnly,
            taskName: '启动流程',
            isDraft: 'true',
            flowEntryName: processDefinitionName.value,
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
      } else {
        FlowOperationController.startOnly({
          processDefinitionKey: processDefinitionKey.value,
        })
          .then(() => {
            ElMessage.success('启动成功！');
          })
          .catch((e: Error) => {
            console.warn(e);
          });
      }
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};
const onSubmit = (row: ANY_OBJECT) => {
  if (props.isEdit || processDefinitionKey.value == null) return;
  let taskId =
    Array.isArray(row.runtimeTaskInfoList) && row.runtimeTaskInfoList.length > 0
      ? row.runtimeTaskInfoList[0].taskId
      : undefined;
  let params = {
    processInstanceId: row.processInstanceId,
    processDefinitionId: row.processDefinitionId,
    taskId: taskId,
  };

  FlowOperationController.viewRuntimeTaskInfo(params)
    .then(res => {
      if (res.data) {
        router.push({
          name: res.data.routerName || 'handlerFlowTask',
          query: {
            isRuntime: 'true',
            isDraft: row.flowStatus === SysFlowWorkOrderStatus.DRAFT ? 'true' : 'false',
            taskId: taskId,
            processDefinitionKey: row.processDefinitionKey,
            processInstanceId: row.processInstanceId,
            processDefinitionId: row.processDefinitionId,
            formId: res.data.formId,
            routerName: res.data.routerName,
            readOnly: res.data.readOnly,
            taskName: (row.runtimeInitialTask || {}).taskName,
            flowEntryName: row.processDefinitionName,
            processInstanceInitiator: row.processInstanceInitiator,
            operationList: JSON.stringify(
              (res.data.operationList || []).filter(
                (item: ANY_OBJECT) => item.type !== SysFlowTaskOperationType.CO_SIGN,
              ),
            ),
            variableList: JSON.stringify(res.data.variableList),
          },
        });
      }
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};
const onView = (row: ANY_OBJECT) => {
  if (props.isEdit || processDefinitionKey.value == null) return;
  let params = {
    processInstanceId: row.processInstanceId,
  };

  FlowOperationController.viewInitialHistoricTaskInfo(params)
    .then(res => {
      if (res.data) {
        router.push({
          name: res.data.routerName || 'handlerFlowTask',
          query: {
            isRuntime: 'false',
            processDefinitionKey: row.processDefinitionKey,
            processInstanceId: row.processInstanceId,
            processDefinitionId: row.processDefinitionId,
            formId: res.data.formId,
            routerName: res.data.routerName,
            readOnly: 'true',
            taskId: row.runtimeTaskInfo.taskId,
            flowEntryName: row.processDefinitionName,
            processInstanceInitiator: row.processInstanceInitiator,
          },
        });
      }
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};
const onRemindClick = (row: ANY_OBJECT) => {
  FlowOperationController.remindRuntimeTask({
    workOrderId: row.workOrderId,
  })
    .then(() => {
      ElMessage.success('催办成功');
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};
const onCancelWorkOrder = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否撤销此工单？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {
        workOrderId: row.workOrderId,
        cancelReason: '主动撤销',
      };

      FlowOperationController.cancelWorkOrder(params)
        .then(() => {
          ElMessage.success('撤销成功！');
          onSearch();
        })
        .catch((e: Error) => {
          console.warn(e);
        });
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};
const refreshTable = (reloadData = false) => {
  if (props.isEdit) return;
  if (reloadData) {
    queryTableWidget.refreshTable(true, 1);
  } else {
    queryTableWidget.refreshTable();
  }
};
const onReset = () => {
  formFilter.createTime = [];
  formFilter.workOrderCode = undefined;
  formFilter.flowStatus = undefined;
  refreshTable(true);
};
const onSearch = () => {
  refreshTable(true);
};

onMounted(() => {
  isReady.value = false;
  if (!props.isEdit) {
    if (props.entryId) {
      FlowEntryController.viewDict({
        entryId: props.entryId,
      })
        .then(res => {
          processDefinitionKey.value = res.data.processDefinitionKey;
          processDefinitionName.value = res.data.processDefinitionName;
          refreshTable(true);
        })
        .catch((e: Error) => {
          console.warn(e);
        });
    }
  }
  isReady.value = true;
});
</script>

<style scoped>
.online-workflow-order-form {
  display: flex;
  flex-direction: column;
}
.online-workflow-order-form .query-filter-box {
  flex-grow: 0;
  flex-shrink: 0;
}
.online-query-form {
  display: flex;
  padding: 16px 24px;
  background-color: white;
  flex-direction: column;
  flex: 1;
}
.online-workflow-order-form .query-table-box {
  flex-shrink: 1;
  height: 200px;
  flex-grow: 1;
}
</style>

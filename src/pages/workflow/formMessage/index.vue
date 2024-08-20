<template>
  <div class="tab-dialog-box" style="position: relative">
    <el-tabs v-model="activeFragmentId">
      <el-tab-pane label="催办消息" name="remindingMessage" style="width: 100%">
        <div class="tab-content-box" :style="'min-height:' + (mainContextHeight - 76) + 'px'">
          <table-box
            class="page-table"
            ref="flowCategory"
            :data="remindingMessageWidget.dataList"
            :size="layoutStore.defaultFormItemSize"
            @sort-change="remindingMessageWidget.onSortChange"
            @refresh="refreshRemindingMessage(true)"
            :seq-config="{
              startIndex:
                (remindingMessageWidget.currentPage - 1) * remindingMessageWidget.pageSize,
            }"
          >
            <vxe-column
              title="序号"
              type="seq"
              width="70px"
              :index="remindingMessageWidget.getTableIndex"
            />
            <vxe-column title="流程名称" field="processDefinitionName" />
            <vxe-column title="任务名称" field="taskName" />
            <vxe-column title="催办人" field="createUsername" />
            <vxe-column title="任务创建时间" field="taskStartTime" />
            <vxe-column title="催办时间" field="createTime" />
            <vxe-column title="操作" width="100px">
              <template v-slot="scope">
                <el-button
                  link
                  type="primary"
                  :size="layoutStore.defaultFormItemSize"
                  @click="onSubmit(scope.row)"
                  >办理</el-button
                >
              </template>
            </vxe-column>
            <template #pagination>
              <el-row justify="end" style="margin-top: 16px">
                <el-pagination
                  :total="remindingMessageWidget.totalCount"
                  :current-page="remindingMessageWidget.currentPage"
                  :page-size="remindingMessageWidget.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, prev, pager, next, sizes"
                  @current-change="remindingMessageWidget.onCurrentPageChange"
                  @size-change="remindingMessageWidget.onPageSizeChange"
                >
                </el-pagination>
              </el-row>
            </template>
          </table-box>
        </div>
      </el-tab-pane>
      <el-tab-pane label="抄送消息" name="copyMessage" style="width: 100%">
        <div class="tab-content-box" :style="'min-height:' + (mainContextHeight - 76) + 'px'">
          <table-box
            class="page-table"
            ref="flowCategory"
            :data="copyMessageWidget.dataList"
            :size="layoutStore.defaultFormItemSize"
            @sort-change="copyMessageWidget.onSortChange"
            @refresh="refreshCopyMessage(true)"
            :seq-config="{
              startIndex: (copyMessageWidget.currentPage - 1) * copyMessageWidget.pageSize,
            }"
          >
            <template #operator>
              <el-radio-group
                :size="layoutStore.defaultFormItemSize"
                v-model="messageStatus"
                @change="refreshCopyMessage(true)"
              >
                <el-radio-button :value="1">已读消息</el-radio-button>
                <el-radio-button :value="0">未读消息</el-radio-button>
              </el-radio-group>
            </template>
            <vxe-column
              title="序号"
              type="seq"
              width="70px"
              :index="copyMessageWidget.getTableIndex"
            />
            <vxe-column title="流程名称" field="processDefinitionName" />
            <vxe-column title="任务名称" field="taskName" />
            <vxe-column title="抄送人" field="createUsername" />
            <vxe-column title="任务创建时间" field="taskStartTime" />
            <vxe-column title="抄送时间" field="createTime" />
            <vxe-column title="操作" width="100px">
              <template v-slot="scope">
                <el-button
                  link
                  type="primary"
                  :size="layoutStore.defaultFormItemSize"
                  @click="onSubmit(scope.row, scope.row.messageId)"
                  >详情</el-button
                >
              </template>
            </vxe-column>
            <template #pagination>
              <el-row justify="end" style="margin-top: 16px">
                <el-pagination
                  :total="copyMessageWidget.totalCount"
                  :current-page="copyMessageWidget.currentPage"
                  :page-size="copyMessageWidget.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, prev, pager, next, sizes"
                  @current-change="copyMessageWidget.onCurrentPageChange"
                  @size-change="copyMessageWidget.onPageSizeChange"
                >
                </el-pagination>
              </el-row>
            </template>
          </table-box>
        </div>
      </el-tab-pane>
    </el-tabs>
    <label class="page-close-box" @click="onClose()">
      <img src="@/assets/img/back2.png" alt="" />
    </label>
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

const props = withDefaults(defineProps<{ type?: string }>(), {
  type: 'remindingMessage',
});

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();
const mainContextHeight = inject('mainContextHeight', 200);

const activeFragmentId = ref('remindingMessage');
const messageStatus = ref(1);

const loadRemindingMessageData = (params: ANY_OBJECT) => {
  if (params == null) params = {};
  return new Promise((resolve, reject) => {
    FlowOperationController.listRemindingTask(params)
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
const loadRemindingMessageVerify = () => {
  return true;
};
const tableRemindingMessageOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadRemindingMessageData,
  verifyTableParameter: loadRemindingMessageVerify,
  paged: true,
  orderFieldName: 'createTime',
  ascending: true,
};
const remindingMessageWidget = ref(useTable(tableRemindingMessageOptions));

const loadCopyMessageData = (params: ANY_OBJECT) => {
  if (params == null) params = {};
  params.read = messageStatus.value === 1;
  return new Promise((resolve, reject) => {
    FlowOperationController.listCopyMessage(params)
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
const loadCopyMessageVerify = () => {
  return true;
};
const tableCopyMessageOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadCopyMessageData,
  verifyTableParameter: loadCopyMessageVerify,
  paged: true,
  orderFieldName: 'createTime',
  ascending: true,
};
const copyMessageWidget = ref(useTable(tableCopyMessageOptions));

const onClose = () => {
  router.go(-1);
};
const refreshRemindingMessage = (reloadData = false) => {
  if (reloadData) {
    remindingMessageWidget.value.refreshTable(true, 1);
  } else {
    remindingMessageWidget.value.refreshTable();
  }
};
const refreshCopyMessage = (reloadData = false) => {
  if (reloadData) {
    copyMessageWidget.value.refreshTable(true, 1);
  } else {
    copyMessageWidget.value.refreshTable();
  }
};
const refreshFormMessage = (reloadData = false) => {
  if (reloadData) {
    remindingMessageWidget.value.refreshTable(true, 1);
    copyMessageWidget.value.refreshTable(true, 1);
  } else {
    remindingMessageWidget.value.refreshTable();
    copyMessageWidget.value.refreshTable();
  }
};
const onSubmit = (row: ANY_OBJECT, messageId: string | null = null) => {
  // 是否抄送消息
  let isCopy = messageId != null;
  let params = {
    processInstanceId: row.processInstanceId,
    processDefinitionId: row.processDefinitionId,
    taskId: row.taskId,
  };
  let httpCall = isCopy
    ? FlowOperationController.viewInitialHistoricTaskInfo(params)
    : FlowOperationController.viewRuntimeTaskInfo(params);
  httpCall
    .then(res => {
      if (res.data) {
        router.push({
          name: res.data.routerName || 'handlerFlowTask',
          query: {
            isRuntime: !isCopy + '',
            taskId: row.taskId,
            messageId: messageId,
            processDefinitionKey: row.processDefinitionKey,
            processInstanceId: row.processInstanceId,
            processDefinitionId: row.processDefinitionId,
            formId: res.data.formId,
            routerName: res.data.routerName,
            readOnly: (isCopy ? true : res.data.readOnly) + '',
            taskName: row.taskName,
            flowEntryName: row.processDefinitionName,
            processInstanceInitiator: row.processInstanceInitiator,
            // 过滤掉加签和撤销操作，加签只有在已完成任务里可以操作
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
// const onResume = () => {
//   refreshFormMessage();
// };
const formInit = () => {
  refreshFormMessage();
};

onMounted(() => {
  // 初始化页面数据
  formInit();
});

watch(
  () => props.type,
  val => {
    activeFragmentId.value = val;
    messageStatus.value = 0;
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss" scoped>
.tab-dialog-box {
  padding: 0 !important;
  margin: 0 !important;
  background-color: #f6f6f6 !important;
  :deep(.el-tabs__header) {
    margin-bottom: 0;
    background-color: white;
    border-top: 1px solid #e8e8e8;
  }
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  :deep(.el-tabs__item) {
    height: 44px;
    line-height: 44px;
  }
  :deep(.el-tabs__nav-wrap) {
    padding-left: 24px;
  }
  :deep(.el-tabs__content) {
    overflow: hidden;
  }

  .tab-content-box {
    display: flex;
    margin: 16px;
    flex-direction: column;
    flex: 1;
  }
  .page-back-box {
    position: absolute;
    top: 0;
    right: 16px;
    display: flex;
    align-items: center;
    height: 44px;
    :deep(.el-button span) {
      display: flex;
      align-items: center;
      img {
        margin-right: 4px;
      }
    }
  }
}
</style>

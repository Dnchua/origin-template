<template>
  <div class="flow-task" style="position: relative; padding: 16px 24px; background-color: white">
    <div class="task-title">
      <div>
        <span class="text">{{ flowInfo.flowEntryName }}</span>
        <el-tag v-if="flowInfo.taskName" effect="dark" :size="size" type="success">{{
          '当前节点：' + flowInfo.taskName
        }}</el-tag>
        <el-tag v-if="flowInfo.processInstanceInitiator" effect="dark" :size="size" type="info">{{
          '发起人：' + flowInfo.processInstanceInitiator
        }}</el-tag>
      </div>
    </div>
    <el-row justify="space-between" style="margin-bottom: 24px; flex-wrap: nowrap">
      <el-radio-group size="default" v-model="currentPage" style="min-width: 400px">
        <el-radio-button value="formInfo">表单信息</el-radio-button>
        <el-radio-button
          v-if="
            processInstanceId == null ||
            isRuntime ||
            isRuntime === 'true' ||
            isDraft ||
            isDraft === 'true'
          "
          label="copyInfo"
          >抄送设置</el-radio-button
        >
        <el-radio-button v-if="processInstanceId != null && !isDraft" value="flowProcess"
          >流程图</el-radio-button
        >
        <el-radio-button v-if="processInstanceId != null && !isDraft" value="approveInfo"
          >审批记录</el-radio-button
        >
        <el-radio-button v-if="taskId != null && !isDraft" value="assigneeList"
          >审批人</el-radio-button
        >
      </el-radio-group>
      <el-row class="task-operation" justify="end" style="flex-wrap: nowrap">
        <el-button v-if="canDraft" size="default" type="success" :plain="true" @click="handlerDraft"
          >保存草稿</el-button
        >
        <template v-if="$slots.operations">
          <slot name="operations" />
        </template>
        <template v-else>
          <el-button
            v-for="(operation, index) in flowOperationList"
            :key="index"
            size="default"
            :type="getButtonType(operation.type) || 'primary'"
            :plain="operation.plain || false"
            @click="handlerOperation(operation)"
          >
            {{ operation.label }}
          </el-button>
        </template>
      </el-row>
    </el-row>
    <el-scrollbar class="custom-scroll" :style="{ height: mainContextHeight - 180 + 'px' }">
      <el-form
        ref="form"
        class="full-width-input"
        style="width: 100%"
        label-width="100px"
        :size="size"
        label-position="right"
        @submit.prevent
      >
        <!-- 表单信息 -->
        <el-row v-show="currentPage === 'formInfo'" type="flex" :key="formKey">
          <slot />
        </el-row>
        <!-- 审批记录 -->
        <el-row v-show="currentPage === 'approveInfo'" :gutter="20">
          <el-col :span="24">
            <vxe-table
              :data="flowTaskCommentList"
              :size="layoutStore.defaultFormItemSize"
              header-cell-class-name="table-header-gray"
              :height="mainContextHeight - 150 + 'px'"
              :row-config="{ isHover: true }"
            >
              <vxe-column title="序号" type="seq" width="100" />
              <vxe-column title="流程环节" field="taskName" />
              <vxe-column title="执行人" field="createUsername" />
              <vxe-column title="操作" width="150px">
                <template v-slot="scope">
                  <el-tag
                    :size="layoutStore.defaultFormItemSize"
                    :type="getOperationTagType(scope.row.approvalType)"
                    effect="dark"
                    >{{ SysFlowTaskOperationType.getValue(scope.row.approvalType) }}</el-tag
                  >
                  <el-tag
                    v-if="scope.row.delegateAssignee != null"
                    :size="layoutStore.defaultFormItemSize"
                    type="success"
                    effect="plain"
                    style="margin-left: 10px"
                    >{{ scope.row.delegateAssignee }}</el-tag
                  >
                </template>
              </vxe-column>
              <vxe-column title="审批意见">
                <template v-slot="scope">
                  <span>{{ scope.row.taskComment ? scope.row.taskComment : '' }}</span>
                </template>
              </vxe-column>
              <vxe-column title="处理时间" field="createTime" />
              <template v-slot:empty>
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png" />
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
          </el-col>
        </el-row>
        <!-- 流程图 -->
        <el-row v-if="currentPage === 'flowProcess'">
          <ProcessViewer
            :style="{ height: mainContextHeight - 148 + 'px' }"
            :xml="processXml"
            :finishedInfo="finishedInfo"
            :allCommentList="flowTaskCommentList"
          />
        </el-row>
        <!-- 抄送设置 -->
        <el-row v-show="currentPage === 'copyInfo'">
          <el-col :span="24" style="border-top: 1px solid #ebeef5">
            <CopyForSelect v-model:value="copyItemList" />
          </el-col>
        </el-row>
        <!-- 审批人列表 -->
        <el-row v-show="currentPage === 'assigneeList'" :gutter="20">
          <el-col :span="24">
            <vxe-table
              :data="assigneeList"
              :size="layoutStore.defaultFormItemSize"
              header-cell-class-name="table-header-gray"
              :height="mainContextHeight - 150 + 'px'"
              :row-config="{ isHover: true }"
            >
              <vxe-column title="序号" type="seq" width="100" />
              <vxe-column title="审批人" field="loginName" />
              <vxe-column title="昵称" field="showName" />
              <vxe-column title="处理时间" field="lastApprovalTime" />
              <template v-slot:empty>
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png" />
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
          </el-col>
        </el-row>
      </el-form>
    </el-scrollbar>
    <page-close-button @close="onClose" />
  </div>
</template>

<script setup lang="ts">
import { VxeTable, VxeColumn, SizeType } from 'vxe-table';
import { EpPropMergeType } from 'element-plus/es/utils/vue/props/types';
import PageCloseButton from '@/components/PageCloseButton/index.vue';
import CopyForSelect from '@/pages/workflow/components/CopyForSelect/index.vue';
import ProcessViewer from '@/pages/workflow/components/ProcessViewer.vue';
import { FlowOperationController } from '@/api/flow';
import { ANY_OBJECT } from '@/types/generic';
import { SysFlowTaskOperationType } from '@/common/staticDict/flow';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const emit = defineEmits<{
  start: [ANY_OBJECT, ANY_OBJECT[], string | undefined];
  submit: [ANY_OBJECT, ANY_OBJECT[], string | undefined];
  close: [];
  draft: [];
}>();

const props = withDefaults(
  defineProps<{
    // 流程实例id
    processInstanceId?: string;
    // 流程定义id
    processDefinitionId?: string;
    isRuntime?: boolean | string;
    isDraft?: boolean | string;
    // 流程名称
    flowEntryName: string;
    // 发起人
    processInstanceInitiator?: string;
    // 当前任务ID
    taskId?: string;
    // 当前任务节点名称
    taskName?: string;
    // 当前任务节点操作列表
    operationList?: Array<ANY_OBJECT> | string;
  }>(),
  {
    isDraft: false,
  },
);

const mainContextHeight = inject('mainContextHeight', 200);

const formKey = new Date().getTime();
const currentPage = ref('formInfo');
const processXml = ref<string>();
const finishedInfo = ref<ANY_OBJECT>();
const flowInfo = reactive({
  taskName: props.taskName,
  flowEntryName: props.flowEntryName,
  processInstanceInitiator: props.processInstanceInitiator,
});
const flowTaskCommentList = ref<ANY_OBJECT[]>([]);
const copyItemList = ref<ANY_OBJECT[]>([]);
const assigneeList = ref<ANY_OBJECT[]>([]);

const flowOperationList = computed<ANY_OBJECT[]>(() => {
  const operationList = Array.isArray(props.operationList)
    ? props.operationList
    : JSON.parse(props.operationList || '[]');
  if (Array.isArray(operationList)) {
    return operationList.map(item => {
      if (item.type === SysFlowTaskOperationType.MULTI_SIGN && item.multiSignAssignee != null) {
        let multiSignAssignee = {
          ...item.multiSignAssignee,
        };
        multiSignAssignee.assigneeList = item.multiSignAssignee.assigneeList
          ? multiSignAssignee.assigneeList.split(',')
          : undefined;
        return {
          ...item,
          multiSignAssignee,
        };
      } else {
        return {
          ...item,
        };
      }
    });
  } else {
    return [];
  }
});
const canDraft = computed(() => {
  // 启动或者草稿状态
  return props.processInstanceId == null || props.isDraft || props.isDraft === 'true';
});

const getButtonType = (type: string) => {
  switch (type) {
    case SysFlowTaskOperationType.AGREE:
    case SysFlowTaskOperationType.TRANSFER:
    case SysFlowTaskOperationType.CO_SIGN:
    case SysFlowTaskOperationType.SIGN_REDUCTION:
    case SysFlowTaskOperationType.MULTI_AGREE:
    case SysFlowTaskOperationType.MULTI_SIGN:
    case SysFlowTaskOperationType.SET_ASSIGNEE:
      return 'primary';
    case SysFlowTaskOperationType.SAVE:
      return 'success';
    case SysFlowTaskOperationType.REFUSE:
    case SysFlowTaskOperationType.PARALLEL_REFUSE:
    case SysFlowTaskOperationType.MULTI_REFUSE:
      return 'default';
    case SysFlowTaskOperationType.REJECT:
    case SysFlowTaskOperationType.REJECT_TO_START:
    case SysFlowTaskOperationType.REJECT_TO_TASK:
    case SysFlowTaskOperationType.REVOKE:
      return 'danger';
    default:
      return 'default';
  }
};
const getOperationTagType = (type: string) => {
  switch (type) {
    case SysFlowTaskOperationType.AGREE:
    case SysFlowTaskOperationType.MULTI_AGREE:
    case SysFlowTaskOperationType.SET_ASSIGNEE:
      return 'success';
    case SysFlowTaskOperationType.REFUSE:
    case SysFlowTaskOperationType.PARALLEL_REFUSE:
    case SysFlowTaskOperationType.MULTI_REFUSE:
      return 'warning';
    case SysFlowTaskOperationType.STOP:
    case SysFlowTaskOperationType.REJECT:
    case SysFlowTaskOperationType.REJECT_TO_START:
    case SysFlowTaskOperationType.REJECT_TO_TASK:
    case SysFlowTaskOperationType.REVOKE:
      return 'danger';
    default:
      return '';
  }
};
// 保存草稿
const handlerDraft = () => {
  emit('draft');
};
const onClose = () => {
  emit('close');
};
const handlerOperation = (operation: ANY_OBJECT) => {
  if (props.processInstanceId == null && props.taskId == null) {
    emit('start', operation, copyItemList.value, processXml.value);
  } else {
    emit('submit', operation, copyItemList.value, processXml.value);
  }
};
const getTaskHighlightData = () => {
  if (props.processInstanceId == null || props.processInstanceId === '') {
    return;
  }
  let params = {
    processInstanceId: props.processInstanceId,
  };

  FlowOperationController.viewHighlightFlowData(params)
    .then(res => {
      // 已完成节点
      finishedInfo.value = res.data;
    })
    .catch(e => {
      console.warn(e);
    });
};
const getTaskProcessXml = () => {
  if (props.processDefinitionId == null || props.processDefinitionId === '') {
    return;
  }
  let params = {
    processDefinitionId: props.processDefinitionId,
  };
  FlowOperationController.viewProcessBpmn(params)
    .then(res => {
      // 当前流程实例xml
      processXml.value = res.data;
    })
    .catch(e => {
      console.warn(e);
    });
};
const loadProcessCommentList = () => {
  flowTaskCommentList.value = [];
  if (props.processInstanceId == null || props.processInstanceId === '') {
    return;
  }
  FlowOperationController.listFlowTaskComment({
    processInstanceId: props.processInstanceId,
  })
    .then(res => {
      console.log('listFlowTaskComment', res);
      if (res.data) {
        flowTaskCommentList.value = res.data.map(item => {
          return { ...item };
        });
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
const loadAssigneeList = () => {
  if (props.taskId == null) return;
  let params = {
    processDefinitionId: props.processDefinitionId,
    processInstanceId: props.processInstanceId,
    taskId: props.taskId,
    historic: !(props.isRuntime || props.isRuntime === 'true'),
  };

  FlowOperationController.viewTaskUserInfo(params)
    .then(res => {
      assigneeList.value = (res.data || []).map(item => {
        return { ...item };
      });
    })
    .catch(e => {
      console.warn(e);
    });
};

onMounted(() => {
  getTaskHighlightData();
  getTaskProcessXml();
  loadProcessCommentList();
  loadAssigneeList();
});
</script>

<style lang="scss" scoped>
.task-title {
  display: flex;
  justify-content: space-between;
  padding-bottom: 6px;
  margin-bottom: 16px;
  border-bottom: 2px solid #e8e8e8;
}
.task-title .text {
  height: 28px;
  line-height: 28px;
  font-weight: 600;
  font-size: 16px;
  color: #383838;
}
.task-title .el-tag {
  margin-left: 10px;
}
.third-party .flow-task {
  overflow: hidden;
}
.page-back-box {
  position: absolute;
  top: 12px;
  right: 24px;
  :deep(.el-button span) {
    display: flex;
    align-items: center;
    img {
      margin-right: 4px;
    }
  }
}
.el-tag {
  border: 0;
  &.el-tag--dark {
    color: #408ef1;
    background-color: rgb(64 142 241 / 10%);
  }
  &.el-tag--success {
    color: #00ae1c;
    background-color: #f0f9ec;
  }
  &.el-tag--danger {
    color: #ef502f;
    background-color: rgb(239 80 47 / 10%);
  }
  &.el-tag--warning {
    color: #ffb800;
    background-color: rgb(255 184 0 / 10%);
  }
}
</style>

<style lang="scss">
@import url('../package/theme/index.scss');
.djs-palette {
  background: var(--palette-background-color);
  border: solid 1px var(--palette-border-color) !important;
  border-radius: 2px;
}

.my-process-designer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  .my-process-designer__header {
    width: 100%;
    min-height: 36px;
    .el-button {
      text-align: center;
    }
    .el-button-group {
      margin: 4px;
    }
    .el-tooltip__popper {
      .el-button {
        width: 100%;
        text-align: left;
        padding-left: 8px;
        padding-right: 8px;
      }
      .el-button:hover {
        background: rgba(64, 158, 255, 0.8);
        color: #ffffff;
      }
    }
    .align {
      position: relative;
      i {
        &:after {
          content: '|';
          position: absolute;
          left: 15px;
          transform: rotate(90deg) translate(200%, 60%);
        }
      }
    }
    .align.align-left i {
      transform: rotate(90deg);
    }
    .align.align-right i {
      transform: rotate(-90deg);
    }
    .align.align-top i {
      transform: rotate(180deg);
    }
    .align.align-bottom i {
      transform: rotate(0deg);
    }
    .align.align-center i {
      transform: rotate(90deg);
      &:after {
        transform: rotate(90deg) translate(0, 60%);
      }
    }
    .align.align-middle i {
      transform: rotate(0deg);
      &:after {
        transform: rotate(90deg) translate(0, 60%);
      }
    }
  }
  .my-process-designer__container {
    display: inline-flex;
    width: 100%;
    flex: 1;
    background-color: #f6f7f9;
    .my-process-designer__canvas {
      flex: 1;
      height: 100%;
      position: relative;
      background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTQwIDBIMHY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')
        repeat !important;
      div.toggle-mode {
        display: none;
      }
    }
    .my-process-designer__property-panel {
      height: 100%;
      overflow: scroll;
      overflow-y: auto;
      z-index: 10;
      * {
        box-sizing: border-box;
      }
    }
    svg {
      width: 100%;
      height: 100%;
      min-height: 100%;
      overflow: hidden;
    }
  }
}

.djs-palette.open {
  .djs-palette-entries {
    div[class^='bpmn-icon-']:before,
    div[class*='bpmn-icon-']:before {
      line-height: unset;
    }
    div.entry {
      position: relative;
    }
    div.entry:hover {
      &::after {
        width: max-content;
        content: attr(title);
        vertical-align: text-bottom;
        position: absolute;
        right: -10px;
        top: 0;
        bottom: 0;
        overflow: hidden;
        transform: translateX(100%);
        font-size: 0.5em;
        display: inline-block;
        text-decoration: inherit;
        font-variant: normal;
        text-transform: none;
        background: #fafafa;
        box-shadow: 0 0 6px #eeeeee;
        border: 1px solid #cccccc;
        box-sizing: border-box;
        padding: 0 16px;
        border-radius: 4px;
        z-index: 100;
      }
    }
  }
}
pre {
  margin: 0;
  height: 100%;
  overflow: hidden;
  max-height: calc(80vh - 32px);
  overflow-y: auto;
}
.hljs {
  word-break: break-word;
  white-space: pre-wrap;
}
.hljs * {
  font-family: Consolas, Monaco, monospace;
}

.djs-container {
  .djs-visual {
    rect,
    polygon,
    circle {
      stroke: #c1c2c4 !important;
      stroke-width: 1px !important;
    }
    circle[style*='stroke-width: 4px'] {
      stroke: #333333 !important;
    }
    path[style='fill: black; stroke-width: 1px; stroke: black;'] {
      fill: #333333 !important;
      stroke-width: 1px;
      stroke: #333333 !important;
    }
  }
  .djs-visual path {
    stroke: #333333 !important;
  }
  [id^='sequenceflow-end-white-black'] path {
    fill: #333333 !important;
    stroke: #333333 !important;
  }
  [id^='conditional-flow-marker-white-black'] path {
    stroke: #333333 !important;
  }
}
</style>

<template>
  <div class="process-viewer" style="width: 100%">
    <div
      class="process-canvas"
      style="height: 100%"
      ref="processCanvas"
      v-show="!isLoading && diagramType == DiagramType.ORDINARY"
    />
    <!-- 自定义箭头样式，用于已完成状态下流程连线箭头 -->
    <defs ref="customDefs">
      <marker
        id="sequenceflow-end-white-success"
        viewBox="0 0 20 20"
        refX="11"
        refY="10"
        markerWidth="10"
        markerHeight="10"
        orient="auto"
      >
        <path
          class="success-arrow"
          d="M 1 5 L 11 10 L 1 15 Z"
          style="stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1"
        ></path>
      </marker>
      <marker
        id="conditional-flow-marker-white-success"
        viewBox="0 0 20 20"
        refX="-1"
        refY="10"
        markerWidth="10"
        markerHeight="10"
        orient="auto"
      >
        <path
          class="success-conditional"
          d="M 0 10 L 8 6 L 16 10 L 8 14 Z"
          style="stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1"
        ></path>
      </marker>
    </defs>
    <!-- 已完成节点悬浮弹窗 -->
    <el-dialog
      class="comment-dialog"
      :title="dlgTitle || '审批记录'"
      v-model="dialogVisible"
      :append-to-body="true"
    >
      <el-row>
        <el-table
          :data="taskCommentList"
          :size="layoutStore.defaultFormItemSize"
          border
          header-cell-class-name="table-header-gray"
          height="500px"
        >
          <el-table-column
            label="序号"
            header-align="center"
            align="center"
            type="index"
            width="70px"
          />
          <el-table-column label="执行人" prop="createUsername" width="150px" />
          <el-table-column label="操作" width="150px">
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
          </el-table-column>
          <el-table-column label="审批意见">
            <template v-slot="scope">
              <span>{{ scope.row.taskComment ? scope.row.taskComment : '' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="处理时间" prop="createTime" width="180px" />
          <template v-slot:empty>
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png" />
              <span>暂无数据</span>
            </div>
          </template>
        </el-table>
      </el-row>
    </el-dialog>
    <div
      style="position: absolute; top: 0; left: 0; width: 100%"
      v-if="diagramType == DiagramType.ORDINARY"
    >
      <el-row type="flex" justify="end">
        <el-button-group key="scale-control" size="default">
          <el-button
            size="default"
            type="default"
            :plain="true"
            :disabled="defaultZoom <= 0.3"
            :icon="ZoomOut"
            @click="processZoomOut()"
          />
          <el-button size="default" type="default" style="width: 90px">{{
            Math.floor(defaultZoom * 10 * 10) + '%'
          }}</el-button>
          <el-button
            size="default"
            type="default"
            :plain="true"
            :disabled="defaultZoom >= 3.9"
            :icon="ZoomIn"
            @click="processZoomIn()"
          />
          <el-button
            size="default"
            type="default"
            :icon="ScaleToOriginal"
            @click="processReZoom()"
          />
          <slot />
        </el-button-group>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ZoomOut, ZoomIn, ScaleToOriginal } from '@element-plus/icons-vue';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { EpPropMergeType } from 'element-plus/es/utils/vue/props/types';
import { ANY_OBJECT } from '@/types/generic';
import { DiagramType, SysFlowTaskOperationType } from '@/common/staticDict/flow';

const props = defineProps<{
  xml?: string;
  finishedInfo?: ANY_OBJECT;
  allCommentList?: ANY_OBJECT[];
}>();

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const processCanvas = ref();
const customDefs = ref();
const dialogVisible = ref(false);
const dlgTitle = ref<string>();
const defaultZoom = ref(1);
// 是否正在加载流程图
const isLoading = ref(true);
let bpmnViewer: ANY_OBJECT | null = null;
// 已完成流程元素
const processNodeInfo = ref<ANY_OBJECT>();
// 当前任务id
const selectTaskId = ref<string>();
// 任务节点审批记录
const taskCommentList = ref<ANY_OBJECT[]>();
const diagramType = ref(DiagramType.ORDINARY);

const processReZoom = () => {
  defaultZoom.value = 1;
  if (bpmnViewer) {
    bpmnViewer.get('canvas').zoom('fit-viewport', 'auto');
  }
};
const processZoomIn = (zoomStep = 0.1) => {
  let newZoom = Math.floor(defaultZoom.value * 100 + zoomStep * 100) / 100;
  if (newZoom > 4) {
    throw new Error('[Process Designer Warn ]: The zoom ratio cannot be greater than 4');
  }
  defaultZoom.value = newZoom;
  bpmnViewer && bpmnViewer.get('canvas').zoom(defaultZoom.value);
};
const processZoomOut = (zoomStep = 0.1) => {
  let newZoom = Math.floor(defaultZoom.value * 100 - zoomStep * 100) / 100;
  if (newZoom < 0.2) {
    throw new Error('[Process Designer Warn ]: The zoom ratio cannot be less than 0.2');
  }
  defaultZoom.value = newZoom;
  bpmnViewer && bpmnViewer.get('canvas').zoom(defaultZoom.value);
};
const getOperationTagType = (
  type: string,
):
  | EpPropMergeType<StringConstructor, '' | 'success' | 'warning' | 'info' | 'danger', unknown>
  | undefined => {
  switch (type) {
    case SysFlowTaskOperationType.AGREE:
    case SysFlowTaskOperationType.MULTI_AGREE:
      return 'success';
    case SysFlowTaskOperationType.REFUSE:
    case SysFlowTaskOperationType.PARALLEL_REFUSE:
    case SysFlowTaskOperationType.MULTI_REFUSE:
      return 'warning';
    case SysFlowTaskOperationType.STOP:
      return 'danger';
    default:
      return '';
  }
};
// 流程图预览清空
const clearViewer = () => {
  if (processCanvas.value) processCanvas.value.innerHTML = '';
  if (bpmnViewer) bpmnViewer.destroy();
  bpmnViewer = null;
};
// 添加自定义箭头
const addCustomDefs = () => {
  if (!bpmnViewer) return;
  const canvas = bpmnViewer.get('canvas');
  const svg = canvas._svg;
  svg.appendChild(customDefs.value);
};
// 任务悬浮弹窗
const onSelectElement = (element: ANY_OBJECT | null = null) => {
  selectTaskId.value = undefined;
  dlgTitle.value = undefined;

  if (processNodeInfo.value == null || processNodeInfo.value.finishedTaskSet == null) return;

  if (element == null || processNodeInfo.value.finishedTaskSet.indexOf(element.id) === -1) {
    return;
  }

  selectTaskId.value = element.id;
  dlgTitle.value = element.businessObject ? element.businessObject.name : undefined;
  // 计算当前悬浮任务审批记录，如果记录为空不显示弹窗
  taskCommentList.value = (props.allCommentList || []).filter(item => {
    return item.taskKey === selectTaskId.value;
  });
  dialogVisible.value = true;
};
// 显示流程图
const importXML = async (xml: string) => {
  clearViewer();
  if (xml != null && xml !== '') {
    try {
      bpmnViewer = new BpmnModeler({
        container: processCanvas.value,
        readOnly: true,
      });
      // 任务节点悬浮事件
      if (bpmnViewer) {
        bpmnViewer.on('element.click', ({ element }: { element: ANY_OBJECT }) => {
          onSelectElement(element);
        });
      } else {
        console.warn('bpmnViewer is undefined');
      }

      isLoading.value = true;
      if (bpmnViewer) {
        await bpmnViewer.importXML(xml);
        const process = bpmnViewer
          .get('elementRegistry')
          .find((el: ANY_OBJECT) => el.type === 'bpmn:Process');
        process?.businessObject?.extensionElements?.values &&
          process.businessObject.extensionElements.values.forEach((row: ANY_OBJECT) => {
            if (row.$type === 'flowable:Properties' || row.$type === 'flowable:properties') {
              (row.values || row.$children).forEach((item: ANY_OBJECT) => {
                if (item.name === '$OrangeDiagramType') {
                  diagramType.value = item.value || 0;
                }
              });
            }
          });
      }
      addCustomDefs();
    } catch (e) {
      console.error(e);
      clearViewer();
    } finally {
      isLoading.value = false;
      if (props.finishedInfo) {
        setProcessStatus(props.finishedInfo);
      }
    }
  }
};
// 设置流程图元素状态
const setProcessStatus = (node: ANY_OBJECT) => {
  processNodeInfo.value = node;
  if (isLoading.value || processNodeInfo.value == null || bpmnViewer == null) return;
  let { finishedSequenceFlowSet, finishedTaskSet, unfinishedTaskSet } = processNodeInfo.value;
  const canvas = bpmnViewer.get('canvas');
  const elementRegistry = bpmnViewer.get('elementRegistry');
  if (Array.isArray(finishedSequenceFlowSet)) {
    finishedSequenceFlowSet.forEach(item => {
      if (item != null) {
        let element = elementRegistry.get(item);
        if (element) {
          canvas.addMarker(item, 'success');
          const conditionExpression = element.businessObject.conditionExpression;
          if (conditionExpression) {
            canvas.addMarker(item, 'condition-expression');
          }
        }
      }
    });
  }
  if (Array.isArray(finishedTaskSet)) {
    finishedTaskSet.forEach(item => {
      if (item != null) {
        let element = elementRegistry.get(item);
        if (element) canvas.addMarker(item, 'success');
      }
    });
  }
  if (Array.isArray(unfinishedTaskSet)) {
    unfinishedTaskSet.forEach(item => {
      if (item != null) {
        let element = elementRegistry.get(item);
        if (element) canvas.addMarker(item, 'current');
      }
    });
  }
};

onMounted(() => {
  if (props.xml) {
    importXML(props.xml);
  }
});
onUnmounted(() => {
  clearViewer();
});

watch(
  () => props.xml,
  newXml => {
    if (newXml) importXML(newXml);
  },
  {
    deep: true,
  },
);

watch(
  () => props.finishedInfo,
  newInfo => {
    if (newInfo) setProcessStatus(newInfo);
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style scoped>
.comment-dialog :deep(.el-dialog__body) {
  padding: 0;
}
</style>

<style lang="scss">
@import url('../package/theme/index.scss');
$success-color: #4eb819;
$current-color: #409eff;
.process-viewer {
  position: relative;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTQwIDBIMHY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')
    repeat !important;
  border: 1px solid #efefef;

  .success-arrow {
    fill: $success-color;
    stroke: $success-color;
  }

  .success-conditional {
    fill: white;
    stroke: $success-color;
  }

  .success.djs-connection {
    .djs-visual path {
      stroke: $success-color !important;

      /* marker-end: url(#sequenceflow-end-white-success)!important; */
    }
  }

  .success.djs-connection.condition-expression {
    .djs-visual path {
      /* marker-start: url(#conditional-flow-marker-white-success)!important; */
    }
  }

  .success.djs-shape {
    .djs-visual rect {
      stroke: $success-color !important;
      fill: $success-color !important;
      fill-opacity: 0.15 !important;
    }

    .djs-visual polygon {
      stroke: $success-color !important;
    }

    .djs-visual path:nth-child(2) {
      stroke: $success-color !important;
      fill: $success-color !important;
    }

    .djs-visual circle {
      stroke: $success-color !important;
      fill: $success-color !important;
      fill-opacity: 0.15 !important;
    }
  }

  .current.djs-shape {
    .djs-visual rect {
      stroke: $current-color !important;
      fill: $current-color !important;
      fill-opacity: 0.15 !important;
    }

    .djs-visual polygon {
      stroke: $current-color !important;
    }

    .djs-visual circle {
      stroke: $current-color !important;
      fill: $current-color !important;
      fill-opacity: 0.15 !important;
    }
  }
}

.process-viewer .djs-tooltip-container,
.process-viewer .djs-overlay-container,
.process-viewer .djs-palette {
  display: none;
}
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

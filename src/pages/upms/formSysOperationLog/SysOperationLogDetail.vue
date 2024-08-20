<template>
  <div class="form-single-fragment" style="position: relative">
    <el-form
      ref="formViewOperationLog"
      :model="formData"
      class="full-width-input"
      style="width: 100%"
      label-width="100px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="操作模块：">
            <span class="input-item">{{ formData.formViewSysOperationLog.serviceName }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="操作人员：">
            <span class="input-item">{{ formData.formViewSysOperationLog.operatorName }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="请求地址：">
            <span>{{ formData.formViewSysOperationLog.requestUrl }}</span>
            <el-tag
              :size="formItemSize"
              style="margin-left: 10px"
              :type="formData.formViewSysOperationLog.requestMethod === 'GET' ? 'success' : 'info'"
            >
              {{ formData.formViewSysOperationLog.requestMethod }}
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="主机地址：">
            <span class="input-item">{{ formData.formViewSysOperationLog.requestIp }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="操作方法：">
            <span class="input-item">{{ formData.formViewSysOperationLog.apiMethod }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="Trace Id：">
            <span class="input-item">{{ formData.formViewSysOperationLog.traceId }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="Session Id：">
            <span class="input-item">{{ formData.formViewSysOperationLog.sessionId }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="请求参数：">
            <JsonViewer
              theme="my-awesome-json-theme"
              copyable
              v-model:value="formData.formViewSysOperationLog.requestArguments"
              :expand-depth="5"
              boxed
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="返回结果：">
            <JsonViewer
              theme="my-awesome-json-theme"
              copyable
              v-model:value="formData.formViewSysOperationLog.responseResult"
              :expand-depth="5"
              boxed
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="登录状态：">
            <el-tag
              v-if="formData.formViewSysOperationLog.success != null"
              :type="formData.formViewSysOperationLog.success ? 'success' : 'danger'"
            >
              {{ formData.formViewSysOperationLog.success ? '成功' : '失败' }}
            </el-tag>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import JsonViewer from 'vue-json-viewer';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface OperationLog {
  apiClass: string;
  apiMethod: string;
  description: string;
  operationTime: string;
  operationType: string;
  operatorId: string;
  operatorName: string;
  requestArguments: string | ANY_OBJECT;
  requestIp: string;
  requestMethod: string;
  requestUrl: string;
  responseResult: string | ANY_OBJECT;
  serviceName: string;
  traceId: string;
  sessionId: string;
  success: true;
}

const props = defineProps<{
  rowData: OperationLog;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}>();

const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});

const formData = reactive({
  formViewSysOperationLog: { requestArguments: {}, responseResult: {} } as OperationLog,
});

onMounted(() => {
  const log = { ...props.rowData };
  if (props.rowData.requestArguments) {
    try {
      log.requestArguments = JSON.parse(props.rowData.requestArguments.toString()) || {};
    } catch (e) {
      log.requestArguments = props.rowData.requestArguments;
    }
  }
  log.requestArguments = log.requestArguments || {};
  if (props.rowData.responseResult) {
    try {
      log.responseResult = JSON.parse(props.rowData.responseResult.toString()) || {};
    } catch (e) {
      log.responseResult = props.rowData.responseResult;
    }
  }
  log.responseResult = log.responseResult || {};
  formData.formViewSysOperationLog = log;
});
</script>

<style lang="scss" scoped>
.my-awesome-json-theme {
  width: 100%;
  font-size: 14px;
  font-family: Consolas, Menlo, Courier, monospace;
  white-space: nowrap;
  color: #525252;
  background: #f3f3f3;

  :deep(.jv-ellipsis) {
    display: inline-block;
    padding: 0 4px 2px;
    font-size: 0.9em;
    color: #999;
    background-color: #eee;
    border-radius: 3px;
    line-height: 0.9;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }
  :deep(.jv-button) {
    color: #49b3ff;
  }
  :deep(.jv-key) {
    color: #111;
  }
  :deep(.jv-item) {
    &.jv-array {
      color: #111;
    }
    &.jv-boolean {
      color: #fc1e70;
    }
    &.jv-function {
      color: #067bca;
    }
    &.jv-number {
      color: #fc1e70;
    }
    &.jv-number-float {
      color: #fc1e70;
    }
    &.jv-number-integer {
      color: #fc1e70;
    }
    &.jv-object {
      color: #111;
    }
    &.jv-undefined {
      color: #e08331;
    }
    &.jv-string {
      white-space: normal;
      color: #42b983;
      word-break: break-word;
    }
  }
  :deep(.jv-code) {
    .jv-toggle {
      &::before {
        padding: 0 2px;
        border-radius: 2px;
      }
      &:hover {
        &::before {
          background: #eee;
        }
      }
    }
  }
}
</style>

<template>
  <div style="margin-top: 16px">
    <el-form-item label="脚本格式">
      <el-input
        v-model="scriptTaskForm.scriptFormat"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
    <el-form-item label="脚本类型">
      <el-select v-model="scriptTaskForm.scriptType">
        <el-option label="内联脚本" value="inline" />
        <el-option label="外部资源" value="external" />
      </el-select>
    </el-form-item>
    <el-form-item label="脚本" v-show="scriptTaskForm.scriptType === 'inline'">
      <el-input
        v-model="scriptTaskForm.script"
        type="textarea"
        resize="vertical"
        :autosize="{ minRows: 2, maxRows: 4 }"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
    <el-form-item label="资源地址" v-show="scriptTaskForm.scriptType === 'external'">
      <el-input
        v-model="scriptTaskForm.resource"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
    <el-form-item label="结果变量">
      <el-input
        v-model="scriptTaskForm.resultVariable"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';

const props = defineProps<{
  id: string;
  type: string;
}>();

const defaultTaskForm = ref<ANY_OBJECT>({
  scriptFormat: '',
  script: '',
  resource: '',
  resultVariable: '',
});
const scriptTaskForm = ref<ANY_OBJECT>({});

let bpmnElement: ANY_OBJECT | null = null;
const win: ANY_OBJECT = window;

const resetTaskForm = () => {
  for (let key in defaultTaskForm.value) {
    let value = bpmnElement?.businessObject[key] || defaultTaskForm.value[key];
    scriptTaskForm.value[key] = value;
  }
  scriptTaskForm.value.scriptType = scriptTaskForm.value.script ? 'inline' : 'external';
};
const updateElementTask = () => {
  let taskAttr = Object.create(null);
  taskAttr.scriptFormat = scriptTaskForm.value.scriptFormat || null;
  taskAttr.resultVariable = scriptTaskForm.value.resultVariable || null;
  if (scriptTaskForm.value.scriptType === 'inline') {
    taskAttr.script = scriptTaskForm.value.script || null;
    taskAttr.resource = null;
  } else {
    taskAttr.resource = scriptTaskForm.value.resource || null;
    taskAttr.script = null;
  }
  win?.bpmnInstances.modeling.updateProperties(bpmnElement, taskAttr);
};

watch(
  () => props.id,
  () => {
    bpmnElement = win?.bpmnInstances?.bpmnElement;

    nextTick(() => {
      resetTaskForm();
    });
  },
  {
    immediate: true,
  },
);

onBeforeUnmount(() => {
  bpmnElement = null;
});
</script>

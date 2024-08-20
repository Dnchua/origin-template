<template>
  <div>
    <el-form :size="layoutStore.defaultFormItemSize" @submit.prevent label-position="top">
      <el-form-item label="任务变量">
        <el-select
          v-model="taskVariableList"
          clearable
          multiple
          collapse-tags
          placeholder="选择任务节点使用的变量"
          filterable
          default-first-option
          @change="onSelectVariableChange"
        >
          <el-option
            v-for="item in allVariableListComputed"
            :key="item.variableId"
            :value="item.variableId"
            :label="item.showName"
          >
            <el-row justify="space-between">
              <span>{{ item.showName }}</span>
              <span>{{ item.variableName }}</span>
            </el-row>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{ id: string; type: string }>();
const allVariableList = inject('allVariableList', () => {
  console.warn('flowFormConfig not inject formList yet.');
  return {} as ANY_OBJECT;
});
console.log('allVariableList()', allVariableList());
const prefix = inject('prefix');

const allVariableListComputed = computed(() => {
  console.log('allVariableListComputed', allVariableList().value);
  return allVariableList().value;
});

const variableList = ref();
const taskVariableList = ref<ANY_OBJECT[]>([]);

let bpmnElement: ANY_OBJECT = {};
const win: ANY_OBJECT = window;

const resetFormVariable = () => {
  bpmnElement = win.bpmnInstances.bpmnElement;

  let elExtensionElements =
    bpmnElement.businessObject.get('extensionElements') ||
    win.bpmnInstances.moddle.create('bpmn:ExtensionElements', { values: [] });
  variableList.value =
    elExtensionElements.values.filter(ex => ex.$type === `${prefix}:VariableList`)?.[0] ||
    win.bpmnInstances.moddle.create(`${prefix}:VariableList`, { variableList: [] });
  taskVariableList.value = JSON.parse(JSON.stringify(variableList.value.variableList || []));
  taskVariableList.value = taskVariableList.value.map(item => item.id);
  updateElementExtensions();
};
const updateElementExtensions = () => {
  // 更新回扩展元素
  let elExtensionElements =
    bpmnElement.businessObject.get('extensionElements') ||
    win.bpmnInstances.moddle.create('bpmn:ExtensionElements', { values: [] });
  const otherExtensions = elExtensionElements.values.filter(
    (ex: ANY_OBJECT) => ex.$type !== `${prefix}:VariableList`,
  );
  variableList.value.variableList = taskVariableList.value.map(item => {
    return win.bpmnInstances.moddle.create(`${prefix}:FormVariable`, {
      id: item,
    });
  });
  const newElExtensionElements = win.bpmnInstances.moddle.create(`bpmn:ExtensionElements`, {
    values: otherExtensions.concat(variableList.value),
  });
  // 更新到元素上
  win.bpmnInstances.modeling.updateProperties(bpmnElement, {
    extensionElements: newElExtensionElements,
  });
};
const onSelectVariableChange = () => {
  updateElementExtensions();
};

watch(
  () => props.id,
  val => {
    val && val.length && nextTick(() => resetFormVariable());
  },
  {
    immediate: true,
  },
);
</script>

<style>
.full-line-btn {
  width: 100%;
  margin-top: 10px;
  border: 1px dashed #ebeef5;
}
</style>

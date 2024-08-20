<template>
  <el-form class="auto-agree" :size="layoutStore.defaultFormItemSize" @submit.prevent>
    <el-form-item label="自动同意" style="margin-bottom: 0 !important">
      <el-select
        v-model="autoAgreeItemList"
        :size="layoutStore.defaultFormItemSize"
        multiple
        placeholder="请选择"
        :disabled="isCountersign"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();
const props = defineProps<{ id: string; isCountersign: boolean }>();

const options = [
  { label: '审批人为发起人', value: '0' },
  { label: '审批人与上一审批节点处理人相同', value: '1' },
  { label: '审批人审批过', value: '2' },
];
const autoAgreeItemList = ref<ANY_OBJECT[]>([]);
// const autoAgreeItemElementList = ref();
// const ruleVlaue = ref();

const win: ANY_OBJECT = window;
const resetFormVariable = () => {
  let businessObject = (win.bpmnInstances.bpmnElement || {}).businessObject;
  autoAgreeItemList.value = (businessObject.autoSkipType || '')
    .split(',')
    .filter((row: ANY_OBJECT) => !!row);
};
const updateElementExtensions = () => {
  let taskAttr = {
    autoSkipType:
      autoAgreeItemList.value && autoAgreeItemList.value.length
        ? autoAgreeItemList.value.join(',')
        : undefined,
  };
  win.bpmnInstances.modeling.updateProperties(win.bpmnInstances.bpmnElement, taskAttr);
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
watch(
  () => props.isCountersign,
  val => {
    if (val) {
      autoAgreeItemList.value = [];
    }
  },
  {
    immediate: true,
  },
);
watch(
  autoAgreeItemList,
  () => {
    updateElementExtensions();
  },
  {
    deep: true,
  },
);
</script>

<style lang="scss" scoped>
.auto-agree {
  margin-top: 10px;
}
</style>

<template>
  <div class="panel-tab__content">
    <div class="element-property input-property">
      <div class="element-property__label">元素文档：</div>
      <div class="element-property__value">
        <el-input
          type="textarea"
          v-model="documentation"
          :size="layoutStore.defaultFormItemSize"
          resize="vertical"
          :autosize="{ minRows: 2, maxRows: 4 }"
          @input="updateDocumentation"
          @blur="updateDocumentation"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch, nextTick, inject } from 'vue';
import { ANY_OBJECT } from '@/types/generic';

const props = defineProps<{ id: string }>();

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const documentation = ref('');
let bpmnElement: ANY_OBJECT | null = null;

const win: ANY_OBJECT = window;

const updateDocumentation = () => {
  (bpmnElement && bpmnElement.id === props.id) ||
    (bpmnElement = win.bpmnInstances.elementRegistry.get(props.id));
  const doc = win.bpmnInstances.bpmnFactory.create('bpmn:Documentation', {
    text: documentation.value,
  });
  win.bpmnInstances.modeling.updateProperties(bpmnElement, {
    documentation: [doc],
  });
};

onBeforeUnmount(() => {
  bpmnElement = null;
});

watch(
  () => props.id,
  val => {
    if (val && val.length) {
      nextTick(() => {
        const doc = win.bpmnInstances.bpmnElement.businessObject?.documentation;
        documentation.value = doc && doc.length ? doc[0].text : '';
      });
    } else {
      documentation.value = '';
    }
  },
  {
    immediate: true,
  },
);
</script>

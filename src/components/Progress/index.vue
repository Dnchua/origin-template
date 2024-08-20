<template>
  <el-progress v-bind="$attrs" :percentage="getPercentage" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /**
     * 组件最小值
     */
    min?: number;
    /**
     * 组件最大值
     */
    max?: number;
    /**
     * 组件当前值
     */
    value?: number;
  }>(),
  { min: 0, max: 100, value: 0 },
);

const getPercentage = computed(() => {
  let value: number = Math.min(props.max, Math.max(props.min, props.value));
  value = value - props.min;
  if (props.max - props.min === 0) {
    value = 0;
  } else {
    value = (value * 100) / (props.max - props.min);
  }
  return value;
});
</script>

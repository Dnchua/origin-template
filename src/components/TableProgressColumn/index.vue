<template>
  <vxe-table-column v-bind="$attrs" :row-config="{ ...($attrs.rowConfig || {}), isHover: true }">
    <template v-slot="scope">
      <Progress
        :stroke-width="strokeWidth"
        :type="type"
        :text-inside="textInside"
        :status="status"
        :color="color"
        :width="width"
        :show-text="showText"
        :min="getMinValue(scope.row)"
        :max="getMaxValue(scope.row)"
        :value="getValue(scope.row)"
      />
    </template>
  </vxe-table-column>
</template>

<script setup lang="ts">
import Progress from '@/components/Progress/index.vue';
import { ANY_OBJECT } from '@/types/generic';

const props = withDefaults(
  defineProps<{
    /**
     * 固定值最小值
     */
    min?: number;
    /**
     * 固定值最大值
     */
    max?: number;
    /**
     * 固定值当前值
     */
    value?: number;
    /**
     * 表格最小值字段名
     */
    minColumn?: string;
    /**
     * 表格最大值字段名
     */
    maxColumn?: string;
    /**
     * 表格当前值字段名
     */
    valueColumn?: string;
    /**
     * 进度条的宽度，单位 px
     */
    strokeWidth?: number;
    /**
     * 进度条类型（line/circle/dashboard）
     */
    type?: string;
    /**
     * 进度条显示文字内置在进度条内（只在 type=line 时可用）
     */
    textInside?: boolean;
    /**
     * 进度条当前状态(success/exception/warning)
     */
    status?: string;
    /**
     * 进度条背景色（会覆盖 status 状态颜色）
     */
    color?: string | (() => string) | string[];
    /**
     * 环形进度条画布宽度（只在 type 为 circle 或 dashboard 时可用）
     */
    width?: number;
    /**
     * 是否显示进度条文字内容
     */
    showText?: boolean;
  }>(),
  {
    min: 0,
    max: 100,
    value: 0,
    strokeWidth: 16,
    type: 'line',
    textInside: true,
    color: '#FF7700',
    width: 126,
    showText: false,
  },
);

const getValue = (row: ANY_OBJECT) => {
  return props.valueColumn ? row[props.valueColumn] : props.value;
};
const getMinValue = (row: ANY_OBJECT) => {
  return props.minColumn ? row[props.minColumn] : props.min;
};
const getMaxValue = (row: ANY_OBJECT) => {
  return props.maxColumn ? row[props.maxColumn] : props.max;
};
</script>

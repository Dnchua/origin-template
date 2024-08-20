<template>
  <div class="date-range">
    <el-select
      v-model="dateType"
      :size="size"
      style="min-width: 100px; max-width: 100px; margin-right: 10px"
      v-if="!hideTypeOnlyOne || validTypeList.length > 1"
    >
      <el-option
        v-for="type in validTypeList"
        :key="type.value"
        :value="type.value"
        :label="type.label"
      />
    </el-select>
    <el-date-picker
      style="flex-grow: 1"
      v-model="currentDates"
      :size="size"
      :placeholder="placeholder"
      :type="innerDateType"
      :disabled="disabled"
      :format="innerDateFormat"
      :readonly="readonly"
      :editable="editable"
      :clearable="clearable"
      :start-placeholder="startPlaceholder"
      :end-placeholder="endPlaceholder"
      :align="align"
      :range-separator="rangeSeparator"
      :value-format="valueFormat"
      :prefix-icon="prefixIcon"
      :clear-icon="clearIcon"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, Component } from 'vue';
import { CircleClose, Calendar } from '@element-plus/icons-vue';
import { ANY_OBJECT } from '@/types/generic';

type ModelValue = string | Date | [Date, Date] | [string, string];

const allTypeList = [
  {
    value: 'day',
    label: '自然日',
  },
  {
    value: 'month',
    label: '自然月',
  },
  {
    value: 'year',
    label: '自然年',
  },
];

const emit = defineEmits<{
  'update:value': [ModelValue];
  change: [ModelValue];
}>();

const props = withDefaults(
  defineProps<{
    value?: ModelValue;
    // 默认显示的数据选择方式，如果不存在与allowTypes中则显示allowTypes中的第一个
    defaultDateType?: string;
    // small / default / large
    size?: '' | 'default' | 'small' | 'large' | undefined;
    // 数据选择方式只有一个的时候是否隐藏数据选择方式下拉
    hideTypeOnlyOne?: boolean;
    // 允许的数据选择方式（day, month, year）
    allowTypes?: string[];
    // 是否范围选择
    isRange?: boolean;
    editable?: boolean;
    clearable?: boolean;
    // 对齐方式（left, center, right）
    align?: string;
    rangeSeparator?: string;
    format?: string;
    valueFormat?: string;
    // 自定义头部图标的类名
    prefixIcon?: Component;
    // 自定义清空图标的类名
    clearIcon?: Component;
    // 非范围选择时的占位内容
    placeholder?: string;
    // 范围选择时开始日期的占位内容
    startPlaceholder?: string;
    //范围选择时结束日期的占位内容
    endPlaceholder?: string;
    // 完全只读
    readonly?: boolean;
    //禁用
    disabled?: boolean;
  }>(),
  {
    value: () => '',
    defaultDateType: 'day',
    size: 'default',
    hideTypeOnlyOne: true,
    allowTypes: () => ['day', 'month', 'year'],
    isRange: true,
    editable: true,
    clearable: true,
    align: 'left',
    rangeSeparator: '-',
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    prefixIcon: Calendar,
    clearIcon: CircleClose,
  },
);

const dateType = ref(props.defaultDateType);
const currentDates = computed({
  get() {
    return props.value;
  },
  set(val) {
    emit('update:value', val);
  },
});

const emitChange = () => {
  let outputDate = [];
  if (currentDates.value != null) {
    if (!props.isRange) {
      outputDate[0] = new Date(currentDates.value.toString());
      outputDate[1] = new Date(currentDates.value.toString());
    } else {
      if (Array.isArray(currentDates.value) && currentDates.value.length == 2) {
        outputDate[0] = new Date(currentDates.value[0]);
        outputDate[1] = new Date(currentDates.value[1]);
      }
    }

    if (outputDate[0] != null && outputDate[1] != null) {
      outputDate[0].setHours(0, 0, 0, 0);
      outputDate[1].setHours(0, 0, 0, 0);
      switch (dateType.value) {
        case 'day':
          outputDate[1].setDate(outputDate[1].getDate() + 1);
          break;
        case 'month':
          outputDate[1].setDate(1);
          outputDate[0].setDate(1);
          outputDate[1].setMonth(outputDate[1].getMonth() + 1);
          break;
        case 'year':
          outputDate[1].setMonth(0);
          outputDate[1].setDate(1);
          outputDate[0].setMonth(0);
          outputDate[0].setDate(1);
          outputDate[1].setFullYear(outputDate[1].getFullYear() + 1);
          break;
      }
      outputDate[1] = new Date(outputDate[1].getTime() - 1);
    }
  }
  emit('update:value', outputDate as ModelValue);
  emit('change', outputDate as ModelValue);
};

const validTypeList = computed(() => {
  return allTypeList.filter(item => {
    return props.allowTypes.indexOf(item.value) != -1;
  });
});
/**
 * el-date-picker使用的type
 */
const innerDateType = computed(() => {
  switch (dateType.value) {
    case 'day':
      return props.isRange ? 'daterange' : 'date';
    case 'month':
      return props.isRange ? 'monthrange' : 'month';
    case 'year':
      return props.isRange ? 'monthrange' : 'year';
    default:
      return props.isRange ? 'daterange' : 'date';
  }
});
/**
 * el-date-picker使用的format
 */
const innerDateFormat = computed(() => {
  switch (dateType.value) {
    case 'day':
      return 'YYYY-MM-DD';
    case 'month':
      return 'YYYY-MM';
    case 'year':
      return 'YYYY';
    default:
      return 'YYYY-MM-DD';
  }
});

watch(
  dateType,
  (newValue, oldValue) => {
    console.log('daterange dateType changed', newValue, oldValue);
    if (props.allowTypes.indexOf(dateType.value) == -1) {
      dateType.value = props.allowTypes[0] || 'day';
    }
    emitChange();
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  () => props.value,
  (newVal, oldVal) => {
    console.log('daterange value change', newVal, oldVal);
    if (newVal != oldVal) {
      currentDates.value = newVal;
    }
  },
  {
    deep: true,
  },
);

watch(
  () => props.defaultDateType,
  (newValue, oldValue) => {
    console.log('daterange defaultDateType changed', newValue, oldValue);
    if (props.allowTypes.indexOf(newValue) !== -1) {
      dateType.value = newValue;
    } else {
      dateType.value = props.allowTypes[0];
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  () => props.isRange,
  (newValue, oldValue) => {
    console.log('daterange isRange changed', newValue, oldValue);
    if (newValue) {
      if (currentDates.value && !Array.isArray(currentDates.value)) {
        currentDates.value = [currentDates.value.toString(), currentDates.value.toString()];
      }
    } else if (Array.isArray(currentDates.value)) {
      currentDates.value = currentDates.value[0] as ModelValue;
    }
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style type="scss" scoped>
.date-range {
  display: flex;
}
</style>

<template>
  <el-form-item :label="attributeItem.name" class="widget-attribute-item">
    <el-input
      v-if="inputWidgetType === SysCustomWidgetType.Input"
      style="width: 100%"
      clearable
      v-model="valStr"
      @input="onValueChange"
      v-bind="attributeProps"
      @change="$emit('change')"
    />
    <el-row v-if="inputWidgetType === SysCustomWidgetType.NumberInput">
      <el-input-number
        clearable
        style="width: 100%"
        controls-position="right"
        :min="attributeItem.min"
        :max="attributeItem.max"
        v-model="valNum"
        @input="onValueChange"
        v-bind="attributeProps"
        @change="$emit('change')"
      />
    </el-row>
    <el-row v-if="inputWidgetType === SysCustomWidgetType.Radio" align="middle">
      <el-radio-group
        size="default"
        v-model="valStr"
        v-bind="attributeProps"
        @change="onValueChange"
      >
        <el-radio-button v-for="item in dropdownData" :key="item.id" :value="item.id">{{
          item.name
        }}</el-radio-button>
      </el-radio-group>
    </el-row>
    <el-slider
      v-if="inputWidgetType === SysCustomWidgetType.Slider"
      style="width: 95%; margin-left: 5px"
      :min="attributeItem.min"
      :max="attributeItem.max"
      v-model="valNum"
      @input="onValueChange"
      v-bind="attributeProps"
    />
    <el-row v-if="inputWidgetType === SysCustomWidgetType.Switch" align="middle">
      <el-select
        style="width: 100%"
        v-model="valBool"
        v-bind="attributeProps"
        placeholder=""
        @change="onValueChange"
      >
        <el-option label="是" :value="true" />
        <el-option label="否" :value="false" />
      </el-select>
      <!--
        <el-switch
          :value="value" @input="onValueChange"
        />
        -->
    </el-row>
    <el-select
      v-if="inputWidgetType === SysCustomWidgetType.Select"
      style="width: 100%"
      clearable
      v-model="valNum"
      @input="onValueChange"
      v-bind="attributeProps"
      placeholder=""
      @change="onValueChange"
    >
      <el-option v-for="item in dropdownData" :key="item.id" :label="item.name" :value="item.id" />
    </el-select>
    <el-color-picker
      v-if="inputWidgetType === SysCustomWidgetType.ColorPicker"
      size="default"
      v-model="valStr"
      v-bind="attributeProps"
      @change="onValueChange"
    />
    <component
      v-if="attributeItem.customComponent"
      :is="components[attributeItem.customComponent.component]"
      style="width: 100%"
      v-bind="attributeProps"
      v-model:value="val"
      @change="onValueChange"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import { Arrayable } from 'element-plus/es/utils';
import { ANY_OBJECT } from '@/types/generic';
import { findItemFromList } from '@/common/utils';
import { SysCustomWidgetType } from '@/common/staticDict/index';
import OnlineTableColumnSetting from '../components/OnlineTableColumnSetting/index.vue';
import CustomWidgetDictSetting from '../components/CustomWidgetDictSetting/index.vue';
import OnlineTabPanelSetting from '../components/OnlineTabPanelSetting/index.vue';
import OnlineImageUrlInput from '../components/OnlineImageUrlInput.vue';

const components: ANY_OBJECT = {
  OnlineTableColumnSetting,
  CustomWidgetDictSetting,
  OnlineTabPanelSetting,
  OnlineImageUrlInput,
};

const emit = defineEmits<{
  'update:value': [ANY_OBJECT | string | number | Arrayable<number> | boolean | null | undefined];
  input: [ANY_OBJECT | string | number | Arrayable<number> | boolean | null | undefined];
  change: [];
}>();
const props = defineProps<{
  value?: string | number | Arrayable<number> | boolean | ANY_OBJECT | null;
  attributeItem: ANY_OBJECT;
}>();
console.log('>>> >>> attributeItem', props.attributeItem);
const formConfig = inject('formConfig', () => {
  console.error('editWidgetAttribute: formConfig not injected');
  return {} as ANY_OBJECT;
});

const dropdownData = ref<ANY_OBJECT[]>([]);
const attributeProps = ref<ANY_OBJECT>({});

const val = computed({
  get() {
    console.log('get val', props.value);
    return props.value;
  },
  set(value) {
    console.log('val change', value);
    onValueChange(value);
  },
});
const valStr = computed({
  get() {
    console.log('get val as string', props.value);
    return props.value as string;
  },
  set(value) {
    console.log('val change str', value);
    onValueChange(value);
  },
});
const valBool = computed({
  get() {
    console.log('get val as boolean', props.value, typeof props.value);
    return props.value as boolean;
  },
  set(value) {
    console.log('val change boolean', value);
    onValueChange(value);
  },
});
const valNum = computed({
  get() {
    console.log('get val as number', props.value);
    return props.value as number;
  },
  set(value) {
    console.log('val change number', value);
    onValueChange(value);
  },
});

const currentWidget = computed(() => {
  return formConfig().currentWidget;
});
const inputWidgetType = computed(() => {
  return props.attributeItem.widgetType;
});
const isWidgetDictSelect = computed(() => {
  if (currentWidget.value == null) return false;
  let temp =
    [
      SysCustomWidgetType.Select,
      SysCustomWidgetType.Cascader,
      SysCustomWidgetType.Radio,
      SysCustomWidgetType.CheckBox,
    ].indexOf(currentWidget.value.widgetType) !== -1;
  return temp && currentWidget.value && props.attributeItem.attributeKey === 'dictId';
});

const onValueChange = (
  val: string | number | Arrayable<number> | boolean | ANY_OBJECT | null | undefined,
) => {
  if (isWidgetDictSelect.value) {
    console.log('isWidgetDictSelect', isWidgetDictSelect.value);
    currentWidget.value.dictInfo = findItemFromList(formConfig().dictList, val as string, 'id');
    console.log('currentWidget.dictInfo', currentWidget.value.dictInfo);
  }
  console.log('onValueChange val', val, typeof val);
  //emit('input', val);
  emit('update:value', val);
  if (props.attributeItem.customComponent) emit('change');
};
const loadDropdownData = () => {
  dropdownData.value = [];
  if (typeof props.attributeItem.dropdownList === 'function') {
    if (isWidgetDictSelect.value) {
      dropdownData.value = props.attributeItem.dropdownList(formConfig());
    } else {
      dropdownData.value = props.attributeItem.dropdownList();
    }
  } else {
    dropdownData.value = Array.isArray(props.attributeItem.dropdownList)
      ? props.attributeItem.dropdownList
      : [];
  }
  //console.log('dropdownData', dropdownData.value);
  if ((dropdownData.value || []).length === 1) onValueChange(dropdownData.value[0].id);
};
const getProps = () => {
  let pps: ANY_OBJECT = {};
  if (props.attributeItem.customComponent) {
    pps = props.attributeItem.customComponent.props || {};
  } else {
    pps = props.attributeItem.props || {};
  }
  pps.disabled = props.attributeItem.disabled || pps.disabled;
  attributeProps.value = Object.keys(pps).reduce((retObj: ANY_OBJECT, key: string) => {
    let value = pps[key];
    if (typeof value === 'function') value = value(formConfig());
    retObj[key] = value;
    return retObj;
  }, {});
};

watch(
  () => props.value,
  () => {
    console.log('..........', props.value);
  },
  {
    immediate: true,
  },
);

watch(
  () => props.attributeItem,
  () => {
    loadDropdownData();
  },
  {
    immediate: true,
    deep: true,
  },
);

watch(
  () => currentWidget.value,
  () => {
    loadDropdownData();
    getProps();
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style scoped>
.widget-attribute-item :deep(.el-textarea__inner) {
  min-height: 100px !important;
}
</style>

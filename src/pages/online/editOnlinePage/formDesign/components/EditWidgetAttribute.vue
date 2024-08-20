<template>
  <el-form-item
    style="width: 100%"
    class="widget-attribute-item"
    :label="attributeItem.showLabel !== false ? attributeItem.name : undefined"
    :label-width="attributeItem.showLabel !== false ? undefined : '0px'"
  >
    <el-input
      v-if="inputWidgetType === SysCustomWidgetType.Input"
      style="width: 100%"
      clearable
      v-model="data"
      v-bind="attributeProps"
    />
    <el-row
      v-if="inputWidgetType === SysCustomWidgetType.NumberInput"
      type="flex"
      style="width: 100%"
    >
      <el-input-number
        style="width: 100%"
        clearable
        controls-position="right"
        :min="attributeItem.min"
        :max="attributeItem.max"
        v-model="data"
        v-bind="attributeProps"
      />
    </el-row>
    <el-row
      v-if="inputWidgetType === SysCustomWidgetType.Radio"
      type="flex"
      align="middle"
      style="width: 100%; height: 32px"
    >
      <el-radio-group size="default" v-model="data" v-bind="attributeProps">
        <el-radio v-for="item in dropdownData" :key="item.id" :value="item.id">{{
          item.name
        }}</el-radio>
      </el-radio-group>
    </el-row>
    <el-slider
      v-if="inputWidgetType === SysCustomWidgetType.Slider"
      style="display: inline-block; width: 95%; margin-left: 5px"
      :min="attributeItem.min"
      :max="attributeItem.max"
      v-model="data"
      v-bind="attributeProps"
    />
    <el-row
      v-if="inputWidgetType === SysCustomWidgetType.Switch"
      type="flex"
      align="middle"
      style="width: 100%; height: 32px"
    >
      <el-switch v-model="data" v-bind="attributeProps" />
    </el-row>
    <el-select
      v-if="inputWidgetType === SysCustomWidgetType.Select"
      style="width: 100%"
      v-model="data"
      v-bind="attributeProps"
      placeholder=""
    >
      <el-option v-for="item in dropdownData" :key="item.id" :label="item.name" :value="item.id" />
    </el-select>
    <el-row
      v-if="inputWidgetType === SysCustomWidgetType.ColorPicker"
      type="flex"
      align="middle"
      style="width: 100%; height: 32px"
    >
      <el-color-picker size="default" v-model="data" v-bind="attributeProps" />
    </el-row>
    <component
      v-if="attributeItem.customComponent"
      :is="components[attributeItem.customComponent.component]"
      style="width: 100%"
      v-bind="attributeProps"
      v-model:value="data"
      :allFormList="allFormList"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';
import { findItemFromList } from '@/common/utils';
import { SysCustomWidgetType } from '@/common/staticDict';
import OnlineTabPanelSetting from '@/online/components/WidgetAttributeSetting/components/OnlineTabPanelSetting/index.vue';
import CustomWidgetDictSetting from '@/online/components/WidgetAttributeSetting/components/CustomWidgetDictSetting/index.vue';
import OnlineTableColumnSetting from '@/online/components/WidgetAttributeSetting/components/OnlineTableColumnSetting/index.vue';
import OnlineImageUrlInput from '@/online/components/WidgetAttributeSetting/components/OnlineImageUrlInput.vue';

const components: ANY_OBJECT = {
  OnlineTableColumnSetting,
  CustomWidgetDictSetting,
  OnlineTabPanelSetting,
  OnlineImageUrlInput,
};

const emit = defineEmits<{
  'update:value': [ANY_OBJECT];
}>();

const props = withDefaults(
  defineProps<{
    value: ANY_OBJECT;
    valueKey: string;
    attributeItem: ANY_OBJECT;
    // 所有表单
    allFormList: ANY_OBJECT[];
  }>(),
  { allFormList: () => [] },
);
const formConfig = inject('formConfig', () => {
  console.error('CustomWidgetAttributeSetting: formConfig not injected');
  return {} as ANY_OBJECT;
});

const attributeProps = ref<ANY_OBJECT>({});
const dropdownData = ref<ANY_OBJECT[]>([]);

const data = computed<string & number>({
  get() {
    //console.log('editWdigetAttribute value', props.value);
    return props.value[props.valueKey] as string & number;
  },
  set(val: (string & number) | null) {
    const value: ANY_OBJECT = { ...props.value };
    value[props.valueKey] = val;
    console.log('value change >>>', val, value);
    emit('update:value', value);
  },
});
const inputWidgetType = computed(() => {
  return props.attributeItem.widgetType;
});
const currentWidget = computed(() => {
  return formConfig().currentWidget;
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

const onValueChange = (val: string | null) => {
  console.log('onValueChange 》', val);
  if (isWidgetDictSelect.value) {
    currentWidget.value.dictInfo = val
      ? findItemFromList(formConfig().dictList, val.toString(), 'id')
      : {};
  }
};

const loadDropdownData = () => {
  dropdownData.value = [];
  if (typeof props.attributeItem.dropdownList === 'function') {
    dropdownData.value = props.attributeItem.dropdownList(formConfig());
  } else {
    dropdownData.value = Array.isArray(props.attributeItem.dropdownList)
      ? props.attributeItem.dropdownList
      : [];
  }
  // TODO 最多只有一个值吗？
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
    console.log('### typeof value', value, formConfig());
    if (typeof value === 'function') value = value(formConfig());
    retObj[key] = value;
    return retObj;
  }, {});
};

watch(
  () => props.attributeItem.dropdownList,
  () => {
    loadDropdownData();
  },
  {
    immediate: true,
  },
);

watch(
  () => currentWidget.value?.bindData.dataType,
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

<template>
  <el-collapse-item :title="attributeItem.name" class="attribute-collapse">
    <template #title>
      <el-row class="attribute-item-title">
        <span style="padding: 0 16px">{{ attributeItem.name }}</span>
      </el-row>
    </template>
    <el-input
      v-if="inputWidgetType === SysCustomWidgetType.Input"
      size="small"
      style="width: 100%"
      clearable
      v-model="valStr"
      @input="onValueChange"
      v-bind="attributeProps"
      @change="$emit('change')"
    />
    <el-row v-if="inputWidgetType === SysCustomWidgetType.NumberInput" type="flex">
      <el-input-number
        size="small"
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
    <el-row v-if="inputWidgetType === SysCustomWidgetType.Radio" type="flex" align="middle">
      <el-radio-group size="small" v-model="valNum" v-bind="attributeProps" @change="onValueChange">
        <el-radio-button
          v-for="item in dropdownData"
          :key="item.id"
          :value="item.id"
          :label="item.name"
        />
      </el-radio-group>
    </el-row>
    <el-slider
      v-if="inputWidgetType === SysCustomWidgetType.Slider"
      style="width: 95%; margin-left: 5px"
      size="small"
      :min="attributeItem.min"
      :max="attributeItem.max"
      v-model="valNum"
      @input="onValueChange"
      v-bind="attributeProps"
      @change="$emit('change')"
    />
    <el-row v-if="inputWidgetType === SysCustomWidgetType.Switch" type="flex" align="middle">
      <el-select
        size="small"
        style="width: 100%"
        v-model="valBool"
        @input="onValueChange"
        v-bind="attributeProps"
        @change="$emit('change')"
        placeholder=""
      >
        <el-option label="是" :value="true" />
        <el-option label="否" :value="false" />
      </el-select>
    </el-row>
    <el-select
      v-if="inputWidgetType === SysCustomWidgetType.Select"
      style="width: 100%"
      clearable
      size="small"
      v-model="valNum"
      v-bind="attributeProps"
      @change="onValueChange"
      placeholder=""
    >
      <el-option v-for="item in dropdownData" :key="item.id" :label="item.name" :value="item.id" />
    </el-select>
    <el-color-picker
      v-if="inputWidgetType === SysCustomWidgetType.ColorPicker"
      size="small"
      v-model="valStr"
      @input="onValueChange"
      v-bind="attributeProps"
      @change="$emit('change')"
    />
    <component
      v-if="attributeItem.customComponent"
      :is="components[attributeItem.customComponent.component]"
      style="width: 100%"
      v-bind="attributeProps"
      v-model:value="val"
      @input="onValueChange"
    />
  </el-collapse-item>
</template>

<script setup lang="ts">
import { Arrayable } from 'element-plus/es/utils';
import { findItemFromList } from '@/common/utils';
import { ANY_OBJECT } from '@/types/generic';
import { SysCustomWidgetType } from '@/common/staticDict';
import OnlineTableColumnSetting from '../components/OnlineTableColumnSetting/index.vue';
import CustomWidgetDictSetting from '../components/CustomWidgetDictSetting/index.vue';
import OnlineTabPanelSetting from '../components/OnlineTabPanelSetting/index.vue';
import OnlineImageUrlInput from '../components/OnlineImageUrlInput.vue';

const components: ANY_OBJECT = {
  CustomWidgetDictSetting,
  OnlineTabPanelSetting,
  OnlineImageUrlInput,
};

const emit = defineEmits<{
  'update:value': [string | number | Arrayable<number> | boolean | null | undefined];
  input: [string | number | Arrayable<number> | null | undefined];
  change: [];
}>();
const Props = defineProps<{
  value?: string | number | boolean | ANY_OBJECT;
  attributeItem: ANY_OBJECT;
}>();

console.log('AttributeCollapse editWidgetAttribute.props', Props);

const formConfig = inject('formConfig', () => {
  console.error('editWidgetAttribute: formConfig not injected');
  return {} as ANY_OBJECT;
});

const dropdownData = ref<ANY_OBJECT[]>([]);
const attributeProps = ref<ANY_OBJECT>({});

const val = computed({
  get() {
    return Props.value;
  },
  set(value) {
    console.log('val change', value);
  },
});
const valStr = computed({
  get() {
    return Props.value as string;
  },
  set(value) {
    console.log('val change str', value);
  },
});
const valBool = computed({
  get() {
    return Props.value as boolean;
  },
  set(value) {
    console.log('val change boolean', value);
  },
});
const valNum = computed({
  get() {
    return Props.value as number;
  },
  set(value) {
    console.log('val change number', value);
  },
});
const inputWidgetType = computed(() => {
  return Props.attributeItem.widgetType;
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
  return temp && currentWidget.value && Props.attributeItem.attributeKey === 'dictId';
});

const onValueChange = (val: string | number | Arrayable<number> | null | undefined) => {
  console.log('AttributeCollapse editWidgetAttribute.onValueChange', typeof val, val);
  if (isWidgetDictSelect.value) {
    currentWidget.value.dictInfo = findItemFromList(formConfig().dictList, val as string, 'id');
  }
  if (val && typeof val === 'object') {
    emit('input', (val as ANY_OBJECT).target?.value);
  } else {
    emit('input', val);
  }

  if (Props.attributeItem.customComponent) emit('change');
};
const loadDropdownData = () => {
  dropdownData.value = [];
  if (typeof Props.attributeItem.dropdownList === 'function') {
    if (isWidgetDictSelect.value) {
      dropdownData.value = Props.attributeItem.dropdownList(formConfig());
    } else {
      dropdownData.value = Props.attributeItem.dropdownList();
    }
  } else {
    dropdownData.value = Array.isArray(Props.attributeItem.dropdownList)
      ? Props.attributeItem.dropdownList
      : [];
  }
  if ((dropdownData.value || []).length === 1) onValueChange(dropdownData.value[0].id);
};
const getProps = () => {
  let props: ANY_OBJECT = {};
  if (Props.attributeItem.customComponent) {
    props = Props.attributeItem.customComponent.props || {};
  } else {
    props = Props.attributeItem.props || {};
  }
  props.disabled = Props.attributeItem.disabled || props.disabled;
  attributeProps.value = Object.keys(props).reduce((retObj: ANY_OBJECT, key: string) => {
    let value = props[key];
    if (typeof value === 'function') value = value(formConfig());
    retObj[key] = value;
    return retObj;
  }, {});
  console.log('>>> attributeProps', attributeProps.value);
};

watch(
  () => Props.attributeItem,
  () => {
    loadDropdownData();
  },
  {
    immediate: true,
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
.attribute-collapse :deep(.el-textarea__inner) {
  min-height: 100px !important;
}
</style>

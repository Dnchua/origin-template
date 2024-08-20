<template>
  <div class="custom-label">
    <span v-if="isText"> {{ showText }} </span>
    <div v-if="isHtml" v-html="showText" />
  </div>
</template>

<script setup lang="ts">
import { SysCustomWidgetType } from '@/common/staticDict';
import { SysOnlineFieldKind } from '@/common/staticDict/online';
import { ANY_OBJECT } from '@/types/generic';

const props = defineProps<{
  value?: number | string | boolean | Array<ANY_OBJECT>;
  widget: ANY_OBJECT;
}>();

const form = inject('form', () => {
  console.error('OnlineCustomLabel: form not injected');
  return { isEdit: false };
});

const isText = computed(() => {
  return (
    [
      SysCustomWidgetType.Label,
      SysCustomWidgetType.Input,
      SysCustomWidgetType.NumberInput,
      SysCustomWidgetType.NumberRange,
      SysCustomWidgetType.Slider,
      SysCustomWidgetType.Radio,
      SysCustomWidgetType.CheckBox,
      SysCustomWidgetType.Switch,
      SysCustomWidgetType.Select,
      SysCustomWidgetType.Cascader,
      SysCustomWidgetType.Date,
      SysCustomWidgetType.DateRange,
      SysCustomWidgetType.UserSelect,
      SysCustomWidgetType.DeptSelect,
      SysCustomWidgetType.DataSelect,
    ].indexOf(props.widget.widgetType) !== -1
  );
});
const isHtml = computed(() => {
  return (
    (props.widget.widgetType === SysCustomWidgetType.RichEditor ||
      props.widget.widgetType === SysCustomWidgetType.Label) &&
    props.widget.column &&
    props.widget.column.fieldKind === SysOnlineFieldKind.RICH_TEXT
  );
});
const showText = computed(() => {
  // console.log('OnlineCustomLabel.showText', props, form());
  switch (props.widget.widgetType) {
    case SysCustomWidgetType.Label:
    case SysCustomWidgetType.Input:
    case SysCustomWidgetType.NumberInput:
    case SysCustomWidgetType.Slider:
    case SysCustomWidgetType.Date:
    case SysCustomWidgetType.RichEditor:
    case SysCustomWidgetType.Radio:
    case SysCustomWidgetType.CheckBox:
    case SysCustomWidgetType.Select:
    case SysCustomWidgetType.Cascader:
    case SysCustomWidgetType.UserSelect:
    case SysCustomWidgetType.DeptSelect:
    case SysCustomWidgetType.DataSelect:
      return !props.value
        ? form().isEdit
          ? 'XXXXXXXXXX'
          : undefined
        : Array.isArray(props.value)
        ? props.value.join(',')
        : props.value;
    case SysCustomWidgetType.NumberRange:
    case SysCustomWidgetType.DateRange:
      return Array.isArray(props.value) && props.value.length > 1
        ? props.value[0] + ' 至 ' + props.value[1]
        : form().isEdit
        ? 'XXXXX 至 XXXXX'
        : undefined;
    case SysCustomWidgetType.Switch:
      return props.value ? '是' : '否';
    default:
      return '';
  }
});
</script>

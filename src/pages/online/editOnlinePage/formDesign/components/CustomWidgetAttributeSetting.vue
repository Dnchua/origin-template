<template>
  <el-form
    class="custom-widget-attribute"
    label-position="top"
    style="width: 100%"
    size="default"
    @submit.prevent
  >
    <EditWidgetAttribute
      v-for="attributeItem in attributeList"
      :key="attributeItem.attributeKey"
      v-model:value="data"
      :valueKey="attributeItem.attributeKey"
      :attributeItem="attributeItem"
      :allFormList="allFormList"
    />
  </el-form>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';
import EditWidgetAttribute from './EditWidgetAttribute.vue';

const emit = defineEmits<{ 'update:value': [ANY_OBJECT] }>();

const props = withDefaults(
  defineProps<{
    value: ANY_OBJECT;
    widget: ANY_OBJECT;
    // 所有表单
    allFormList: ANY_OBJECT[];
  }>(),
  { allFormList: () => [] },
);
const formConfig = inject('formConfig', () => {
  console.error('CustomWidgetAttributeSetting: formConfig not injected');
  return {} as ANY_OBJECT;
});
const attributeList = ref<ANY_OBJECT[]>([]);

const data = computed({
  get() {
    console.log('wdiget attribute data', props.value);
    return props.value;
  },
  set(val) {
    console.log('widget attribute change ==========', val);
    emit('update:value', val);
  },
});

const currentWidget = computed(() => {
  return formConfig().currentWidget;
});
const getWidgetAttributeConfig = computed(() => {
  // return (widgetData.getWidgetAttribute(this.widget.widgetType) || {}).attribute;
  console.log(
    'getWidgetAttributeConfig',
    props.widget.widgetType,
    formConfig().getWidgetAttribute(props.widget.widgetType),
  );
  return (formConfig().getWidgetAttribute(props.widget.widgetType) || {}).attribute;
});

const getAttributeItemValue = (attributeItem: ANY_OBJECT) => {
  if (typeof attributeItem === 'function') {
    return attributeItem(formConfig());
  } else {
    return attributeItem;
  }
};
const buildAttributeList = () => {
  attributeList.value = [];
  if (getWidgetAttributeConfig.value != null) {
    Object.keys(getWidgetAttributeConfig.value).forEach(attributeKey => {
      let attributeItem = getWidgetAttributeConfig.value[attributeKey];
      if (attributeItem != null) {
        let temp = Object.keys(attributeItem).reduce(
          (retObj: ANY_OBJECT, subKey: string) => {
            retObj[subKey] = getAttributeItemValue(attributeItem[subKey]);
            return retObj;
          },
          {
            attributeKey: attributeKey,
          },
        );
        if (temp.visible == null || temp.visible) attributeList.value.push(temp);
      }
    });
  }
  console.log('widget attribute list', attributeList.value);
};

watch(
  () => currentWidget.value,
  () => {
    console.log('CustomWidgetAttributeSetting.currentWidget change');
    buildAttributeList();
  },
  {
    immediate: true,
  },
);

watch(
  () => props.widget,
  () => {
    console.log('CustomWidgetAttributeSetting.widget change');
    buildAttributeList();
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

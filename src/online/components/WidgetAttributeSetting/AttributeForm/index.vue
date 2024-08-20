<template>
  <el-form
    class="custom-widget-attribute"
    label-position="top"
    label-width="115px"
    size="default"
    @submit.prevent
  >
    <EditWidgetAttribute
      v-for="attributeItem in attributeList"
      :key="attributeItem.attributeKey"
      v-model:value="modelValue[attributeItem.attributeKey]"
      :attributeItem="attributeItem"
    />
  </el-form>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';
import EditWidgetAttribute from './editWidgetAttribute.vue';

const emit = defineEmits<{ 'update:value': [ANY_OBJECT] }>();
const props = defineProps<{ value: ANY_OBJECT }>();

const formConfig = inject('formConfig', () => {
  console.error('AttributeForm: formConfig not injected');
  return {} as ANY_OBJECT;
});

const attributeList = ref<ANY_OBJECT[]>([]);
const modelValue = computed({
  get() {
    return props.value || {};
  },
  set(val) {
    console.log('AttributeForm value change', val);
    emit('update:value', props.value);
  },
});
const currentWidget = computed(() => {
  return formConfig().currentWidget;
});
const getWidgetAttributeConfig = computed(() => {
  return (formConfig().getWidgetAttribute(currentWidget.value?.widgetType) || {}).attribute;
});

const getAttributeItemValue = (attributeItem: ANY_OBJECT) => {
  if (typeof attributeItem === 'function') {
    return attributeItem(formConfig());
  } else {
    return attributeItem;
  }
};
const buildAttributeList = () => {
  const list: ANY_OBJECT[] = [];
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
        if (temp.visible == null || temp.visible) list.push(temp);
      }
    });
  }
  console.log('AttributeForm attributeList', list);
  attributeList.value = list;
};

watch(
  () => currentWidget.value,
  () => {
    buildAttributeList();
  },
  {
    immediate: true,
  },
);
</script>

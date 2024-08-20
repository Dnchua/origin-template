<template>
  <el-collapse style="border: none" :accordion="true" class="unified-font" :modelValue="undefined">
    <slot />
    <EditWidgetAttribute
      v-for="attributeItem in attributeList"
      :key="attributeItem.attributeKey"
      v-model:value="val[attributeItem.attributeKey]"
      :attributeItem="attributeItem"
    />
  </el-collapse>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';
import EditWidgetAttribute from './editWidgetAttribute.vue';

const props = defineProps<{ widget: ANY_OBJECT; value?: ANY_OBJECT }>();
const formConfig = inject('formConfig', () => {
  console.error('AttributeCollapse: formConfig not injected');
  return {} as ANY_OBJECT;
});
const attributeList = ref<ANY_OBJECT[]>([]);

const val = computed<ANY_OBJECT>({
  get() {
    console.log('AttributeCollapse value', props.value, currentWidget.value.props);
    //return props.value || {};
    return currentWidget.value.props || {};
  },
  set(val) {
    console.log('AttributeCollapse value change', val);
  },
});
const currentWidget = computed(() => {
  return formConfig().currentWidget || {};
});
const getWidgetAttributeConfig = computed(() => {
  // props.widget的变化滞后
  // console.log(
  //   'AttributeCollapse getWidgetAttributeConfig widget',
  //   props.widget,
  //   currentWidget.value,
  // );
  return (formConfig().getWidgetAttribute(currentWidget.value.widgetType) || {}).attribute;
});
const getAttributeItemValue = (attributeItem: ANY_OBJECT) => {
  if (typeof attributeItem === 'function') {
    return attributeItem(formConfig());
  } else {
    return attributeItem;
  }
};
const buildAttributeList = () => {
  const values: ANY_OBJECT[] = [];
  const config: ANY_OBJECT = getWidgetAttributeConfig.value;
  console.log('AttributeCollapse getWidgetAttributeConfig', config);
  if (config) {
    Object.keys(config).forEach(attributeKey => {
      let attributeItem = config[attributeKey];
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
        if (temp.visible == null || temp.visible) values.push(temp);
      }
    });
  }

  attributeList.value = values;
  console.log('AttributeCollapse attributeList', attributeList);
};

watch(
  () => currentWidget.value,
  () => {
    console.log('AttributeCollapse watch widget props', currentWidget.value, {
      ...currentWidget.value,
    });
    buildAttributeList();
  },
  {
    immediate: true,
  },
);
</script>

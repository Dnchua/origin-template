<template>
  <el-form
    label-position="top"
    size="default"
    v-if="pagerSetting"
    style="padding: 10px 16px 0"
    @submit.prevent
  >
    <el-form-item class="view-attribute-item" label="是否显示">
      <el-switch v-model="pagerSetting.show" />
    </el-form-item>
    <el-form-item class="view-attribute-item" label="尺寸">
      <el-select v-model="pagerSetting.size" placeholder="">
        <el-option label="默认" value="default" />
        <el-option label="小" value="small" />
      </el-select>
    </el-form-item>
    <el-form-item class="view-attribute-item" label="样式">
      <el-select v-model="pagerSetting.background" placeholder="">
        <el-option label="按钮" value="1" />
        <el-option label="文字" value="0" />
      </el-select>
    </el-form-item>
    <el-form-item class="view-attribute-item" label="对齐方式">
      <el-radio-group v-model="pagerSetting.align">
        <el-radio-button value="left">居左</el-radio-button>
        <el-radio-button value="center">居中</el-radio-button>
        <el-radio-button value="right">居右</el-radio-button>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';

const props = withDefaults(defineProps<{ fieldName?: string }>(), { fieldName: 'pagerSetting' });
const formConfig = inject('formConfig', () => {
  console.error('PivotTableTotalSetting: formConfig not injected');
  return {} as ANY_OBJECT;
});

const widget = computed(() => {
  return formConfig().currentWidget;
});
const pagerSetting = computed(() => {
  let pps = (widget.value || {}).props;
  if (pps) {
    return pps[props.fieldName];
  } else {
    return {};
  }
});
</script>

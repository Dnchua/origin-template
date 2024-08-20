<template>
  <el-popover width="300px" @show="onInit" :visible="visible">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input"
      :rules="rules"
      style="width: 100%"
      label-width="100px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-form-item label="字典键类型">
        <el-radio-group v-model="formData.type" :disabled="value != null" @change="onChangeHandle">
          <el-radio-button value="Integer">整数</el-radio-button>
          <el-radio-button value="String">字符串</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type === 'String'" label="字典键数据" prop="id">
        <el-input v-model="formData.id" />
      </el-form-item>
      <el-form-item v-if="formData.type === 'Integer'" label="字典键数据" prop="id">
        <el-input-number v-model="formData.id" />
      </el-form-item>
      <el-form-item label="字典值数据" prop="id">
        <el-input v-model="formData.name" />
      </el-form-item>
    </el-form>
    <el-row type="flex" justify="end">
      <el-button :size="layoutStore.defaultFormItemSize" :plain="true" @click="onCancel"
        >取消</el-button
      >
      <el-button :size="layoutStore.defaultFormItemSize" type="primary" @click="onSubmit"
        >保存</el-button
      >
    </el-row>
    <template v-slot:reference>
      <el-button
        :size="layoutStore.defaultFormItemSize"
        link
        type="primary"
        @click="visible = true"
        style="padding: 0"
        >{{ btnText }}</el-button
      >
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import { ANY_OBJECT } from '@/types/generic';
import { DictData } from '@/types/online/dict';
import { isNumber } from '@/common/utils';

const emit = defineEmits<{ save: [ANY_OBJECT, ANY_OBJECT | undefined] }>();
const props = withDefaults(defineProps<{ width: string; btnText: string; value?: DictData }>(), {
  width: '200px',
});
const form = ref();
const visible = ref(false);
const formData = ref({
  type: 'Integer',
} as DictData);
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();
const rules = {
  id: [{ required: true, message: '字典键数据不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '字典值数据不能为空', trigger: 'blur' }],
};

const onCancel = () => {
  visible.value = false;
};
const onSubmit = () => {
  form.value.validate((valid: boolean) => {
    if (valid) {
      visible.value = false;
      emit('save', formData.value, props.value);
    }
  });
};
const onInit = () => {
  formData.value = { type: 'Integer' };
  if (props.value) {
    formData.value = { ...props.value };
  }
};
const onChangeHandle = (val: string | number | boolean) => {
  console.log(val, formData.value);
  if (val == 'Integer' && formData.value.id && !isNumber(formData.value.id)) {
    formData.value.id = undefined;
  }
};
</script>

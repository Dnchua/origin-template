<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input form-box"
      :rules="rules"
      style="width: 100%"
      label-width="100px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-form-item label="显示名称" prop="name">
        <el-input v-model="formData.name" clearable />
      </el-form-item>
      <el-form-item label="最小值">
        <el-input v-model="formData.min" clearable />
      </el-form-item>
      <el-form-item label="最大值">
        <el-input v-model="formData.max" clearable />
      </el-form-item>
    </el-form>
    <el-row class="no-scroll menu-box" type="flex" justify="end">
      <el-button type="primary" :size="formItemSize" :plain="true" @click="onCancel">
        取消
      </el-button>
      <el-button type="primary" :size="formItemSize" @click="onSubmit"> 保存 </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { DialogProp } from '@/components/Dialog/types';
import { ANY_OBJECT } from '@/types/generic';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  rowData?: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const form = ref();
const formData = ref<ANY_OBJECT>({
  id: undefined,
  name: undefined,
  min: undefined,
  max: undefined,
});
const rules: ANY_OBJECT = {
  name: [{ required: true, message: '请输入显示名称', trugger: 'change' }],
};

const dialogParams = computed(() => {
  return {
    rowData: props.rowData || thirdParams.value.rowData,
  };
});

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};
const onSubmit = () => {
  form.value.validate((valid: boolean) => {
    if (!valid) return;
    // 生成唯一ID
    if (formData.value.id == null) formData.value.id = new Date().getTime();
    if (props.dialog) {
      props.dialog?.submit(formData.value);
    } else {
      onCloseThirdDialog(true, dialogParams.value.rowData, formData.value);
    }
  });
};

onMounted(() => {
  if (dialogParams.value.rowData != null) {
    formData.value = {
      ...formData.value,
      ...dialogParams.value.rowData,
    };
  }
});
</script>

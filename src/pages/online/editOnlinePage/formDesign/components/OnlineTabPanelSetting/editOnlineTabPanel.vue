<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input form-box"
      :rules="rules"
      style="width: 100%"
      label-width="100px"
      :size="itemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="标签显示名" prop="showName">
            <el-input v-model="formData.showName" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="标签标识" prop="variableName">
            <el-input v-model="formData.variableName" clearable />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="no-scroll menu-box" type="flex" justify="end">
      <el-button :size="itemSize" :plain="true" @click="onCancel"> 取消 </el-button>
      <el-button type="primary" :size="itemSize" @click="onSubmit"> 保存 </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  rowData?: ANY_OBJECT;
  tabPanelList?: ANY_OBJECT[];
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();
const itemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const form = ref();
const formData = ref<ANY_OBJECT>({
  showName: undefined,
  variableName: undefined,
});
const dialogParams = computed(() => {
  return {
    rowData: props.rowData || thirdParams.value.rowData,
    tabPanelList: props.tabPanelList || thirdParams.value.tabPanelList,
  };
});
function func(param: ANY_OBJECT | null = null) {
  // empty
}
const checkVarialeName = (rule: ANY_OBJECT | null, value: ANY_OBJECT, callback: typeof func) => {
  if (Array.isArray(dialogParams.value.tabPanelList)) {
    if (dialogParams.value.tabPanelList.indexOf(value) !== -1) {
      callback(new Error('标签页标识不能重复'));
    } else {
      callback();
    }
  } else {
    callback();
  }
};
const rules: ANY_OBJECT = {
  showName: [{ required: true, message: '标签页显示名不能为空', trigger: 'blur' }],
  variableName: [
    { required: true, message: '标签页标识不能为空', trigger: 'blur' },
    {
      validator: checkVarialeName,
      trigger: 'blur',
    },
  ],
};

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
    if (props.dialog) {
      props.dialog.submit(formData.value);
    } else {
      onCloseThirdDialog(true, dialogParams.value.rowData, formData.value);
    }
  });
};

onMounted(() => {
  if (dialogParams.value.rowData) {
    formData.value = {
      ...formData.value,
      ...dialogParams.value.rowData,
    };
  }
});
</script>

<template>
  <div class="form-single-fragment" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input"
      :rules="rules"
      style="width: 100%"
      label-width="100px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="状态显示名" prop="name">
            <el-input
              class="input-item"
              v-model="formData.name"
              :clearable="true"
              placeholder="状态显示名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态标识" prop="id">
            <el-input-number
              class="input-item"
              v-model="formData.id"
              clearable
              :controls="false"
              :step-strictly="true"
              placeholder="状态标识"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-row class="no-scroll flex-box" type="flex" justify="end">
            <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
            <el-button type="primary" :size="formItemSize" @click="onSubmit"> 保存 </el-button>
          </el-row>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import { FlowEntryController } from '@/api/flow';
import { DialogProp } from '@/components/Dialog/types';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  flowEntry: ANY_OBJECT;
  rowData?: ANY_OBJECT;
  usedVariableList?: ANY_OBJECT[];
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = withDefaults(defineProps<IProps>(), {
  usedVariableList: () => [],
});
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const form = ref();
const formData = ref<ANY_OBJECT>({
  name: undefined,
  id: undefined,
});
const rules = {
  id: [{ required: true, message: '状态标识不能为空！', trigger: 'blur' }],
  name: [{ required: true, message: '状态显示名不能为空！', trigger: 'blur' }],
};

const dialogParams = computed(() => {
  return {
    flowEntry: props.flowEntry || thirdParams.value.flowEntry,
    usedVariableList: props.usedVariableList || thirdParams.value.usedVariableList,
    rowData: props.rowData || thirdParams.value.rowData,
  };
});
const isEdit = computed(() => {
  return props.rowData != null;
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
    if (dialogParams.value.usedVariableList.indexOf(formData.value.id) !== -1) {
      ElMessage.error('状态标识已存在！');
      return;
    }

    // 合并状态
    let approvalStatusDict: ANY_OBJECT[] = [];
    if (isEdit.value) {
      approvalStatusDict = dialogParams.value.flowEntry.extensionData.approvalStatusDict.map(
        (item: ANY_OBJECT) => {
          return item.name === props.rowData?.name ? formData.value : item;
        },
      );
    } else {
      approvalStatusDict = [...dialogParams.value.flowEntry.extensionData.approvalStatusDict];
      approvalStatusDict.push(formData.value);
    }
    let params = {
      flowEntryDto: {
        ...dialogParams.value.flowEntry,
        extensionData: JSON.stringify({
          approvalStatusDict,
          notifyTypes: dialogParams.value.flowEntry.notifyTypes,
        }),
      },
    };
    FlowEntryController.update(params)
      .then(() => {
        ElMessage.success('保存成功！');
        if (props.dialog) {
          props.dialog.submit(approvalStatusDict);
        } else {
          onCloseThirdDialog(true, undefined, approvalStatusDict);
        }
      })
      .catch(e => {
        console.warn(e);
      });
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

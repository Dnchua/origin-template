<template>
  <el-form
    ref="form"
    :model="formData"
    :rules="rules"
    label-width="80px"
    :size="formItemSize"
    label-position="right"
    @submit.prevent
  >
    <el-form-item label="字典编码" prop="dictCode">
      <el-input v-model="formData.dictCode" placeholder="字典编码" clearable />
    </el-form-item>
    <el-form-item label="字典名称" prop="dictName">
      <el-input v-model="formData.dictName" placeholder="字典名称" clearable />
    </el-form-item>
    <el-row type="flex" justify="end" class="dialog-btn-layer">
      <el-button :size="formItemSize" :plain="true" @click="onCancel">取消</el-button>
      <el-button type="primary" :size="formItemSize" @click="onSubmit">保存</el-button>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { SysGlobalDictController } from '@/api/system';
import { DialogProp } from '@/components/Dialog/types';
import { DictCode } from '@/types/upms/dict';
import { ANY_OBJECT } from '@/types/generic';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  rowData?: DictCode;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const formData = ref({} as DictCode);
const rules = {
  dictCode: [{ required: true, message: '字典编码不能为空', trigger: 'blur' }],
  dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
};
const form = ref();

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
};

const isEdit = computed(() => {
  return !!formData.value.dictId;
});

const onSubmit = () => {
  form.value.validate((valid: boolean) => {
    if (valid) {
      let params = {
        globalDictDto: {
          ...formData.value,
        },
      };
      let httpCall = isEdit.value
        ? SysGlobalDictController.update(params)
        : SysGlobalDictController.add(params);
      httpCall
        .then(res => {
          ElMessage.success('保存成功');
          if (props.dialog) {
            props.dialog.submit(res);
          }
        })
        .catch(e => {
          console.warn(e);
        });
    }
  });
};

onMounted(() => {
  if (props.rowData) {
    formData.value = {
      dictId: props.rowData.dictId,
      dictCode: props.rowData.dictCode,
      dictName: props.rowData.dictName,
    };
  }
});
</script>

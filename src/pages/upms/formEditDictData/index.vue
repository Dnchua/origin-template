<template>
  <el-form
    ref="form"
    :model="formData"
    :rules="rules"
    label-width="80px"
    :size="formItemSize"
    label-position="right"
    class="full-width-input"
    @submit.prevent
  >
    <el-row style="width: 100%">
      <el-col :span="24">
        <el-form-item v-if="dictInfo.treeFlag" label="父字典">
          <el-cascader
            style="width: 100%"
            :options="dictData"
            v-model="parentPath"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择所属父字典"
            :clearable="true"
            :change-on-select="true"
            @change="onParentChange"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item v-if="dictInfo.dictCode != null" label="ID" prop="itemId">
          <el-input v-model="formData.itemId" placeholder="ID" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="字典名称" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item v-if="dictInfo.dictCode != null" label="显示顺序" prop="showOrder">
          <el-input-number
            v-model="formData.showOrder"
            style="width: 100%"
            placeholder="显示顺序"
            clearable
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row type="flex" justify="end" class="dialog-btn-layer">
      <el-button :size="formItemSize" :plain="true" @click="onCancel">取消</el-button>
      <el-button type="primary" :size="formItemSize" @click="onSubmit">确定</el-button>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { CascaderValue, ElMessage } from 'element-plus';
import { DialogProp } from '@/components/Dialog/types';
import { DictCodeItem } from '@/types/upms/dict';
import { ANY_OBJECT } from '@/types/generic';
import { findTreeNodePath } from '@/common/utils';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  dictInfo: ANY_OBJECT;
  dictData: ANY_OBJECT[];
  currentData?: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const form = ref();

const formData = ref({} as DictCodeItem);
const rules = {
  name: [{ required: true, message: '字典数据名称不能为空', trigger: 'blur' }],
  itemId: [{ required: true, message: '字典数据ID不能为空', trigger: 'blur' }],
  showOrder: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }],
};
const parentPath = ref<CascaderValue>([]);

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
};

const onParentChange = (values: CascaderValue) => {
  if (Array.isArray(values) && values.length > 0) {
    formData.value.parentId = values[values.length - 1] as string;
  } else {
    formData.value.parentId = undefined;
  }
};
const onSubmit = () => {
  form.value.validate((valid: boolean) => {
    if (valid) {
      let params: ANY_OBJECT = {};
      params[props.dictInfo.variableName + 'Dto'] = {
        dictCode: props.dictInfo.dictCode,
        id: props.dictInfo.dictCode != null ? formData.value.id : undefined,
        itemId: props.dictInfo.dictCode != null ? formData.value.itemId : undefined,
        showOrder: formData.value.showOrder,
      };
      params[props.dictInfo.variableName + 'Dto'][props.dictInfo.nameKey] = formData.value.name;
      params[props.dictInfo.variableName + 'Dto'][props.dictInfo.parentKey] =
        formData.value.parentId;

      if (formData.value.id == null) {
        props.dictInfo
          .addApi(params)
          .then((res: ANY_OBJECT) => {
            ElMessage.success('操作成功');
            if (props.dialog) {
              props.dialog.submit(res);
            }
          })
          .catch((e: Error) => {
            console.warn(e);
          });
      } else {
        if (props.dictInfo.dictCode == null)
          params[props.dictInfo.variableName + 'Dto'][props.dictInfo.idKey] = formData.value.id;
        props.dictInfo
          .updateApi(params)
          .then((res: ANY_OBJECT) => {
            ElMessage.success('操作成功');
            if (props.dialog) {
              props.dialog.submit(res);
            }
          })
          .catch((e: Error) => {
            console.warn(e);
          });
      }
    }
  });
};

onMounted(() => {
  if (props.currentData) {
    formData.value.id = props.currentData.id;
    formData.value.name = props.currentData.name;
    formData.value.showOrder = props.currentData.showOrder;
    formData.value.itemId = props.currentData.itemId;
    if (
      props.dictInfo.treeFlag &&
      props.currentData.parentId != null &&
      props.currentData.parentId !== ''
    ) {
      formData.value.parentId = props.currentData.parentId;
      if (formData.value.parentId) {
        parentPath.value = findTreeNodePath(props.dictData, formData.value.parentId, 'id');
      }
    }
  }
});
</script>

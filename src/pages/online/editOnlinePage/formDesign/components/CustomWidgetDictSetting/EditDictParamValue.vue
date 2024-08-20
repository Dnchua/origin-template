<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input form-box"
      :rules="rules"
      label-width="100px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="参数名称" prop="dictParamName">
            <el-select v-model="formData.dictParamName" placeholder="" :disabled="rowData != null">
              <el-option
                v-for="item in dialogParams.paramList"
                :key="item.dictParamName"
                :label="item.dictParamName"
                :value="item.dictParamName"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="参数值类型" prop="dictValueType">
            <el-select
              class="input-item"
              v-model="formData.dictValueType"
              :clearable="true"
              placeholder="参数值类型"
              @change="onDictValueTypeChange"
            >
              <el-option
                v-for="item in SysOnlineParamValueType.getList()"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formData.dictValueType === SysOnlineParamValueType.TABLE_COLUMN">
          <el-form-item label="参数值" prop="dictValue">
            <el-select
              class="input-item"
              v-model="formData.dictValue"
              key="TABLE_COLUMN"
              :clearable="true"
              placeholder="参数值"
            >
              <el-option
                v-for="item in dialogParams.columnList"
                :key="item.columnId"
                :label="item.objectFieldName"
                :value="item.columnId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formData.dictValueType === SysOnlineParamValueType.STATIC_DICT">
          <el-form-item label="参数值" prop="dictValue">
            <el-cascader v-model="formData.dictValue" :options="staticData" :props="staticPops" />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formData.dictValueType === SysOnlineParamValueType.INPUT_VALUE">
          <el-form-item label="参数值" prop="dictValue">
            <el-input v-model="formData.dictValue" placeholder="请输入参数值" clearable />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="no-scroll menu-box" type="flex" justify="end" style="margin-top: 15px">
      <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
      <el-button type="primary" :size="formItemSize" @click="onSubmit"> 保存 </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import combinedDict from '@/common/staticDict/combined';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { SysOnlineParamValueType } from '@/common/staticDict/online';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  rowData?: ANY_OBJECT;
  paramList?: ANY_OBJECT[];
  columnList?: ANY_OBJECT[];
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();
const StaticDict = { ...combinedDict };
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const form = ref();
const formData = ref<ANY_OBJECT>({
  dictParamName: undefined,
  dictValue: undefined,
  dictValueType: undefined,
});
const staticPops: ANY_OBJECT = {
  label: 'name',
  value: 'id',
};
const staticData = ref<ANY_OBJECT[]>([]);
const rules: ANY_OBJECT = {
  dictParamName: [{ required: true, message: '请选择参数', trigger: 'blur' }],
  dictValueType: [{ required: true, message: '请选择参数值类型', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请选择参数值', trigger: 'blur' }],
};

const dialogParams = computed(() => {
  return {
    rowData: props.rowData || thirdParams.value.rowData,
    paramList: props.paramList || thirdParams.value.paramList,
    columnList: props.columnList || thirdParams.value.columnList,
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
    if (
      formData.value.dictValueType === SysOnlineParamValueType.STATIC_DICT &&
      formData.value.dictValue.length !== 2
    ) {
      ElMessage.error('静态字典类型的参数值必须选择静态字典的值！');
      return;
    }
    if (props.dialog) {
      props.dialog.submit(formData.value);
    } else {
      onCloseThirdDialog(true, dialogParams.value.rowData, formData.value);
    }
  });
};
const onDictValueTypeChange = () => {
  formData.value.dictValue = undefined;
  form.value.clearValidate();
};
const loadStaticData = () => {
  const dictList: ANY_OBJECT = StaticDict;
  staticData.value = Object.keys(dictList)
    .map(key => {
      if (key === 'DictionaryBase') return undefined;
      let dictItem = dictList[key];
      return {
        id: key,
        name: dictItem.showName,
        children: dictItem.getList(),
      };
    })
    .filter(item => item != null) as ANY_OBJECT[];
};

onMounted(() => {
  formData.value = {
    ...formData.value,
    ...dialogParams.value.rowData,
  };
  loadStaticData();
});
</script>

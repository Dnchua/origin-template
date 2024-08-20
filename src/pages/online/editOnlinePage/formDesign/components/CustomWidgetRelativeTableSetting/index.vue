<template>
  <el-row>
    <el-form label-position="left" label-width="115px" size="default" @submit.prevent>
      <el-col :span="24">
        <el-form-item label="弹窗表单选择">
          <el-select
            v-model="relativeFormId"
            clearable
            placeholder=""
            @change="onTableSelectChanged"
            @clear="onTableSelectClear"
            style="width: 100%"
          >
            <el-option
              v-for="item in selectableForms"
              :key="item.formId"
              :label="item.formName"
              :value="item.formId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="显示字段选择" style="margin-top: 20px">
          <el-select
            v-model="displayField"
            clearable
            placeholder=""
            @change="onPropertyChanged"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in selectableFields"
              :key="index"
              :label="item.columnComment"
              :value="item.columnName"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-form>
  </el-row>
</template>

<script setup lang="ts">
import { SysOnlineFormType } from '@/common/staticDict';
import { ANY_OBJECT } from '@/types/generic';

const emit = defineEmits<{ 'update:modelValue': [ANY_OBJECT] }>();

const props = withDefaults(
  defineProps<{
    modelValue?: ANY_OBJECT;
    formSelect?: string;
    datasource?: string;
    // 所有表单
    allFormList: ANY_OBJECT[];
  }>(),
  {
    modelValue: () => {
      return {};
    },
    formSelect: '',
    datasource: '',
    allFormList: () => [],
  },
);

const formConfig = inject('formConfig', () => {
  console.error('CustomWidgetRelativeTableSetting: formConfig not injected');
  return {} as ANY_OBJECT;
});

const relativeFormId = ref('');
const relativeColumn = ref('');
const relativeTableName = ref(''); //  选择的弹窗表单
const displayField = ref(''); //  选择的显示字段
const relationId = ref('');
const datasourceId = ref('');
const variableName = ref('');
const selectableForms = ref<ANY_OBJECT[]>([]); // 待选择的弹窗表单列表
const selectableFields = ref<ANY_OBJECT[]>([]); // 表单可选字段列表

const onPropertyChanged = () => {
  console.log('relativeFormId', relativeFormId.value);
  emit('update:modelValue', {
    relativeFormId: relativeFormId.value,
    relativeTableName: relativeTableName.value,
    relativeColumn: relativeColumn.value,
    relationId: relationId.value,
    datasourceId: datasourceId.value,
    variableName: variableName.value,
    displayField: displayField.value,
  });
};

const onTableSelectClear = () => {
  relativeFormId.value = '';
  relativeColumn.value = '';
  relativeTableName.value = '';
  displayField.value = '';
  relationId.value = '';
  datasourceId.value = '';
  variableName.value = '';
  onPropertyChanged();
};

const loadDisplayFields = () => {
  if (relativeFormId.value === '' || relativeFormId.value == null) return;
  // 选中的表单
  let formInfo: ANY_OBJECT | undefined = props.allFormList.find(
    x => x.formId === relativeFormId.value,
  );
  if (formInfo) {
    // 根据选中表单绑定的数据找到 一对一的数据表
    let relativeTable = formConfig().getAllTableList.find(
      (x: ANY_OBJECT) => x.tableId === formInfo?.onlineTable.tableId,
    );

    relativeFormId.value = formInfo.formId;
    relativeColumn.value = relativeTable.slaveColumnName;
    relativeTableName.value = relativeTable.tableName;
    relationId.value = relativeTable.tag.relationId;
    datasourceId.value = relativeTable.tag.datasourceId;
    variableName.value = formConfig().currentWidget.datasource.variableName;
    selectableFields.value = relativeTable.columnList;
  }
};

const onTableSelectChanged = () => {
  loadDisplayFields();
  onPropertyChanged();
};

onMounted(() => {
  if (props.modelValue) {
    relativeFormId.value = props.modelValue.relativeFormId;
    relativeColumn.value = props.modelValue.relativeColumn;
    relativeTableName.value = props.modelValue.relativeTableName;
    relationId.value = props.modelValue.relationId;
    datasourceId.value = props.modelValue.datasourceId;
    variableName.value = props.modelValue.variableName;
    displayField.value = props.modelValue.displayField;

    loadDisplayFields();
  }
  // 读取配置了一对一查询表单的数据表
  selectableForms.value = props.allFormList
    .filter(x => x.formType === SysOnlineFormType.ONE_TO_ONE_QUERY)
    .map(x => {
      return {
        formName: x.formName,
        tableName: x.onlineTable.tableName,
        formId: x.formId,
      };
    });
});
</script>

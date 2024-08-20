<template>
  <div class="form-single-fragment third-party-dlg">
    <el-form
      ref="form"
      :model="formData"
      class="form-box"
      :rules="rules"
      style="width: 100%"
      label-width="100px"
      :size="itemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row class="full-width-input">
        <el-col :span="24">
          <el-form-item label="绑定类型">
            <el-radio-group
              v-model="formData.fieldType"
              :disabled="rowData != null"
              @change="onBindTypeChange"
            >
              <el-radio-button :value="0">表字段</el-radio-button>
              <el-radio-button :value="1">自定义</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formData.fieldType === 1">
          <el-form-item label="字段名" prop="customFieldName">
            <el-input v-model="formData.customFieldName" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formData.fieldType === 0">
          <el-form-item label="字段数据表" prop="tableId">
            <el-select
              class="input-item"
              v-model="formData.tableId"
              :disabled="dialogParams.rowData != null"
              :clearable="true"
              placeholder="字段数据表"
              @change="onTableChange"
            >
              <el-option
                v-for="(table, index) in dialogParams.tableList"
                :key="table.tableId"
                :label="table.tableName"
                :value="table.tableId"
              >
                <el-row type="flex" justify="space-between" align="middle">
                  <span>{{ table.tableName }}</span>
                  <el-tag
                    :type="table.relationType == null ? 'success' : ''"
                    style="margin-left: 30px"
                    :size="itemSize"
                    effect="dark"
                  >
                    {{ table.relationType == null || index === 0 ? '主表' : '一对一关联' }}
                  </el-tag>
                </el-row>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formData.fieldType === 0">
          <el-form-item label="绑定列字段" prop="columnId">
            <el-select
              class="input-item"
              v-model="formData.columnId"
              :disabled="dialogParams.rowData != null"
              :clearable="true"
              placeholder="字段数据表"
              @change="onColumnChange"
            >
              <el-option
                v-for="column in getTableColumnList"
                :key="column.columnId"
                :label="column.columnName"
                :value="column.columnId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="表格列名" prop="showName">
            <el-input
              class="input-item"
              v-model="formData.showName"
              :clearable="true"
              placeholder="表格列名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="表格列宽">
            <el-input-number
              class="input-item"
              v-model="formData.columnWidth"
              placeholder="表格列宽"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="支持排序">
            <el-switch v-model="formData.sortable" :disabled="formData.fieldType == 1" />
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
import { findItemFromList } from '@/common/utils';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  rowData?: ANY_OBJECT;
  tableList?: ANY_OBJECT[];
  usedColumnList?: ANY_OBJECT[];
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
  columnId: undefined,
  tableId: undefined,
  showName: undefined,
  sortable: false,
  columnWidth: undefined,
  fieldType: 0,
  customFieldName: undefined,
});
const oldColumnId = ref<string>();
const rules: ANY_OBJECT = {
  showName: [{ required: true, message: '表格列名不能为空', trigger: 'blur' }],
  tableId: [{ required: true, message: '表格列绑定数据表不能为空', trigger: 'blur' }],
  columnId: [{ required: true, message: '表格列绑定字段不能为空', trigger: 'blur' }],
  customFieldName: [{ required: true, message: '自定义字段名不能为空', trigger: 'blur' }],
};
const dialogParams = computed<ANY_OBJECT>(() => {
  return {
    rowData: props.rowData || thirdParams.value.rowData,
    tableList: props.tableList || thirdParams.value.tableList,
    usedColumnList: props.usedColumnList || thirdParams.value.usedColumnList,
  };
});
const getCurrentTable = computed(() => {
  return findItemFromList(dialogParams.value.tableList, formData.value.tableId, 'tableId');
});
const getTableColumnList = computed<ANY_OBJECT[]>(() => {
  if (getCurrentTable.value != null) {
    return getCurrentTable.value.columnList.filter((item: ANY_OBJECT) => {
      return (
        dialogParams.value.usedColumnList.indexOf(item.columnId) === -1 ||
        oldColumnId.value === item.columnId
      );
    });
  } else {
    return [];
  }
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
    if (formData.value.fieldType === 1) {
      if (formData.value.id == null) formData.value.id = 'custom_' + new Date().getTime();
    } else {
      if (formData.value.id == null) formData.value.id = 'column_' + formData.value.columnId;
    }

    formData.value.table = getCurrentTable.value;
    formData.value.relationId =
      (getCurrentTable.value || {}).relationType == null ? undefined : getCurrentTable.value?.id;
    if (props.dialog) {
      props.dialog.submit(formData.value);
    } else {
      onCloseThirdDialog(true, dialogParams.value.rowData, formData.value);
    }
  });
};
const onTableChange = () => {
  formData.value.columnId = undefined;
};
const onColumnChange = () => {
  formData.value.column = findItemFromList(
    getTableColumnList.value,
    formData.value.columnId,
    'columnId',
  );
  formData.value.showName = formData.value.column ? formData.value.column.columnComment : undefined;
};
const onBindTypeChange = () => {
  formData.value.customFieldName = undefined;
  formData.value.tableId = undefined;
  formData.value.columnId = undefined;
  formData.value.sortable = false;
  if (form.value) form.value.clearValidate();
};

onMounted(() => {
  if (dialogParams.value.rowData) {
    formData.value = {
      ...formData.value,
      ...dialogParams.value.rowData,
    };
    oldColumnId.value = formData.value.columnId;
  }
});
</script>

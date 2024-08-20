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
      <el-row>
        <el-col :span="24">
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
                    :type="table.relationType == null ? 'success' : 'primary'"
                    style="margin-left: 30px"
                    :size="formItemSize"
                    effect="dark"
                  >
                    {{ table.relationType == null || index === 0 ? '主表' : '一对一关联' }}
                  </el-tag>
                </el-row>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="绑定字段" prop="columnId">
            <el-select
              class="input-item"
              v-model="formData.columnId"
              :disabled="dialogParams.rowData != null"
              :clearable="true"
              placeholder="绑定字段"
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
          <el-form-item label="显示名" prop="showName">
            <el-input v-model="formData.showName" clearable />
          </el-form-item>
        </el-col>
      </el-row>
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
import { findItemFromList } from '@/common/utils';
import { DialogProp } from '@/components/Dialog/types';
import { ANY_OBJECT } from '@/types/generic';
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
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const form = ref();
const formData = ref<ANY_OBJECT>({
  id: undefined,
  tableId: undefined,
  columnId: undefined,
  showName: undefined,
});
const oldColumnId = ref<string>();
const rules: ANY_OBJECT = {
  showName: [{ required: true, message: '显示名不能为空', trigger: 'blur' }],
  tableId: [{ required: true, message: '数据表不能为空', trigger: 'blur' }],
  columnId: [{ required: true, message: '绑定字段不能为空', trigger: 'blur' }],
};

const dialogParams = computed(() => {
  return {
    rowData: props.rowData || thirdParams.value.rowData,
    tableList: props.tableList || thirdParams.value.tableList,
    usedColumnList: props.usedColumnList || thirdParams.value.usedColumnList || [],
  };
});
const getCurrentTable = computed(() => {
  return findItemFromList(dialogParams.value.tableList, formData.value.tableId, 'tableId');
});
const getTableColumnList = computed(() => {
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
    if (!valid) return;
    if (formData.value.id == null) formData.value.id = new Date().getTime();
    formData.value.relationId =
      (getCurrentTable.value || {}).relationType == null ? undefined : getCurrentTable.value?.id;
    if (props.dialog) {
      props.dialog?.submit(formData.value);
    } else {
      onCloseThirdDialog(true, dialogParams.value.rowData, formData.value);
    }
  });
};
const onTableChange = () => {
  formData.value.columnId = undefined;
};
const onColumnChange = () => {
  let column = findItemFromList(getTableColumnList.value, formData.value.columnId, 'columnId');
  formData.value.showName = column ? column.columnComment : undefined;
};

onMounted(() => {
  if (dialogParams.value.rowData != null) {
    formData.value = {
      ...formData.value,
      ...dialogParams.value.rowData,
    };
    oldColumnId.value = formData.value.columnId;
  }
});
</script>

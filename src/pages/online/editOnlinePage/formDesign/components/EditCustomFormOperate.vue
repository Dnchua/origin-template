<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <div class="form-box">
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
        <el-row>
          <el-col :span="24">
            <el-form-item label="操作类型" prop="type">
              <el-select
                v-model="formData.type"
                :disabled="formData.builtin || isEdit"
                @change="onFormTypeChange"
              >
                <el-option
                  v-for="item in getValidOperationType"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作名称" prop="name">
              <el-input
                class="input-item"
                v-model="formData.name"
                :clearable="true"
                placeholder="操作按钮名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用">
              <el-switch class="input-item" v-model="formData.enabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="!formData.rowOperation">
            <el-form-item label="按钮类型" prop="btnType">
              <el-select v-model="formData.btnType">
                <el-option label="primary" value="primary" />
                <el-option label="success" value="success" />
                <el-option label="warning" value="warning" />
                <el-option label="danger" value="danger" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="!formData.rowOperation">
            <el-form-item label="镂空模式" prop="btnType">
              <el-switch v-model="formData.plain" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.rowOperation">
            <el-form-item label="操作按钮类名">
              <el-input
                class="input-item"
                v-model="formData.btnClass"
                :clearable="true"
                placeholder="操作按钮类名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.type === SysCustomWidgetOperationType.START_FLOW">
            <el-form-item label="启动流程" prop="processDefinitionKey">
              <el-cascader
                class="input-item"
                v-model="bindFlowPath"
                :options="flowTree"
                :props="{ value: 'id', label: 'name' }"
                placeholder="请选择启动流程"
                clearablebindFlowPath
                @change="flowPathChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="按钮显示顺序">
              <el-input-number
                class="input-item"
                v-model="formData.showOrder"
                controls-position="right"
                placeholder="按钮显示顺序"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="formData.type === SysCustomWidgetOperationType.FORM ? 16 : 24"
            v-if="showSelectForm"
          >
            <el-form-item label="操作表单" prop="formId">
              <el-select
                class="input-item"
                v-model="formData.formId"
                placeholder="选择操作按钮触发表单"
                clearable
              >
                <el-option
                  v-for="form in getFormList"
                  :key="form.formId"
                  :label="form.formName"
                  :value="form.formId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="formData.type === SysCustomWidgetOperationType.FORM">
            <el-form-item label="只读表单">
              <el-switch v-model="formData.readOnly" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- 导出配置 -->
      <el-col
        :span="24"
        v-show="formData.type === SysCustomWidgetOperationType.EXPORT"
        style="margin-bottom: 20px"
      >
        <vxe-table
          :data="tableColumnTree"
          ref="exportColumnTable"
          border
          show-overflow="title"
          show-header-overflow="title"
          :row-config="{ height: 35, isHover: true }"
          :tree-config="{
            transform: false,
            rowField: 'id',
            parentField: 'parentId',
            expandAll: true,
          }"
          :checkbox-config="{ checkMethod: enableChecked }"
          height="350px"
          @checkbox-all="onExportColumnChange"
          @checkbox-change="onExportColumnChange"
        >
          <vxe-column type="checkbox" width="60" />
          <vxe-column title="导出字段" field="variableName" tree-node>
            <template #default="{ row }">
              <span>{{ row.variableName }}</span>
              <el-tag
                style="margin-left: 10px"
                size="default"
                type="danger"
                v-if="row.aggregationColumnId"
                >聚合字段</el-tag
              >
              <el-tag
                style="margin-left: 10px"
                size="default"
                type="success"
                v-if="row.isTable && row.relationType != null"
                >一对一关联</el-tag
              >
            </template>
          </vxe-column>
          <vxe-column title="显示名称" field="showName">
            <template #default="{ row }">
              <el-input
                v-if="row.isColumn"
                size="default"
                :disabled="!exportColumnIsSelected(row)"
                v-model="row.showName"
              />
            </template>
          </vxe-column>
          <vxe-column title="显示顺序" field="showOrder">
            <template #default="{ row }">
              <el-input-number
                v-if="row.isColumn"
                size="default"
                :disabled="!exportColumnIsSelected(row)"
                v-model="row.showOrder"
                controls-position="right"
              />
            </template>
          </vxe-column>
          <template v-slot:empty>
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png" />
              <span>暂无数据</span>
            </div>
          </template>
        </vxe-table>
      </el-col>
    </div>
    <el-row class="no-scroll menu-box" type="flex" justify="end">
      <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
      <el-button type="primary" :size="formItemSize" @click="onSubmit"> 保存 </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { VxeTable, VxeColumn } from 'vxe-table';
import { CascaderOption, CascaderValue, ElMessage } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import {
  OnlineFormEventType,
  SysCustomWidgetOperationType,
  SysOnlineFormType,
} from '@/common/staticDict';
import { findItemFromList, findTreeNodePath } from '@/common/utils';
import { OnlineOperationController } from '@/api/online';
import { FlowEntryController } from '@/api/flow';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';

const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  rowData: ANY_OBJECT | null;
  formList: Array<ANY_OBJECT>;
  tableList: Array<ANY_OBJECT>;
  formConfig: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const exportColumnTable = ref();
const form = ref();
const formData = ref<ANY_OBJECT>({
  type: SysCustomWidgetOperationType.FORM,
  name: undefined,
  btnType: undefined,
  plain: false,
  enabled: true,
  builtin: false,
  rowOperation: true,
  readOnly: false,
  btnClass: 'table-btn primary',
  showOrder: 0,
  formId: undefined,
  exportColumnList: [] as (ANY_OBJECT | null)[],
  processDefinitionKey: undefined,
  skipHeader: true,
  eventList: [] as ANY_OBJECT[],
});
const rules = {
  name: [{ required: true, message: '操作按钮名称不能为空', trigger: 'blur' }],
  formId: [{ required: true, message: '请选择按钮触发表单', trigger: 'blur' }],
  processDefinitionKey: [{ required: true, message: '请选择启动流程', trigger: 'blur' }],
};
const bindFlowPath = ref<CascaderValue>([]);
const flowTree = ref<CascaderOption[]>([]);
const tableColumnTree = ref<ANY_OBJECT[]>([]);
const exportColumn = ref<ANY_OBJECT[]>([]);
const dialogParams = computed(() => {
  return {
    rowData: props.rowData || thirdParams.value.rowData,
    formList: props.formList || thirdParams.value.formList,
    tableList: props.tableList || thirdParams.value.tableList,
    formConfig: props.formConfig || thirdParams.value.formConfig,
  };
});
const isEdit = computed(() => {
  return dialogParams.value.rowData != null;
});
const allowEventList = computed(() => {
  if (dialogParams.value.formConfig.form.formType === SysOnlineFormType.WORK_ORDER) {
    return [];
  } else {
    return [OnlineFormEventType.OPERATION_VISIBLE, OnlineFormEventType.OPERATION_DISABLED];
  }
});
const getFormList = computed(() => {
  return dialogParams.value.formList.filter(item => {
    if (formData.value.type === SysCustomWidgetOperationType.FORM) {
      return true;
    } else {
      return item.formType === SysOnlineFormType.FORM;
    }
  });
});
const getValidOperationType = computed(() => {
  return SysCustomWidgetOperationType.getList().filter(item => {
    if (isEdit.value) return true;
    if (dialogParams.value.formConfig.form.formType === SysOnlineFormType.FORM) {
      return item.id === SysCustomWidgetOperationType.FORM;
    } else {
      return (
        [SysCustomWidgetOperationType.FORM, SysCustomWidgetOperationType.COPY].indexOf(item.id) !==
        -1
      );
    }
  });
});

const showSelectForm = computed(() => {
  return (
    formData.value.type === SysCustomWidgetOperationType.ADD ||
    formData.value.type === SysCustomWidgetOperationType.EDIT ||
    formData.value.type === SysCustomWidgetOperationType.FORM ||
    formData.value.type === SysCustomWidgetOperationType.COPY
  );
});

const flowPathChange = () => {
  if (Array.isArray(bindFlowPath.value)) {
    formData.value.processDefinitionKey = bindFlowPath.value[bindFlowPath.value.length - 1];
  }
};

const onCancel = () => {
  if (formData.value.type === SysCustomWidgetOperationType.EXPORT) {
    formData.value.exportColumnList = (exportColumn.value || [])
      .map(column => {
        return column && column.isColumn
          ? {
              tableId: column.table.tableId,
              columnId: column.aggregationColumn ? undefined : column.columnId,
              virtualColumnId: column.aggregationColumnId,
              showName: column.showName,
              showOrder: column.showOrder,
            }
          : undefined;
      })
      .filter(item => item != null);
  } else {
    formData.value.exportColumnList = [];
  }
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};

const onSubmit = () => {
  form.value.validate((valid: boolean) => {
    if (!valid) return;
    if (showSelectForm.value && !formData.value.formId) {
      ElMessage.error('请选择操作按钮触发表单');
      return;
    }
    if (formData.value.type === SysCustomWidgetOperationType.EXPORT) {
      formData.value.exportColumnList = (exportColumn.value || [])
        .map(column => {
          return column && column.isColumn
            ? {
                tableId: column.table.tableId,
                columnId: column.aggregationColumn ? undefined : column.columnId,
                virtualColumnId: column.aggregationColumnId,
                showName: column.showName,
                showOrder: column.showOrder,
              }
            : undefined;
        })
        .filter(item => item != null);
    } else {
      formData.value.exportColumnList = [];
    }
    if (props.dialog) {
      props.dialog.submit(formData.value);
    } else {
      onCloseThirdDialog(true, dialogParams.value.rowData, formData.value);
    }
  });
};

const onFormTypeChange = () => {
  formData.value.rowOperation = true;
  formData.value.readOnly = false;
  formData.value.formId = undefined;
};
const onExportColumnChange = () => {
  exportColumn.value = exportColumnTable.value.getCheckboxRecords(true);
};
const exportColumnIsSelected = (row: ANY_OBJECT) => {
  if (Array.isArray(exportColumn.value)) {
    return exportColumn.value.indexOf(row) !== -1;
  } else {
    return false;
  }
};
const enableChecked = ({ row }: { row: ANY_OBJECT }) => {
  return row.isColumn;
};

const getTableColumnTree = () => {
  tableColumnTree.value = [];
  let selectedRows: ANY_OBJECT[] = [];
  if (Array.isArray(dialogParams.value.tableList)) {
    let tempTableList = dialogParams.value.tableList;
    tableColumnTree.value = tempTableList.map(item => {
      return {
        variableName: item.tableName,
        id: item.tableId,
        isTable: true,
        relationType: item.relationType,
        children: (item.columnList || []).map((column: ANY_OBJECT) => {
          let columnInfo = findItemFromList(
            formData.value.exportColumnList,
            column.aggregationColumnId,
            'virtualColumnId',
          );
          if (columnInfo == null)
            columnInfo = findItemFromList(
              formData.value.exportColumnList,
              column.columnId,
              'columnId',
            );
          let temp = {
            ...column,
            id: column.aggregationColumnId || column.columnId,
            table: item,
            variableName: column.columnName,
            showName: (columnInfo || {}).showName || column.columnComment,
            showOrder: (columnInfo || {}).showOrder || 0,
            isColumn: true,
          };
          if (columnInfo != null) selectedRows.push(temp);
          return temp;
        }),
      };
    });
  }
  return selectedRows;
};

const loadFlowTree = () => {
  FlowEntryController.listAll({})
    .then(res => {
      let flowCategoryList = res.data.flowCategoryList;
      let flowEntryList = res.data.flowEntryList;
      flowTree.value = flowCategoryList.map((category: ANY_OBJECT) => {
        return {
          id: category.categoryId,
          name: category.name,
          children: flowEntryList
            .filter((entry: ANY_OBJECT) => entry.categoryId === category.categoryId)
            .map((entry: ANY_OBJECT) => {
              return {
                id: entry.processDefinitionKey,
                name: entry.processDefinitionName,
              };
            }),
        };
      });
      if (formData.value.processDefinitionKey) {
        bindFlowPath.value = findTreeNodePath(
          flowTree.value,
          formData.value.processDefinitionKey,
          'id',
        );
      }
    })
    .catch(e => {
      console.error(e);
    });
};

onMounted(() => {
  exportColumn.value = [];
  if (dialogParams.value.rowData != null) {
    formData.value = {
      ...formData.value,
      ...dialogParams.value.rowData,
    };
    if (formData.value.type === SysCustomWidgetOperationType.EXPORT) {
      exportColumn.value = getTableColumnTree();
      setTimeout(() => {
        exportColumnTable.value.setCheckboxRow(exportColumn.value, true);
      }, 100);
    }
  }
  loadFlowTree();
});
</script>

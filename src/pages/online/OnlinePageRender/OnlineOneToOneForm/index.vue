<template>
  <div
    class="online-query-form"
    :style="{ height: height ? height : '100%', width: '100%' }"
    v-show="isReady"
  >
    <OnlineFilterBox
      class="query-filter-box"
      :isEdit="dialogParams.isEdit"
      ref="filterBox"
      :itemWidth="form.filterItemWidth || 350"
      style="margin-bottom: 16px"
      v-model:widgetList="activeWidgetList"
      :formData="formData"
      :operationList="activeOperationList"
      @widgetClick="onWidgetClick"
      @search="refreshTable(true)"
      @reset="onReset"
      @copy="onCopyWidget"
      @delete="onDeleteWidget"
      @operationClick="onOperationClick"
    >
      <template v-slot:operator>
        <el-button type="primary" :size="layoutStore.defaultFormItemSize" @click="onSubmit()">
          确定
        </el-button>
      </template>
    </OnlineFilterBox>
    <div
      class="query-table-box custom-widget-item widget-item"
      :class="{ active: dialogParams.isEdit && currentWidget === queryTable }"
      @click.stop="onTableClick"
    >
      <OnlineCustomTable
        ref="dataTable"
        style="padding: 0 !important"
        :dataList="queryTableWidget.dataList"
        :isEdit="dialogParams.isEdit"
        :widget="queryTable"
        :singleSelect="true"
        :operationList="activeOperationList"
        :getTableIndex="queryTableWidget.getTableIndex"
        :sortChange="queryTableWidget.onSortChange"
        :onRadioChange="onRadioChange"
        @operationClick="onOperationClick"
        @refresh="refreshTable(false)"
      >
        <template v-slot:pagination>
          <el-row
            type="flex"
            justify="end"
            style="margin-top: 16px"
            v-if="queryTable && queryTable.props.paged"
          >
            <el-pagination
              :total="queryTableWidget.totalCount"
              :current-page="queryTableWidget.currentPage"
              :page-size="queryTableWidget.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, prev, pager, next, sizes"
              @current-change="queryTableWidget.onCurrentPageChange"
              @size-change="queryTableWidget.onPageSizeChange"
            />
          </el-row>
        </template>
      </OnlineCustomTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import {
  OnlineFormEventType,
  SysCustomWidgetBindDataType,
  SysCustomWidgetOperationType,
} from '@/common/staticDict';
import { SysOnlineColumnFilterType } from '@/common/staticDict/online';
import { post, download, get } from '@/common/http/request';
import OnlineCustomTable from '@/online/components/OnlineCustomTable.vue';
import { useTable } from '@/common/hooks/useTable';
import { TableOptions } from '@/common/types/pagination';
import { API_CONTEXT } from '@/api/config';
import widgetData from '@/online/config/index';
import { useLayoutStore, useLoginStore } from '@/store';
import { useDict } from '../../hooks/useDict';
import { useForm } from '../hooks/useForm';
import { useFormExpose } from '../hooks/useFormExpose';
import OnlineFilterBox from './OnlineFilterBox.vue';

const emit = defineEmits<{
  widgetClick: [ANY_OBJECT | null];
  tableClick: [ANY_OBJECT];
  radioSelectChanged: [ANY_OBJECT];
  submit: [];
}>();

const props = withDefaults(
  defineProps<{
    formConfig: ANY_OBJECT;
    height?: string;
    // 主表数据
    masterTableData?: ANY_OBJECT;
    // 是否表单编辑模式
    isEdit?: boolean;
    readOnly?: boolean;
    // 当前选中组件
    currentWidget?: ANY_OBJECT | null;
    // 需要编辑数据，如果是null则是新增
    rowData?: ANY_OBJECT;
    // 是否全屏弹窗
    fullscreen?: boolean;
    selectedColumn?: string;
    selectedValue?: string;
    mode?: string;
  }>(),
  {
    isEdit: false,
    readOnly: false,
    fullscreen: false,
  },
);
const layoutStore = useLayoutStore();

const { getDictDataList } = useDict();
const {
  isReady,
  dialogParams,
  form,
  formData,
  getWidgetValue,
  getWidgetVisible,
  onValueChange,
  onWidgetValueChange,
  getDropdownParams,
  checkOperationPermCode,
  checkOperationDisabled,
  checkOperationVisible,
  cloneWidget,
  handlerOperation,
  loadOnlineFormConfig,
  initPage,
  initFormWidgetList,
  onPrint,
} = useForm(props);

provide('form', () => {
  console.log('provide form4', props, form);
  return {
    ...form.value,
    mode: props.mode || 'pc',
    isEdit: dialogParams.value.isEdit,
    readOnly: dialogParams.value.readOnly,
    formData: formData,
    getWidgetValue: getWidgetValue,
    getWidgetVisible: getWidgetVisible,
    onValueChange: onValueChange,
    onWidgetValueChange: onWidgetValueChange,
    getDropdownParams: getDropdownParams,
    checkOperationPermCode: checkOperationPermCode,
    checkOperationDisabled: checkOperationDisabled,
    checkOperationVisible: checkOperationVisible,
    cloneWidget: cloneWidget,
    handlerOperation: handlerOperation,
    getDictDataList: getDictDataList,
    loadOnlineFormConfig: loadOnlineFormConfig,
    isActive: (widget: ANY_OBJECT) => {
      return props.currentWidget === widget;
    },
    getWidgetObject: widgetData.getWidgetObject,
    instanceData: () => useFormExpose(formData),
  };
});

const dataTable = ref();
const selectRows = ref<ANY_OBJECT[] | ANY_OBJECT>([]);

const activeWidgetList = computed(() => {
  return form.value.widgetList;
});
const getQueryParams = () => {
  if (Array.isArray(activeWidgetList.value)) {
    return activeWidgetList.value
      .map(widget => {
        if (
          widget.bindData.dataType !== SysCustomWidgetBindDataType.Column ||
          widget.column == null
        )
          return null;
        let column = widget.column;
        let paramValue = getWidgetValue(widget);
        if (
          paramValue == null ||
          paramValue === '' ||
          (Array.isArray(paramValue) && paramValue.length === 0)
        )
          return null;
        let temp: ANY_OBJECT = {
          tableName: widget.table.tableName,
          columnName: widget.column.columnName,
          filterType: widget.column.filterType,
          columnValue:
            widget.column.filterType !== SysOnlineColumnFilterType.RANFGE_FILTER
              ? paramValue
              : undefined,
        };

        if (column.filterType === SysOnlineColumnFilterType.RANFGE_FILTER) {
          temp.columnValueStart = paramValue[0];
          temp.columnValueEnd = paramValue[1];
        }

        return temp;
      })
      .filter(item => item != null);
  }
  return [];
};
const loadTableData = (params: ANY_OBJECT) => {
  return new Promise((resolve, reject) => {
    let table = form.value.tableMap.get(queryTable.value.bindData.tableId);
    let httpCall = null;
    params.datasourceId = table.datasource.datasourceId;
    params.filterDtoList = getQueryParams();

    if (queryTable.value.relation != null) {
      params.relationId = table.relation.relationId;
    }
    if (params == null) {
      reject();
      return;
    }

    if (table.relation != null) {
      httpCall = post<ANY_OBJECT>(
        API_CONTEXT +
          '/online/onlineOperation/listByOneToManyRelationId/' +
          table.datasource.variableName,
        params,
      );
    } else {
      httpCall = post<ANY_OBJECT>(
        API_CONTEXT + '/online/onlineOperation/listByDatasourceId/' + table.datasource.variableName,
        params,
      );
    }

    httpCall
      .then(res => {
        resolve({
          dataList: res.data.dataList,
          totalCount: res.data.totalCount,
        });
        let selectedRowNum = res.data.dataList.findIndex((x: ANY_OBJECT) => {
          if (props.selectedColumn) {
            return x[props.selectedColumn] === props.selectedValue;
          } else {
            return false;
          }
        });
        if (selectedRowNum >= 0) {
          //this.$forceUpdate();
          nextTick(() => {
            dataTable.value.setSelectedRow(selectedRowNum);
          });
        }
      })
      .catch(e => {
        reject(e);
      });
  });
};
const loadTableDataVerify = () => {
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadTableData,
  verifyTableParameter: loadTableDataVerify,
  paged: dialogParams.value.formConfig?.tableWidget?.props.paged,
};
const queryTableWidget = reactive(useTable(tableOptions));

const queryTable = computed<ANY_OBJECT>(() => {
  return form.value.tableWidget;
});
const activeOperationList = computed(() => {
  return form.value.operationList;
});

// const getTableStyle = computed(() => {
//   return {
//     padding:
//       dialogParams.value.isEdit && props.currentWidget === queryTable.value ? '5px' : undefined,
//     background:
//       dialogParams.value.isEdit && props.currentWidget === queryTable.value
//         ? 'rgba(64, 158, 255, 0.2)'
//         : undefined,
//   };
// });
const primaryColumnName = computed(() => {
  let table = form.value.tableMap.get(queryTable.value.bindData.tableId);
  if (table && Array.isArray(table.columnList)) {
    for (let i = 0; i < table.columnList.length; i++) {
      let column = table.columnList[i];
      if (column.primaryKey) {
        return column.columnName;
      }
    }
  }
  return null;
});

const refreshTable = (reloadData = false) => {
  if (dialogParams.value.isEdit) return;
  if (reloadData) {
    queryTableWidget.refreshTable(true, 1);
  } else {
    queryTableWidget.refreshTable();
  }
};

const onSubmit = () => {
  emit('submit');
};
const onCopyWidget = (widget: ANY_OBJECT) => {
  activeWidgetList.value.push(widget);
};
const onDeleteWidget = (widget: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此组件？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    form.value.widgetList = form.value.widgetList.filter((item: ANY_OBJECT) => item !== widget);
    onWidgetClick(null);
  });
};
const onTableClick = () => {
  emit('tableClick', queryTable.value);
};
const onWidgetClick = (widget: ANY_OBJECT | null) => {
  emit('widgetClick', widget);
};
const onRadioChange = (rows: ANY_OBJECT) => {
  selectRows.value = rows;
  emit('radioSelectChanged', selectRows.value as ANY_OBJECT);
};
const onReset = () => {
  refreshTable(true);
};
const onBatchDelete = () => {
  if (selectRows.value.length <= 0) {
    ElMessage.error('请选择要批量删除的数据！');
    return;
  }
  ElMessageBox.confirm('是否删除选中数据？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    let table = form.value.tableMap.get(queryTable.value.bindData.tableId);
    let params = {
      datasourceId: table.datasource.datasourceId,
      relationId: (table.relation || {}).relationId,
      dataIdList: selectRows.value.map((item: ANY_OBJECT) => {
        return item[primaryColumnName.value];
      }),
    };

    let httpCall;
    if (params.relationId) {
      httpCall = post(
        API_CONTEXT +
          '/online/onlineOperation/deleteBatchOneToManyRelation/' +
          table.datasource.variableName,
        params,
      );
    } else {
      httpCall = post(
        API_CONTEXT +
          '/online/onlineOperation/deleteBatchDatasource/' +
          table.datasource.variableName,
        params,
      );
    }
    httpCall
      .then(() => {
        ElMessage.success('删除成功！');
        refreshTable(true);
      })
      .catch(e => {
        console.warn(e);
      });
  });
};
const onDeleteRow = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除当前数据？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    let table = form.value.tableMap.get(queryTable.value.bindData.tableId);
    let params = {
      datasourceId: table.datasource.datasourceId,
      relationId: (table.relation || {}).relationId,
      dataId: row[primaryColumnName.value],
    };
    let httpCall = null;
    if (params.relationId) {
      httpCall = post(
        API_CONTEXT +
          '/online/onlineOperation/deleteOneToManyRelation/' +
          table.datasource.variableName,
        params,
      );
    } else {
      httpCall = post(
        API_CONTEXT + '/online/onlineOperation/deleteDatasource/' + table.datasource.variableName,
        params,
      );
    }

    httpCall
      .then(() => {
        ElMessage.success('删除成功！');
        refreshTable(true);
      })
      .catch(e => {
        console.warn(e);
      });
  });
};
const onExport = (operation: ANY_OBJECT) => {
  ElMessageBox.confirm('是否导出表格数据？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    let table = form.value.tableMap.get(queryTable.value.bindData.tableId);
    let params = {
      datasourceId: table.datasource.datasourceId,
      relationId: (table.relation || {}).relationId,
      filterDtoList: getQueryParams(),
      exportInfoList: (operation.exportColumnList || []).sort(
        (val1: ANY_OBJECT, val2: ANY_OBJECT) => {
          return val1.showOrder - val2.showOrder;
        },
      ),
    };

    if (queryTable.value.relation != null) {
      params.filterDtoList.push({
        tableName: queryTable.value.table.tableName,
        columnName: queryTable.value.relation.slaveColumn.columnName,
        filterType: SysOnlineColumnFilterType.EQUAL_FILTER,
        columnValue: (dialogParams.value.masterTableData || {})[
          queryTable.value.relation.masterColumn.columnName
        ],
      });
    }

    let httpCall;
    if (params.relationId) {
      httpCall = download(
        API_CONTEXT +
          '/online/onlineOperation/exportByOneToManyRelationId/' +
          table.datasource.variableName,
        params,
        queryTable.value.showName + '.xlsx',
      );
    } else {
      httpCall = download(
        API_CONTEXT +
          '/online/onlineOperation/exportByDatasourceId/' +
          table.datasource.variableName,
        params,
        queryTable.value.showName + '.xlsx',
      );
    }
    httpCall
      .then(() => {
        ElMessage.success('导出成功！');
      })
      .catch((e: Error) => {
        ElMessage.error(e);
      });
  });
};
const onOperationClick = (operation: ANY_OBJECT, row: ANY_OBJECT | null) => {
  if (dialogParams.value.isEdit) return;
  if (operation.type === SysCustomWidgetOperationType.BATCH_DELETE) {
    onBatchDelete();
  } else if (operation.type === SysCustomWidgetOperationType.DELETE) {
    if (row) onDeleteRow(row);
  } else if (operation.type === SysCustomWidgetOperationType.EXPORT) {
    onExport(operation);
  } else if (operation.type === SysCustomWidgetOperationType.PRINT) {
    if (row) onPrint(operation, row, null, queryTable.value.showName + '.pdf');
  } else {
    handlerOperation(operation, {
      isEdit: dialogParams.value.isEdit,
      rowData: row,
      masterTableData: dialogParams.value.masterTableData || row,
      callback: () => {
        refreshTable();
      },
    });
  }
};

const initFormData = () => {
  refreshTable(true);
};

onMounted(() => {
  isReady.value = false;
  if (!dialogParams.value.isEdit) {
    initFormData();
  }
  isReady.value = true;
});
</script>

<style scoped>
.header-logo {
  display: inline-block;
  width: 40px;
  height: 40px;
  margin-right: 8px;
  text-align: center;
  color: #fda834;
  background: rgb(255 119 0 / 10%);
  border-radius: 8px;
  line-height: 40px;
}
.el-divider--vertical {
  height: 26px;
  margin: 7px 15px;
}
.online-query-form {
  display: flex;
  flex-direction: column;
}
.table-wrap {
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  background-color: white;
  flex: 1;
}
.online-query-form .query-filter-box {
  flex-grow: 0;
  flex-shrink: 0;
}
.online-query-form .query-table-box {
  flex-shrink: 1;
  height: 200px;
  flex-grow: 1;
}
</style>

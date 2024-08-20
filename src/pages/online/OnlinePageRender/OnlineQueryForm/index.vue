<template>
  <div class="online-query-form" :style="{ height: height ? height : '100%' }" v-show="isReady">
    <template v-if="dialogParams.fullscreen && !dialogParams.isEdit">
      <el-container>
        <el-header style="height: 72px; background: white">
          <el-row
            type="flex"
            align="middle"
            style="justify-content: space-between; width: 100%; height: 100%"
          >
            <div style="display: flex; height: 40px; line-height: 40px">
              <i
                class="header-logo online-icon icon-orange-icon"
                style="font-size: 40px; color: #fda834; background: rgb(255 119 0 / 10%)"
              />
              <span style="font-size: 22px; color: #333; font-weight: bold">橙单</span>
              <el-divider direction="vertical" style="height: 26px; margin: 7px 8px" />
              <span style="font-size: 18px; color: #333; font-weight: bold">{{
                form.formName
              }}</span>
            </div>
            <el-button
              link
              size="default"
              :icon="Close"
              style="font-size: 24px; color: #909399"
              @click="onCancel"
            />
          </el-row>
        </el-header>
        <el-main style="width: 100%; padding: 25px; background: #f9f9f9">
          <div
            class="online-query-form"
            style="height: calc(100vh - 122px); padding: 25px; background: white"
          >
            <OnlineFilterBox
              class="query-filter-box"
              :isEdit="dialogParams.isEdit"
              ref="filterBox"
              :itemWidth="form.filterItemWidth || 350"
              :style="{ 'margin-bottom': dialogParams.isEdit ? '10px' : '0px' }"
              :widgetList="activeWidgetList"
              :formData="formData"
              :operationList="activeOperationList"
              @widgetClick="onWidgetClick"
              @search="refreshTable(true)"
              @reset="onReset"
              @copy="onCopyWidget"
              @delete="onDeleteWidget"
              @operationClick="onOperationClick"
            />
            <div
              class="query-table-box custom-widget-item widget-item"
              :class="{
                active: dialogParams.isEdit && currentWidget === queryTable,
              }"
              style="margin-top: 8px"
              :style="{
                padding: dialogParams.isEdit && currentWidget === queryTable ? '2px' : '0px',
              }"
              @click.stop="onTableClick"
            >
              <OnlineCustomTable
                :dataList="queryTableWidget.dataList"
                :isEdit="dialogParams.isEdit"
                :widget="queryTable"
                :multiSelect="batchDelete"
                :operationList="activeOperationList"
                :getTableIndex="queryTableWidget.getTableIndex"
                :sortChange="queryTableWidget.onSortChange"
                :onSelectChange="onSelectRowChange"
                @refresh="refreshTable(false)"
                @operationClick="onOperationClick"
              />
            </div>
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
          </div>
        </el-main>
      </el-container>
    </template>
    <template v-else>
      <OnlineFilterBox
        class="query-filter-box"
        :isEdit="dialogParams.isEdit"
        ref="filterBox"
        :itemWidth="form.filterItemWidth || 350"
        style="margin-bottom: 16px"
        :widgetList="activeWidgetList"
        :formData="formData"
        :operationList="activeOperationList"
        @widgetClick="onWidgetClick"
        @search="refreshTable(true)"
        @reset="onReset"
        @copy="onCopyWidget"
        @delete="onDeleteWidget"
        @operationClick="onOperationClick"
      />
      <div
        class="query-table-box custom-widget-item widget-item"
        :class="{ active: dialogParams.isEdit && currentWidget === queryTable }"
        :style="{ padding: dialogParams.isEdit ? '0' : '' }"
        @click.stop="onTableClick"
      >
        <OnlineCustomTable
          :dataList="queryTableWidget.dataList"
          style="height: 100%"
          :isEdit="dialogParams.isEdit"
          :widget="queryTable"
          :multiSelect="batchDelete"
          :operationList="activeOperationList"
          :getTableIndex="queryTableWidget.getTableIndex"
          :sortChange="queryTableWidget.onSortChange"
          :onSelectChange="onSelectRowChange"
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { Close } from '@element-plus/icons-vue';
import { ANY_OBJECT } from '@/types/generic';
import OnlineCustomTable from '@/online/components/OnlineCustomTable.vue';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import {
  OnlineFormEventType,
  SysCustomWidgetBindDataType,
  SysCustomWidgetOperationType,
} from '@/common/staticDict';
import { SysOnlineColumnFilterType } from '@/common/staticDict/online';
import { download, post, get } from '@/common/http/request';
import { API_CONTEXT } from '@/api/config';
import { useUpload } from '@/common/hooks/useUpload';
import { DialogProp } from '@/components/Dialog/types';
import { ThirdProps } from '@/components/thirdParty/types';
import { useThirdParty } from '@/components/thirdParty/hooks';
import widgetData from '@/online/config/index';
import { useLoginStore } from '@/store';
import { useDict } from '../../hooks/useDict';
import { useForm } from '../hooks/useForm';
import { useFormExpose } from '../hooks/useFormExpose';
import OnlineFilterBox from './OnlineFilterBox.vue';

interface IProps extends ThirdProps {
  formConfig: ANY_OBJECT;
  height?: string;
  masterTableData?: ANY_OBJECT;
  // 是否表单编辑模式
  isEdit?: boolean;
  readOnly?: boolean;
  // 当前选中组件
  currentWidget?: ANY_OBJECT | null;
  // 是否全屏弹窗
  fullscreen?: boolean;
  mode: string;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT | ANY_OBJECT[] | undefined>;
}

const emit = defineEmits<{
  widgetClick: [ANY_OBJECT | null];
  tableClick: [ANY_OBJECT | null];
}>();

const props = withDefaults(defineProps<IProps>(), {
  isEdit: false,
  readOnly: false,
  fullscreen: false,
  mode: 'pc',
});

const { onCloseThirdDialog } = useThirdParty(props);
const { fetchUpload } = useUpload();

const batchDelete = ref(false);
const selectRows = ref<ANY_OBJECT[]>([]);

const { getDictDataList } = useDict();
const {
  isReady,
  dialogParams,
  form,
  formData,
  getWidgetValue,
  getWidgetProp,
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
  onPrint,
  initPage,
  initFormWidgetList,
  initWidgetLinkage,
  onStartFlow,
} = useForm(props);

provide('form', () => {
  return {
    ...form.value,
    mode: props.mode || 'pc',
    isEdit: props.isEdit,
    readOnly: props.readOnly,
    formData: formData,
    getWidgetValue: getWidgetValue,
    getWidgetProp: getWidgetProp,
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

const queryTable = computed(() => {
  return form.value.tableWidget;
});
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
    if (!table) {
      console.warn('table is undefined tableId=', queryTable.value.bindData.tableId);
      return;
    }
    let httpCall = null;
    params.datasourceId = table.datasource.datasourceId;
    params.filterDtoList = getQueryParams();

    if (queryTable.value.relation != null) {
      params.relationId = table.relation.relationId;
      params.filterDtoList.push({
        tableName: queryTable.value.table.tableName,
        columnName: queryTable.value.relation.slaveColumn.columnName,
        filterType: SysOnlineColumnFilterType.EQUAL_FILTER,
        columnValue: (dialogParams.value.masterTableData || {})[
          queryTable.value.relation.masterColumn.columnName
        ],
      });
    }
    if (params == null) {
      reject();
      return;
    }

    if (table.relation != null) {
      httpCall = post(
        API_CONTEXT +
          '/online/onlineOperation/listByOneToManyRelationId/' +
          table.datasource.variableName,
        params,
      );
    } else {
      httpCall = post(
        API_CONTEXT + '/online/onlineOperation/listByDatasourceId/' + table.datasource.variableName,
        params,
      );
    }

    httpCall
      .then((res: ANY_OBJECT) => {
        resolve({
          dataList: res.data.dataList,
          totalCount: res.data.totalCount,
        });
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
  paged: dialogParams.value.formConfig?.tableWidget?.props?.paged,
};
const queryTableWidget = reactive(useTable(tableOptions));

const onTableClick = () => {
  emit('tableClick', queryTable.value);
};
const onWidgetClick = (widget: ANY_OBJECT | null) => {
  console.log('OnlineQueryForm onWidgetClick', widget);
  emit('widgetClick', widget);
};

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};

const activeOperationList = computed(() => {
  return form.value.operationList;
});
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

const onCopyWidget = (widget: ANY_OBJECT) => {
  activeWidgetList.value.push(widget);
};
const onDeleteWidget = (widget: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此组件？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      form.value.widgetList = form.value.widgetList.filter((item: ANY_OBJECT) => item !== widget);
      onWidgetClick(null);
    })
    .catch(e => {
      console.warn(e);
    });
};
const onSelectRowChange = (rows: ANY_OBJECT[]) => {
  selectRows.value = rows;
};
const refreshTable = (reloadData = false) => {
  if (dialogParams.value.isEdit) return;
  if (reloadData) {
    queryTableWidget.refreshTable(true, 1);
  } else {
    queryTableWidget.refreshTable();
  }
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
      dataIdList: selectRows.value.map(item => {
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
      .catch(e => {
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
    onPrint(operation, row, selectRows.value, queryTable.value.showName + '.pdf');
  } else if (operation.type === SysCustomWidgetOperationType.START_FLOW) {
    console.log('启动流程');
    onStartFlow(operation, row);
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
const onReset = () => {
  refreshTable(true);
};
const initFormData = () => {
  refreshTable(true);
};

onMounted(() => {
  isReady.value = false;
  if (!dialogParams.value.isEdit) {
    initFormData();
    initWidgetLinkage();
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

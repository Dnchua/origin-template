<template>
  <div class="online-advance-query-form" v-show="isReady">
    <template v-if="dialogParams.fullscreen && !dialogParams.isEdit">
      <el-container>
        <el-header style="height: 72px; background: white">
          <el-row align="middle" style="justify-content: space-between; width: 100%; height: 100%">
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
          <el-container style="height: calc(100vh - 122px); padding: 25px; background: white">
            <el-aside
              width="265px"
              class="left-panel"
              v-if="leftWidget != null"
              @click.stop="onLeftWidgetClick"
            >
              <div class="title">
                <el-row align="middle" style="flex-wrap: nowrap">
                  <span class="name">{{ leftWidget.showName }}</span>
                  <el-input
                    class="search round-search"
                    :prefix-icon="Search"
                    v-model="leftFilter"
                    clearable
                    :size="layoutStore.defaultFormItemSize"
                    style="border-radius: 16px"
                    :placeholder="'输入' + leftWidget.showName"
                  />
                </el-row>
              </div>
              <el-scrollbar class="custom-scroll tree" style="flex-grow: 1">
                <div
                  class="widget-item"
                  :class="{ active: dialogParams.isEdit && currentWidget === leftWidget }"
                >
                  <OnlineCustomWidget
                    :widget="leftWidget"
                    :ref="leftWidget.variableName"
                    :value="getWidgetValue(leftWidget)"
                    @input="val => onValueChange(leftWidget, val as ANY_OBJECT)"
                    @change="onLeftWidgetChange"
                  />
                </div>
              </el-scrollbar>
            </el-aside>
            <el-main class="table-panel" style="margin-left: 15px">
              <el-row
                class="query-filter-box"
                type="flex"
                justify="end"
                style="margin-bottom: 20px"
              >
                <el-button
                  class="table-operation"
                  v-if="operationVisible(SysCustomWidgetOperationType.BATCH_DELETE)"
                  :size="layoutStore.defaultFormItemSize"
                  :type="getOperation(SysCustomWidgetOperationType.BATCH_DELETE)?.btnType"
                  :plain="getOperation(SysCustomWidgetOperationType.BATCH_DELETE)?.plain"
                  :disabled="operationDisabled(SysCustomWidgetOperationType.BATCH_DELETE)"
                  @click="onOperationClick(getOperation(SysCustomWidgetOperationType.BATCH_DELETE))"
                  :icon="Delete"
                  >{{
                    getOperation(SysCustomWidgetOperationType.BATCH_DELETE)?.name || '批量删除'
                  }}</el-button
                >
                <el-button
                  class="table-operation"
                  v-if="operationVisible(SysCustomWidgetOperationType.EXPORT)"
                  :size="layoutStore.defaultFormItemSize"
                  :type="getOperation(SysCustomWidgetOperationType.EXPORT)?.btnType"
                  :plain="getOperation(SysCustomWidgetOperationType.EXPORT)?.plain"
                  :disabled="operationDisabled(SysCustomWidgetOperationType.EXPORT)"
                  @click="onOperationClick(getOperation(SysCustomWidgetOperationType.EXPORT))"
                  :icon="Download"
                  >{{
                    getOperation(SysCustomWidgetOperationType.EXPORT)?.name || '导出'
                  }}</el-button
                >
                <el-button
                  class="table-operation"
                  v-if="operationVisible(SysCustomWidgetOperationType.PRINT)"
                  :size="layoutStore.defaultFormItemSize"
                  :type="getOperation(SysCustomWidgetOperationType.PRINT)?.btnType"
                  :plain="getOperation(SysCustomWidgetOperationType.PRINT)?.plain"
                  :disabled="operationDisabled(SysCustomWidgetOperationType.PRINT)"
                  @click="onOperationClick(getOperation(SysCustomWidgetOperationType.PRINT))"
                  >{{ getOperation(SysCustomWidgetOperationType.PRINT)?.name || '打印' }}</el-button
                >
                <el-button
                  v-if="operationVisible(SysCustomWidgetOperationType.ADD)"
                  :size="layoutStore.defaultFormItemSize"
                  :type="getOperation(SysCustomWidgetOperationType.ADD)?.btnType"
                  :plain="getOperation(SysCustomWidgetOperationType.ADD)?.plain"
                  :disabled="operationDisabled(SysCustomWidgetOperationType.ADD)"
                  @click="onOperationClick(getOperation(SysCustomWidgetOperationType.ADD))"
                  :icon="Plus"
                  >{{ getOperation(SysCustomWidgetOperationType.ADD)?.name || '新建' }}</el-button
                >
              </el-row>
              <div
                class="query-filter-box"
                style="margin-bottom: 10px"
                v-if="activeWidgetList.length > 0 || isEdit"
                :style="{
                  background: dialogParams.isEdit ? undefined : '#F6F7F9',
                  border: dialogParams.isEdit ? '1px solid #e8eaec' : 'none',
                }"
              >
                <OnlineFilterBox
                  :isEdit="dialogParams.isEdit"
                  ref="filterBox"
                  :isAdvance="true"
                  :itemWidth="form.filterItemWidth || 350"
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
              </div>
              <div class="table-wrap">
                <div
                  class="query-table-box widget-item"
                  :class="{ active: dialogParams.isEdit && currentWidget === queryTable }"
                  style="margin-top: 8px"
                  :style="{ padding: '16px 24px', backgroundColor: 'white' }"
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
                    @operationClick="onOperationClick"
                  >
                    <template #pagination>
                      <el-row
                        justify="end"
                        style="margin-top: 10px"
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
            </el-main>
          </el-container>
        </el-main>
      </el-container>
    </template>
    <template v-else>
      <el-container :style="{ height: height ? height : '100%' }">
        <el-aside
          width="265px"
          class="left-panel"
          v-if="leftWidget != null"
          @click.stop="onLeftWidgetClick"
        >
          <div class="title">
            <el-row align="middle" style="flex-wrap: nowrap">
              <span class="name">{{ leftWidget.showName }}</span>
              <el-input
                class="search round-search"
                :prefix-icon="Search"
                v-model="leftFilter"
                clearable
                :size="layoutStore.defaultFormItemSize"
                style="border-radius: 16px"
                :placeholder="'输入' + leftWidget.showName"
              />
            </el-row>
          </div>
          <el-scrollbar class="custom-scroll tree" style="flex-grow: 1">
            <div
              class="widget-item"
              :class="{ active: dialogParams.isEdit && currentWidget === leftWidget }"
            >
              <OnlineCustomWidget
                :widget="leftWidget"
                :ref="leftWidget.variableName"
                :value="getWidgetValue(leftWidget)"
                @input="val => onValueChange(leftWidget, val as ANY_OBJECT)"
                @change="onLeftWidgetChange"
              />
            </div>
          </el-scrollbar>
        </el-aside>
        <el-main class="table-panel" style="overflow: hidden; margin-left: 15px">
          <div
            class="query-filter-box"
            v-if="activeWidgetList.length > 0 || isEdit"
            :style="{
              background: dialogParams.isEdit ? undefined : '#F6F7F9',
              border: dialogParams.isEdit ? '1px solid #e8eaec' : 'none',
            }"
          >
            <OnlineFilterBox
              :isEdit="dialogParams.isEdit"
              ref="filterBox"
              :isAdvance="true"
              style="margin-bottom: 16px"
              :itemWidth="form.filterItemWidth || 350"
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
          </div>
          <div
            class="query-table-box widget-item"
            :class="{ active: dialogParams.isEdit && currentWidget === queryTable }"
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
              @operationClick="onOperationClick"
              @refresh="refreshTable(false)"
            >
              <template #pagination>
                <el-row
                  justify="end"
                  style="margin-top: 10px"
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
        </el-main>
      </el-container>
    </template>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';
import { Close, Search, Plus, Delete, Download, Upload } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { findItemFromList } from '@/common/utils';
import OnlineCustomWidget from '@/online/components/OnlineCustomWidget.vue';
import OnlineCustomTable from '@/online/components/OnlineCustomTable.vue';
import { DialogProp } from '@/components/Dialog/types';
import { ANY_OBJECT } from '@/types/generic';
import { useTable } from '@/common/hooks/useTable';
import { TableOptions } from '@/common/types/pagination';
import {
  OnlineFormEventType,
  SysCustomWidgetBindDataType,
  SysCustomWidgetOperationType,
} from '@/common/staticDict';
import { download, post } from '@/common/http/request';
import { SysOnlineColumnFilterType } from '@/common/staticDict/online';
import { TableData } from '@/common/types/table';
import { useUpload } from '@/common/hooks/useUpload';
import widgetData from '@/online/config/index';
import { useLayoutStore } from '@/store';
import OnlineFilterBox from '../OnlineQueryForm/OnlineFilterBox.vue';
import { useDict } from '../../hooks/useDict';
import { useForm } from '../hooks/useForm';
import { useFormExpose } from '../hooks/useFormExpose';

const { fetchUpload } = useUpload();

const emit = defineEmits<{
  widgetClick: [ANY_OBJECT | null];
  tableClick: [ANY_OBJECT];
}>();

const props = withDefaults(
  defineProps<{
    formConfig: ANY_OBJECT;
    height?: string;
    // 主表数据
    masterTableData?: ANY_OBJECT;
    // 是否表单编辑模式
    isEdit?: boolean;
    // 是否复制
    isCopy?: boolean;
    readOnly?: boolean;
    // 当前选中组件
    currentWidget?: ANY_OBJECT | null;
    // 需要编辑数据，如果是null则是新增
    rowData?: ANY_OBJECT;
    // 是否全屏弹窗
    fullscreen?: boolean;
    mode?: string;
    // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
    dialog?: DialogProp<ANY_OBJECT>;
  }>(),
  {
    isEdit: false,
    readOnly: false,
    fullscreen: false,
    mode: 'pc',
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
  getWidgetProp,
  getWidgetVisible,
  onValueChange,
  onWidgetValueChange,
  getPrimaryData,
  getDropdownParams,
  checkOperationPermCode,
  checkOperationDisabled,
  checkOperationVisible,
  cloneWidget,
  handlerOperation,
  loadOnlineFormConfig,
  getTableData,
  setTableData,
  initPage,
  initFormWidgetList,
  initWidgetLinkage,
  onPrint,
  onStartFlow,
} = useForm(props);

provide('form', () => {
  return {
    ...form.value,
    mode: props.mode || 'pc',
    isEdit: dialogParams.value.isEdit,
    readOnly: dialogParams.value.readOnly,
    formData: formData,
    getWidgetValue: getWidgetValue,
    getWidgetProp: getWidgetProp,
    getWidgetVisible: getWidgetVisible,
    onValueChange: onValueChange,
    onWidgetValueChange: onWidgetValueChange,
    getTableData: getTableData,
    setTableData: setTableData,
    getPrimaryData: getPrimaryData,
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
    filter: {
      name: leftFilter.value,
    },
    instanceData: () => useFormExpose(formData),
  };
});

const filterBox = ref();
const selectRows = ref<ANY_OBJECT[]>([]);
const batchDelete = ref(false);
const leftFilter = ref<string>();

const getQueryParamItem = (widget: ANY_OBJECT) => {
  if (widget == null) return;
  if (widget.bindData.dataType !== SysCustomWidgetBindDataType.Column || widget.column == null)
    return;
  let column = widget.column;
  let paramValue = getWidgetValue(widget);
  if (
    paramValue == null ||
    paramValue === '' ||
    (Array.isArray(paramValue) && paramValue.length === 0)
  )
    return;

  const temp: ANY_OBJECT = {
    tableName: widget.table.tableName,
    columnName: widget.column.columnName,
    filterType: widget.column.filterType,
    columnValue:
      widget.column.filterType !== SysOnlineColumnFilterType.RANFGE_FILTER ? paramValue : undefined,
  };

  if (column.filterType === SysOnlineColumnFilterType.RANFGE_FILTER) {
    temp.columnValueStart = paramValue[0];
    temp.columnValueEnd = paramValue[1];
  }

  return temp;
};
const getQueryParams = () => {
  let queryParams: ANY_OBJECT[] = [];
  if (Array.isArray(activeWidgetList.value)) {
    queryParams = activeWidgetList.value
      .map(widget => {
        return getQueryParamItem(widget);
      })
      .filter(item => item != null) as ANY_OBJECT[];
  }

  if (leftWidget.value != null) {
    let temp = getQueryParamItem(leftWidget.value);
    if (temp) queryParams.push(temp);
  }

  return queryParams;
};
const loadTableData = (params: ANY_OBJECT) => {
  return new Promise((resolve, reject) => {
    let table = form.value.tableMap.get(queryTable.value.bindData.tableId);
    let httpCall = null;
    params.datasourceId = table.datasource.datasourceId;
    params.filterDtoList = getQueryParams();

    if (queryTable.value.relation != null && dialogParams.value.masterTableData != null) {
      // 如果是从主表跳转过来的，加上主表关联字段的过滤
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
      httpCall = post<TableData<ANY_OBJECT>>(
        '/admin/online/onlineOperation/listByOneToManyRelationId/' + table.datasource.variableName,
        params,
      );
    } else {
      httpCall = post<TableData<ANY_OBJECT>>(
        '/admin/online/onlineOperation/listByDatasourceId/' + table.datasource.variableName,
        params,
      );
    }

    httpCall
      .then(res => {
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
  paged: (props.formConfig || dialogParams.value.formConfig).tableWidget.props.paged,
};
const queryTableWidget = ref(useTable(tableOptions));

const leftWidget = computed(() => {
  return form.value.leftWidget;
});
const queryTable = computed<ANY_OBJECT>(() => {
  return form.value.tableWidget;
});
const activeWidgetList = computed(() => {
  return form.value.widgetList;
});
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

// TODO 弹窗关闭
const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
  // else {
  //   this.onCloseThirdDialog();
  // }
};
const onCopyWidget = (widget: ANY_OBJECT) => {
  activeWidgetList.value.push(widget);
};
const onWidgetClick = (widget: ANY_OBJECT | null) => {
  emit('widgetClick', widget);
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
const onTableClick = () => {
  emit('tableClick', queryTable.value);
};
const onLeftWidgetClick = () => {
  emit('widgetClick', form.value.leftWidget);
};
const onSelectRowChange = (rows: ANY_OBJECT[]) => {
  selectRows.value = rows;
};
const refreshTable = (reloadData = false) => {
  if (dialogParams.value.isEdit) return;
  if (reloadData) {
    queryTableWidget.value.refreshTable(true, 1);
  } else {
    queryTableWidget.value.refreshTable();
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
        '/admin/online/onlineOperation/deleteBatchOneToManyRelation/' +
          table.datasource.variableName,
        params,
      );
    } else {
      httpCall = post(
        '/admin/online/onlineOperation/deleteBatchDatasource/' + table.datasource.variableName,
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
  })
    .then(() => {
      let table = form.value.tableMap.get(queryTable.value.bindData.tableId);
      let params = {
        datasourceId: table.datasource.datasourceId,
        relationId: (table.relation || {}).relationId,
        dataId: row[primaryColumnName.value],
      };
      let httpCall = null;
      if (params.relationId) {
        httpCall = post(
          '/admin/online/onlineOperation/deleteOneToManyRelation/' + table.datasource.variableName,
          params,
        );
      } else {
        httpCall = post(
          '/admin/online/onlineOperation/deleteDatasource/' + table.datasource.variableName,
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
    })
    .catch(e => {
      console.warn(e);
    });
};
const onExport = (operation: ANY_OBJECT) => {
  ElMessageBox.confirm('是否导出表格数据？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
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
          '/admin/online/onlineOperation/exportByOneToManyRelationId/' +
            table.datasource.variableName,
          params,
          queryTable.value.showName + '.xlsx',
        );
      } else {
        httpCall = download(
          '/admin/online/onlineOperation/exportByDatasourceId/' + table.datasource.variableName,
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
    })
    .catch(e => {
      console.warn(e);
    });
};
const onReset = () => {
  refreshTable(true);
};
const initFormData = () => {
  refreshTable(true);
};
const resetWidget = (widget: ANY_OBJECT) => {
  if (filterBox.value) filterBox.value.resetWidget(widget);
};
const hasOperator = (type: string) => {
  let temp = getOperation(type);
  return temp && temp.enabled;
};
const getOperation = (type: string) => {
  return findItemFromList(form.value.operationList, type, 'type');
};
const operationVisible = (type: string) => {
  let operation = getOperation(type);
  return !form.value.readOnly && hasOperator(type) && checkOperationVisible(operation);
};
const operationDisabled = (type: string) => {
  let operation = getOperation(type);
  return checkOperationDisabled(operation) || !checkOperationPermCode(operation);
};
const onLeftWidgetChange = (val: ANY_OBJECT | undefined, dictData: ANY_OBJECT | null) => {
  onWidgetValueChange(leftWidget.value, val, dictData);
  nextTick(() => {
    console.log('onLeftWidgetChange', val, formData.dsTeacher.level);
    refreshTable(true);
  });
};
const onOperationClick = (operation: ANY_OBJECT | null, row: ANY_OBJECT | null = null) => {
  if (dialogParams.value.isEdit) return;
  if (operation == null) {
    console.warn('operation is null');
    return;
  }
  if (operation.type === SysCustomWidgetOperationType.BATCH_DELETE) {
    onBatchDelete();
  } else if (operation.type === SysCustomWidgetOperationType.DELETE) {
    row && onDeleteRow(row);
  } else if (operation.type === SysCustomWidgetOperationType.EXPORT) {
    onExport(operation);
  } else if (operation.type === SysCustomWidgetOperationType.PRINT) {
    onPrint(operation, row, selectRows.value, queryTable.value.showName + '.pdf');
  } else if (operation.type === SysCustomWidgetOperationType.START_FLOW) {
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

defineExpose({ resetWidget });

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
.round-search :deep(.el-input__wrapper) {
  border-radius: 16px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 2px solid #e8e8e8;
}
.left-panel .title {
  flex-shrink: 0;
  padding: 20px;
  font-size: 16px;
  color: #333;
  flex-grow: 0;
  font-weight: 400;
  border-bottom: 2px solid #e8e8e8;
}

.left-panel .title .name {
  flex-grow: 0;
  flex-shrink: 0;
}
.left-panel .title .search {
  flex-shrink: 1;
  min-width: 50px;
  margin-left: 10px;
  flex-grow: 1;
}
.online-advance-query-form {
  height: 100%;
}
.online-advance-query-form .table-panel {
  display: flex;
  flex-direction: column;
}
.online-advance-query-form .query-filter-box {
  flex-grow: 0;
  flex-shrink: 0;
}

.online-advance-query-form .query-table-box {
  flex-shrink: 1;
  height: 200px;
  flex-grow: 1;
}
.table-wrap {
  display: flex;
  padding-bottom: 16px;
  background-color: white;
  flex: 1;
  flex-direction: column;
}
.table-operation {
  display: inline-block;
}
.table-operation + .table-operation {
  margin-left: 8px;
}
</style>

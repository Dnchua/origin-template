<template>
  <table-box
    ref="table"
    style="height: 100%"
    :data="dataList"
    :key="tableKey"
    show-overflow="title"
    show-header-overflow="title"
    class="draggable-widget page-table"
    header-cell-class-name="table-header-gray"
    :hasImageColumn="hasImageColumn"
    :size="layoutStore.defaultFormItemSize"
    :keep-source="rowEdit"
    :edit-config="{
      trigger: 'manual',
      mode: 'row',
      enabled: rowEdit,
      showIcon: false,
      autoClear: false,
      showStatus: true,
    }"
    :edit-closed="onSaveRowData"
    :seq-config="{ seqMethod }"
    :hasExtend="hasExtend"
    @sort-change="onSortChange"
    @checkbox-select-change="onCheckBoxChange"
    @radio-select-change="onRadioSelectChange"
    :sort-config="{ remote: remoteSort }"
    @refresh="onRefresh"
  >
    <template
      v-slot:operator
      v-if="
        operationList.filter(row => {
          return row.enabled && !row.rowOperation;
        }).length > 0 && !form().readOnly
      "
    >
      <el-button
        class="table-operation"
        v-if="operationVisible(SysCustomWidgetOperationType.BATCH_DELETE)"
        :size="layoutStore.defaultFormItemSize"
        :type="getOperation(SysCustomWidgetOperationType.BATCH_DELETE).btnType"
        :plain="getOperation(SysCustomWidgetOperationType.BATCH_DELETE).plain"
        :disabled="operationDisabled(SysCustomWidgetOperationType.BATCH_DELETE)"
        @click="onOperationClick(getOperation(SysCustomWidgetOperationType.BATCH_DELETE))"
        :icon="Delete"
        >{{ getOperation(SysCustomWidgetOperationType.BATCH_DELETE).name || '批量删除' }}</el-button
      >
      <el-button
        class="table-operation"
        v-if="operationVisible(SysCustomWidgetOperationType.EXPORT)"
        :size="layoutStore.defaultFormItemSize"
        :type="getOperation(SysCustomWidgetOperationType.EXPORT).btnType"
        :plain="getOperation(SysCustomWidgetOperationType.EXPORT).plain"
        :disabled="operationDisabled(SysCustomWidgetOperationType.EXPORT)"
        @click="onOperationClick(getOperation(SysCustomWidgetOperationType.EXPORT))"
        :icon="Download"
        >{{ getOperation(SysCustomWidgetOperationType.EXPORT).name || '导出' }}</el-button
      >
      <el-button
        class="table-operation"
        v-if="operationVisible(SysCustomWidgetOperationType.PRINT)"
        :size="layoutStore.defaultFormItemSize"
        :type="getOperation(SysCustomWidgetOperationType.PRINT).btnType"
        :plain="getOperation(SysCustomWidgetOperationType.PRINT).plain"
        :disabled="operationDisabled(SysCustomWidgetOperationType.PRINT)"
        @click="onOperationClick(getOperation(SysCustomWidgetOperationType.PRINT))"
        >{{ getOperation(SysCustomWidgetOperationType.PRINT).name || '打印' }}</el-button
      >
      <el-button
        class="table-operation"
        v-if="operationVisible(SysCustomWidgetOperationType.ADD)"
        :size="layoutStore.defaultFormItemSize"
        :type="getOperation(SysCustomWidgetOperationType.ADD).btnType"
        :plain="getOperation(SysCustomWidgetOperationType.ADD).plain"
        :disabled="operationDisabled(SysCustomWidgetOperationType.ADD)"
        @click="onOperationClick(getOperation(SysCustomWidgetOperationType.ADD))"
        :icon="Plus"
        >{{ getOperation(SysCustomWidgetOperationType.ADD).name || '新建' }}</el-button
      >
    </template>
    <vxe-column v-if="hasBatchOperation && !form().readOnly" type="checkbox" :width="50" />
    <vxe-column v-if="singleSelect" type="radio" align="center" :width="50" />
    <vxe-column v-if="tableColumnList.length > 0" type="seq" title="序号" :width="50" />
    <template v-for="tableColumn in tableColumnList" :key="tableColumn.column?.columnId">
      <!-- Boolean类型字段 -->
      <vxe-column
        v-if="tableColumn.column && tableColumn.column.objectFieldType === 'Boolean'"
        :title="tableColumn.showName"
        :width="tableColumn.columnWidth"
      >
        <template #default="{ row }">
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            :type="getObjectValue(row, tableColumn.showFieldName) ? 'success' : 'danger'"
          >
            {{ getObjectValue(row, tableColumn.showFieldName) ? '是' : '否' }}
          </el-tag>
        </template>
      </vxe-column>
      <!-- 图片类型字段 -->
      <vxe-column
        v-else-if="
          tableColumn.column && tableColumn.column.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE
        "
        :title="tableColumn.showName"
        :width="tableColumn.columnWidth"
      >
        <template #default="{ row }">
          <el-image
            v-for="item in parseTableUploadData(tableColumn, row)"
            :preview-src-list="getTablePictureList(tableColumn, row)"
            class="table-cell-image"
            :key="item.url"
            :src="item.url"
            fit="fill"
          >
            <template v-slot:error>
              <div class="table-cell-image">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </vxe-column>
      <!-- 文件下载类型字段 -->
      <vxe-column
        v-else-if="tableColumn.column && tableColumn.column.fieldKind === SysOnlineFieldKind.UPLOAD"
        :title="tableColumn.showName"
        :width="tableColumn.columnWidth"
      >
        <template #default="{ row }">
          <a
            v-for="item in parseTableUploadData(tableColumn, row)"
            :key="item.url"
            href="javascript:void(0);"
            @click="downloadFile(item.url, item.name)"
          >
            {{ item.name }}
          </a>
        </template>
      </vxe-column>
      <!-- 其他类型 -->
      <vxe-column
        v-else
        :title="tableColumn.showName"
        :field="tableColumn.showFieldName"
        :width="tableColumn.columnWidth"
        :sortable="tableColumn.sortable"
      />
    </template>
    <vxe-column
      title="操作"
      :width="widget.props.operationColumnWidth || 160"
      fixed="right"
      :show-overflow="false"
      v-if="(rowEdit || tableOperationList.length > 0) && tableColumnList.length > 0"
    >
      <template #default="{ row }">
        <el-button
          v-for="operation in tableOperationList"
          :key="operation.id"
          v-show="form().checkOperationVisible(operation, row)"
          :size="layoutStore.defaultFormItemSize"
          link
          :class="operation.btnClass"
          :disabled="
            !form().checkOperationPermCode(operation) ||
            form().checkOperationDisabled(operation, row)
          "
          @click="onOperationClick(operation, row)"
        >
          {{ operation.name }}
        </el-button>
      </template>
    </vxe-column>
    <template v-slot:empty>
      <div class="table-empty unified-font">
        <img src="@/assets/img/empty.png" />
        <span>暂无数据</span>
      </div>
    </template>
    <template v-slot:pagination>
      <slot name="pagination" />
    </template>
  </table-box>
</template>

<script setup lang="ts">
import { VxeColumn } from 'vxe-table';
import { Picture, Delete, Download, Plus } from '@element-plus/icons-vue';
import TableBox from '@/components/TableBox/index.vue';
import { useDownload } from '@/common/hooks/useDownload';
import { ANY_OBJECT } from '@/types/generic';
import { findItemFromList, getObjectValue } from '@/common/utils';
import { SysCustomWidgetOperationType } from '@/common/staticDict';
import { SysOnlineFieldKind } from '@/common/staticDict/online';
import { useUpload } from '@/common/hooks/useUpload';
import { SortInfo } from '@/common/types/sortinfo';
import { API_CONTEXT } from '@/api/config';
import { useLayoutStore } from '@/store';

const layoutStore = useLayoutStore();
const { downloadFile } = useDownload();
const { parseUploadData } = useUpload();

const emit = defineEmits<{
  delete: [ANY_OBJECT];
  operationClick: [ANY_OBJECT, ANY_OBJECT | null];
  refresh: [];
}>();
const props = withDefaults(
  defineProps<{
    dataList?: Array<ANY_OBJECT>;
    height?: string | number;
    border?: string;
    // 是否支持行内编辑
    rowEdit?: boolean;
    // 是否支持多选
    multiSelect?: boolean;
    // 是否支持单选
    singleSelect?: boolean;
    // 表格操作列表
    operationList?: Array<ANY_OBJECT>;
    widget: ANY_OBJECT;
    // 获取行序号
    getTableIndex?: (value: number) => number;
    // 排序改变
    sortChange?: (value: SortInfo) => void;
    // 多选选中改变
    onSelectChange?: (values: Array<ANY_OBJECT>) => void;
    // 单选中改变
    onRadioChange?: (value: ANY_OBJECT) => void;
  }>(),
  {
    dataList: () => [],
    height: 'auto',
    border: 'full',
    rowEdit: false,
    multiSelect: false,
    singleSelect: false,
    operationList: () => [],
  },
);

const table = ref();
const form = inject('form', () => {
  console.error('OnlineCustomTable: form not injected');
  return { isEdit: false } as ANY_OBJECT;
});

const slots = useSlots();

// const editInfo = reactive<ANY_OBJECT>({
//   editRow: undefined,
// });
const sortInfo = ref<SortInfo | null>(null);

const buildFlowParam = computed(() => {
  let flowParam: ANY_OBJECT = {};
  let flowData = form().flowData;
  if (flowData) {
    if (flowData.processDefinitionKey)
      flowParam.processDefinitionKey = flowData.processDefinitionKey;
    if (flowData.processInstanceId) flowParam.processInstanceId = flowData.processInstanceId;
    if (flowData.taskId) flowParam.taskId = flowData.taskId;
  }

  return flowParam;
});
const tableColumnList = computed(() => {
  let tempList =
    props.widget && props.widget.props && Array.isArray(props.widget.props.tableColumnList)
      ? props.widget.props.tableColumnList
      : [];
  const res: ANY_OBJECT[] = [];
  for (const tempItem of tempList) {
    const item = { ...tempItem };
    if (item.fieldType === 0 || item.fieldType == null) {
      // 绑定表字段
      if (item.column) item.showFieldName = item.column.columnName;
      if (props.widget.relation == null && item.relation != null) {
        item.showFieldName = item.relation.variableName + '.' + item.showFieldName;
      }
      if (item.column && item.column.dictInfo) {
        item.showFieldName = item.showFieldName + 'DictMap.name';
      }
    } else {
      // 自定义字段
      item.showFieldName = item.customFieldName;
    }
    res.push(item);
  }
  return res;
});
const tableOperationList = computed(() => {
  return props.operationList.filter(item => {
    let temp = item.enabled && item.rowOperation;
    if (temp && form().readOnly) {
      temp = temp && item.readOnly;
    }
    return temp;
  });
});
const hasBatchOperation = computed(() => {
  let batchDeleteOperation = findItemFromList(
    props.operationList,
    SysCustomWidgetOperationType.BATCH_DELETE,
    'type',
  );
  let printOperation = findItemFromList(
    props.operationList,
    SysCustomWidgetOperationType.PRINT,
    'type',
  );
  return (
    (batchDeleteOperation != null && batchDeleteOperation.enabled) ||
    (printOperation != null && printOperation.enabled && !printOperation.rowOperation)
  );
});
const hasImageColumn = computed(() => {
  return (
    tableColumnList.value.filter((tableColumn: ANY_OBJECT) => {
      return tableColumn.column && tableColumn.column.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE;
    }).length > 0
  );
});
const tableKey = computed(() => {
  return (props.widget || {}).variableName + new Date().getTime() + tableColumnList.value.length;
});
const remoteSort = computed(() => {
  return props.widget ? (props.widget.props || {}).paged : false;
});
const hasExtend = computed(() => {
  return (
    (props.operationList.filter(row => {
      return row.enabled && !row.rowOperation;
    }).length > 0 &&
      !form().readOnly) ||
    (slots.operator && slots.operator()) != null
  );
});

const onRefresh = () => {
  emit('refresh');
};
const hasOperator = (type: string) => {
  let temp = getOperation(type);
  return temp && temp.enabled;
};
const getOperation = (type: string) => {
  return findItemFromList(props.operationList, type, 'type') || {};
};
const operationVisible = (type: string) => {
  let operation = getOperation(type);
  if (!operation) return false;
  return !form().readOnly && hasOperator(type) && form().checkOperationVisible(operation);
};
const operationDisabled = (type: string) => {
  let operation = getOperation(type);
  return form().checkOperationDisabled(operation) || !form().checkOperationPermCode(operation);
};
const seqMethod = (data: ANY_OBJECT) => {
  if (props.getTableIndex) {
    return props.getTableIndex(data.seq - 1);
  } else {
    return data.seq;
  }
};
const onSortChange = (data: ANY_OBJECT) => {
  if (!props.widget.props.paged) return;
  let fieldName = data.property.replace('DictMap.name', '');
  let order = data.order;
  if (order == null) {
    fieldName = undefined;
  }
  if (order === 'asc') order = 'ascending';
  if (
    sortInfo.value != null &&
    sortInfo.value?.prop === fieldName &&
    sortInfo.value?.order === order
  ) {
    return;
  }
  sortInfo.value = {
    prop: fieldName,
    order: order,
  };
  if (props.sortChange) {
    props.sortChange(sortInfo.value);
  }
};
const onCheckBoxChange = () => {
  if (table.value && typeof props.onSelectChange === 'function') {
    let selectRows = table.value.getTableImpl().getCheckboxRecords(true);
    props.onSelectChange(selectRows);
  }
};
const onRadioSelectChange = () => {
  if (table.value && typeof props.onRadioChange === 'function') {
    let selectRow = table.value.getTableImpl().getRadioRecord();
    props.onRadioChange(selectRow);
  }
};
const setSelectedRow = (rowNum: number) => {
  nextTick(() => {
    table.value.getTableImpl().setRadioRow(props.dataList[rowNum]);
    onRadioSelectChange();
  });
};
// 取消行内编辑
// const cancelRowEvent = (row: ANY_OBJECT) => {
//   if (form().isEdit) return;
//   table.value
//     .getTableImpl()
//     .clearActived()
//     .then(() => {
//       // 还原行数据
//       table.value.getTableImpl().revertData(row);
//       editInfo.editRow = undefined;
//     })
//     .catch(e => {
//       console.warn(e);
//     });
// };
// 启动行内编辑
// const editRowEvent = (row: ANY_OBJECT) => {
//   if (form().isEdit) return;
//   table.value.getTableImpl().setEditRow(row);
//   editInfo.editRow = row;
// };
// 保存行内编辑数据
// const saveRowEvent = (row: ANY_OBJECT) => {
//   if (form().isEdit) return;
//   table.value
//     .getTableImpl()
//     .clearActived()
//     .then(() => {
//       table.value.getTableImpl().reloadRow(row);
//       editInfo.editRow = undefined;
//     });
// };
const onSaveRowData = ({ row }: { row: ANY_OBJECT }) => {
  console.log(row);
};
const onOperationClick = (operation: ANY_OBJECT, row: ANY_OBJECT | null = null) => {
  emit('operationClick', operation, row);
};
const refreshColumn = () => {
  nextTick(() => {
    if (table.value) table.value.getTableImpl().refreshColumn();
  });
};
const getDownloadUrl = (tableColumn: ANY_OBJECT) => {
  let downloadUrl = null;
  if (form().flowData != null) {
    downloadUrl = API_CONTEXT + '/flow/flowOnlineOperation/download';
  } else {
    if (tableColumn.relationId) {
      downloadUrl =
        API_CONTEXT +
        '/online/onlineOperation/downloadOneToManyRelation/' +
        (props.widget.datasource || {}).variableName;
    } else {
      downloadUrl =
        API_CONTEXT +
        '/online/onlineOperation/downloadDatasource/' +
        (props.widget.datasource || {}).variableName;
    }
  }

  return downloadUrl;
};
const parseTableUploadData = (tableColumn: ANY_OBJECT, row: ANY_OBJECT) => {
  let jsonData = getObjectValue(row, tableColumn.showFieldName);
  console.log('parseTableUploadData', tableColumn, row, jsonData);
  if (!jsonData) return [];
  let downloadParams: ANY_OBJECT = {
    ...buildFlowParam.value,
    datasourceId: props.widget.datasource.datasourceId,
    relationId: tableColumn.relationId,
    fieldName: tableColumn.column?.columnName,
    asImage: tableColumn.column?.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE,
  };

  if (props.widget.primaryColumnName != null) {
    downloadParams.dataId = row[props.widget.primaryColumnName] || '';
  }

  let downloadUrl = getDownloadUrl(tableColumn);

  console.log('parseTableUploadData downloadUrl', downloadUrl);
  console.log('parseTableUploadData jsonData.toString()', jsonData.toString());
  let temp = JSON.parse(jsonData.toString());
  temp = Array.isArray(temp)
    ? temp.map(item => {
        return {
          ...item,
          downloadUri: downloadUrl,
        };
      })
    : [];
  return parseUploadData(JSON.stringify(temp), downloadParams);
};
const getTablePictureList = (tableColumn: ANY_OBJECT, row: ANY_OBJECT) => {
  let temp = parseTableUploadData(tableColumn, row);
  if (Array.isArray(temp)) {
    return temp.map(item => item.url);
  }
};
const formatListData = (data: ANY_OBJECT) => {
  Object.keys(data).forEach(key => {
    let subData = data[key];
    if (typeof subData === 'object' && key.indexOf('DictMap') === -1) {
      formatListData(subData);
    } else {
      // 如果是多选字典字段，那么把选中的字典值拼接成DictMap去显示
      if (key.indexOf('DictMapList') !== -1 && Array.isArray(data[key])) {
        let newKey = key.replace('DictMapList', 'DictMap');
        data[newKey] = {
          id: data[key.replace('DictMapList', '')],
          name: data[key].map((subItem: ANY_OBJECT) => subItem.name).join(','),
        };
      }
    }
  });
};

watch(
  () => props.dataList,
  () => {
    if (Array.isArray(props.dataList)) {
      props.dataList.forEach(item => {
        formatListData(item);
      });
      //console.log('OnlineCumstomTable.dataList', props.dataList);
    }
  },
  {
    immediate: true,
  },
);
watch(
  () => tableColumnList.value,
  () => {
    refreshColumn();
  },
  {
    immediate: true,
  },
);
watch(
  () => props.widget.props.operationColumnWidth,
  () => {
    refreshColumn();
  },
);

defineExpose({
  setSelectedRow,
});
</script>

<style scoped>
.table-operation {
  display: inline-block;
}
.table-operation + .table-operation {
  margin-left: 8px;
}
</style>

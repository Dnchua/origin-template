<template>
  <vxe-table
    ref="table"
    :key="tableKey"
    :data="dataList"
    :height="height"
    show-overflow="title"
    show-header-overflow="title"
    header-cell-class-name="table-header-gray"
    :keep-source="false"
    :row-config="{ height: rowHeight, isHover: true }"
    :seq-config="{ seqMethod }"
    @sort-change="onSortChange"
    :sort-config="{ remote: remoteSort }"
  >
    <vxe-column v-if="tableColumnList.length > 0" type="seq" title="序号" :width="60" />
    <vxe-column title="工单编号" show-overflow="tooltip" field="workOrderCode" :width="200" />
    <template v-for="tableColumn in tableColumnList" :key="tableColumn.id">
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
    <vxe-column title="当前任务" field="runtimeTaskInfo.taskName" :min-width="100" />
    <vxe-column title="流程创建时间" field="createTime" :min-width="180" />
    <vxe-column title="流程状态" field="latestApprovalStatusDictMap.name" :min-width="100" />
    <vxe-column title="工单状态" field="flowStatusShowName" :min-width="100" />
    <vxe-column title="操作" :width="160" fixed="right" :show-overflow="false">
      <template #default="{ row }">
        <el-button
          link
          :size="layoutStore.defaultFormItemSize"
          v-if="getPrintOperation != null"
          :class="getPrintOperation.btnClass"
          @click.stop="onPrint(getPrintOperation, row)"
        >
          {{ getPrintOperation.name || '打印' }}
        </el-button>
        <el-button
          link
          type="primary"
          :size="layoutStore.defaultFormItemSize"
          v-if="(row.initTaskInfo || {}).taskKey !== (row.runtimeTaskInfo || {}).taskKey"
          @click.stop="onViewWorkOrder(row)"
        >
          详情
        </el-button>
        <el-button
          link
          type="primary"
          :size="layoutStore.defaultFormItemSize"
          v-if="(row.initTaskInfo || {}).taskKey === (row.runtimeTaskInfo || {}).taskKey"
          @click.stop="onHandlerWorkOrder(row)"
        >
          办理
        </el-button>
        <el-button
          link
          type="primary"
          :size="layoutStore.defaultFormItemSize"
          @click.stop="onHandlerRemindClick(row)"
        >
          催办
        </el-button>
        <el-button
          link
          type="primary"
          :size="layoutStore.defaultFormItemSize"
          @click.stop="onCancelWorkOrder(row)"
        >
          撤销
        </el-button>
      </template>
    </vxe-column>
    <template v-slot:empty>
      <div class="table-empty unified-font">
        <img src="@/assets/img/empty.png" />
        <span>暂无数据</span>
      </div>
    </template>
  </vxe-table>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { Picture } from '@element-plus/icons-vue';
import { VxeTable, VxeColumn } from 'vxe-table';
import { ANY_OBJECT } from '@/types/generic';
import { SortInfo } from '@/common/types/sortinfo';
import { SysOnlineFieldKind } from '@/common/staticDict/online';
import { findItemFromList, getObjectValue } from '@/common/utils';
import { SysCustomWidgetOperationType } from '@/common/staticDict';
import widgetData from '@/online/config/index';
import { downloadBlob, post } from '@/common/http/request';
import { useDownload } from '@/common/hooks/useDownload';
import { useUpload } from '@/common/hooks/useUpload';
import { API_CONTEXT } from '@/api/config';
import { useLayoutStore } from '@/store';

const layoutStore = useLayoutStore();
const emit = defineEmits<{
  viewWorkOrder: [ANY_OBJECT, ANY_OBJECT | null];
  handlerWorkOrder: [ANY_OBJECT, ANY_OBJECT | null];
  handlerRemind: [ANY_OBJECT, ANY_OBJECT | null];
  cancelWorkOrder: [ANY_OBJECT, ANY_OBJECT | null];
}>();

interface IProps {
  widget: ANY_OBJECT;
  dataList?: ANY_OBJECT[];
  height?: number | string;
  border?: string;
  // 是否支持行内编辑
  rowEdit?: boolean;
  // 是否支持多选
  multiSelect?: boolean;
  // 表格操作列表
  operationList?: ANY_OBJECT[];
  // 获取行序号
  getTableIndex?: (value: number) => number;
  // 排序改变
  sortChange?: (value: SortInfo) => void;
  // 多选选中改变
  onSelectChange?: (values: Array<ANY_OBJECT>) => void;
  // 单选中改变
  onRadioChange?: (value: ANY_OBJECT) => void;
}
const props = withDefaults(defineProps<IProps>(), {
  isEdit: false,
  dataList: () => [],
  height: 'auto',
  border: 'full',
  rowEdit: false,
  multiSelect: false,
  operationList: () => [],
});

const form = inject('form', () => {
  console.error('OnlineCustomWorkFlowTable: form not injected');
  return { isEdit: false } as ANY_OBJECT;
});
const { downloadFile } = useDownload();
const { parseUploadData } = useUpload();

const table = ref();
const sortInfo = ref<SortInfo | null>();
const tableColumnList = computed(() => {
  let tempList =
    props.widget && props.widget.props && Array.isArray(props.widget.props.tableColumnList)
      ? props.widget.props.tableColumnList
      : [];
  tempList = tempList.map(item => {
    return {
      ...item,
    };
  });
  tempList.forEach((item: ANY_OBJECT) => {
    if (item.fieldType === 0 || item.fieldType == null) {
      // 绑定表字段
      item.showFieldName =
        'masterData.' +
        (item.relation ? item.relation.variableName : '') +
        (item.column || {}).columnName;
      if ((item.column || {}).dictInfo) {
        item.showFieldName = item.showFieldName + 'DictMap.name';
      }
    } else {
      // 自定义字段
      item.showFieldName = item.customFieldName;
    }
  });
  return tempList;
});
const hasImageColumn = computed(() => {
  return (
    tableColumnList.value.filter((tableColumn: ANY_OBJECT) => {
      return tableColumn.column && tableColumn.column.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE;
    }).length > 0
  );
});
const rowHeight = computed(() => {
  return hasImageColumn.value ? 80 : 35;
});
const tableKey = computed(() => {
  return (props.widget || {}).variableName + new Date().getTime() + tableColumnList.value.length;
});
const remoteSort = computed(() => {
  return false;
});
const getPrintOperation = computed(() => {
  let operation = findItemFromList(
    form().operationList,
    SysCustomWidgetOperationType.PRINT,
    'type',
  );
  return operation && operation.enabled ? operation : null;
});
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
    sortInfo.value.prop === fieldName &&
    sortInfo.value.order === order
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
const onViewWorkOrder = (row: ANY_OBJECT) => {
  emit('viewWorkOrder', row, widgetData.getWidgetAttribute(props.widget.widgetType));
};
const onHandlerWorkOrder = (row: ANY_OBJECT) => {
  emit('handlerWorkOrder', row, widgetData.getWidgetAttribute(props.widget.widgetType));
};
const onHandlerRemindClick = (row: ANY_OBJECT) => {
  emit('handlerRemind', row, widgetData.getWidgetAttribute(props.widget.widgetType));
};
const onCancelWorkOrder = (row: ANY_OBJECT) => {
  emit('cancelWorkOrder', row, widgetData.getWidgetAttribute(props.widget.widgetType));
};
const refreshColumn = () => {
  nextTick(() => {
    if (table.value) table.value.refreshColumn();
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
  if (jsonData == null) return [];
  let downloadParams: ANY_OBJECT = {
    ...buildFlowParam.value,
    datasourceId: props.widget.datasource.datasourceId,
    relationId: tableColumn.relationId,
    fieldName: tableColumn.column.columnName,
    asImage: tableColumn.column.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE,
  };

  if (props.widget.primaryColumnName != null) {
    downloadParams.dataId = row[props.widget.primaryColumnName] || '';
  }

  let downloadUrl = getDownloadUrl(tableColumn);

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
const getPrintParamItem = (row: ANY_OBJECT, printParamList: ANY_OBJECT[]) => {
  let param;
  if (Array.isArray(printParamList)) {
    param = printParamList
      .map(item => {
        let columnId = item.paramValue;
        if (columnId != null) {
          let column = form().columnMap.get(columnId);
          let value;
          if (column == null) {
            value = row[item.paramValue];
          } else {
            value = (row.masterData || {})[column.columnName];
          }
          if (item.paramName != null && value != null) {
            return {
              paramName: item.paramName,
              paramValue: value,
            };
          }
        }
        return null;
      })
      .filter(item => item != null);
  }

  return param;
};
const onPrint = (operation: ANY_OBJECT, row: ANY_OBJECT) => {
  if (operation == null || row == null || row.processDefinitionKey == null) return;
  let printParam;
  let temp = getPrintParamItem(row, operation.printParamList);
  printParam = temp ? [temp] : [];

  let params = {
    printId: operation.printTemplateId,
    printParams: printParam,
  };
  post<string>(
    API_CONTEXT + '/flow/flowOnlineOperation/printWorkOrder/' + row.processDefinitionKey,
    params,
  )
    .then(res => {
      let downloadUrl = res.data;
      downloadBlob(downloadUrl, {})
        .then((blobData: Blob) => {
          let pdfUrl = window.URL.createObjectURL(blobData);
          window.open('./lib/pdfjs/web/viewer.html?file=' + pdfUrl);
        })
        .catch(e => {
          console.log(e);
          ElMessage.error(e);
        });
    })
    .catch(e => {
      console.warn(e);
    });
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
          name: data[key].map((subItem: ANY_OBJECT) => subItem.name).join(', '),
        };
      }
    }
  });
};

watch(
  () => props.dataList,
  newVal => {
    if (newVal) {
      newVal.forEach(item => {
        formatListData(item.masterData);
      });
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  () => tableColumnList.value,
  () => {
    refreshColumn();
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  () => props.widget,
  () => {
    refreshColumn();
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

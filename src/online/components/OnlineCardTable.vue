<template>
  <el-card class="online-card-table base-card" shadow="never" :body-style="{ padding: '0px' }">
    <el-row>
      <el-col
        :span="24"
        :style="{
          height: widget.props.height != null ? widget.props.height - 53 + 'px' : undefined,
        }"
      >
        <OnlineCustomTable
          :dataList="tableWidget.dataList"
          :widget="widget"
          :height="widget.props.height ? widget.props.height - 53 : 200"
          border="default"
          :multiSelect="batchDelete"
          :operationList="widget.operationList"
          :getTableIndex="tableWidget.getTableIndex"
          :sortChange="tableWidget.onSortChange"
          :onSelectChange="onSelectRowChange"
          @operationClick="onOperationClick"
        />
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import { useTable } from '@/common/hooks/useTable';
import { TableOptions } from '@/common/types/pagination';
import { OnlineFormEventType, SysCustomWidgetOperationType } from '@/common/staticDict';
import { findItemFromList } from '@/common/utils';
import OnlineCustomTable from './OnlineCustomTable.vue';

const emit = defineEmits<{ input: [ANY_OBJECT[]] }>();

const props = withDefaults(
  defineProps<{
    value: Array<ANY_OBJECT>;
    widget: ANY_OBJECT;
  }>(),
  { value: () => [], isEdit: false, showBorder: true },
);

const form = inject('form', () => {
  console.error('OnlineCardTable: form not injected');
  return { isEdit: false } as ANY_OBJECT;
});

const selectRows = ref<ANY_OBJECT[]>([]);
const batchDelete = ref(false);

const loadTableData = () => {
  return Promise.resolve({
    dataList: props.value,
    totalCount: props.value.length,
  });
};
const loadTableDataVerify = () => {
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadTableData,
  verifyTableParameter: loadTableDataVerify,
};
const tableWidget = reactive(useTable(tableOptions));

const refresh = () => {
  tableWidget.refreshTable(true, 1);
};
watch(
  () => props.value,
  () => {
    refresh();
  },
  {
    deep: true,
    immediate: true,
  },
);

const handlerEditOperate = (row: ANY_OBJECT | null, res: ANY_OBJECT) => {
  if (props.widget.relation != null) {
    if (row == null) {
      console.log('新增记录', res, props, tableWidget);
      // 新增记录
      row = res[props.widget.relation.variableName];
      onTableDataListChange([
        ...tableWidget.dataList,
        {
          ...row,
          __cascade_add_id__: new Date().getTime(),
        },
      ]);
    } else {
      console.log('更新记录', res, props, tableWidget);
      // 更新记录
      row = res[props.widget.relation.variableName];
      onTableDataListChange(
        tableWidget.dataList.map((item: ANY_OBJECT) => {
          if (row != null && row.__cascade_add_id__ != null) {
            return row.__cascade_add_id__ === item.__cascade_add_id__ ? row : item;
          } else {
            return row != null &&
              row[props.widget.primaryColumnName] === item[props.widget.primaryColumnName]
              ? row
              : item;
          }
        }),
      );
    }
  }
};
const onSelectRowChange = (rows: ANY_OBJECT[]) => {
  selectRows.value = rows;
};
const onOperationClick = (operation: ANY_OBJECT, row: ANY_OBJECT | null) => {
  if (operation.type === SysCustomWidgetOperationType.BATCH_DELETE) {
    onBatchDelete(operation);
  } else if (operation.type === SysCustomWidgetOperationType.DELETE && row != null) {
    onDeleteRow(row);
  } else {
    console.log('OnlineCardTable onOperationClick -> form', operation, form());
    form().handlerOperation(operation, {
      isEdit: form().isEdit,
      saveData: false,
      widget: props.widget,
      rowData: row,
      callback: (res: ANY_OBJECT) => {
        handlerEditOperate(row, res);
      },
    });
  }
};
const onBatchDelete = (operation: ANY_OBJECT) => {
  console.log('onBatchDelete operation', operation);
  if (selectRows.value.length <= 0) {
    ElMessage.error('请选择要批量删除的数据！');
    return;
  }
  ElMessageBox.confirm('是否删除选中数据？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    onTableDataListChange(
      tableWidget.dataList.filter(row => {
        // 通过主键查找
        let temp = findItemFromList(
          selectRows.value,
          row[props.widget.primaryColumnName],
          props.widget.primaryColumnName,
        );
        // 通过新增临时主键查找
        if (temp == null && row.__cascade_add_id__ != null) {
          temp = findItemFromList(selectRows.value, row.__cascade_add_id__, '__cascade_add_id__');
        }
        return temp == null;
      }),
    );
  });
};
const onDeleteRow = (data: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除当前数据？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      onTableDataListChange(
        tableWidget.dataList.filter(row => {
          if (data.__cascade_add_id__ != null) {
            return data.__cascade_add_id__ !== row.__cascade_add_id__;
          } else {
            return data[props.widget.primaryColumnName] !== row[props.widget.primaryColumnName];
          }
        }),
      );
    })
    .catch(e => {
      console.warn(e);
    });
};
const onTableDataListChange = (dataList: ANY_OBJECT[]) => {
  emit('input', dataList);
};
</script>

<style scoped>
.base-card :deep(.el-card__header) {
  padding: 0 10px !important;
}
.online-card-table :deep(.vxe-table--border-line) {
  border: none !important;
}
</style>

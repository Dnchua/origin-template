<template>
  <MultiItemList
    :data="value"
    label="表格字段"
    :supportSort="true"
    @add="onEditTableColumn()"
    @edit="onEditTableColumn"
    @delete="onRemoveTableColumn"
    :prop="{
      label: 'showName',
      value: 'columnId',
    }"
  >
  </MultiItemList>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import MultiItemList from '@/components/MultiItemList/index.vue';
import { ANY_OBJECT } from '@/types/generic';
import { Dialog } from '@/components/Dialog';
import { SysOnlineFormType } from '@/common/staticDict';
import { useLayoutStore } from '@/store';
import EditOnlineTableColumn from './editOnlineTableColumn.vue';

const props = defineProps<{ value: ANY_OBJECT[] }>();
const layoutStore = useLayoutStore();
const formConfig = inject('formConfig', () => {
  console.error('OnlineTableColumnSetting: formConfig not injected');
  return {} as ANY_OBJECT;
});

const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdEditOnlineTableColumn' && data.isSuccess) {
    handlerEditOperate(data.rowData, data.data);
  }
};
defineExpose({ refreshData });

const emit = defineEmits<{ 'update:value': [ANY_OBJECT[]] }>();
const handlerEditOperate = (row: ANY_OBJECT | null, res: ANY_OBJECT) => {
  let tempList: ANY_OBJECT[] = [];
  if (row == null) {
    tempList = props.value || [];
    tempList.push(res);
  } else {
    tempList = (props.value || []).map(item => {
      if (res.fieldType === 0) {
        return item.columnId === res.columnId ? res : item;
      } else {
        return item.id === res.id ? res : item;
      }
    });
  }
  emit('update:value', tempList);
};
const onEditTableColumn = (row: ANY_OBJECT | null = null) => {
  let tableList = formConfig().getTableWidgetTableList;
  // 非查询页面只能从组件绑定的表中选择
  if (
    formConfig().form.formType !== SysOnlineFormType.QUERY &&
    formConfig().form.formType !== SysOnlineFormType.ADVANCE_QUERY
  ) {
    tableList = (tableList || []).filter((table: ANY_OBJECT) => {
      return table.tableId === formConfig().currentWidget.bindData.tableId;
    });
  }
  Dialog.show<ANY_OBJECT>(
    row ? '编辑字段' : '添加字段',
    EditOnlineTableColumn,
    {
      area: '600px',
    },
    {
      rowData: row,
      tableList: tableList,
      usedColumnList: props.value.map(item => item.columnId),
      path: 'thirdEditOnlineTableColumn',
    },
    {
      width: '600px',
      height: '500px',
      pathName: '/thirdParty/thirdEditOnlineTableColumn',
    },
  )
    .then(res => {
      handlerEditOperate(row, res);
    })
    .catch(e => {
      console.warn(e);
    });
};
const onRemoveTableColumn = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此表格列？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit(
        'update:value',
        (props.value || []).filter(item => item !== row),
      );
    })
    .catch(e => {
      console.warn(e);
    });
};
</script>

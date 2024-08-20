<template>
  <MultiItemBox
    :data="value"
    addText="添加快捷选项"
    :supportSort="true"
    @add="onEditTableColumn()"
    @edit="onEditTableColumn"
    @delete="onRemoveTableColumn"
    :prop="{
      label: 'name',
      value: 'id',
    }"
  />
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import MultiItemBox from '@/components/MultiItemBox/index.vue';
import { ANY_OBJECT } from '@/types/generic';
import { Dialog } from '@/components/Dialog';
import EditNumberRangeQuick from './editNumberRangeQuick.vue';

const emit = defineEmits<{ 'update:value': [ANY_OBJECT[]] }>();
const props = withDefaults(defineProps<{ value: ANY_OBJECT[] }>(), {});

const handlerEditOperate = (row: ANY_OBJECT | null, res: ANY_OBJECT) => {
  let tempList: ANY_OBJECT[] = [];
  if (row == null) {
    tempList = props.value || [];
    tempList.push(res);
  } else {
    tempList = (props.value || []).map(item => {
      return item.id === res.id ? res : item;
    });
  }
  emit('update:value', tempList);
};
const onEditTableColumn = (row: ANY_OBJECT | null = null) => {
  Dialog.show<ANY_OBJECT>(
    row ? '编辑快捷选项' : '添加快捷选项',
    EditNumberRangeQuick,
    {
      area: '500px',
    },
    {
      rowData: row,
      path: 'thirdEditOnlineMobileNumberRangeQuick',
    },
    {
      width: '500px',
      height: '500px',
      pathName: '/thirdParty/thirdEditOnlineMobileNumberRangeQuick',
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
  ElMessageBox.confirm('是否删除此快捷选项？', '', {
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
const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdEditOnlineMobileNumberRangeQuick' && data.isSuccess) {
    handlerEditOperate(data.rowData, data.data);
  }
};
defineExpose({ refreshData });
</script>

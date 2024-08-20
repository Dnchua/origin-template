<template>
  <div class="user-task-select">
    <el-select
      :model-value="value"
      ref="select"
      style="width: 100%"
      :disabled="disabled"
      :size="size"
      :clearable="clearable"
      :placeholder="placeholder"
      :teleported="false"
      popper-class="user-task-select-popper"
      @visible-change="onVisibleChange"
      @clear="onClear"
    >
      <el-option
        v-for="item in selectedItems"
        :key="item[props.value]"
        :label="item[props.label]"
        :value="item[props.value]"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { EpPropMergeType } from 'element-plus/es/utils';
import { getUUID } from '@/common/utils';
import { ANY_OBJECT } from '@/types/generic';
import { Dialog } from '@/components/Dialog';
import UserTaskSelectDlg from './userTaskSelectDlg.vue';

const emit = defineEmits<{
  'update:value': [ANY_OBJECT];
  change: [ANY_OBJECT];
}>();

const pps = withDefaults(
  defineProps<{
    value?: string;
    props?: ANY_OBJECT;
    disabled?: boolean;
    clearable?: boolean;
    size?:
      | EpPropMergeType<StringConstructor, '' | 'default' | 'small' | 'large', never>
      | undefined;
    placeholder?: string;
    xml?: string;
    finishedInfo?: ANY_OBJECT;
  }>(),
  {
    props: () => {
      return {
        label: 'taskName',
        value: 'taskId',
      };
    },
    disabled: false,
    clearable: false,
  },
);

const select = ref();
const widgetId = getUUID();
const selectedItems = ref<ANY_OBJECT[]>([]);

const handlerEditOperate = (items: ANY_OBJECT) => {
  console.log('>>> ', items);
  const list: ANY_OBJECT[] = [];
  if (items != null) list.push(items);
  selectedItems.value = list;
  console.log(selectedItems.value);
  if (pps.value === (selectedItems.value[0] || {})[pps.props.value]) return;
  emitChange();
};
const onVisibleChange = (visible: boolean) => {
  if (visible) {
    Dialog.show<ANY_OBJECT>(
      '任务选择',
      UserTaskSelectDlg,
      {
        area: ['80vw', '750px'],
        offset: '50px',
      },
      {
        xml: pps.xml,
        path: 'thirdSelectUserTask/' + widgetId,
        finishedInfo: pps.finishedInfo,
      },
      {
        width: '1200px',
        height: '600px',
        pathName: '/thirdParty/thirdSelectUserTask',
      },
    ).then(res => {
      select.value.blur();
      handlerEditOperate(res);
    });
  }
};
const onClear = () => {
  selectedItems.value = [];
  emitChange();
};
const emitChange = () => {
  let tempValue = (selectedItems.value[0] || {})[pps.props.value];
  emit('update:value', tempValue);
  emit('change', tempValue);
  //emit('input', tempValue);
};

const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdSelectUserTask/' + widgetId && data.isSuccess) {
    handlerEditOperate(data.data);
  }
};
defineExpose({ refreshData });
</script>

<style scoped>
.user-task-select {
  width: 100%;
}
.user-task-select :deep(.user-task-select-popper) {
  display: none;
}
.user-task-select :deep(.el-dialog__header) {
  height: 42px;
  line-height: 42px;
  padding: 0 20px;
  background-color: #f8f8f8;
}
.user-task-select :deep(.el-dialog__title) {
  font-size: 14px;
  color: #333;
}
.user-task-select :deep(.el-dialog__headerbtn) {
  top: 12px;
}
.user-task-select :deep(.el-dialog__body) {
  padding: 25px;
}
</style>

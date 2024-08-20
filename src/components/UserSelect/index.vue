<template>
  <div class="user-select">
    <el-select
      :model-value="modelValue"
      style="width: 100%"
      :multiple="multiple"
      :disabled="disabled"
      :size="size"
      :clearable="clearable"
      :collapse-tags="collapseTags"
      :placeholder="placeholder"
      :teleported="false"
      popper-class="user-select-popper"
      @visible-change="onVisibleChange"
      @remove-tag="onRemoveTag"
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
import { getUUID } from '@/common/utils';
import { ANY_OBJECT } from '@/types/generic';
import { SysCommonBizController } from '@/api/system';
import { Dialog } from '@/components/Dialog';
import UserSelectDlg from './UserSelectDlg.vue';

const emit = defineEmits<{
  'update:modelValue': [string | number | ANY_OBJECT[]];
  change: [string | number | ANY_OBJECT[], string | number | ANY_OBJECT[]];
}>();

const pps = withDefaults(
  defineProps<{
    modelValue: string | number | Array<ANY_OBJECT> | undefined;
    size?: '' | 'default' | 'small' | 'large';
    placeholder?: string;
    props?: ANY_OBJECT;
    multiple?: boolean;
    disabled?: boolean;
    clearable?: boolean;
    collapseTags?: boolean;
  }>(),
  {
    props: () => {
      return {
        label: 'showName',
        value: 'userId',
      };
    },
    multiple: false,
    disabled: false,
    clearable: false,
    collapseTags: true,
  },
);

const widgetId = ref(getUUID());
const selectedItems = ref<ANY_OBJECT[]>([]);

const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdSelectUser/' + widgetId.value && data.isSuccess) {
    handlerEditOperate(data.data);
  }
};
const handlerEditOperate = (items: Ref<ANY_OBJECT>) => {
  selectedItems.value = [];
  if (pps.multiple) {
    if (Array.isArray(items)) selectedItems.value = items;
  } else {
    if (items != null) selectedItems.value.push(items);
  }
  if (!checkSelectChange()) return;
  emitChange();
};
const onVisibleChange = (visible: boolean) => {
  if (visible) {
    Dialog.show<Ref<ANY_OBJECT>>(
      '用户选择',
      UserSelectDlg,
      {
        area: ['900px', '650px'],
        offset: '100px',
      },
      {
        value: selectedItems.value,
        props: pps.props,
        path: 'thirdSelectUser/' + widgetId.value,
        multiple: pps.multiple,
      },
      {
        width: '900px',
        height: '650px',
        pathName: '/thirdParty/thirdSelectUser',
      },
    ).then(res => {
      handlerEditOperate(res);
    });
  }
};
const onRemoveTag = (val: ANY_OBJECT) => {
  selectedItems.value = selectedItems.value.filter(item => {
    return item[pps.props.value] !== val;
  });
  emitChange();
};
const onClear = () => {
  selectedItems.value = [];
  emitChange();
};
const emitChange = () => {
  let tempValue;
  if (pps.multiple) {
    tempValue = selectedItems.value.map(item => {
      return item;
    });
    emit(
      'update:modelValue',
      tempValue.map(item => item[pps.props.value]),
    );
    emit(
      'change',
      tempValue.map(item => item[pps.props.value]),
      tempValue,
    );
  } else {
    tempValue = selectedItems.value[0] || {};
    emit('update:modelValue', tempValue[pps.props.value]);
    emit('change', tempValue[pps.props.value], selectedItems.value);
  }
};
const checkSelectChange = () => {
  let valueIdString = pps.multiple
    ? ((pps.modelValue || []) as ANY_OBJECT[])
        .sort((val1: ANY_OBJECT, val2: ANY_OBJECT) => {
          if (val1 === val2) return 0;
          return val1 < val2 ? -1 : 1;
        })
        .join(',')
    : pps.modelValue || '';
  let selectedItemsString = selectedItems.value
    .sort((item1, item2) => {
      if (item1[pps.props.value] === item2[pps.props.value]) return 0;
      return item1[pps.props.value] < item2[pps.props.value] ? -1 : 1;
    })
    .map(item => item[pps.props.value])
    .join(',');
  return valueIdString !== selectedItemsString;
};
const getSelectUserList = () => {
  let params: ANY_OBJECT = {
    widgetType: 'upms_user',
  };
  if (
    pps.modelValue == null ||
    pps.modelValue === '' ||
    (Array.isArray(pps.modelValue) && pps.modelValue.length <= 0)
  )
    selectedItems.value = [];
  if (pps.multiple) {
    params.fieldValues = Array.isArray(pps.modelValue) ? pps.modelValue : [];
  } else {
    params.fieldValues = Array.isArray(pps.modelValue) ? pps.modelValue[0] : pps.modelValue;
    params.fieldValues = params.fieldValues == null ? [] : [params.fieldValues];
  }
  if (Array.isArray(params.fieldValues) && params.fieldValues.length > 0) {
    params.fieldValues = params.fieldValues.join(',');
    SysCommonBizController.viewByIds(params, {
      showMask: false,
    })
      .then(res => {
        if (Array.isArray(res.data)) {
          selectedItems.value = res.data;
        }
      })
      .catch(e => {
        console.warn(e);
      });
  }
};
watch(
  () => pps.modelValue,
  () => {
    if (pps.modelValue) getSelectUserList();
  },
  {
    immediate: true,
  },
);

defineExpose({
  refreshData,
});
</script>

<style scoped>
.user-select :deep(.user-select-popper) {
  display: none;
}

.user-select :deep(.el-dialog__header) {
  height: 42px;
  line-height: 42px;
  padding: 0 20px;
  background-color: #f8f8f8;
}
.user-select :deep(.el-dialog__title) {
  font-size: 14px;
  color: #333;
}
.user-select :deep(.el-dialog__headerbtn) {
  top: 12px;
}
.user-select :deep(.el-dialog__body) {
  padding: 25px;
}
</style>

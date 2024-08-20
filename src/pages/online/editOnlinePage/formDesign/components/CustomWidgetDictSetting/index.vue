<template>
  <el-row>
    <el-col :span="24">
      <el-select
        v-model="data.dictId"
        clearable
        placeholder=""
        style="width: 100%"
        @change="onDictChange"
      >
        <el-option
          v-for="item in validDictList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-col>
    <el-col v-if="dictParamList && dictParamList.length > 0" :span="24" style="margin-top: 10px">
      <MultiItemBox
        :data="(modelValue || {}).paramList"
        addText="添加字典过滤参数"
        :maxCount="dictParamList ? dictParamList.length : 0"
        @add="onEditDictParamValue()"
        @edit="onEditDictParamValue"
        @delete="onRemoveDictParamValue"
        :prop="{
          label: 'dictParamName',
          value: 'dictParamName',
        }"
      />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import MultiItemBox from '@/components/MultiItemBox/index.vue';
import { ANY_OBJECT } from '@/types/generic';
import { findItemFromList } from '@/common/utils';
import { SysCustomWidgetBindDataType, SysOnlineFormType } from '@/common/staticDict';
import { Dialog } from '@/components/Dialog';
import { SysOnlineColumnFilterType } from '@/common/staticDict/online';
import EditDictParamValue from './EditDictParamValue.vue';

const emit = defineEmits<{ 'update:modelValue': [ANY_OBJECT] }>();

const props = withDefaults(defineProps<{ modelValue: ANY_OBJECT }>(), {});
const validDictList = ref<ANY_OBJECT[]>([]);
const formConfig = inject('formConfig', () => {
  console.error('CustomWidgegtDictSetting: formConfig not injected');
  return {} as ANY_OBJECT;
});

const currentWidget = computed(() => {
  return formConfig().currentWidget;
});
const allDictList = computed(() => {
  return formConfig().dictList;
});
const currentDictInfo = computed(() => {
  return findItemFromList(allDictList.value, props.modelValue.dictId, 'id');
});
const dictParamList = computed(() => {
  return currentDictInfo.value ? (currentDictInfo.value.dictData || {}).paramList : undefined;
});

const data = computed({
  get() {
    return props.modelValue;
  },
  set(val: ANY_OBJECT) {
    console.log('data change', val);
    emitChange(val);
  },
});

const emitChange = (info: ANY_OBJECT) => {
  nextTick(() => {
    emit('update:modelValue', {
      ...info,
      dict: findItemFromList(allDictList.value, (info || {}).dictId, 'id'),
    });
  });
};
const handlerEditOperate = (row: ANY_OBJECT | null, res: ANY_OBJECT) => {
  if (row == null) {
    emitChange({
      dictId: props.modelValue.dictId,
      paramList: [...props.modelValue.paramList, res],
    });
  } else {
    emitChange({
      dictId: props.modelValue.dictId,
      paramList: props.modelValue.paramList.map((item: ANY_OBJECT) => {
        return item.dictParamName === row.dictParamName ? res : item;
      }),
    });
  }
};
const onEditDictParamValue = (row: ANY_OBJECT | null = null) => {
  let validParamList = (dictParamList.value || []).filter((item: ANY_OBJECT) => {
    let usedParamList = props.modelValue.paramList;
    let temp = findItemFromList(usedParamList, item.dictParamName, 'dictParamName');
    return temp == null;
  });
  Dialog.show<ANY_OBJECT>(
    row ? '编辑参数' : '添加参数',
    EditDictParamValue,
    {
      area: '600px',
    },
    {
      rowData: row,
      paramList: validParamList,
      columnList: formConfig().getMasterTable.columnList.filter((item: ANY_OBJECT) => {
        return (
          formConfig().form.formType !== SysOnlineFormType.QUERY ||
          item.filterType !== SysOnlineColumnFilterType.NONE
        );
      }),
      path: 'thirdEditDictParamValue',
    },
    {
      width: '600px',
      height: '400px',
      pathName: '/thirdParty/thirdEditDictParamValue',
    },
  )
    .then(res => {
      handlerEditOperate(row, res);
    })
    .catch(e => {
      console.warn(e);
    });
};

const getValidDictList = () => {
  validDictList.value = [];
  if (currentWidget.value == null || !Array.isArray(allDictList.value)) return;
  if (currentWidget.value.bindData.dataType === SysCustomWidgetBindDataType.Column) {
    if (
      currentWidget.value.bindData.column != null &&
      currentWidget.value.bindData.column.dictId != null
    ) {
      validDictList.value = (allDictList.value || []).filter(
        item => item.id === currentWidget.value.bindData.column.dictId,
      );
    }
  } else if (currentWidget.value.bindData.dataType === SysCustomWidgetBindDataType.Custom) {
    validDictList.value = allDictList.value;
  }
};

const onRemoveDictParamValue = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此参数？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    emitChange({
      dictId: props.modelValue.dictId,
      paramList: props.modelValue.paramList.filter(
        (item: ANY_OBJECT) => item.dictParamName !== row.dictParamName,
      ),
    });
  });
};

const onDictChange = (val: ANY_OBJECT) => {
  emitChange({
    dictId: val,
    paramList: [],
  });
};

watch(
  () => currentWidget.value,
  () => {
    getValidDictList();
  },
  {
    deep: true,
    immediate: true,
  },
);
watch(
  validDictList,
  () => {
    if (validDictList.value.length === 1) {
      if (props.modelValue.dictId !== validDictList.value[0].id) {
        // 如果选中字典改变，并且只有一个字典，那么默认选中
        emitChange({
          dictId: validDictList.value[0].id,
          paramList: [],
        });
      }
    }
  },
  { deep: true, immediate: true },
);
</script>

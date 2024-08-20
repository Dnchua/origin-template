<template>
  <el-row>
    <el-col :span="24">
      <el-select
        v-model="dictId"
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
        :data="(value || {}).paramList"
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
import { findItemFromList } from '@/common/utils';
import { ANY_OBJECT } from '@/types/generic';
import { Dialog } from '@/components/Dialog';
import { SysCustomWidgetBindDataType, SysOnlineFormType } from '@/common/staticDict';
import { SysOnlineColumnFilterType } from '@/common/staticDict/online';
import EditDictParamValue from './editDictParamValue.vue';

const props = withDefaults(defineProps<{ value?: ANY_OBJECT }>(), {
  value: () => {
    return {};
  },
});

const formConfig = inject('formConfig', () => {
  console.error('CustomWidgetDictSetting: formConfig not injected');
  return {} as ANY_OBJECT;
});
console.log('>>> >>> dictSetting', formConfig());
const validDictList = ref<ANY_OBJECT[]>([]);
const currentWidget = computed(() => {
  return formConfig().currentWidget;
});
const allDictList = computed(() => {
  return formConfig().dictList;
});
const currentDictInfo = computed(() => {
  return findItemFromList(allDictList.value, props.value.dictId, 'id');
});
const dictParamList = computed(() => {
  return currentDictInfo.value ? (currentDictInfo.value.dictData || {}).paramList : undefined;
});
const dictId = computed({
  get() {
    return props.value.dictId;
  },
  set(val) {
    onDictChange(val);
  },
});

const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdEditDictParamValue' && data.isSuccess) {
    handlerEditOperate(data.rowData, data.data);
  }
};
defineExpose({ refreshData });

const onDictChange = (val: ANY_OBJECT) => {
  emitChange({
    dictId: val,
    paramList: [],
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
const emit = defineEmits<{ 'update:value': [ANY_OBJECT] }>();
const emitChange = (info: ANY_OBJECT) => {
  nextTick(() => {
    emit('update:value', {
      ...info,
      dict: findItemFromList(allDictList.value, (info || {}).dictId, 'id'),
    });
  });
};
const handlerEditOperate = (row: ANY_OBJECT | null, res: ANY_OBJECT) => {
  if (res == null) return;
  if (!row) {
    emitChange({
      dictId: props.value.dictId,
      paramList: [...props.value.paramList, res],
    });
  } else {
    emitChange({
      dictId: props.value.dictId,
      paramList: props.value.paramList.map((item: ANY_OBJECT) => {
        return item.dictParamName === row.dictParamName ? res : item;
      }),
    });
  }
};
const onEditDictParamValue = (row: ANY_OBJECT | null = null) => {
  let validParamList = (dictParamList.value || []).filter((item: ANY_OBJECT) => {
    let usedParamList = props.value.paramList;
    let temp = findItemFromList(usedParamList, item.dictParamName, 'dictParamName');
    return temp == null;
  });
  let columnList = [];
  // 报表表单从组件中获取数据，其他表单从数据源字段中获取数据
  if (formConfig().form.pageCode != null) {
    columnList = (formConfig().allWidgetList || []).map((widget: ANY_OBJECT) => {
      return {
        columnId: widget.widgetId,
        objectFieldName: widget.showName,
      };
    });
  } else {
    columnList = formConfig().getMasterTable.columnList.filter((item: ANY_OBJECT) => {
      return (
        formConfig().form.formType !== SysOnlineFormType.QUERY ||
        item.filterType !== SysOnlineColumnFilterType.NONE
      );
    });
  }
  Dialog.show<ANY_OBJECT>(
    row ? '编辑参数' : '添加参数',
    EditDictParamValue,
    {
      area: '600px',
    },
    {
      rowData: row,
      paramList: validParamList,
      columnList: columnList,
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
const onRemoveDictParamValue = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此参数？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emitChange({
        dictId: props.value.dictId,
        paramList: props.value.paramList.filter(
          (item: ANY_OBJECT) => item.dictParamName !== row.dictParamName,
        ),
      });
    })
    .catch(e => {
      console.warn(e);
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
  () => validDictList.value,
  () => {
    if (validDictList.value.length === 1 && !props.value.dictId) {
      emitChange({
        dictId: validDictList.value[0].id,
        paramList: [],
      });
    }
  },
  {
    immediate: true,
  },
);
</script>

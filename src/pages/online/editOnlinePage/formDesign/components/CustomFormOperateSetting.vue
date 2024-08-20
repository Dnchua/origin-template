<template>
  <el-row style="width: 100%">
    <el-form
      style="width: 100%"
      :size="layoutStore.defaultFormItemSize"
      label-position="top"
      @submit.prevent
    >
      <MultiItemList
        label="操作"
        v-model:data="data"
        addText="添加"
        @add="onEditOperate(null)"
        @edit="onEditOperate"
        @delete="onDeleteOperate"
        :prop="{
          label: 'name',
          value: 'name',
          disabled: function (item:ANY_OBJECT) {
            return item.builtin;
          },
        }"
      >
        <template v-slot:right="scope">
          <el-tag size="default" :type="scope.data.enabled ? 'success' : 'danger'">
            {{ scope.data.enabled ? '启动' : '禁用' }}
          </el-tag>
        </template>
      </MultiItemList>
    </el-form>
  </el-row>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import MultiItemList from '@/components/MultiItemList/index.vue';
import { Dialog } from '@/components/Dialog';
import { SysCustomWidgetOperationType } from '@/common/staticDict';
import { useLayoutStore } from '@/store';
import EditCustomFormOperate from './EditCustomFormOperate.vue';

const emit = defineEmits<{ 'update:value': [ANY_OBJECT] }>();

const layoutStore = useLayoutStore();
const formConfig = inject('formConfig', () => {
  console.error('CustomFormOperateSetting: formConfig not injected');
  return {} as ANY_OBJECT;
});

const props = withDefaults(
  defineProps<{
    value?: Array<ANY_OBJECT>;
    formList?: Array<ANY_OBJECT>;
    tableList?: Array<ANY_OBJECT>;
  }>(),
  {
    value: () => [],
    formList: () => [],
    tableList: () => [],
  },
);

const data = computed({
  get() {
    return props.value;
  },
  set(val) {
    emit('update:value', val);
  },
});

const buildFormConfig = computed(() => {
  return {
    form: {
      formType: formConfig().form.formType,
      customFieldList: formConfig().form.customFieldList,
    },
    getMasterTable: {
      relationType: formConfig().getMasterTable.relationType,
      tag: {
        datasourceName: formConfig().getMasterTable.tag.datasourceName,
        relationName: formConfig().getMasterTable.tag.relationName,
        variableName: formConfig().getMasterTable.tag.variableName,
      },
      columnList: formConfig().getMasterTable.columnList.map((column: ANY_OBJECT) => {
        return {
          filterType: column.filterType,
          columnComment: column.columnComment,
          columnName: column.columnName,
          columnId: column.columnId,
        };
      }),
    },
    getAllTableList: formConfig().getAllTableList.map((table: ANY_OBJECT) => {
      return {
        relationType: table.relationType,
        tag: {
          datasourceName: table.tag.datasourceName,
          relationName: table.tag.relationName,
          variableName: table.tag.variableName,
        },
        columnList: table.columnList.map((column: ANY_OBJECT) => {
          return {
            filterType: column.filterType,
            columnComment: column.columnComment,
            columnName: column.columnName,
            columnId: column.columnId,
          };
        }),
      };
    }),
  };
});

const onDeleteOperate = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此操作？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit(
        'update:value',
        props.value.filter(item => item.id !== row.id),
      );
    })
    .catch(e => {
      console.warn(e);
    });
};
const handlerEditOperate = (row: ANY_OBJECT | null, res: ANY_OBJECT) => {
  let tempList = [];
  if (row == null) {
    res.id = new Date().getTime();
    tempList = props.value.concat(res);
  } else {
    tempList = props.value.map(item => {
      return item.id === res.id ? res : item;
    });
  }
  emit('update:value', tempList);
};
const onEditOperate = (row: ANY_OBJECT | null) => {
  Dialog.show<ANY_OBJECT>(
    row == null ? '添加操作' : '编辑操作',
    EditCustomFormOperate,
    {
      area: row && row.type === SysCustomWidgetOperationType.EXPORT ? '900px' : '600px',
      offset: '50px',
    },
    {
      rowData: row,
      formList: props.formList.map(item => {
        return {
          formId: item.formId,
          formType: item.formType,
          formName: item.formName,
        };
      }),
      tableList: props.tableList,
      formConfig: buildFormConfig.value,
      //path: 'thirdEditCustomFormOperate',
    },
    {
      height: row && row.type === SysCustomWidgetOperationType.EXPORTT ? '80vh' : '600px',
      width: row && row.type === SysCustomWidgetOperationType.EXPORT ? '900px' : '600px',
      pathName: '/thirdParty/thirdEditCustomFormOperate',
    },
  )
    .then(res => {
      handlerEditOperate(row, res);
    })
    .catch(e => {
      console.warn(e);
    });
};
</script>

<style scoped>
.full-line-btn {
  width: 100%;
  margin-top: 10px;
  border: 1px dashed #ebeef5;
}
</style>

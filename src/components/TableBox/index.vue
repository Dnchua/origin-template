<template>
  <div class="table-box">
    <el-row
      type="flex"
      justify="space-between"
      align="middle"
      class="operator-box"
      v-if="hasExtend || $slots.operator"
    >
      <div>
        <slot name="operator" />
      </div>
      <div class="extend-box" v-if="hasExtend">
        <i
          class="online-icon icon-custom-refresh"
          style="margin-right: 4px; font-size: 20px; color: #333; cursor: pointer"
          @click="refresh"
        />
        <i
          class="online-icon icon-table-row-height"
          style="font-size: 20px; color: #333; cursor: pointer"
          @click="onRowHeightToogle"
        />
      </div>
    </el-row>
    <div class="vxe-table-box">
      <vxe-table
        ref="table"
        border="inner"
        height="100%"
        :data="data"
        :class="rowHeightClass"
        :key="tableKey"
        v-bind="$attrs"
        :row-config="{ ...($attrs.rowConfig || {}), isHover: true }"
        :checkbox-config="{ checkMethod: checkedMethod }"
        header-cell-class-name="table-header-gray"
        @checkbox-change="onCheckBoxChange"
        @checkbox-all="onCheckAllChange"
        @radio-change="onRadioSelectChange"
      >
        <slot></slot>
        <template v-slot:empty>
          <div class="table-empty unified-font">
            <img src="@/assets/img/empty.png" />
            <span>暂无数据</span>
          </div>
        </template>
      </vxe-table>
    </div>
    <slot class="pagination-box" name="pagination"></slot>
  </div>
</template>

<script setup lang="ts">
import { VxeTable, VxeTableInstance, VxeTableEvents, VxeTablePropTypes } from 'vxe-table';
import { ANY_OBJECT, T } from '@/types/generic';
import { traverseTree } from '@/common/utils';

const attrs = useAttrs();
//console.log('tablebox $attrs', attrs);

// 定义事件
const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'update:value', rows: T[]): void;
  (e: 'checkbox-select-change', params: T[]): void;
  (e: 'radio-select-change', param: ANY_OBJECT | null): void;
  (e: 'change', rows: T[], multi: boolean): void;
}>();

// Props
const props = withDefaults(
  defineProps<{
    data: T[];
    value?: T | T[];
    height?: string | number;
    hasImageColumn?: boolean;
    hasExtend?: boolean;
    checkedMethod?: () => boolean;
  }>(),
  {
    hasExtend: true,
    height: 'auto',
    hasImageColumn: false,
    checkedMethod: () => {
      return true;
    },
  },
);

// 组件引用
const table = ref<VxeTableInstance>();

// 变量
let expandRows: T[] = [];
const tableKey = new Date().getTime();

const rowHeightStatus = ref('default');

// computed属性，树型表格参数
const treeConfig = computed<VxeTablePropTypes.TreeConfig>(() => {
  const config: VxeTablePropTypes.TreeConfig = attrs['tree-config'] as VxeTablePropTypes.TreeConfig;
  if (config && !config.toggleMethod) {
    config.toggleMethod = ({ expanded, row }) => {
      //console.log(expanded, row);
      if (treeRowKey.value) {
        let id = row[treeRowKey.value];
        if (id) {
          if (expanded) {
            if (expandRows.indexOf(id) === -1) expandRows.push(id);
          } else {
            expandRows = expandRows.filter(item => item !== id);
          }
        }
      }
      return true;
    };
  }
  return config;
});

const treeRowKey = computed(() => {
  return treeConfig.value ? treeConfig.value.rowField : undefined;
});

const rowHeightClass = computed(() => {
  const classArr = ['row-height-' + rowHeightStatus.value];
  if (props.hasImageColumn) {
    classArr.push('row-height-image');
  }
  return classArr;
});

// 方法
const refresh = () => {
  emit('refresh');
};

const onRowHeightToogle = () => {
  if (rowHeightStatus.value == 'default') {
    rowHeightStatus.value = 'mini';
  } else {
    rowHeightStatus.value = 'default';
  }
};

const onSelectChange = (rows: T[], multi: boolean) => {
  emit('update:value', rows);
  emit('change', rows, multi);
};

const onCheckBoxChange: VxeTableEvents.CheckboxChange<T> = ({ checked }) => {
  console.log('onCheckBoxChange', checked);
  let selectRows: T[] = [];
  if (table.value) {
    selectRows = table.value.getCheckboxRecords(true);
    selectRows = selectRows.concat(table.value.getCheckboxIndeterminateRecords(true));
  }
  onSelectChange(selectRows, true);
  emit('checkbox-select-change', selectRows);
};

const onCheckAllChange: VxeTableEvents.CheckboxAll<T> = ({ checked }) => {
  console.log('onCheckAllChange', checked);
  let selectRows: T[] = [];
  if (table.value) {
    selectRows = table.value.getCheckboxRecords(true);
    selectRows = selectRows.concat(table.value.getCheckboxIndeterminateRecords(true));
  }
  onSelectChange(selectRows, true);
  emit('checkbox-select-change', selectRows);
};

const onRadioSelectChange: VxeTableEvents.RadioChange<T> = (data: T) => {
  console.log('onRadioSelectChange', data);
  let selectRow: T | null = null;
  if (table.value) {
    selectRow = table.value.getRadioRecord();
  }
  onSelectChange(selectRow != null ? [selectRow] : [], false);
  emit('radio-select-change', selectRow);
};

const setTableSelectRow = () => {
  nextTick(() => {
    if (table.value) {
      table.value.clearRadioRow();
      table.value.clearCheckboxRow();
      if (props.data == null) return;
      if (Array.isArray(props.value)) {
        // 多选
        table.value.setCheckboxRow(props.value, true);
      } else {
        // 单选
        table.value.setRadioRow(props.value);
      }
    }
  });
};

// 监听属性变化
watch(
  () => props.value,
  () => {
    console.log('value changed');
    setTableSelectRow();
  },
  { deep: true },
);
watch(
  () => props.data,
  (newVal, oldValue) => {
    //console.log('data changed', newVal == oldValue, newVal, oldValue);
    if (newVal == oldValue) return;
    //console.log('expandedRows treeRowKey', treeRowKey, expandRows);
    if (treeRowKey.value) {
      let nodeList: T[] = [];
      traverseTree(props.data, node => nodeList.push(node), 'children');
      let defaultExpandRows = nodeList.filter((row: T) => {
        if (!treeRowKey.value) {
          return false;
        }
        return expandRows.indexOf(row[treeRowKey.value]) != -1;
      });
      expandRows = defaultExpandRows.map(item => item[treeRowKey.value || 'id']);
      //console.log('expandedRows', defaultExpandRows, nodeList);

      nextTick(() => {
        if (table.value) {
          table.value.setTreeExpand(defaultExpandRows, true);
        }
      });
    }
  },
  { deep: true },
);

// 生命周期
onMounted(() => {
  console.log('treeConfig', treeConfig);
});

const getTableImpl = () => {
  return table.value;
};

defineExpose({
  getTableImpl,
});
</script>

<style lang="scss" scoped>
.table-box {
  display: flex;
  background-color: white;
  flex-direction: column;
  flex: 1;
  .vxe-table-box {
    flex-shrink: 1;
    height: 200px;
    flex-grow: 1;
  }
  .operator-box {
    margin-bottom: 16px;
    flex-grow: 0;
  }
  .extend-box {
    display: flex;
    justify-content: flex-end;
  }
  .pagination-box {
    flex-grow: 0;
  }
}
.table-box :deep(.vxe-body--column) {
  padding: 0 !important;
}
.vxe-table.page-table {
  padding: 0 !important;
}
.row-height-mini.row-height-image :deep(.vxe-body--column) {
  height: 70px !important;
}
.row-height-default.row-height-image :deep(.vxe-body--column) {
  height: 80px !important;
}
.row-height-mini :deep(.vxe-body--column) {
  height: 35px !important;
}
.row-height-default :deep(.vxe-body--column) {
  height: 50px !important;
}
</style>

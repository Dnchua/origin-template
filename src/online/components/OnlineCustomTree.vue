<template>
  <el-tree
    class="online-custom-tree"
    ref="tree"
    :data="treeDataList"
    node-key="id"
    :show-checkbox="multiple"
    :highlight-current="true"
    :default-expand-all="true"
    :auto-expand-parent="true"
    :expand-on-click-node="false"
    @check-change="onSelectChange"
    @node-click="onNodeClick"
  >
    <template v-slot="{ data }">
      <el-row class="node-item" justify="space-between" align="middle">
        <div class="text">{{ data.name }}</div>
      </el-row>
    </template>
  </el-tree>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, computed, nextTick, inject } from 'vue';
import { treeDataTranslate, findItemFromList } from '@/common/utils';
import { ANY_OBJECT } from '@/types/generic';

const props = withDefaults(
  defineProps<{
    value?: number | string | ANY_OBJECT[];
    widget: ANY_OBJECT;
    multiple?: boolean;
    dataList?: ANY_OBJECT[];
    filter?: ANY_OBJECT;
  }>(),
  {
    multiple: false,
    dataList: () => [],
  },
);
const tree = ref();

const form = inject('form', () => {
  console.error('OnlineCustomTree: form not injected');
  return { isEdit: false } as ANY_OBJECT;
});
// 左树右表布局，左侧过滤条件
const leftFilterObject = computed(() => {
  return form().filter;
});
const treeDataList = computed(() => {
  let tempList = (props.dataList || []).filter(item => {
    item.children = null;
    return (
      leftFilterObject.value == null ||
      leftFilterObject.value.name == null ||
      item.name.indexOf(leftFilterObject.value.name) !== -1
    );
  });
  let temp = treeDataTranslate(tempList, 'id', 'parentId');
  if (props.multiple) {
    return temp;
  } else {
    return [
      {
        id: '',
        name: '全部',
      },
      ...temp,
    ];
  }
});

const onNodeClick = () => {
  if (form().isEdit) return;
  if (!props.multiple) onSelectChange();
};
const emit = defineEmits<{
  'update:value': [number | string | ANY_OBJECT[] | undefined];
  change: [number | string | ANY_OBJECT[] | undefined, ANY_OBJECT | null];
}>();
const onValueChange = () => {
  let temp = props.value;
  if (tree.value) {
    if (props.multiple) {
      temp = tree.value.getCheckedKeys();
    } else {
      temp = tree.value.getCurrentKey();
    }
  }
  emit('update:value', temp);
  let dictData = props.multiple
    ? null
    : findItemFromList(props.dataList, temp as string | number, 'id');
  emit('change', temp, dictData);
};
const onSelectChange = () => {
  nextTick(() => {
    onValueChange();
  });
};
const setTreeSelectNode = () => {
  if (tree.value) {
    if (props.multiple) {
      tree.value.setCheckedKeys(props.value || []);
    } else {
      tree.value.setCurrentKey(props.value);
    }
  }
};

watch(
  () => props.value,
  () => {
    setTreeSelectNode();
  },
  {
    immediate: true,
  },
);
watch(
  () => props.dataList,
  () => {
    setTimeout(() => {
      setTreeSelectNode();
    }, 50);
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
.online-custom-tree :deep(.el-tree-node__content) {
  height: 100%;
}
.online-custom-tree :deep(.el-tree-node__expand-icon) {
  font-size: 16px;
  color: #666;
}
.online-custom-tree :deep(.el-tree-node__expand-icon.is-leaf) {
  color: transparent;
  cursor: default;
}
.node-item {
  min-width: 100px;
  padding: 12px 0;
  margin-right: 15px;
  flex-grow: 1;
}
.node-item .text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<style lang="scss">
.online-custom-tree .is-current > .el-tree-node__content {
  color: $color-primary;
  background: $color-primary-light-9 !important;
}
</style>

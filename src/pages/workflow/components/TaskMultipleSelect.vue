<template>
  <div class="task-multiple-select">
    <slot />
    <div class="tag-box" v-if="selectValues.length">
      <el-tag
        :size="layoutStore.defaultFormItemSize"
        effect="dark"
        v-for="item in selectValues"
        :key="item.id"
        :closable="!isCountersign"
        @close="onDeleteTag(item)"
      >
        {{ item.name }}
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';

const emit = defineEmits<{ 'update:value': string[] | ANY_OBJECT[] }>();
const props = withDefaults(
  defineProps<{ value?: string | ANY_OBJECT[]; isCountersign?: boolean }>(),
  {
    isCountersign: false,
  },
);
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const selectValues = ref<ANY_OBJECT[]>([]);
const calcUserName: ANY_OBJECT = {
  '${startUserName}': '流程发起人',
  '${appointedAssignee}': '指定审批人 ',
};

const onDeleteTag = (tag: ANY_OBJECT) => {
  let temp = selectValues.value.filter(item => {
    return item.id !== tag.id;
  });
  if (Array.isArray(props.value)) {
    emit('update:value', temp);
  } else {
    emit('update:value', temp.map(item => item.id).join(','));
  }
};

watch(
  () => props.value,
  newValue => {
    console.log('TaskMultipleSelect value change', newValue);
    if (!newValue) {
      selectValues.value = [];
    } else {
      if (Array.isArray(newValue)) {
        selectValues.value = [...newValue].map((row: ANY_OBJECT) => {
          return {
            id: row.id,
            name: calcUserName[row.id] ? calcUserName[row.id] : row.name || row.id,
          };
        });
      } else {
        selectValues.value = newValue.split(',').map(item => {
          return {
            id: item,
            name: calcUserName[item] ? calcUserName[item] : item,
          };
        });
      }
    }
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>

<style lang="scss" scoped>
.task-multiple-select {
  :deep(.el-tag) {
    padding-right: 4px;
    margin-right: 8px;
    color: #666;
    background-color: #f6f6f6;
    border-color: #e8e8e8;
    .el-tag__close {
      right: 1px;
      font-size: 12px;
      color: #666;
      transform: scale(1);
      &:hover {
        background-color: transparent;
      }
    }
  }
  .tag-box {
    flex-grow: 1;
    margin-top: 8px;
  }
}
</style>

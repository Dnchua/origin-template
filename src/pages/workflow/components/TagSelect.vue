<template>
  <div class="tag-select">
    <div class="tag-box">
      <el-tag
        v-for="item in selectValues"
        :key="item.id"
        effect="dark"
        style="margin-right: 5px"
        type="primary"
        :size="layoutStore.defaultFormItemSize"
        closable
        @close="onDeleteTag(item)"
      >
        {{ item.name }}
      </el-tag>
    </div>
    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';

const emit = defineEmits<{ 'update:value': ANY_OBJECT[] | string[] }>();
const props = defineProps<{ value: string | Array<ANY_OBJECT> }>();
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
    if (newValue == null || newValue === '') {
      selectValues.value = [];
    } else {
      if (Array.isArray(newValue)) {
        selectValues.value = [...newValue].map(row => {
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
  },
);
</script>

<style scoped>
.tag-select {
  display: flex;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.tag-box {
  flex-grow: 1;
  padding: 0 5px;
}
</style>

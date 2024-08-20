<template>
  <div class="multi-item-box">
    <!-- 数据列表 -->
    <VueDraggable
      draggable=".column-item"
      v-model="dataList"
      :group="dragGroup"
      style="overflow: hidden; height: 100%"
      :disabled="!supportSort"
    >
      <el-alert
        v-for="item in dataList"
        :key="item[prop.value]"
        class="column-item"
        :type="itemType"
        :closable="false"
      >
        <template v-slot:title>
          <el-row type="flex" align="middle" justify="space-between" style="width: 100%">
            <el-link :type="itemType" :disabled="disabled" @click="onEditItem(item)">
              <slot v-if="hasSlot" :data="item" />
              <span v-else>{{ item[prop.label] }}</span>
            </el-link>
            <div class="right">
              <slot name="right" :data="item" />
              <el-icon @click="onDeleteItem(item)" style="cursor: pointer"><Close /></el-icon>
            </div>
          </el-row>
        </template>
      </el-alert>
    </VueDraggable>
    <!-- 添加按钮 -->
    <el-alert
      v-show="maxCount == null || maxCount > (data || []).length"
      class="column-item"
      :type="addType"
      :closable="false"
    >
      <template v-slot:title>
        <el-row type="flex" align="middle" justify="space-between" style="width: 100%">
          <el-link :disabled="disabled" :type="addType" @click="onEditItem(null)">
            {{ addText }}
          </el-link>
        </el-row>
      </template>
    </el-alert>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import { getCurrentInstance } from 'vue';
import { Close } from '@element-plus/icons-vue';
import { EpPropMergeType } from 'element-plus/es/utils';
import { ANY_OBJECT } from '@/types/generic';

const emit = defineEmits<{
  add: [];
  edit: [ANY_OBJECT];
  delete: [ANY_OBJECT];
  'update:data': [ANY_OBJECT | ANY_OBJECT[]];
}>();

const props = withDefaults(
  defineProps<{
    /**
     * 添加按钮类型
     */
    addType?:
      | EpPropMergeType<StringConstructor, 'info' | 'success' | 'warning', unknown>
      | undefined;
    data: ANY_OBJECT | ANY_OBJECT[];
    /**
     * 数据项类型
     */
    itemType?:
      | EpPropMergeType<StringConstructor, 'info' | 'success' | 'warning', unknown>
      | undefined;
    /**
     * 添加按钮文本
     */
    addText?: string;
    disabled?: boolean;
    /**
     * 最大项数，当达到最大项数，则不能添加数据
     */
    maxCount?: number;
    /**
     * 是否支持拖拽排序，默认为false
     */
    supportSort?: boolean;
    /**
     * 是否支持添加
     */
    supportAdd?: boolean;
    dragGroup?: string;
    prop?: ANY_OBJECT;
  }>(),
  {
    addType: 'info',
    itemType: 'success',
    addText: '请点击添加数据项',
    disabled: false,
    supportSort: false,
    supportAdd: true,
    dragGroup: 'componentsGroup',
    prop: () => {
      return {
        // 数据显示字段
        label: 'name',
        // 数据值字段
        value: 'id',
      };
    },
  },
);

const hasSlot = computed(() => {
  return getCurrentInstance()?.slots.default;
});
const dataList = computed({
  get: () => {
    if (props.data == null) return [];
    return Array.isArray(props.data) ? props.data : [props.data];
  },
  set: (val: ANY_OBJECT[]) => {
    // 更新数据，调用的地方必须使用v-model:data的方式
    emit('update:data', val);
  },
});

const onEditItem = (item: ANY_OBJECT | null) => {
  if (props.disabled) return;
  if (item == null) {
    emit('add');
  } else {
    emit('edit', item);
  }
};
const onDeleteItem = (item: ANY_OBJECT) => {
  if (props.disabled) return;
  emit('delete', item);
};
</script>

<style scoped>
.multi-item-box {
  display: inline-block;
  width: 100%;
  min-height: 30px;
  padding: 5px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
}
.multi-item-box :deep(.el-alert) {
  padding: 0;
}
.multi-item-box :deep(.el-alert__content) {
  width: 100%;
  padding: 5px 10px;
  font-size: 12px;
}
.multi-item-box :deep(.el-alert__content .el-icon-close) {
  cursor: pointer;
  flex-shrink: 0;
  flex-grow: 0;
}
.column-item + .column-item {
  margin-top: 5px;
}
.column-item :deep(.el-alert__title, .column-item .el-link) {
  font-size: 12px !important;
}
</style>

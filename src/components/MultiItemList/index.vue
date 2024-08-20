<template>
  <el-form-item class="multi-item-list" :class="{ empty: (dataList || []).length <= 0 }">
    <template v-slot:label>
      <el-row justify="space-between" align="middle" style="width: 100%">
        <span>{{ label }}</span>
        <right-add-btn
          class="add-btn"
          :disabled="addDisabled"
          @click.prevent.stop="onEditItem(null)"
          >{{ addText ? addText : '添加' }}</right-add-btn
        >
      </el-row>
    </template>
    <VueDraggable
      draggable=".list-item"
      v-model="dataList"
      :group="dragGroup"
      style="display: inline-block; overflow: hidden; width: 100%; height: 100%"
      :disabled="!supportSort"
    >
      <el-row
        class="list-item"
        v-for="item in dataList"
        :key="getItemValue(item)"
        align="middle"
        justify="space-between"
        style="width: 100%; flex-wrap: nowrap"
      >
        <div class="item" style="width: 100%; padding: 0 15px">
          <el-row align="middle" justify="space-between" style="min-height: 32px; padding: 6px 0">
            <el-link
              style="font-size: 12px; color: #333; line-height: 20px"
              :disabled="disabled"
              @click="onEditItem(item)"
            >
              <slot v-if="hasSlot" :data="item" />
              <span v-else>{{ getItemLabel(item) }}</span>
            </el-link>
            <div class="right" style="line-height: 20px; font-size: 12px">
              <slot name="right" :data="item" />
            </div>
          </el-row>
        </div>
        <el-icon
          style="margin-left: 8px; color: #333"
          class="close-btn"
          :class="{ disabled: getItemDisabled(item) }"
          @click.stop="onDeleteItem(item)"
          ><Remove
        /></el-icon>
      </el-row>
    </VueDraggable>
  </el-form-item>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import { getCurrentInstance } from 'vue';
import { Remove } from '@element-plus/icons-vue';
import { ANY_OBJECT } from '@/types/generic';
import RightAddBtn from '@/components/Btns/RightAddBtn.vue';

const emit = defineEmits<{
  add: [];
  edit: [ANY_OBJECT];
  delete: [ANY_OBJECT];
  'update:data': [ANY_OBJECT | ANY_OBJECT[]];
}>();

const props = withDefaults(
  defineProps<{
    label: string;
    data?: ANY_OBJECT | ANY_OBJECT[];
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
    addText?: string;
  }>(),
  {
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
        // 数据disabled字段
        disabled: undefined,
      };
    },
  },
);

const slots = useSlots();
console.log('slots', slots);

const addDisabled = computed(() => {
  console.log(
    'addDisabled',
    props.label,
    props.disabled,
    !props.supportAdd,
    props.maxCount,
    (dataList.value || []).length,
  );
  return (
    props.disabled ||
    !props.supportAdd ||
    (props.maxCount && props.maxCount <= (dataList.value || []).length)
  );
});
const hasSlot = computed(() => {
  console.log('getCurrentInstance.slots', getCurrentInstance()?.slots);
  return getCurrentInstance()?.slots.default;
});
const dataList = computed({
  get: () => {
    console.log('dataList 0>>>', props.data);
    if (props.data == null) return [];
    return Array.isArray(props.data) ? props.data : [props.data];
  },
  set: (val: ANY_OBJECT[]) => {
    console.log('MultiItemList data change', val);
    // 更新数据，调用的地方必须使用v-model:data的方式
    emit('update:data', val);
  },
});

const getItemDisabled = (item: ANY_OBJECT) => {
  let itemDisabled = false;
  if (item != null && props.prop.disabled != null) {
    if (typeof props.prop.disabled === 'function') {
      itemDisabled = props.prop.disabled(item);
    } else {
      itemDisabled = item[props.prop.disabled];
    }
  }
  return props.disabled || item == null || itemDisabled;
};
const onEditItem = (item: ANY_OBJECT | null) => {
  if (props.disabled) return;
  if (item == null) {
    emit('add');
  } else {
    emit('edit', item);
  }
};
const onDeleteItem = (item: ANY_OBJECT) => {
  if (getItemDisabled(item)) return;
  emit('delete', item);
};
const getItemValue = (item: ANY_OBJECT) => {
  console.log('getItemValue >>>', props.label, item[props.prop.value], dataList.value);
  if (typeof props.prop.value === 'function') return props.prop.value(item);
  return item[props.prop.value];
};
const getItemLabel = (item: ANY_OBJECT) => {
  if (typeof props.prop.label === 'function') return props.prop.label(item);
  return item[props.prop.label];
};
</script>

<style scoped>
.multi-item-list :deep(.el-form-item__label) {
  width: 100%;
}

.multi-item-list .item {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.list-item + .list-item {
  margin-top: 8px;
}
.multi-item-list.empty :deep(.el-form-item__content) {
  height: 0;
}
</style>

<style lang="scss" scoped>
.add-btn {
  position: relative;
  z-index: 9;
  margin-left: 5px;
  font-size: 12px;
  color: $color-primary;
}

.close-btn {
  cursor: pointer;
}

.close-btn.disabled {
  cursor: not-allowed;
}
</style>

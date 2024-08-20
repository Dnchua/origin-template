<template>
  <div class="active-widget-menu">
    <el-icon v-if="clone != null" @click.stop="onCopy"><CopyDocument /></el-icon>
    <el-icon style="margin-left: 3px" @click.stop="onDelete"><Delete /></el-icon>
  </div>
</template>

<script setup lang="ts">
import { CopyDocument, Delete } from '@element-plus/icons-vue';
import { ANY_OBJECT } from '@/types/generic';

const emit = defineEmits<{
  copy: [ANY_OBJECT];
  delete: [ANY_OBJECT];
}>();
const props = defineProps<{
  widget: ANY_OBJECT;
  clone?: (widget: ANY_OBJECT) => ANY_OBJECT | null;
}>();

const cloneWidget = (widget: ANY_OBJECT) => {
  if (props.clone && typeof props.clone === 'function') {
    return props.clone(widget);
  }
  console.warn('not found clone method');
  return null;
};
const onCopy = () => {
  const widget = cloneWidget(props.widget);
  if (widget) {
    emit('copy', widget);
  }
};
const onDelete = () => {
  emit('delete', props.widget);
};
</script>

<style lang="scss" scoped>
.active-widget-menu {
  position: absolute;
  right: -1px;
  bottom: -1px;
  z-index: 1000;
  height: 20px;
  padding: 0 5px;
  color: white;
  background: $color-primary;
  border-radius: 2px 0 0;
  line-height: 20px;
  i {
    font-size: 12px;
    cursor: pointer;
  }
}
</style>

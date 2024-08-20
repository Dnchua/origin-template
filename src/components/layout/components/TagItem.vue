<template>
  <div
    ref="root"
    class="tags-item"
    :class="{ active: active }"
    @mouseenter.prevent="mouseEnterHandle"
    @mouseout.prevent="mouseLeaveHandle"
    @mousemove.prevent="mouseMoveHandle"
  >
    <span class="title">{{ title }}</span>
    <el-icon
      ref="icon"
      v-if="supportClose && (mouseEnter || active)"
      style="margin-left: 6px; color: #999"
      @mouseenter.prevent="iconMouseEnterHandle"
      @mouseleave.prevent="iconMouseLeaveHandle"
      @click.stop="onClose"
    >
      <Close v-if="!iconEnter" /><CircleCloseFilled class="hover-close" v-if="iconEnter" />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'close'): void;
}>();

withDefaults(
  defineProps<{
    title: string;
    supportClose?: boolean;
    active: boolean;
  }>(),
  {
    supportClose: true,
    active: false,
  },
);

const root = ref<HTMLElement>();
const icon = ref<ComponentPublicInstance>();
const mouseEnter = ref(false);
const iconEnter = ref(false);

const onClose = () => {
  emit('close');
};

const mouseEnterHandle = () => {
  //iconEnter.value = false;
  mouseEnter.value = true;
};
// 解决鼠标移动过快mouseleave失效，图标不能正确改变样式
const mouseMoveHandle = (e: MouseEvent) => {
  if (['DIV', 'SPAN'].includes((e.target as HTMLElement).nodeName)) {
    iconEnter.value = false;
  }
};
const mouseLeaveHandle = (e: MouseEvent) => {
  iconEnter.value = false;
  //console.log(props.title, root.value?.contains(e.relatedTarget as Node), e);
  if (e.type == 'mouseout' && root.value?.contains(e.relatedTarget as Node)) {
    return;
  }
  mouseEnter.value = false;
};
const iconMouseEnterHandle = () => {
  iconEnter.value = true;
};
const iconMouseLeaveHandle = () => {
  iconEnter.value = false;
};

defineExpose({
  root,
});
</script>

<style lang="scss" scoped>
.tags-item {
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  color: #999;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 3px;
  box-sizing: border-box;
  cursor: pointer;
}
.tags-item .title {
  font-size: 12px;
}
.close {
  display: none;
  vertical-align: middle;
  color: #999;
}
.tags-item.active .close {
  display: inline-block;
  margin-left: 6px;
}
.hover-close {
  color: $color-text-secondary;
}
.tags-item:hover {
  color: #333;
}
.tags-item.active {
  color: #333;
}
.tags-item + .tags-item {
  margin-left: 8px;
}
</style>

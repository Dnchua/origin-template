<template>
  <el-button
    v-bind="$attrs"
    type="primary"
    class="right-add-btn"
    :size="layoutStore.defaultFormItemSize"
    link
    :icon="CirclePlusFilled"
  >
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { EpPropMergeType } from 'element-plus/es/utils';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

type BtnSizeType =
  | EpPropMergeType<StringConstructor, '' | 'default' | 'small' | 'large', never>
  | undefined;

const props = withDefaults(
  defineProps<{
    size?: BtnSizeType;
  }>(),
  { size: 'default' },
);
</script>

<style lang="scss" scoped>
.right-add-btn {
  display: flex;
  align-items: center;
  :deep(.el-icon-circle-plus) {
    font-size: 14px !important;
  }

  :deep(span) {
    margin-left: 4px !important;
  }
}
</style>

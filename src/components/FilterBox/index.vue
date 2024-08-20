<template>
  <el-row class="flex-box" type="flex">
    <slot />
    <div class="search-box" v-if="hasSearch" :style="{ 'min-width': minMenuWidth + 'px' }">
      <el-button class="search-btn" type="default" plain @click="search" :icon="ElIconSearch"
        >查询</el-button
      >
      <el-button v-if="hasReset" type="default" plain @click="reset" style="width: 72px"
        >重置</el-button
      >
      <div style="float: right">
        <slot name="operation" />
      </div>
    </div>
  </el-row>
</template>

<script setup lang="ts">
import { Search as ElIconSearch } from '@element-plus/icons-vue';

const emit = defineEmits<{
  (e: 'reset'): void;
  (e: 'search'): void;
}>();

withDefaults(
  defineProps<{
    hasSearch?: boolean;
    hasReset?: boolean;
    minMenuWidth?: number;
  }>(),
  {
    hasSearch: true,
    hasReset: true,
    // 这个值在size为default时会导致某些页面按钮折行
    minMenuWidth: 300,
  },
);

const search = () => {
  emit('search');
};
const reset = () => {
  emit('reset');
};
</script>

<style lang="scss" scoped>
.flex-box {
  padding: 16px 24px 0;
  margin-bottom: 16px;
  background-color: white;
  .search-btn {
    color: $color-primary;
    border-color: $color-primary;
    &:hover {
      background-color: $color-primary-light-9;
    }
  }
  :deep(.el-form-item) {
    margin-right: 8px;
    margin-bottom: 16px;
  }
  .extend-box {
    img {
      cursor: pointer;
      margin-left: 8px;
    }
  }
  .search-box {
    flex-shrink: 0;
    padding-left: 8px;
    margin-bottom: 16px;
    flex-grow: 1;
  }
}
</style>

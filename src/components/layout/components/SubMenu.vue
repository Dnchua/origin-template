<template>
  <div class="menu-wrapper">
    <el-menu-item
      ref="item"
      :index="menu.menuId"
      v-if="menu.children == null || menu.children.length == 0"
    >
      <template v-slot:title>
        <orange-icon v-if="menu.icon" :icon="menu.icon" class="menu-icon" />
        <span :style="getTextStyle(!menu.icon)">{{ menu.menuName }}</span>
      </template>
      <orange-icon
        v-if="menu.icon && !isChild && store.collapsed"
        :icon="menu.icon"
        class="menu-icon"
      />
    </el-menu-item>
    <el-sub-menu v-else :index="menu.menuId">
      <template v-slot:title>
        <orange-icon v-if="menu.icon" :icon="menu.icon" class="menu-icon" />
        <span :style="getTextStyle(!menu.icon)" v-show="!store.collapsed || isChild">{{
          menu.menuName
        }}</span>
      </template>
      <template v-for="child in menu.children" :key="child.menuId">
        <sub-menu class="nest-menu" :menu="child" :isChild="true" />
      </template>
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { MenuItem } from '@/types/upms/menu';
import { useLayoutStore } from '@/store';
import OrangeIcon from '@/components/icons/index.vue';

interface IProps {
  menu: MenuItem;
  isChild?: boolean;
}

const store = useLayoutStore();
const props: IProps = defineProps<IProps>();

// const getIconStyle = (isShow: boolean) => {
//   if (isShow && props.isChild) {
//     return [{ 'margin-left': '13px' }];
//   }
// };

const getTextStyle = (isShow: boolean) => {
  if (isShow && props.isChild) {
    return [{ 'padding-left': '13px' }];
  }
};
</script>

<style scoped>
.menu-icon {
  margin-right: 10px;
  font-size: 18px;
}
.nest-menu :deep(.el-menu-item span:first-child),
.nest-menu :deep(.el-menu-item .menu-icon:first-child),
.nest-menu :deep(.el-submenu__title span:first-child) {
  padding-left: 8px !important;
}
.nest-menu :deep(.el-submenu__title .menu-icon:first-child) {
  margin-left: 8px !important;
}
</style>

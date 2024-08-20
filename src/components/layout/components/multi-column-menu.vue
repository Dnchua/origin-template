<template>
  <ul class="multi-column-menu">
    <template v-for="menu in menuList" :key="menu.menuId">
      <el-popover
        placement="right-start"
        width="220"
        trigger="hover"
        :disabled="!menu.children || (menu.children || []).length === 0 || level >= 1"
        :show-arrow="false"
      >
        <template v-slot:reference>
          <li
            @click="selectMenuItem(menu)"
            :class="{ active: layoutStore.currentMenuId === menu.menuId }"
          >
            <div class="menu-name">
              <orange-icon
                v-if="menu.icon"
                :icon="menu.icon"
                style="margin-right: 5px; font-size: 18px"
              />
              {{ menu.menuName }}
            </div>
            <el-icon v-if="menu.children && menu.children.length"><el-icon-arrow-right /></el-icon>
            <div
              class="multi-column-menu-popover"
              :class="{ level2: level > 1 }"
              v-if="level >= 1 && (menu.children || []).length"
            >
              <div class="popover-box">
                <multiColumnMenu
                  :menuList="menu.children"
                  :key="column?.menuId + '-' + menu.menuId"
                  :level="2"
                  :column="column"
                  @select="select"
                />
              </div>
            </div>
          </li>
        </template>
        <multiColumnMenu
          v-if="(menu.children || []).length && level < 1"
          :menuList="menu.children"
          :level="level + 1"
          :column="column"
          @select="select"
        />
      </el-popover>
    </template>
  </ul>
</template>

<script setup lang="ts">
import { ArrowRight as ElIconArrowRight } from '@element-plus/icons-vue';
import { MenuItem } from '@/types/upms/menu';
import { useLayoutStore } from '@/store';
import OrangeIcon from '@/components/icons/index.vue';
import { SysMenuType } from '@/common/staticDict';
import { useSelectMenu } from './hooks';

const emit = defineEmits<{
  (e: 'select'): void;
}>();

const props = withDefaults(
  defineProps<{
    level: number;
    menuList?: Array<MenuItem>;
    column?: MenuItem;
  }>(),
  {
    level: 0,
  },
);

const layoutStore = useLayoutStore();

const { selectMenu } = useSelectMenu();

const selectMenuItem = (menu: MenuItem) => {
  if (layoutStore.currentMenuId == menu.menuId || menu.menuType == SysMenuType.DIRECTORY) return;
  // 单页面清空所有tags和cachePage
  // if (!layoutStore.supportTags) {
  //   layoutStore.clearAllTags();
  // }

  if (props.column && props.column.menuId !== layoutStore.currentColumnId) {
    layoutStore.setCurrentColumn(props.column);
  }
  nextTick(() => {
    selectMenu(menu);
    select();
  });
};
const select = () => {
  emit('select');
};
</script>

<style lang="scss">
.multi-column-menu {
  width: 200px;
  padding: 0 8px;
  margin: 0;
  list-style: none;
  li {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    padding: 0 16px;
    font-size: 14px;
    color: #333;
    border-radius: 4px;
    cursor: pointer;
    .menu-name {
      display: flex;
      align-items: center;
    }
    i {
      color: #999;
    }
    &:hover {
      background-color: #f6f6f6;
      & > .multi-column-menu-popover {
        display: block;
      }
    }
    &.active {
      color: $color-primary;
      background-color: $color-primary-light-9;
    }
  }
}
.multi-column-menu-popover {
  position: absolute;
  top: 0;
  left: 100%;
  display: none;
  padding-left: 16px;
  &.level2 {
    padding-left: 22px;
  }
  .popover-box {
    padding: 12px;
    background-color: white;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  }
}
</style>

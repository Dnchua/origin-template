<template>
  <div class="multi-column-wrap">
    <el-scrollbar
      wrap-class="scrollbar_dropdown__wrap"
      style="width: 80px; height: calc(100vh - 60px)"
      v-if="menuList && menuList.length"
    >
      <ul class="multi-column-list">
        <template v-for="(menu, index) in menuList" :key="menu.menuId">
          <el-popover
            ref="popover"
            placement="right-start"
            width="220"
            trigger="hover"
            :disabled="
              !menu.children || (menu.children || []).length === 0 || !layoutStore.collapsed
            "
            :show-arrow="false"
          >
            <template v-slot:reference>
              <li
                @click="onColumnChange(menu)"
                :class="{ active: layoutStore.currentColumnId === menu.menuId }"
              >
                <orange-icon v-if="menu.icon" :icon="menu.icon" />
                <p :title="menu.menuName.length > 4 ? menu.menuName : undefined">
                  {{ menu.menuName }}
                </p>
              </li>
            </template>
            <multiColumnMenu
              v-if="(menu.children || []).length"
              :menuList="menu.children"
              :level="1"
              @select="selectMenu(index)"
              :column="menu"
            />
          </el-popover>
        </template>
      </ul>
    </el-scrollbar>
    <el-scrollbar
      v-if="children && children.length"
      class="children-menu-scrollbar"
      wrap-class="scrollbar_dropdown__wrap"
      style="height: calc(100vh - 60px); background-color: white"
      :scroll-x="false"
    >
      <div style="padding: 24px 0">
        <multiColumnMenu
          :menuList="children"
          :level="0"
          :key="layoutStore.currentColumnId"
          :columnId="layoutStore.currentColumnId"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { PopoverInstance } from 'element-plus';
import { MenuItem } from '@/types/upms/menu';
import { useLayoutStore } from '@/store';
import OrangeIcon from '@/components/icons/index.vue';
import multiColumnMenu from './multi-column-menu.vue';

defineProps<{ menuList: MenuItem[] }>();
const popover: Ref<PopoverInstance[]> = ref([]);
const children: Ref<MenuItem[]> = ref([]);

const layoutStore = useLayoutStore();

const onColumnChange = (column: MenuItem) => {
  layoutStore.setCurrentColumn(column);
};

const selectMenu = (index: number) => {
  // console.log('selectMenu', index);
  // 自动隐藏弹出体，只在侧边栏折叠状态下才会触发
  popover.value[index].hide();
};

watch(
  () => layoutStore.currentColumn,
  (newVal, oldVal) => {
    if (newVal == oldVal) return;
    children.value = newVal.children || [];
  },
  { immediate: true },
);
</script>

<style lang="scss">
.multi-column-wrap {
  display: flex;
  min-width: 81px;
  height: 100%;
  border-right: 1px solid #e8e8e8;
  .children-menu-scrollbar {
    width: 0;
    flex: 1;
    .el-scrollbar__bar.is-horizontal {
      display: none;
    }
  }
  .multi-column-list {
    width: 80px;
    padding: 16px 0;
    margin: 0;
    text-align: center;
    list-style: none;
    li {
      display: flex;
      align-items: center;
      height: 80px;
      font-size: 14px !important;
      color: #a4a5a7;
      flex-direction: column;
      justify-items: center;
      cursor: pointer;
      &.active,
      &:hover {
        color: #fff;
        background-color: rgb(246 246 246 / 30%);
      }
      i {
        margin-top: 14px;
        font-size: 24px !important;
      }
      p {
        overflow: hidden;
        width: 100%;
        padding: 0 10px;
        margin: 12px 0 0;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>

<template>
  <div class="tags-panel" ref="panel">
    <el-icon class="arrow left"><el-icon-arrow-left @click="leftClick" /></el-icon>
    <el-icon class="arrow right"><el-icon-arrow-right @click="rightClick" /></el-icon>
    <div class="main-panel">
      <div
        class="scroll-box"
        ref="scroll"
        :style="{ transform: 'translateX(' + translateX + 'px)' }"
      >
        <TagItem
          ref="home"
          class="item"
          title="主页"
          :active="layoutStore.currentMenuId == null"
          :supportClose="false"
          @click="onTagItemClick(null)"
          @contextmenu.prevent="openMenu(null, $event)"
        />
        <TagItem
          ref="items"
          class="item"
          v-for="item in layoutStore.tagList"
          :key="item.menuId"
          :title="item.menuName"
          :active="item.menuId == layoutStore.currentMenuId"
          @close="onTagItemClose(item)"
          @click="onTagItemClick(item)"
          @contextmenu.prevent="openMenu(item, $event)"
        ></TagItem>
      </div>
    </div>
    <div
      v-show="contextMenuVisible"
      @click.stop="onMenuMaskClick"
      @contextmenu="openMaskMenu"
      style="
        position: fixed;
        top: 0;
        left: 0;
        z-index: 99999;
        width: 100vw;
        height: 100vh;
        background: rgb(0 0 0 / 1%);
      "
    >
      <ul
        class="contextmenu"
        style="z-index: 99999; background: white"
        :style="{ left: left + 'px', top: top + 'px' }"
      >
        <li @click="closeSelectTag" :class="currentMenu == null ? 'disabled' : ''">关闭</li>
        <li @click="closeOthersTags">关闭其他</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/store';
import { MenuItem } from '@/types/upms/menu';
import { T } from '@/types/generic';
import TagItem from './TagItem.vue';

const layoutStore = useLayoutStore();

const panel = ref();
const scroll = ref();
const home = ref();
const items = ref<T[]>([]);

const contextMenuVisible = ref(false);
const translateX = ref(0);
const left = ref(0);
const top = ref(0);

let currentMenu: MenuItem | null = null;

const onTagItemClick = (item: MenuItem | null) => {
  layoutStore.setCurrentMenu(item);
};
const openMenu = (item: MenuItem | null, event: MouseEvent) => {
  // console.log(item, event);
  currentMenu = item;
  contextMenuVisible.value = true;
  left.value = event.clientX;
  top.value = event.clientY;
};
const onMenuMaskClick = () => {
  console.log('onMenuMaskClick');
  contextMenuVisible.value = false;
};
const openMaskMenu = (e: MouseEvent) => {
  // console.log('openMaskMenu');
  e.preventDefault();
};
const closeSelectTag = () => {
  if (currentMenu != null) {
    layoutStore.removeTag(currentMenu.menuId);
  }
};
const closeOthersTags = () => {
  //console.log('closeOthersTags');
  if (currentMenu != null) {
    layoutStore.closeOtherTags(currentMenu.menuId);
  } else {
    layoutStore.clearAllTags();
  }
};
const onTagItemClose = (item: MenuItem) => {
  layoutStore.removeTag(item.menuId);
};

onMounted(() => {
  initTagPanel(layoutStore.tagList);
  scrollToMenu(layoutStore.currentMenu);
});

function initTagPanel(tagList: MenuItem[]) {
  nextTick(() => {
    let width = (home.value ? home.value.root.offsetWidth : 0) + 60 + tagList.length * 5;
    //console.log('width', width);
    items.value.forEach(row => {
      //console.log(row);
      width += row.root.offsetWidth + 5;
    });
    //console.log('width', width);
    scroll.value.style.width = width + 'px';
    const showArrow = width > panel.value.offsetWidth;
    if (!showArrow) {
      translateX.value = 0;
    } else if (panel.value.offsetWidth - width >= translateX.value && translateX.value !== 0) {
      translateX.value = panel.value.offsetWidth - width;
    }
    //console.log('xxx', translateX.value);
  });
}

function scrollToMenu(menu: MenuItem) {
  nextTick(() => {
    layoutStore.tagList.forEach((row, index) => {
      if (row.menuId === menu.menuId) {
        let el = items.value[index].root;
        if (-el.offsetLeft > translateX.value) {
          translateX.value = -el.offsetLeft;
        } else if (
          el.offsetLeft + el.offsetWidth + 60 >
          panel.value.offsetWidth - translateX.value
        ) {
          translateX.value = panel.value.offsetWidth - el.offsetLeft - el.offsetWidth - 60;
        }
      }
    });
  });
}

watch(
  () => layoutStore.currentMenu,
  (menu: MenuItem) => {
    scrollToMenu(menu);
  },
);

watch(
  () => layoutStore.tagList,
  tagList => {
    if (tagList && tagList.length) {
      initTagPanel(tagList);
    }
  },
  { deep: true },
);

const leftClick = () => {
  if (!items.value) return;
  let x = 0;

  for (let i = layoutStore.tagList.length - 1; i >= 0; i--) {
    const el = items.value[i].root;
    //console.log(el.innerText, layoutStore.tagList[i].menuName);
    console.log(el.offsetLeft, translateX.value, -el.offsetLeft > translateX.value);
    if (-el.offsetLeft > translateX.value) {
      x = -el.offsetLeft;
      break;
    }
    console.log('x', x);
  }
  if (x > 0) {
    x = 0;
  }

  console.log('x', x);

  translateX.value = x;
};

const rightClick = () => {
  if (!items.value) return;
  let x = translateX.value;
  for (let i = 0; i < layoutStore.tagList.length; i++) {
    const el = items.value[i].root;
    if (el.offsetLeft + el.offsetWidth + 60 > panel.value.offsetWidth - translateX.value) {
      x = panel.value.offsetWidth - el.offsetLeft - el.offsetWidth - 60;
      break;
    }
  }
  console.log('x', x, panel.value.offsetWidth, scroll.value.offsetWidth);
  let max = panel.value.offsetWidth - scroll.value.offsetWidth - 60;
  console.log('max', max);
  if (x < max) {
    x = max;
  }
  if (x > 0) x = 0;
  translateX.value = x;
};
</script>

<style lang="scss" scoped>
.tags-panel {
  width: 100px;
  background-color: white;
  flex: 1;
}
.main-panel {
  position: relative;
  overflow: hidden;
  margin: 0 30px;
}
.scroll-box {
  display: flex;
  align-items: center;
  overflow: hidden;
  width: 100%;
  height: 48px;
  white-space: nowrap;
  transition: 0.3s;
  flex-wrap: nowrap;
}
.arrow {
  z-index: 100;
  width: 30px;
  height: 48px;
  font-size: 14px;
  text-align: center;
  color: #999;
  line-height: 48px;
  cursor: pointer;
  box-sizing: border-box;
}
.arrow.left {
  float: left;
}
.arrow.right {
  float: right;
}
.contextmenu {
  position: fixed;
  z-index: 2;
  padding: 5px 0;
  margin: 0;
  font-size: 12px;
  color: #333;
  border-radius: 5px;
  box-shadow: 2px 2px 3px 0 rgb(0 0 0 / 30%);
  list-style-type: none;
  font-weight: 400;
}
.contextmenu li {
  padding: 7px 16px;
  margin: 0;
  cursor: pointer;
}
.contextmenu li.disabled {
  padding: 7px 16px;
  margin: 0;
  cursor: not-allowed;
}
.contextmenu li:hover {
  background: #eee;
}
</style>

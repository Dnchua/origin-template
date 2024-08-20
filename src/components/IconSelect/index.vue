<template>
  <el-popover width="510" v-model:visible="showDropdown" @show="onDropdownShow" trigger="click">
    <div class="icon-select-dropdown">
      <el-row type="flex" style="flex-wrap: wrap">
        <div
          v-for="icon in getIconList"
          :key="icon"
          class="icon-item"
          :class="{ active: value === icon }"
          @click="onIconClick(icon)"
          :title="icon"
        >
          <orange-icon :icon="icon" />
        </div>
      </el-row>
      <el-row type="flex" justify="space-between">
        <el-button link @click="onClearClick" style="margin-left: 10px">清空</el-button>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="getIconCount"
        >
        </el-pagination>
      </el-row>
    </div>
    <template v-slot:reference>
      <div
        class="icon-select-input"
        :style="{
          width: height + 'px',
          height: height + 'px',
          'line-height': height + 'px',
          'font-size': height * 0.5 + 'px',
        }"
      >
        <orange-icon v-if="value" :icon="value" />
      </div>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import OrangeIcon from '../icons/index.vue';
//import iconList from './icon.json';

const iconList: string[] = [];
for (const [key] of Object.entries(ElementPlusIconsVue)) {
  //console.log(key);
  iconList.push(key);
}

const emit = defineEmits<{
  (e: 'update:value', icon?: string): void;
}>();

const props = withDefaults(
  defineProps<{
    value?: string;
    height?: number;
  }>(),
  {
    value: '',
    height: 45,
  },
);

const showDropdown = ref(false);
const currentPage = ref(1);
const pageSize = ref(32);

const onIconClick = (icon: string) => {
  emit('update:value', icon);
  showDropdown.value = false;
};

const onClearClick = () => {
  emit('update:value', '');
  showDropdown.value = false;
};

const onDropdownShow = () => {
  currentPage.value = 1;
  let pos = iconList.indexOf(props.value);
  if (pos >= 0) {
    currentPage.value += Math.floor(pos / pageSize.value);
  }
};

const getIconCount = computed(() => {
  return iconList.length;
});

const getIconList = computed(() => {
  let beginPos = (currentPage.value - 1) * pageSize.value;
  let endPos = beginPos + pageSize.value;
  return iconList.slice(beginPos, endPos);
});
</script>

<style scoped>
.icon-select-input {
  text-align: center;
  color: #5f6266;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}
.icon-item {
  width: 40px;
  height: 40px;
  margin: 10px;
  font-size: 20px;
  text-align: center;
  color: #5f6266;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  line-height: 40px;
  cursor: pointer;
}
.active {
  color: #ef5e1c;
}
</style>

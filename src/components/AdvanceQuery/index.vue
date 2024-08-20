<template>
  <el-container class="advance-query-form advance-query advance-box">
    <el-aside width="300px" style="background-color: white">
      <el-card class="base-card" shadow="never" style="height: 100%; border: none">
        <template v-slot:header>
          <div class="base-card-header">
            <span class="header-title">{{ treePanel.title }}</span>
            <div class="base-card-operation">
              <el-button
                class="advance-icon-btn"
                @click="refreshGroup()"
                style="width: 40px; height: 32px; padding: 0"
              >
                <img src="@/assets/img/refresh2.png" alt="" style="vertical-align: middle" />
              </el-button>
              <el-button
                class="advance-icon-btn"
                v-if="treePanel.supportAdd"
                style="width: 40px; height: 32px; padding: 0"
                @click="onEditGroupItem(null)"
              >
                <!-- {{treePanel.addText}} -->
                <img src="@/assets/img/add.png" alt="" style="vertical-align: middle" />
              </el-button>
            </div>
          </div>
        </template>
        <el-scrollbar :style="{ height: height - 130 + 'px' }" class="custom-scroll">
          <el-tree
            ref="groupTree"
            :data="groupDataList"
            :node-key="treePanel.keyColumnName"
            @node-click="onNodeClick"
            :highlight-current="true"
            :default-expand-all="true"
            :auto-expand-parent="true"
            :expand-on-click-node="false"
          >
            <template v-slot="{ data }">
              <el-row
                class="tree-node-item module-node-item"
                type="flex"
                justify="space-between"
                align="middle"
              >
                <span class="node-text" :title="data[treePanel.nameColumnName]">{{
                  data[treePanel.nameColumnName]
                }}</span>
                <div class="module-node-menu" style="padding-right: 9px">
                  <el-button
                    v-if="treePanel.supportEdit"
                    link
                    type="primary"
                    @click.stop="onEditGroupItem(data)"
                    :icon="Edit"
                  ></el-button>
                  <el-button
                    v-if="treePanel.supportDelete"
                    link
                    type="danger"
                    @click.stop="onDeleteGroupItem(data)"
                    :icon="Delete"
                  ></el-button>
                </div>
              </el-row>
            </template>
          </el-tree>
        </el-scrollbar>
      </el-card>
    </el-aside>
    <el-main class="table-panel">
      <el-card
        class="base-card"
        shadow="never"
        :body-style="{ padding: '0px' }"
        style="border: none"
      >
        <template v-slot:header>
          <div class="base-card-header">
            <span class="header-title">{{ tablePanel.title }}</span>
            <div class="base-card-operation">
              <slot name="tableFilter" />
              <el-button
                v-if="tablePanel.supportAdd"
                type="primary"
                style="margin-left: 20px"
                :size="layoutStore.defaultFormItemSize"
                :icon="Plus"
                @click="onAddTableItem()"
                >{{ tablePanel.addText }}</el-button
              >
            </div>
          </div>
        </template>
        <div class="advance-table-box">
          <slot name="table" />
        </div>
      </el-card>
    </el-main>
    <slot />
  </el-container>
</template>

<script setup lang="ts">
import { Edit, Delete, Plus } from '@element-plus/icons-vue';
import { inject, onMounted, ref, watch } from 'vue';
import { ANY_OBJECT } from '@/types/generic';
import { treeDataTranslate, findItemFromList } from '@/common/utils';

const emit = defineEmits<{
  editGroupItem: [ANY_OBJECT];
  refreshTable: [ANY_OBJECT];
  deleteGroupItem: [ANY_OBJECT];
  addTableItem: [];
}>();

const props = defineProps<{
  height: number;
  treePanel: ANY_OBJECT;
  tablePanel: ANY_OBJECT;
}>();

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const groupTree = ref();
const currentGroup = ref();
const groupDataList = ref<ANY_OBJECT[]>([]);

const loadGroupData = () => {
  if (typeof props.treePanel.loadFunction === 'function') {
    props.treePanel
      .loadFunction()
      .then((dataList: ANY_OBJECT[]) => {
        groupDataList.value = treeDataTranslate(
          dataList.map((item: ANY_OBJECT) => {
            return {
              ...item,
            };
          }),
          props.treePanel.keyColumnName,
        );
        if (currentGroup.value != null) {
          currentGroup.value = findItemFromList(
            dataList,
            currentGroup.value[props.treePanel.keyColumnName],
            props.treePanel.keyColumnName,
          );
        }
        if (currentGroup.value == null) currentGroup.value = dataList[0];
        setTimeout(() => {
          if (groupTree.value && currentGroup.value)
            groupTree.value.setCurrentKey(currentGroup.value[props.treePanel.keyColumnName]);
        }, 50);
      })
      .catch((e: Error) => {
        console.warn(e);
      });
  }
};
const refreshGroup = () => {
  loadGroupData();
};
const onEditGroupItem = (data: ANY_OBJECT) => {
  emit('editGroupItem', data);
};
const onNodeClick = (data: ANY_OBJECT) => {
  currentGroup.value = data;
};
const onDeleteGroupItem = (data: ANY_OBJECT) => {
  emit('deleteGroupItem', data);
};
const onAddTableItem = () => {
  emit('addTableItem');
};

defineExpose({ refreshGroup });

watch(
  currentGroup,
  (newVal, oldVal) => {
    if (newVal != oldVal) {
      emit('refreshTable', newVal);
    }
  },
  {
    deep: true,
  },
);

onMounted(() => {
  loadGroupData();
});
</script>

<style scoped>
.el-main {
  display: flex;
  flex-direction: column;
}
.table-panel {
  padding: 0;
  margin-left: 15px;
  background: white;
}
.table-panel .base-card {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.advance-query :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.advance-query :deep(.el-tree-node__content) {
  height: 35px;
}
.advance-query .tree-node-item {
  flex: 1;
  height: 35px;
  line-height: 35px;
  font-size: 12px;
}
.advance-query .module-node-menu {
  text-align: right;
}
.advance-query .tree-node-item .node-text {
  overflow: hidden;
  max-width: 175px;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.advance-table-box {
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>

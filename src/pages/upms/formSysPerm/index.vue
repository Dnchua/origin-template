<template>
  <el-container class="advance-query-form advance-box">
    <el-aside width="300px" style="background-color: white">
      <PermGroupList
        @select="onSelect"
        @change="refreshFormPerm"
        :perm-module-list="permModuleId.impl.dropdownList"
      />
    </el-aside>
    <el-main style="overflow: inherit; margin-left: 15px">
      <PermList
        :perm-module-id="currentPermModuleId"
        :perm-module-list="permModuleId.impl.dropdownList"
      />
    </el-main>
  </el-container>
</template>

<script lang="ts">
export default {
  name: 'formSysPerm',
};
</script>

<script setup lang="ts">
import { PermController } from '@/api/system';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import { PermModule } from '@/types/upms/perm';
import { ANY_OBJECT } from '@/types/generic';
import { SysPermModuleType } from '@/common/staticDict/index';
import PermList from './PermList.vue';
import PermGroupList from './PermGroupList.vue';

const currentPermModuleId = ref();

/**
 * 所属权限模块下拉数据获取函数
 */
const loadPermModuleIdDropdownList = (): Promise<ListData<PermModule>> => {
  return new Promise((resolve, reject) => {
    let params = {};
    PermController.getPermGroupList(params)
      .then(res => {
        resolve({ dataList: res.data });
      })
      .catch(e => {
        reject(e);
      });
  });
};

const dropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadPermModuleIdDropdownList,
  idKey: 'moduleId',
  isTree: true,
};
const permModuleId = reactive({
  impl: useDropdown(dropdownOptions),
});

/**
 * 更新权限管理
 */
const refreshFormPerm = () => {
  permModuleId.impl.refresh().catch(e => {
    console.warn(e);
  });
};

const onSelect = (module: PermModule) => {
  console.log('module', module);
  if (module.moduleType == SysPermModuleType.CONTROLLER) {
    currentPermModuleId.value = module.moduleId;
  }
};

onMounted(() => {
  refreshFormPerm();
});
</script>

<style scoped>
.el-main {
  display: flex;
  flex-direction: column;
}
:deep(.el-tree-node__content) {
  height: 35px;
}
:deep(.el-tree-node__content .is-leaf) {
  display: none;
}
:deep(.module-node-item) {
  width: 100%;
  height: 35px;
  line-height: 35px;
}
:deep(.module-node-menu) {
  float: right;
  width: 84px;
  padding-right: 9px;
  text-align: right;
}
:deep(.module-node-menu.group) {
  width: 84px;
  padding-right: 9px;
  text-align: right;
}
:deep(.module-node-text) {
  width: 100%;
  margin-right: 56px;
}
:deep(.module-node-text.group) {
  margin-right: 84px;
}
:deep(.el-tree-node__content .is-leaf + .module-node-item .module-node-text) {
  padding-left: 24px;
}
:deep(.module-node-text .text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

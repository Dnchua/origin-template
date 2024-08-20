<template>
  <div class="tab-dialog-box" style="position: relative">
    <el-tabs v-model="activeFragmentId" :before-leave="onFragmentChange">
      <el-tab-pane
        label="数据权限管理"
        name="fragmentSysDataPerm"
        style="width: 100%"
        v-if="checkPermCodeExist('formSysDataPerm:fragmentSysDataPerm')"
      >
        <tab-content-data-perm ref="tabDataPerm" />
      </el-tab-pane>
      <el-tab-pane
        label="用户授权"
        name="fragmentSysDataPermUser"
        style="width: 100%"
        v-if="checkPermCodeExist('formSysDataPerm:fragmentSysDataPermUser')"
      >
        <tab-content-data-perm-user />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
export default {
  name: 'formSysDataPerm',
};
</script>

<script setup lang="ts">
import { TabPaneName, ElMessage } from 'element-plus';
import { usePermissions } from '@/common/hooks/usePermission';
import { ANY_OBJECT } from '@/types/generic';
import TabContentDataPerm from './TabContentDataPerm.vue';
import TabContentDataPermUser from './TabContentDataPermUser.vue';

const { checkPermCodeExist } = usePermissions();
let permCodeList: ANY_OBJECT[] = [];

const activeFragmentId = ref();
const onFragmentChange = (newPanel: TabPaneName) => {
  //console.log(newPanel, oldPanel, activeFragmentId);
  if (newPanel == activeFragmentId.value) return;
  for (let i = 0; i < permCodeList.length; i++) {
    if (permCodeList[i].key === newPanel) {
      activeFragmentId.value = newPanel;
      if (permCodeList[i].refresh) permCodeList[i].refresh();
      return true;
    }
  }
  return false;
};

const tabDataPerm = ref();
const refreshFragmentSysDataPerm = () => {
  tabDataPerm.value.refreshFragmentSysDataPerm();
};

const buildFragmentPermCodeMap = () => {
  permCodeList = [
    {
      key: 'fragmentSysDataPerm',
      permCode: 'formSysDataPerm:fragmentSysDataPerm',
      refresh: refreshFragmentSysDataPerm,
    },
    {
      key: 'fragmentSysDataPermUser',
      permCode: 'formSysDataPerm:fragmentSysDataPermUser',
      // 切换到授权用户Tab页的时候不自动刷新页面数据，因为必须选择数据权限后才可以获得用户列表
      // refresh: this.refreshFragmentSysDataPermUser
    },
  ];
};
const getDefaultFragment = () => {
  for (let i = 0; i < permCodeList.length; i++) {
    if (checkPermCodeExist(permCodeList[i].permCode)) {
      activeFragmentId.value = permCodeList[i].key;
      return permCodeList[i];
    }
  }
  return undefined;
};
const formInit = () => {
  buildFragmentPermCodeMap();
  let defaultFragment = getDefaultFragment();
  if (defaultFragment == null) {
    ElMessage.error('您没有访问这个页面的权限，请与系统管理员联系！');
  } else {
    if (defaultFragment.refresh) defaultFragment.refresh();
  }
};

onMounted(() => {
  formInit();
});
</script>

<style lang="scss" scoped>
.tab-dialog-box {
  padding: 0 !important;
  margin: 0 !important;
  background-color: #f6f6f6 !important;
  :deep(.el-tabs__header) {
    margin-bottom: 0;
    background-color: white;
    border-top: 1px solid #e8e8e8;
  }
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  :deep(.el-tabs__item) {
    height: 44px;
    line-height: 44px;
  }
  :deep(.el-tabs__nav-wrap) {
    padding-left: 24px;
  }
  :deep(.el-tabs__content) {
    overflow: hidden;
  }

  :deep(.tab-content-box) {
    display: flex;
    margin: 16px;
    flex-direction: column;
    flex: 1;
  }
}
</style>

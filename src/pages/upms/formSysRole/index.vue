<template>
  <div class="tab-dialog-box" style="position: relative">
    <el-tabs v-model="activeFragmentId" :before-leave="onFragmentChange">
      <el-tab-pane
        label="角色管理"
        name="fragmentSysRole"
        style="width: 100%"
        v-if="checkPermCodeExist('formSysRole:fragmentSysRole')"
      >
        <tab-content-role ref="tabRole" />
      </el-tab-pane>
      <el-tab-pane
        label="用户授权"
        name="fragmentSysRoleUser"
        style="width: 100%"
        v-if="checkPermCodeExist('formSysRole:fragmentSysRoleUser')"
      >
        <tab-content-user />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
export default {
  name: 'formSysRole',
};
</script>

<script setup lang="ts">
import { TabPaneName, ElMessage } from 'element-plus';
import { usePermissions } from '@/common/hooks/usePermission';
import { ANY_OBJECT } from '@/types/generic';
import TabContentRole from './TabContentRole.vue';
import TabContentUser from './TabContentUser.vue';

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

const tabRole = ref();
const refreshFragmentSysRole = () => {
  // 重新获取数据组件的数据
  tabRole.value.refreshFragmentSysRole();
};

const buildFragmentPermCodeMap = () => {
  permCodeList = [
    {
      key: 'fragmentSysRole',
      permCode: 'formSysRole:fragmentSysRole',
      refresh: refreshFragmentSysRole,
    },
    {
      key: 'fragmentSysRoleUser',
      permCode: 'formSysRole:fragmentSysRoleUser',
      // 切换到角色用户Tab页的时候不自动刷新页面数据，因为必须选择当前角色后才可以获得角色用户
      // refresh: refreshFragmentSysRoleUser
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

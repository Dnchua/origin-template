<template>
  <el-container :class="'container-' + defaultFormItemSize" :style="getMainStyle">
    <el-container style="background-color: #f5f8f9">
      <el-header
        class="header"
        style="padding: 0"
        :class="layoutStore.supportColumn ? 'multi-column-header' : ''"
      >
        <div class="logo has-multi-column" v-if="layoutStore.supportColumn">
          <img src="@/assets/img/logo_white.png" alt="" />
        </div>
        <div class="header-main">
          <div
            class="logo"
            v-if="!layoutStore.supportColumn"
            style="padding-left: 8px; margin-right: 8px"
          >
            <img src="@/assets/img/login_logo.png" alt="" />
          </div>
          <div class="title">{{ projectName }}</div>
          <bread-crumb class="breadcrumb-container" />
          <div class="header-menu" style="flex-grow: 1">
            <el-dropdown trigger="click" style="margin-right: 14px" @command="handleMessage">
              <el-badge
                is-dot
                :hidden="!messageCount.totalCount || messageCount.totalCount <= 0"
                style="height: 20px; line-height: 20px; cursor: pointer"
              >
                <i class="online-icon icon-message" style="font-size: 16px; color: #333" />
              </el-badge>
              <template #dropdown>
                <el-dropdown-menu style="min-width: 130px">
                  <el-dropdown-item class="user-dropdown-item" command="remindingMessage">
                    催办消息
                    <el-badge
                      :value="messageCount.remindingMessageCount"
                      :hidden="
                        !messageCount.remindingMessageCount ||
                        messageCount.remindingMessageCount <= 0
                      "
                    />
                  </el-dropdown-item>
                  <el-dropdown-item class="user-dropdown-item" command="copyMessage">
                    抄送消息
                    <el-badge
                      :value="messageCount.copyMessageCount"
                      :hidden="!messageCount.copyMessageCount || messageCount.copyMessageCount <= 0"
                    />
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <span class="line"></span>
            <img :src="headerImg ? headerImg : defaultHeaderImg" class="header-img" />
            <el-dropdown class="user-dropdown" trigger="click" @command="handleCommand">
              <span class="el-dropdown-link"
                >{{ (userInfo || {}).showName
                }}<el-icon class="el-icon--right"><el-icon-arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item class="user-dropdown-item" command="modifyPassword"
                    >修改密码</el-dropdown-item
                  >
                  <el-dropdown-item class="user-dropdown-item" command="modifyHeadImage"
                    >修改头像</el-dropdown-item
                  >
                  <el-dropdown-item class="user-dropdown-item" command="logout"
                    >退出登录</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main class="layout-main">
        <el-aside
          :width="
            layoutStore.collapsed
              ? layoutStore.supportColumn
                ? '80px'
                : '64px'
              : layoutStore.supportColumn
              ? '280px'
              : '204px'
          "
          class="sidebar"
        >
          <sidebar style="overflow: hidden"></sidebar>
        </el-aside>
        <div class="layout-content">
          <div class="tag-wrap" v-if="layoutStore.supportTags">
            <i
              class="online-icon"
              :class="layoutStore.collapsed ? 'icon-expand' : 'icon-unexpand'"
              style="font-size: 16px; color: #333; cursor: pointer"
              @click="() => layoutStore.toggleCollapsed()"
            />
            <tag-panel />
          </div>
          <el-scrollbar wrap-class="scrollbar_dropdown__wrap" :style="getContextStyle">
            <router-view
              v-slot="{ Component }"
              class="page-box"
              style="overflow: hidden; margin: 16px"
              :style="getRouterViewStyle"
            >
              <transition name="el-fade-in-linear" :appear="true">
                <keep-alive :include="layoutStore.cachePages">
                  <component :is="Component" />
                </keep-alive>
              </transition>
            </router-view>
          </el-scrollbar>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
export default {
  name: 'Layout',
};
</script>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import defaultHeaderImg from '@/assets/img/default-header.jpg';
import { getToken, setToken } from '@/common/utils/index';
import { useLayoutStore, useLoginStore, useMessage } from '@/store';
import { SysMenuBindType, SysOnlineFormType } from '@/common/staticDict';
import LoginController from '@/api/system/LoginController';
import { MenuItem } from '@/types/upms/menu';
import { useUpload } from '@/common/hooks/useUpload';
import { useCommon } from '@/common/hooks/useCommon';
import Sidebar from './components/Sidebar.vue';
import BreadCrumb from './components/BreadCrumb.vue';
import TagPanel from './components/TagPanel.vue';
import FormModifyPassword from './components/formModifyPassword/index.vue';
import FormModifyHeadImage from './components/formModifyHeadImage/index.vue';

const { Dialog } = useCommon();
const router = useRouter();
const route = useRoute();
const layoutStore = useLayoutStore();
const loginStore = useLoginStore();
const documentClientHeight = inject('documentClientHeight', ref(500));
const projectName = process.env.VUE_APP_PROJECT_NAME;

const { getUploadFileUrl } = useUpload();

const userInfo = loginStore.userInfo;
// TODO 切换菜单会触发该方法？
// 用户头像
const headerImg = computed(() => {
  if (userInfo && userInfo.headImageUrl) {
    let temp = getUploadFileUrl(userInfo.headImageUrl, {
      filename: userInfo.headImageUrl.filename,
    });
    return temp;
  } else {
    return null;
  }
});

// 消息数量
const messageStore = useMessage();
const messageCount = computed(() => {
  return messageStore.messageCount || {};
});

// TODO 监听当前菜单变化，跳转到目标路由
watch(
  () => layoutStore.currentMenu,
  (newVal, oldVal) => {
    //console.log('当前页发生变化', newVal, oldVal);
    if (newVal != oldVal) {
      jumpTo(newVal);
    }
    // else {
    //   if (route.name != layoutStore.indexName) {
    //     router.replace({
    //       name: layoutStore.indexName,
    //     });
    //   }
    // }
  },
);

// 路由跳转
function jumpTo(menuItem: MenuItem) {
  if (menuItem != null) {
    // 路由菜单
    if (
      menuItem.bindType === SysMenuBindType.ROUTER &&
      menuItem.formRouterName != null &&
      menuItem.formRouterName !== ''
    ) {
      router.replace({
        name: menuItem.formRouterName,
      });
      return;
    }
    // 在线表单菜单
    if (
      menuItem.bindType === SysMenuBindType.ONLINE_FORM &&
      menuItem.onlineFormId != null &&
      menuItem.onlineFormId !== ''
    ) {
      router.replace({
        name: 'onlineForm',
        query: {
          formId: menuItem.onlineFormId,
          formType: SysOnlineFormType.QUERY,
        },
      });
      return;
    }
    // 工单列表菜单
    if (
      menuItem.bindType === SysMenuBindType.WORK_ORDER &&
      menuItem.onlineFormId != null &&
      menuItem.onlineFormId !== '' &&
      menuItem.onlineFlowEntryId != null &&
      menuItem.onlineFlowEntryId !== ''
    ) {
      router.replace({
        name: 'onlineForm',
        query: {
          formId: menuItem.onlineFormId,
          entryId: menuItem.onlineFlowEntryId,
          formType: SysOnlineFormType.WORK_ORDER,
        },
      });
      return;
    }
    // 报表菜单
    if (
      menuItem.bindType === SysMenuBindType.REPORT &&
      menuItem.reportPageId != null &&
      menuItem.reportPageId !== ''
    ) {
      router.replace({
        name: 'reportRender',
        query: {
          pageId: menuItem.reportPageId,
        },
      });
      return;
    }
    // 外部链接
    if (
      menuItem.bindType === SysMenuBindType.THRID_URL &&
      menuItem.targetUrl != null &&
      menuItem.targetUrl !== ''
    ) {
      let token = getToken();
      let targetUrl = menuItem.targetUrl;
      if (targetUrl.indexOf('?') === -1) {
        targetUrl = targetUrl + '?';
      }
      targetUrl = targetUrl + 'token=' + token;
      window.open(targetUrl);
      return;
    }
  }
  console.warn('没有匹配到目标路由');
  if (route.name !== layoutStore.indexName) {
    router.replace({
      name: layoutStore.indexName,
    });
  }
}

const getMainStyle = computed(() => {
  return [
    {
      height: documentClientHeight.value + 'px',
    },
  ];
});

const getContextStyle = computed(() => {
  return [
    {
      height: documentClientHeight.value - (layoutStore.supportTags ? 108 : 60) + 'px',
    },
  ];
});

const getRouterViewStyle = computed(() => {
  return [
    {
      'min-height': documentClientHeight.value - (layoutStore.supportTags ? 108 : 60) - 32 + 'px',
    },
  ];
});

const handleMessage = (command: string) => {
  router.push({
    name: 'formMessage',
    query: {
      type: command,
    },
  });
};

const handleCommand = (command: string) => {
  switch (command) {
    case 'logout':
      ElMessageBox.confirm('是否退出登录？', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          LoginController.logout()
            .then(() => {
              ElMessage({
                type: 'success',
                message: '退出成功',
              });
              setToken(null);
              router.replace('/login');
            })
            .catch(e => {
              console.log(e);
              ElMessage({
                type: 'error',
                message: e,
              });
            });
        })
        .catch(() => {
          console.log('取消退出');
        });
      break;
    case 'modifyPassword':
      Dialog.show('修改密码', FormModifyPassword, { area: '500px' }, {}).catch(e => {
        console.warn(e);
      });
      break;
    case 'modifyHeadImage':
      Dialog.show('修改头像', FormModifyHeadImage, { area: '500px' }, {});
      break;
    default:
      ElMessage.warning(`click on item ${command}`);
      break;
  }
};

onMounted(() => {
  messageStore.startMessage();
});

onBeforeUnmount(() => {
  messageStore.stopMessage();
});
</script>

<style lang="scss">
.header {
  z-index: 1;
  .header-main {
    display: flex;
    align-items: center;
    padding-left: 4px;
    box-shadow: 0 2px 10px 1px rgb(65 64 133 / 10%);
    flex: 1;
    .title {
      overflow: hidden;
      width: 144px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .logo {
    padding-left: 16px;
    img {
      width: 40px;
    }
  }
  .has-multi-column {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 60px;
    padding-left: 0;
    background-color: $color-primary;
    img {
      width: 36px;
    }
  }
  .title {
    font-size: 22px;
    font-weight: bold;
    color: #434344;
  }
}
.sidebar {
  transition: 0.3s;
}
.el-menu {
  background-color: #2d3039 !important;
}
.layout-main {
  display: flex !important;
  .layout-content {
    width: 0;
    flex: 1;
  }
  .tag-wrap {
    display: flex;
    align-items: center;
    padding: 0 25px;
    background-color: white;
    .collapse-img {
      padding: 4px;
      margin-right: 12px;
      background-color: #f6f7f9;
      border-radius: 4px;
      cursor: pointer;
      img {
        vertical-align: middle;
      }
    }

    .collapse {
      transform: rotate(180deg);
    }
  }
}
.message-popover {
  padding: 5px !important;
}

.message-popover .el-table::before {
  height: 0 !important;
}

.message-popover .el-table td {
  border: none;
}
.header-menu {
  align-items: center;
  padding-right: 45px;
  .header-img {
    width: 31px !important;
    height: 31px !important;
    margin-right: 8px;
  }
  .line {
    display: inline-block;
    width: 1px;
    height: 24px;
    background-color: #e8e8e8;
    vertical-align: middle;
  }
}
.user-dropdown {
  color: #333 !important;
  .el-icon-arrow-down {
    color: #333;
  }
}
.code-generation-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 82px;
  height: 32px;
  padding: 0 !important;
  margin-right: 20px !important;
  color: $color-primary !important;
  border-color: $color-primary !important;
  span {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    img {
      margin-right: 4px;
    }
  }
}
.multi-column-header .header-main {
  padding-left: 16px;
  .title {
    width: 185px;
  }
}
.page-box {
  display: flex !important;
  flex-direction: column;
}
</style>

import { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/index.vue';
import Welcome from '@/pages/welcome/index.vue';
import Login from '@/pages/login/index.vue';
import { useLayoutStore } from '@/store';

function getProps(route: RouteLocationNormalizedLoaded) {
  return route.query;
}

// 系统生成路由
export const routers: Array<RouteRecordRaw> = [
  {
    path: '/login',
    component: Login,
    name: 'login',
    meta: {
      title: '登录',
    },
  },
  {
    path: '/',
    component: Layout,
    name: 'main',
    props: getProps,
    redirect: {
      name: 'welcome',
    },
    meta: {
      title: '主页',
      showOnly: true,
    },
    children: [
      {
        path: 'welcome',
        component: Welcome,
        name: 'welcome',
        meta: { title: '欢迎' },
      },
      {
        path: 'formSysMenu',
        component: () =>
          useLayoutStore().supportColumn
            ? import('@/pages/upms/formSysMenu/formSysColumnMenu.vue')
            : import('@/pages/upms/formSysMenu/index.vue'),
        name: 'formSysMenu',
        meta: { title: '菜单列表' },
      },
      {
        path: 'formSysUser',
        component: () => import('@/pages/upms/formSysUser/index.vue'),
        name: 'formSysUser',
        meta: { title: '用户列表' },
      },
      {
        path: 'formSysDept',
        component: () => import('@/pages/upms/formSysDept/index.vue'),
        name: 'formSysDept',
        meta: { title: '部门列表' },
      },
      {
        path: 'formSysRole',
        component: () => import('@/pages/upms/formSysRole/index.vue'),
        name: 'formSysRole',
        meta: { title: '角色管理' },
      },
      {
        path: 'formSysDataPerm',
        component: () => import('@/pages/upms/formSysDataPerm/index.vue'),
        name: 'formSysDataPerm',
        meta: { title: '数据权限管理' },
      },
      {
        path: 'formSysPermCode',
        component: () => import('@/pages/upms/formSysPermCode/index.vue'),
        name: 'formSysPermCode',
        meta: { title: '权限字管理' },
      },
      {
        path: 'formSysPerm',
        component: () => import('@/pages/upms/formSysPerm/index.vue'),
        name: 'formSysPerm',
        meta: { title: '权限资源管理' },
      },
      {
        path: 'formSysLoginUser',
        component: () => import('@/pages/upms/formSysLoginUser/index.vue'),
        name: 'formSysLoginUser',
        meta: { title: '在线用户' },
      },
      // 岗位模块路由配置
      {
        path: 'formSysPost',
        component: () => import('@/pages/upms/formSysPost/index.vue'),
        name: 'formSysPost',
        meta: { title: '岗位管理' },
      },
      {
        path: 'formSysDeptPost',
        component: () => import('@/pages/upms/formSysDeptPost/index.vue'),
        name: 'formSysDeptPost',
        props: getProps,
        meta: { title: '设置部门岗位' },
      },
      {
        path: 'formSysDict',
        component: () => import('@/pages/upms/formSysDict/index.vue'),
        name: 'formSysDict',
        meta: { title: '字典管理' },
      },
      {
        path: 'formSysOperationLog',
        component: () => import('@/pages/upms/formSysOperationLog/index.vue'),
        name: 'formSysOperationLog',
        meta: { title: '操作日志' },
      },
      // 404
      {
        path: '/:pathMatch(.*)*',
        component: () => import('@/pages/error/404.vue'),
        name: 'NotFound',
        meta: {
          title: '404',
        },
      },
      // 在线表单
      {
        path: 'formOnlineDblink',
        component: () => import('@/pages/online/formOnlineDblink/index.vue'),
        name: 'formOnlineDblink',
        props: getProps,
        meta: { title: '数据库链接' },
      },
      {
        path: 'formOnlineDict',
        component: () => import('@/pages/online/formOnlineDict/index.vue'),
        name: 'formOnlineDict',
        props: getProps,
        meta: { title: '在线表单字典管理' },
      },
      {
        path: 'formOnlinePage',
        component: () => import('@/pages/online/formOnlinePage/index.vue'),
        name: 'formOnlinePage',
        props: getProps,
        meta: { title: '在线表单管理' },
      },
      {
        path: 'onlineForm',
        component: () => import('@/pages/online/OnlinePageRender/index.vue'),
        name: 'onlineForm',
        props: getProps,
        meta: { title: '在线表单' },
      },
      // 流模管理
      {
        path: 'formMessage',
        component: () => import('@/pages/workflow/formMessage/index.vue'),
        name: 'formMessage',
        props: getProps,
        meta: { title: '催办消息' },
      },
      {
        path: 'formFlowCategory',
        component: () => import('@/pages/workflow/flowCategory/formFlowCategory.vue'),
        name: 'formFlowCategory',
        props: getProps,
        meta: { title: '流程分类管理' },
      },
      {
        path: 'formFlowEntry',
        component: () => import('@/pages/workflow/flowEntry/formFlowEntry.vue'),
        name: 'formFlowEntry',
        props: getProps,
        meta: { title: '流程设计' },
      },
      {
        path: 'formAllInstance',
        component: () => import('@/pages/workflow/taskManager/formAllInstance.vue'),
        name: 'formAllInstance',
        props: getProps,
        meta: { title: '流程实例' },
      },
      {
        path: 'handlerFlowTask',
        component: () => import('@/pages/workflow/handlerFlowTask/index.vue'),
        name: 'handlerFlowTask',
        props: getProps,
        meta: { title: '流程处理' },
        children: [
          // 静态表单路由设置
        ],
      },
      {
        path: 'formMyTask',
        component: () => import('@/pages/workflow/taskManager/formMyTask.vue'),
        name: 'formMyTask',
        props: getProps,
        meta: { title: '我的待办' },
      },
      {
        path: 'formMyApprovedTask',
        component: () => import('@/pages/workflow/taskManager/formMyApprovedTask.vue'),
        name: 'formMyApprovedTask',
        props: getProps,
        meta: { title: '已办任务' },
      },
      {
        path: 'formMyHistoryTask',
        component: () => import('@/pages/workflow/taskManager/formMyHistoryTask.vue'),
        name: 'formMyHistoryTask',
        props: getProps,
        meta: { title: '历史流程' },
      },
    ],
  },
  // 第三方接入路由
  {
    path: '/thirdParty',
    component: () => import('@/components/thirdParty/index.vue'),
    name: 'thirdParty',
    props: getProps,
    children: [
      // 流程分类列表
      {
        path: 'thirdFormFlowCategory',
        name: 'thirdFormFlowCategory',
        props: getProps,
        component: () => import('@/pages/workflow/flowCategory/formFlowCategory.vue'),
      },
      // 流程分类 新增、编辑
      {
        path: 'thirdAddFormFlowCategory',
        name: 'thirdAddFormFlowCategory',
        props: getProps,
        component: () => import('@/pages/workflow/flowCategory/formEditFlowCategory.vue'),
      },
      // 流程实例列表
      {
        path: 'thirdFormAllInstance',
        name: 'thirdFormAllInstance',
        props: getProps,
        component: () => import('@/pages/workflow/taskManager/formAllInstance.vue'),
      },
      // 流程图
      {
        path: 'thirdFormTaskProcessViewer',
        name: 'thirdFormTaskProcessViewer',
        props: getProps,
        component: () => import('@/pages/workflow/taskManager/formTaskProcessViewer.vue'),
      },
      // 流程终止
      {
        path: 'thirdFormStopTaskInstance',
        name: 'thirdFormStopTaskInstance',
        props: getProps,
        component: () => import('@/pages/workflow/taskManager/stopTask.vue'),
      },
      // 选择用户-处理用户
      {
        path: 'thirdTaskUserSelect',
        name: 'thirdTaskUserSelect',
        props: getProps,
        component: () => import('@/pages/workflow/components/TaskUserSelect.vue'),
      },
      // 流程设计
      {
        path: 'thirdFormFlowEntry',
        name: 'thirdFormFlowEntry',
        props: getProps,
        component: () => import('@/pages/workflow/flowEntry/formFlowEntry.vue'),
      },
      {
        path: 'thirdFormEditFlowEntry',
        name: 'thirdFormEditFlowEntry',
        props: getProps,
        component: () => import('@/pages/workflow/flowEntry/formEditFlowEntry.vue'),
      },
      {
        path: 'thirdFormPublishedFlowEntry',
        name: 'thirdFormPublishedFlowEntry',
        props: getProps,
        component: () => import('@/pages/workflow/flowEntry/formPublishedFlowEntry.vue'),
      },
      {
        path: 'thirdHandlerFlowTask',
        name: 'thirdHandlerFlowTask',
        props: getProps,
        component: () => import('@/pages/workflow/handlerFlowTask/index.vue'),
      },
      // 流程设计-候选用户组
      {
        path: 'thirdTaskGroupSelect',
        name: 'thirdTaskGroupSelect',
        props: getProps,
        component: () => import('@/pages/workflow/components/TaskGroupSelect.vue'),
      },
      // 流程设计-选择岗位
      {
        path: 'thirdTaskPostSelect',
        name: 'thirdTaskPostSelect',
        props: getProps,
        component: () => import('@/pages/workflow/components/TaskPostSelect.vue'),
      },
      // 流程设计-抄送
      {
        path: 'thirdAddCopyForItem',
        name: 'thirdAddCopyForItem',
        props: getProps,
        component: () => import('@/pages/workflow/components/CopyForSelect/addCopyForItem.vue'),
      },
      // 流程设计-任务操作按钮
      {
        path: 'thirdEditOperation',
        name: 'thirdEditOperation',
        props: getProps,
        component: () => import('@/pages/workflow/package/refactor/form/formEditOperation.vue'),
      },
      // 流程设计-设置表单权限
      {
        path: 'thirdSetOnlineFormAuth',
        name: 'thirdSetOnlineFormAuth',
        props: getProps,
        component: () => import('@/pages/workflow/package/refactor/form/formSetOnlineFormAuth.vue'),
      },
      // 流程设计-添加变量
      {
        path: 'thirdFormEditFlowEntryVariable',
        name: 'thirdFormEditFlowEntryVariable',
        props: getProps,
        component: () => import('@/pages/workflow/flowEntry/formEditFlowEntryVariable.vue'),
      },
      // 流程设计-新建状态
      {
        path: 'thirdFormEditFlowEntryStatus',
        name: 'thirdFormEditFlowEntryStatus',
        props: getProps,
        component: () => import('@/pages/workflow/flowEntry/formEditFlowEntryStatus.vue'),
      },
      // 流程设计-新建状态
      {
        path: 'thirdTaskCommit',
        name: 'thirdTaskCommit',
        props: getProps,
        component: () => import('@/pages/workflow/components/TaskCommit.vue'),
      },
      // 待办任务
      {
        path: 'thirdFormMyTask',
        name: 'thirdFormMyTask',
        props: getProps,
        component: () => import('@/pages/workflow/taskManager/formMyTask.vue'),
      },
      // 历史任务
      {
        path: 'thirdFormMyHistoryTask',
        name: 'thirdFormMyHistoryTask',
        props: getProps,
        component: () => import('@/pages/workflow/taskManager/formMyHistoryTask.vue'),
      },
      // 已办任务
      {
        path: 'thirdFormMyApprovedTask',
        name: 'thirdFormMyApprovedTask',
        props: getProps,
        component: () => import('@/pages/workflow/taskManager/formMyApprovedTask.vue'),
      },
      // 在线表单部分
      {
        path: 'thirdOnlineForm',
        name: 'thirdOnlineForm',
        props: getProps,
        component: () => import('@/pages/online/OnlinePageRender/index.vue'),
      },
      {
        path: 'thirdOnlineEditForm',
        name: 'thirdOnlineEditForm',
        props: getProps,
        component: () => import('@/pages/online/OnlinePageRender/OnlineEditForm/index.vue'),
      },
      {
        path: 'thirdFormOnlineDict',
        name: 'thirdFormOnlineDict',
        props: getProps,
        component: () => import('@/pages/online/formOnlineDict/index.vue'),
      },
      {
        path: 'thirdEditOnlineDict',
        name: 'thirdEditOnlineDict',
        props: getProps,
        component: () => import('@/pages/online/formOnlineDict/EditOnlineDict.vue'),
      },
      {
        path: 'thirdOnlinePage',
        name: 'thirdOnlinePage',
        props: getProps,
        component: () => import('@/pages/online/formOnlinePage/index.vue'),
      },
      {
        path: 'thirdEditOnlinePage',
        name: 'thirdEditOnlinePage',
        props: getProps,
        component: () => import('@/pages/online/editOnlinePage/index.vue'),
      },
      {
        path: 'thirdEditOnlineForm',
        name: 'thirdEditOnlineForm',
        props: getProps,
        component: () => import('@/pages/online/editOnlinePage/editOnlineForm.vue'),
      },
      {
        path: 'thirdEditPageDatasource',
        name: 'thirdEditPageDatasource',
        props: getProps,
        component: () => import('@/pages/online/editOnlinePage/editOnlinePageDatasource.vue'),
      },
      {
        path: 'thirdEditPageRelation',
        name: 'thirdEditPageRelation',
        props: getProps,
        component: () =>
          import('@/pages/online/editOnlinePage/editOnlinePageDatasourceRelation.vue'),
      },
      {
        path: 'thirdSetOnlineTableColumnRule',
        name: 'thirdSetOnlineTableColumnRule',
        props: getProps,
        component: () => import('@/pages/online/editOnlinePage/setOnlineTableColumnRule.vue'),
      },
      {
        path: 'thirdEditVirtualColumnFilter',
        name: 'thirdEditVirtualColumnFilter',
        props: getProps,
        component: () => import('@/pages/online/editOnlinePage/editVirtualColumnFilter.vue'),
      },
      {
        path: 'thirdEditTableColumn',
        name: 'thirdEditTableColumn',
        props: getProps,
        component: () => import('@/pages/online/editOnlinePage/formDesign/editTableColumn.vue'),
      },
      {
        path: 'thirdEditCustomFormOperate',
        name: 'thirdEditCustomFormOperate',
        props: getProps,
        component: () =>
          import('@/pages/online/editOnlinePage/formDesign/components/EditCustomFormOperate.vue'),
      },
      {
        path: 'thirdEditFormField',
        name: 'thirdEditFormField',
        props: getProps,
        component: () =>
          import('@/pages/online/editOnlinePage/formDesign/components/EditFormField.vue'),
      },
      {
        path: 'thirdEditDictParamValue',
        name: 'thirdEditDictParamValue',
        props: getProps,
        component: () =>
          import(
            '@/pages/online/editOnlinePage/formDesign/components/CustomWidgetDictSetting/EditDictParamValue.vue'
          ),
      },
      {
        path: 'thirdEditOnlineTableColumn',
        name: 'thirdEditOnlineTableColumn',
        props: getProps,
        component: () =>
          import(
            '@/pages/online/editOnlinePage/formDesign/components/OnlineTableColumnSetting/editOnlineTableColumn.vue'
          ),
      },
      {
        path: 'thirdEditOnlineTabPanel',
        name: 'thirdEditOnlineTabPanel',
        props: getProps,
        component: () =>
          import(
            '@/pages/online/editOnlinePage/formDesign/components/OnlineTabPanelSetting/editOnlineTabPanel.vue'
          ),
      },
      {
        path: 'thirdOnlineDblink',
        name: 'thirdOnlineDblink',
        props: getProps,
        component: () => import('@/pages/online/formOnlineDblink/index.vue'),
      },
      {
        path: 'thirdEditOnlineDblink',
        name: 'thirdEditOnlineDblink',
        props: getProps,
        component: () => import('@/pages/online/formOnlineDblink/EditOnlineDblink.vue'),
      },
      // 通用
      {
        path: 'thirdEditDictParamValue2',
        name: 'thirdEditDictParamValue2',
        props: getProps,
        component: () =>
          import(
            '@/online/components/WidgetAttributeSetting/components/CustomWidgetDictSetting/editDictParamValue.vue'
          ),
      },
      {
        path: 'thirdEditOnlineTableColumn2',
        name: 'thirdEditOnlineTableColumn2',
        props: getProps,
        component: () =>
          import(
            '@/online/components/WidgetAttributeSetting/components/OnlineTableColumnSetting/editOnlineTableColumn.vue'
          ),
      },
      {
        path: 'thirdEditOnlineTabPanel2',
        name: 'thirdEditOnlineTabPanel2',
        props: getProps,
        component: () =>
          import(
            '@/online/components/WidgetAttributeSetting/components/OnlineTabPanelSetting/editOnlineTabPanel.vue'
          ),
      },
      {
        path: 'thirdSelectDept',
        name: 'thirdSelectDept',
        props: getProps,
        component: () => import('@/components/DeptSelect/DeptSelectDlg.vue'),
      },
      {
        path: 'thirdSelectUser',
        name: 'thirdSelectUser',
        props: getProps,
        component: () => import('@/components/UserSelect/UserSelectDlg.vue'),
      },
    ],
  },
];

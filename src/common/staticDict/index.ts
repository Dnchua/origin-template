import { DictionaryBase } from './types';

const SysUserStatus = new DictionaryBase('用户状态', [
  {
    id: 0,
    name: '正常状态',
    symbol: 'NORMAL',
  },
  {
    id: 1,
    name: '锁定状态',
    symbol: 'LOCKED',
  },
]);

const SysUserType = new DictionaryBase('用户类型', [
  {
    id: 0,
    name: '管理员',
    symbol: 'ADMIN',
  },
  {
    id: 1,
    name: '系统操作员',
    symbol: 'SYSTEM',
  },
  {
    id: 2,
    name: '普通操作员',
    symbol: 'OPERATOR',
  },
]);

const SysOperationType = new DictionaryBase('操作日志操作类型', [
  {
    id: 0,
    name: '登录',
    symbol: 'LOGIN',
  },
  {
    id: 1,
    name: '手机登录',
    symbol: 'MOBILE_LOGIN',
  },
  {
    id: 5,
    name: '登出',
    symbol: 'LOGOUT',
  },
  {
    id: 10,
    name: '新增',
    symbol: 'ADD',
  },
  {
    id: 15,
    name: '修改',
    symbol: 'UPDATE',
  },
  {
    id: 20,
    name: '删除',
    symbol: 'DELETE',
  },
  {
    id: 35,
    name: '查询',
    symbol: 'LIST',
  },
  {
    id: 40,
    name: '分组查询',
    symbol: 'LIST_WITH_GROUP',
  },
  {
    id: 45,
    name: '导出',
    symbol: 'EXPORT',
  },
  {
    id: 25,
    name: '新增多对多关联',
    symbol: 'ADD_M2M',
  },
  {
    id: 30,
    name: '移除多对多关联',
    symbol: 'DELETE_M2M',
  },
  {
    id: 50,
    name: '上传',
    symbol: 'UPLOAD',
  },
  {
    id: 55,
    name: '下载',
    symbol: 'DOWNLOAD',
  },
  {
    id: 60,
    name: '重置缓存',
    symbol: 'RELOAD_CACHE',
  },
  {
    id: 65,
    name: '发布',
    symbol: 'PUBLISH',
  },
  {
    id: 70,
    name: '取消发布',
    symbol: 'UNPUBLISH',
  },
  {
    id: 75,
    name: '流程挂起',
    symbol: 'SUSPEND',
  },
  {
    id: 80,
    name: '流程恢复',
    symbol: 'RESUME',
  },
  {
    id: 100,
    name: '启动流程',
    symbol: 'START_FLOW',
  },
  {
    id: 105,
    name: '终止流程',
    symbol: 'STOP_FLOW',
  },
  {
    id: 110,
    name: '删除流程',
    symbol: 'DELETE_FLOW',
  },
  {
    id: 115,
    name: '撤销流程',
    symbol: 'CANCEL_FLOW',
  },
  {
    id: 120,
    name: '提交流程任务',
    symbol: 'SUBMIT_TASK',
  },
  {
    id: 125,
    name: '催办流程',
    symbol: 'REMIND_TASK',
  },
  {
    id: 126,
    name: '流程干预',
    symbol: 'INTERVENE_FLOW',
  },
  {
    id: 127,
    name: '流程数据补偿',
    symbol: 'FIX_FLOW_BUSINESS_DATA',
  },
]);

const SysPermModuleType = new DictionaryBase('权限分组类型', [
  {
    id: 0,
    name: '分组模块',
    symbol: 'GROUP',
  },
  {
    id: 1,
    name: '接口模块',
    symbol: 'CONTROLLER',
  },
]);

const SysPermCodeType = new DictionaryBase('权限字类型', [
  {
    id: 0,
    name: '表单',
    symbol: 'FORM',
  },
  {
    id: 1,
    name: '片段',
    symbol: 'FRAGMENT',
  },
  {
    id: 2,
    name: '操作',
    symbol: 'OPERATION',
  },
]);

/**
 * 菜单类型
 *
 * DIRECTORY(0: 目录)
 * MENU(1: 表单)
 * FRAGMENT(2: 片段)
 * BUTTON(3: 按钮)
 */
const SysMenuType = new DictionaryBase('菜单类型', [
  {
    id: 0,
    name: '目录',
    symbol: 'DIRECTORY',
  },
  {
    id: 1,
    name: '菜单',
    symbol: 'MENU',
  },
  {
    id: 2,
    name: '片段',
    symbol: 'FRAGMENT',
  },
  {
    id: 3,
    name: '按钮',
    symbol: 'BUTTON',
  },
]);

const MobileEntryType = new DictionaryBase('移动端首页配置项类型', [
  {
    id: 0,
    name: '轮播图',
    symbol: 'BANNER',
  },
  {
    id: 1,
    name: '九宫格',
    symbol: 'SUDOKU',
  },
  {
    id: 2,
    name: '分组',
    symbol: 'GROUP',
  },
]);

/**
 * 菜单绑定类型
 *
 * ROUTER(0: 路由菜单)
 * ONLINE_FORM(1: 在线表单)
 * WORK_ORDER(2: 工单列表)
 * REPORT(3: 报表页面)
 * THRID_URL(4: 外部链接)
 */
const SysMenuBindType = new DictionaryBase('菜单绑定类型', [
  {
    id: 0,
    name: '路由菜单',
    symbol: 'ROUTER',
  },
  {
    id: 1,
    name: '在线表单',
    symbol: 'ONLINE_FORM',
  },
  {
    id: 2,
    name: '工单列表',
    symbol: 'WORK_ORDER',
  },
  {
    id: 3,
    name: '报表页面',
    symbol: 'REPORT',
  },
  {
    id: 4,
    name: '外部链接',
    symbol: 'THRID_URL',
  },
]);

const SysDataPermType = new DictionaryBase('数据权限类型', [
  {
    id: 0,
    name: '查看全部',
    symbol: 'ALL',
  },
  {
    id: 1,
    name: '仅看自己',
    symbol: 'ONLY_USER',
  },
  {
    id: 2,
    name: '仅看所在部门',
    symbol: 'ONLY_DEPT',
  },
  {
    id: 3,
    name: '仅看所在部门及子部门',
    symbol: 'ONLY_DEPT_AND_CHILD',
  },
  {
    id: 4,
    name: '自选部门及子部门',
    symbol: 'CUSTOM_DEPT_AND_CHILD',
  },
  {
    id: 5,
    name: '仅自选部门',
    symbol: 'CUSTOM_DEPT',
  },
  {
    id: 6,
    name: '本部门用户',
    symbol: 'DEPT_USER',
  },
  {
    id: 7,
    name: '本部门及子部门用户',
    symbol: 'DEPT_AND_CHILD_USER',
  },
]);

const ScatterSymbolType = new DictionaryBase('纵轴位置', [
  {
    id: 0,
    name: '固定大小',
    symbol: 'FIXED',
  },
  {
    id: 1,
    name: '值大小',
    symbol: 'VALUE',
  },
]);

const SysCustomWidgetType = new DictionaryBase('组件类型', [
  {
    id: 0,
    name: '文本显示',
    symbol: 'Label',
  },
  {
    id: 1,
    name: '文本输入框',
    symbol: 'Input',
  },
  {
    id: 3,
    name: '数字输入框',
    symbol: 'NumberInput',
  },
  {
    id: 4,
    name: '数字范围输入框',
    symbol: 'NumberRange',
  },
  {
    id: 5,
    name: '开关组件',
    symbol: 'Switch',
  },
  {
    id: 6,
    name: '滑块组件',
    symbol: 'Slider',
  },
  {
    id: 7,
    name: '单选组件',
    symbol: 'Radio',
  },
  {
    id: 8,
    name: '复选框',
    symbol: 'CheckBox',
  },
  {
    id: 10,
    name: '下拉选择框',
    symbol: 'Select',
  },
  {
    id: 12,
    name: '级联选择框',
    symbol: 'Cascader',
  },
  {
    id: 13,
    name: '树形选择组件',
    symbol: 'Tree',
  },
  {
    id: 14,
    name: '评分组件',
    symbol: 'Rate',
  },
  {
    id: 15,
    name: '进步器',
    symbol: 'Stepper',
  },
  {
    id: 16,
    name: '日历组件',
    symbol: 'Calendar',
  },
  {
    id: 20,
    name: '日期选择框',
    symbol: 'Date',
  },
  {
    id: 21,
    name: '日期范围选择框',
    symbol: 'DateRange',
  },
  {
    id: 30,
    name: '颜色选择框',
    symbol: 'ColorPicker',
  },
  {
    id: 31,
    name: '上传组件',
    symbol: 'Upload',
  },
  {
    id: 32,
    name: '富文本编辑',
    symbol: 'RichEditor',
  },
  {
    id: 40,
    name: '分割线',
    symbol: 'Divider',
  },
  {
    id: 41,
    name: '文本',
    symbol: 'Text',
  },
  {
    id: 42,
    name: '图片',
    symbol: 'Image',
  },
  {
    id: 43,
    name: '超链接',
    symbol: 'Link',
  },
  {
    id: 100,
    name: '表格组件',
    symbol: 'Table',
  },
  {
    id: 101,
    name: '透视表',
    symbol: 'PivotTable',
  },
  {
    id: 102,
    name: '数据列表',
    symbol: 'List',
  },
  {
    id: 103,
    name: '查询列表',
    symbol: 'QueryList',
  },
  {
    id: 104,
    name: '工单列表',
    symbol: 'WorkOrderList',
  },
  {
    id: 200,
    name: '折线图',
    symbol: 'LineChart',
  },
  {
    id: 201,
    name: '柱状图',
    symbol: 'BarChart',
  },
  {
    id: 202,
    name: '饼图',
    symbol: 'PieChart',
  },
  {
    id: 203,
    name: '散点图',
    symbol: 'ScatterChart',
  },
  {
    id: 204,
    name: '普通表格',
    symbol: 'DataViewTable',
  },
  {
    id: 205,
    name: '轮播图',
    symbol: 'Carousel',
  },
  {
    id: 206,
    name: '富文本',
    symbol: 'RichText',
  },
  {
    id: 207,
    name: '仪表盘',
    symbol: 'GaugeChart',
  },
  {
    id: 208,
    name: '漏斗图',
    symbol: 'FunnelChart',
  },
  {
    id: 209,
    name: '雷达图',
    symbol: 'RadarChart',
  },
  {
    id: 210,
    name: '普通进度条',
    symbol: 'ProgressBar',
  },
  {
    id: 211,
    name: '环形进度条',
    symbol: 'ProgressCircle',
  },
  {
    id: 212,
    name: '通用卡片',
    symbol: 'DataCard',
  },
  {
    id: 213,
    name: '通用列表',
    symbol: 'CommonList',
  },
  {
    id: 214,
    name: '进度条卡片',
    symbol: 'DataProgressCard',
  },
  {
    id: 300,
    name: '基础块',
    symbol: 'Block',
  },
  {
    id: 301,
    name: '卡片组件',
    symbol: 'Card',
  },
  {
    id: 302,
    name: 'Tabs 组件',
    symbol: 'Tabs',
  },
  {
    id: 303,
    name: '图片卡片',
    symbol: 'ImageCard',
  },
  {
    id: 304,
    name: '分组容器',
    symbol: 'CellGroup',
  },
  {
    id: 400,
    name: '用户选择',
    symbol: 'UserSelect',
  },
  {
    id: 401,
    name: '部门选择',
    symbol: 'DeptSelect',
  },
  {
    id: 402,
    name: '关联选择',
    symbol: 'DataSelect',
  },
  {
    id: 403,
    name: '表格容器',
    symbol: 'TableContainer',
  },
  {
    id: 500,
    name: '单选过滤',
    symbol: 'MobileRadioFilter',
  },
  {
    id: 501,
    name: '多选过滤',
    symbol: 'MobileCheckBoxFilter',
  },
  {
    id: 502,
    name: '文本过滤',
    symbol: 'MobileInputFilter',
  },
  {
    id: 503,
    name: '开关过滤',
    symbol: 'MobileSwitchFilter',
  },
  {
    id: 504,
    name: '日期过滤',
    symbol: 'MobileDateRangeFilter',
  },
  {
    id: 505,
    name: '数字范围过滤',
    symbol: 'MobileNumberRangeFilter',
  },
]);

const OnlineFormEventType = new DictionaryBase('在线表单事件类型', [
  {
    id: 'change',
    name: '数据改变',
    symbol: 'CHANGE',
  },
  {
    id: 'disable',
    name: '是否禁用',
    symbol: 'DISABLE',
  },
  {
    id: 'visible',
    name: '是否可见',
    symbol: 'VISIBLE',
  },
  {
    id: 'dropdownChange',
    name: '下拉数据改变',
    symbol: 'DROPDOWN_CHANGE',
  },
  {
    id: 'linkHerf',
    name: '链接地址',
    symbol: 'LINK_HERF',
  },
  {
    id: 'disabledDate',
    name: '日期是否可用',
    symbol: 'DISABLED_DATE',
  },
  {
    id: 'afterLoadTableData',
    name: '表格加载数据后',
    symbol: 'AFTER_LOAD_TABLE_DATA',
  },
  {
    id: 'beforeLoadTableData',
    name: '表格加载数据前',
    symbol: 'BEFORE_LOAD_TABLE_DATA',
  },
  {
    id: 'afterLoadFormData',
    name: '页面加载数据后',
    symbol: 'AFTER_LOAD_FORM_DATA',
  },
  {
    id: 'beforeLoadFormData',
    name: '页面加载数据前',
    symbol: 'BEFORE_LOAD_FORM_DATA',
  },
  {
    id: 'beforeCommitFormData',
    name: '页面数据提交前',
    symbol: 'BEFORE_COMMIT_FORM_DATA',
  },
  {
    id: 'formCreated',
    name: '页面创建完毕',
    symbol: 'AFTER_CREATE_FORM',
  },
  {
    id: 'tableOperationVisible',
    name: '操作是否可见',
    symbol: 'OPERATION_VISIBLE',
  },
  {
    id: 'tableOperationDisbled',
    name: '操作是否禁用',
    symbol: 'OPERATION_DISABLED',
  },
]);

/**
 * 表单类型
 *
 * QUERY(1: 查询表单)
 * ADVANCE_QUERY(2: 左树右表查询)
 * ONE_TO_ONE_QUERY(3: 一对一查询)
 * FORM(5: 编辑表单)
 * FLOW(10: 流程表单)
 * WORK_ORDER(11: 工单列表)
 * REPORT(50: 报表页面)
 */
const SysOnlineFormType = new DictionaryBase('表单类型', [
  {
    id: 1,
    name: '查询表单',
    symbol: 'QUERY',
  },
  {
    id: 2,
    name: '左树右表查询',
    symbol: 'ADVANCE_QUERY',
  },
  {
    id: 3,
    name: '一对一查询',
    symbol: 'ONE_TO_ONE_QUERY',
  },
  {
    id: 5,
    name: '编辑表单',
    symbol: 'FORM',
  },
  {
    id: 10,
    name: '流程表单',
    symbol: 'FLOW',
  },
  {
    id: 11,
    name: '工单列表',
    symbol: 'WORK_ORDER',
  },
  {
    id: 50,
    name: '报表页面',
    symbol: 'REPORT',
  },
]);

const SysCustomWidgetOperationType = new DictionaryBase('操作类型', [
  {
    id: 0,
    name: '新建',
    symbol: 'ADD',
  },
  {
    id: 1,
    name: '编辑',
    symbol: 'EDIT',
  },
  {
    id: 2,
    name: '删除',
    symbol: 'DELETE',
  },
  {
    id: 3,
    name: '导出',
    symbol: 'EXPORT',
  },
  {
    id: 10,
    name: '批量删除',
    symbol: 'BATCH_DELETE',
  },
  {
    id: 20,
    name: '表单操作',
    symbol: 'FORM',
  },
  {
    id: 22,
    name: '复制',
    symbol: 'COPY',
  },
  {
    id: 30,
    name: '保存',
    symbol: 'SAVE',
  },
  {
    id: 31,
    name: '取消',
    symbol: 'CANCEL',
  },
  {
    id: 50,
    name: '脚本操作',
    symbol: 'SCRIPT',
  },
  {
    id: 51,
    name: '下钻事件',
    symbol: 'DRILL',
  },
  {
    id: 52,
    name: '路由跳转',
    symbol: 'ROUTE',
  },
]);

const OnlineSystemVariableType = new DictionaryBase('系统变量类型', [
  {
    id: 0,
    name: '登录用户',
    symbol: 'CURRENT_USER',
  },
  {
    id: 1,
    name: '所属部门',
    symbol: 'CURRENT_DEPT',
  },
  {
    id: 10,
    name: '当前日期',
    symbol: 'CURRENT_DATE',
  },
  {
    id: 11,
    name: '当前时间',
    symbol: 'CURRENT_TIME',
  },
  {
    id: 20,
    name: '流程发起人',
    symbol: 'FLOW_CREATE_USER',
  },
]);

const SysCustomWidgetBindDataType = new DictionaryBase('组件绑定数据类型', [
  {
    id: 0,
    name: '字段',
    symbol: 'Column',
  },
  {
    id: 5,
    name: '系统变量',
    symbol: 'SYSTEM_VARIABLE',
  },
  {
    id: 10,
    name: '自定义字段',
    symbol: 'Custom',
  },
  {
    id: 20,
    name: '固定值',
    symbol: 'Fixed',
  },
]);

const DirectionType = new DictionaryBase('方向', [
  {
    id: 0,
    name: '横轴',
    symbol: 'HORIZONTAL',
  },
  {
    id: 1,
    name: '纵轴',
    symbol: 'VERTICAL',
  },
]);

const DblinkType = new DictionaryBase('数据库连接类型', [
  {
    id: 0,
    name: 'MySQL',
    symbol: 'MYSQL',
  },
  /*
  {
    id: 1,
    name: 'PostgreSQL',
    symbol: 'POSTGRESQL',
  },
  {
    id: 2,
    name: 'Oracle',
    symbol: 'ORACLE',
  },
  {
    id: 3,
    name: '达梦数据库',
    symbol: 'DM_DB',
  },
  {
    id: 4,
    name: '人大金仓',
    symbol: 'KINGBASE',
  },
  {
    id: 5,
    name: '华为高斯',
    symbol: 'OPENGAUSS',
  },
  {
    id: 10,
    name: 'ClickHouse',
    symbol: 'CLICK_HOUSE',
  },
  {
    id: 11,
    name: 'Doris',
    symbol: 'DORIS',
  },
  */
]);

export {
  SysUserStatus,
  SysUserType,
  SysDataPermType,
  SysOperationType,
  SysPermModuleType,
  SysPermCodeType,
  SysMenuBindType,
  MobileEntryType,
  SysMenuType,
  ScatterSymbolType,
  SysCustomWidgetType,
  OnlineFormEventType,
  SysOnlineFormType,
  SysCustomWidgetOperationType,
  OnlineSystemVariableType,
  SysCustomWidgetBindDataType,
  DirectionType,
  DblinkType,
};

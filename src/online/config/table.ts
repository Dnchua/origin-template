import {
  SysCustomWidgetType,
  SysOnlineFormType,
  OnlineFormEventType,
  SysCustomWidgetOperationType,
} from '@/common/staticDict/index';
import { ANY_OBJECT } from '@/types/generic';

const table = {
  span: {
    name: '组件宽度',
    widgetType: SysCustomWidgetType.Slider,
    value: 24,
    visible: function (formConfig: ANY_OBJECT) {
      return formConfig && formConfig.form.formType !== SysOnlineFormType.QUERY;
    },
    min: 1,
    max: 24,
  },
  height: {
    name: '表格高度',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 300,
    visible: function (formConfig: ANY_OBJECT) {
      return formConfig && formConfig.form.formType !== SysOnlineFormType.QUERY;
    },
    min: 100,
  },
  paddingBottom: {
    name: '底部距离',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 0,
    min: 0,
  },
  paged: {
    name: '支持分页',
    widgetType: SysCustomWidgetType.Switch,
    value: true,
    visible: function (formConfig: ANY_OBJECT) {
      return formConfig && formConfig.form.formType === SysOnlineFormType.QUERY;
    },
  },
  pageSize: {
    name: '每页条数',
    widgetType: SysCustomWidgetType.Select,
    value: 10,
    visible: function (formConfig: ANY_OBJECT) {
      return formConfig && formConfig.form.formType === SysOnlineFormType.QUERY;
    },
    dropdownList: [
      {
        id: 10,
        name: 10,
      },
      {
        id: 20,
        name: 20,
      },
      {
        id: 50,
        name: 50,
      },
      {
        id: 100,
        name: 100,
      },
    ],
  },
  operationColumnWidth: {
    name: '操作列宽度',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 160,
  },
  tableColumnList: {
    name: '表格字段',
    showLabel: false,
    value: [],
    customComponent: {
      component: 'OnlineTableColumnSetting',
    },
  },
};

const tableConfig = {
  widgetType: SysCustomWidgetType.Table,
  icon: 'online-icon icon-table',
  attribute: table,
  allowEventList: [
    OnlineFormEventType.VISIBLE,
    OnlineFormEventType.BEFORE_LOAD_TABLE_DATA,
    OnlineFormEventType.AFTER_LOAD_TABLE_DATA,
  ],
  operationList: [
    {
      id: 1,
      type: SysCustomWidgetOperationType.BATCH_DELETE,
      name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.BATCH_DELETE),
      enabled: false,
      builtin: true,
      rowOperation: false,
      btnType: 'danger',
      plain: true,
      formId: undefined,
      readOnly: false,
      showOrder: 0,
      eventList: [],
    },
    {
      id: 2,
      type: SysCustomWidgetOperationType.ADD,
      name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.ADD),
      enabled: false,
      builtin: true,
      rowOperation: false,
      btnType: 'primary',
      plain: false,
      formId: undefined,
      readOnly: false,
      showOrder: 1,
      eventList: [],
    },
    {
      id: 3,
      type: SysCustomWidgetOperationType.EDIT,
      name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.EDIT),
      enabled: false,
      builtin: true,
      rowOperation: true,
      btnClass: 'table-btn success',
      formId: undefined,
      readOnly: false,
      showOrder: 10,
      eventList: [],
    },
    {
      id: 4,
      type: SysCustomWidgetOperationType.DELETE,
      name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.DELETE),
      enabled: false,
      builtin: true,
      rowOperation: true,
      btnClass: 'table-btn delete',
      formId: undefined,
      readOnly: false,
      showOrder: 15,
      eventList: [],
    },
  ],
  supportOperate: true,
  supportBindTable: true,
  supportBindColumn: false,
  supportOperation: true,
};

export default tableConfig;

import {
  SysCustomWidgetType,
  SysOnlineFormType,
  OnlineFormEventType,
} from '@/common/staticDict/index';
import { ANY_OBJECT } from '@/types/generic';

const dateRange = {
  span: {
    name: '组件宽度',
    widgetType: SysCustomWidgetType.Slider,
    value: 12,
    visible: function (formConfig: ANY_OBJECT) {
      return formConfig && formConfig.form.formType !== SysOnlineFormType.QUERY;
    },
    min: 1,
    max: 24,
  },
  'start-placeholder': {
    name: '开始日期提示',
    widgetType: SysCustomWidgetType.Input,
    value: '',
  },
  'end-placeholder': {
    name: '结束日期提示',
    widgetType: SysCustomWidgetType.Input,
    value: '',
  },
  type: {
    name: '显示类型',
    widgetType: SysCustomWidgetType.Select,
    dropdownList: [
      {
        id: 'daterange',
        name: '日',
      },
      {
        id: 'monthrange',
        name: '月',
      },
      {
        id: 'datetimerange',
        name: '时间',
      },
    ],
    value: 'daterange',
  },
  required: {
    name: '是否必填',
    value: false,
    widgetType: SysCustomWidgetType.Switch,
    dropdownList: [
      {
        id: true,
        name: '必填',
      },
      {
        id: false,
        name: '非必填',
      },
    ],
  },
  disabled: {
    name: '是否禁用',
    value: false,
    visible: function (formConfig: ANY_OBJECT) {
      return formConfig && formConfig.form.formType !== SysOnlineFormType.QUERY;
    },
    widgetType: SysCustomWidgetType.Switch,
    dropdownList: [
      {
        id: false,
        name: '启用',
      },
      {
        id: true,
        name: '禁用',
      },
    ],
  },
};

const dateRangeConfig = {
  widgetType: SysCustomWidgetType.DateRange,
  icon: 'online-icon icon-date-range',
  attribute: dateRange,
  allowEventList: [
    OnlineFormEventType.CHANGE,
    OnlineFormEventType.DISABLE,
    OnlineFormEventType.VISIBLE,
    OnlineFormEventType.DISABLED_DATE,
  ],
  supportBindTable: true,
  supportBindColumn: true,
};

export default dateRangeConfig;

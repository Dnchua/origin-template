import {
  SysCustomWidgetType,
  SysOnlineFormType,
  OnlineFormEventType,
} from '@/common/staticDict/index';
import { ANY_OBJECT } from '@/types/generic';

const deptSelect = {
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
  placeholder: {
    name: '占位文本',
    widgetType: SysCustomWidgetType.Input,
    value: '',
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

const deptSelectConfig = {
  widgetType: SysCustomWidgetType.DeptSelect,
  icon: 'online-icon icon-dept',
  attribute: deptSelect,
  allowEventList: [
    OnlineFormEventType.CHANGE,
    OnlineFormEventType.DISABLE,
    OnlineFormEventType.VISIBLE,
  ],
  supportBindTable: true,
  supportBindColumn: true,
};

export default deptSelectConfig;

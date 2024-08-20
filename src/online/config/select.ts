import {
  SysCustomWidgetType,
  SysOnlineFormType,
  OnlineFormEventType,
} from '@/common/staticDict/index';
import { ANY_OBJECT } from '@/types/generic';

const select = {
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
  dictInfo: {
    name: '下拉字典',
    value: {},
    customComponent: {
      component: 'CustomWidgetDictSetting',
    },
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

const selectConfig = {
  widgetType: SysCustomWidgetType.Select,
  icon: 'online-icon icon-select',
  attribute: select,
  allowEventList: [
    OnlineFormEventType.CHANGE,
    OnlineFormEventType.DISABLE,
    OnlineFormEventType.VISIBLE,
    OnlineFormEventType.DROPDOWN_CHANGE,
  ],
  supportBindTable: true,
  supportBindColumn: true,
};

export default selectConfig;

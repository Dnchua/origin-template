import {
  SysCustomWidgetType,
  SysOnlineFormType,
  OnlineFormEventType,
} from '@/common/staticDict/index';
import { ANY_OBJECT } from '@/types/generic';

const input = {
  span: {
    name: '组件宽度',
    widgetType: SysCustomWidgetType.Slider,
    value: 12,
    visible: function (formConfig: ANY_OBJECT) {
      return (
        formConfig &&
        formConfig.form.formType !== SysOnlineFormType.QUERY &&
        formConfig.activeMode === 'pc'
      );
    },
    disabled: false,
    min: 1,
    max: 24,
  },
  type: {
    name: '输入框类型',
    value: 'text',
    widgetType: SysCustomWidgetType.Select,
    dropdownList: function (formConfig: ANY_OBJECT) {
      return [
        {
          id: 'text',
          name: '单行文本',
        },
        {
          id: 'textarea',
          name: '多行文本',
        },
      ];
    },
  },
  placeholder: {
    name: '占位文本',
    widgetType: SysCustomWidgetType.Input,
    value: '',
  },
  'show-password': {
    name: '是否密码',
    value: false,
    widgetType: SysCustomWidgetType.Switch,
    dropdownList: [
      {
        id: true,
        name: '是',
      },
      {
        id: false,
        name: '否',
      },
    ],
  },
  'show-word-limit': {
    name: '是否显示字数统计',
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
  maxlength: {
    name: '最大字符数',
    widgetType: SysCustomWidgetType.NumberInput,
    value: undefined,
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

const inputConfig = {
  widgetType: SysCustomWidgetType.Input,
  icon: 'online-icon icon-input',
  attribute: input,
  allowEventList: [
    OnlineFormEventType.CHANGE,
    OnlineFormEventType.DISABLE,
    OnlineFormEventType.VISIBLE,
  ],
  supportBindTable: true,
  supportBindColumn: true,
};

export default inputConfig;

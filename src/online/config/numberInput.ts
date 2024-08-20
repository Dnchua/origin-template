import {
  SysCustomWidgetType,
  SysOnlineFormType,
  OnlineFormEventType,
} from '@/common/staticDict/index';
import { ANY_OBJECT } from '@/types/generic';

const numberInput = {
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
  min: {
    name: '最小值',
    widgetType: SysCustomWidgetType.NumberInput,
    value: undefined,
  },
  max: {
    name: '最大值',
    widgetType: SysCustomWidgetType.NumberInput,
    value: undefined,
  },
  step: {
    name: '步长',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 1,
  },
  precision: {
    name: '精度',
    widgetType: SysCustomWidgetType.NumberInput,
    value: undefined,
  },
  controls: {
    name: '控制按钮',
    widgetType: SysCustomWidgetType.Switch,
    value: true,
    dropdownList: [
      {
        id: true,
        name: '显示',
      },
      {
        id: false,
        name: '隐藏',
      },
    ],
  },
  'controls-position': {
    name: '按钮位置',
    widgetType: SysCustomWidgetType.Radio,
    value: undefined,
    dropdownList: [
      {
        id: undefined,
        name: '默认',
      },
      {
        id: 'right',
        name: '右侧',
      },
    ],
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

const numberInputConfig = {
  widgetType: SysCustomWidgetType.NumberInput,
  icon: 'online-icon icon-input-number',
  attribute: numberInput,
  allowEventList: [
    OnlineFormEventType.CHANGE,
    OnlineFormEventType.DISABLE,
    OnlineFormEventType.VISIBLE,
  ],
  supportBindTable: true,
  supportBindColumn: true,
};

export default numberInputConfig;

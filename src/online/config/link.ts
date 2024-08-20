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
      return formConfig && formConfig.form.formType !== SysOnlineFormType.QUERY;
    },
    disabled: false,
    min: 1,
    max: 24,
  },
  type: {
    name: '显示类型',
    value: 'primary',
    widgetType: SysCustomWidgetType.Select,
    dropdownList: [
      {
        id: 'primary',
        name: 'primary',
      },
      {
        id: 'success',
        name: 'success',
      },
      {
        id: 'warning',
        name: 'warning',
      },
      {
        id: 'danger',
        name: 'danger',
      },
      {
        id: 'info',
        name: 'info',
      },
    ],
  },
  href: {
    name: '链接地址',
    widgetType: SysCustomWidgetType.Input,
    value: undefined,
  },
  showText: {
    name: '链接显示',
    widgetType: SysCustomWidgetType.Input,
    value: undefined,
  },
  underline: {
    name: '下划线',
    value: false,
    widgetType: SysCustomWidgetType.Switch,
    dropdownList: [
      {
        id: true,
        name: '下划线',
      },
      {
        id: false,
        name: '无下划线',
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

const linkConfig = {
  widgetType: SysCustomWidgetType.Link,
  icon: 'online-icon icon-link',
  attribute: input,
  allowEventList: [
    OnlineFormEventType.LINK_HERF,
    OnlineFormEventType.DISABLE,
    OnlineFormEventType.VISIBLE,
  ],
  supportBindTable: false,
  supportBindColumn: false,
};

export default linkConfig;

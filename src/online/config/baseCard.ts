import { SysCustomWidgetType, OnlineFormEventType } from '@/common/staticDict/index';

const card = {
  span: {
    name: '组件宽度',
    widgetType: SysCustomWidgetType.Slider,
    value: 12,
    min: 1,
    max: 24,
  },
  shadow: {
    name: '阴影显示',
    widgetType: SysCustomWidgetType.Select,
    value: 'never',
    dropdownList: [
      {
        id: 'never',
        name: '不显示',
      },
      {
        id: 'hover',
        name: '悬浮显示',
      },
      {
        id: 'always',
        name: '一直显示',
      },
    ],
  },
  padding: {
    name: '内部边距',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 20,
    min: 0,
  },
  paddingBottom: {
    name: '底部距离',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 0,
    min: 0,
  },
};

const baseCardConfig = {
  widgetType: SysCustomWidgetType.Card,
  icon: 'online-icon icon-card3',
  attribute: card,
  allowEventList: [OnlineFormEventType.VISIBLE],
  operationList: [],
  supportBindTable: false,
  supportBindColumn: false,
};

export default baseCardConfig;

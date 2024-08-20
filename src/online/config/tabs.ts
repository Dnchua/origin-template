import { SysCustomWidgetType, OnlineFormEventType } from '@/common/staticDict/index';

const tabs = {
  span: {
    name: '组件宽度',
    widgetType: SysCustomWidgetType.Slider,
    value: 24,
    min: 1,
    max: 24,
  },
  type: {
    name: '风格类型',
    widgetType: SysCustomWidgetType.Radio,
    value: undefined,
    dropdownList: [
      {
        id: undefined,
        name: '默认',
      },
      {
        id: 'border-card',
        name: '卡片',
      },
    ],
  },
  paddingBottom: {
    name: '底部距离',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 0,
    min: 0,
  },
  tabPanelList: {
    name: '标签页设置',
    value: [],
    customComponent: {
      component: 'OnlineTabPanelSetting',
    },
  },
};

const tabsConfig = {
  widgetType: SysCustomWidgetType.Tabs,
  icon: 'online-icon icon-tabs2',
  attribute: tabs,
  allowEventList: [OnlineFormEventType.VISIBLE],
  supportOperate: false,
  supportBindTable: false,
  supportBindColumn: false,
};

export default tabsConfig;

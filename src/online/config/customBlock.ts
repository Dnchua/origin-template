import { SysCustomWidgetType, OnlineFormEventType } from '@/common/staticDict/index';

const block = {
  span: {
    name: '组件宽度',
    widgetType: SysCustomWidgetType.Slider,
    value: 12,
    min: 1,
    max: 24,
  },
  paddingBottom: {
    name: '底部距离',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 0,
    min: 0,
  },
};

const customBlockConfig = {
  widgetType: SysCustomWidgetType.Block,
  icon: 'online-icon icon-block',
  attribute: block,
  allowEventList: [OnlineFormEventType.VISIBLE],
  supportBindTable: false,
  supportBindColumn: false,
};

export default customBlockConfig;

import { SysCustomWidgetType, OnlineFormEventType } from '@/common/staticDict/index';

const workOrderList = {
  card: {
    name: '显示组件',
    widgetType: SysCustomWidgetType.Select,
    value: SysCustomWidgetType.ImageCard,
    dropdownList: [
      {
        id: SysCustomWidgetType.ImageCard,
        name: SysCustomWidgetType.getValue(SysCustomWidgetType.ImageCard),
      },
    ],
    props: {
      clearable: false,
    },
  },
};

const workOrderListConfig = {
  widgetType: SysCustomWidgetType.WorkOrderList,
  icon: 'online-icon icon-card',
  attribute: workOrderList,
  allowEventList: [OnlineFormEventType.VISIBLE],
  operationList: [],
  supportOperate: false,
  supportBindTable: true,
  supportBindColumn: false,
  supportOperation: false,
};

export default workOrderListConfig;

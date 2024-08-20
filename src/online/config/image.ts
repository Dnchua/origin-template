import {
  SysCustomWidgetType,
  OnlineFormEventType,
  SysCustomWidgetBindDataType,
} from '@/common/staticDict/index';
import { ANY_OBJECT } from '@/types/generic';

const image = {
  span: {
    name: '组件宽度',
    widgetType: SysCustomWidgetType.Slider,
    value: 12,
    min: 1,
    max: 24,
  },
  fit: {
    name: '裁切方式',
    widgetType: SysCustomWidgetType.Select,
    value: 'fill',
    dropdownList: [
      {
        id: 'fill',
        name: 'fill',
      },
      {
        id: 'contain',
        name: 'contain',
      },
      {
        id: 'cover',
        name: 'cover',
      },
      {
        id: 'none',
        name: 'none',
      },
      {
        id: 'scale-down',
        name: 'scale-down',
      },
    ],
  },
  align: {
    name: '图片位置',
    widgetType: SysCustomWidgetType.Select,
    value: 'start',
    dropdownList: [
      {
        id: 'start',
        name: '左侧',
      },
      {
        id: 'center',
        name: '居中',
      },
      {
        id: 'end',
        name: '右侧',
      },
    ],
  },
  width: {
    name: '图片宽度',
    value: '100px',
    widgetType: SysCustomWidgetType.Input,
  },
  height: {
    name: '图片高度',
    value: '100px',
    widgetType: SysCustomWidgetType.Input,
  },
  radius: {
    name: '圆角宽度',
    value: 3,
    widgetType: SysCustomWidgetType.Slider,
    min: 0,
  },
  round: {
    name: '圆形图片',
    value: false,
    widgetType: SysCustomWidgetType.Switch,
  },
  src: {
    name: '图片地址',
    value: '',
    customComponent: {
      component: 'OnlineImageUrlInput',
      props: {
        disabled: function (formConfig: ANY_OBJECT) {
          // 表单为非报表，并且绑定在字段上，那么图片不可输入
          return (
            formConfig &&
            formConfig.currentWidget &&
            formConfig.currentWidget.bindData?.dataType !== SysCustomWidgetBindDataType.Fixed &&
            formConfig.form?.pageCode == null
          );
        },
      },
    },
  },
  paddingBottom: {
    name: '底部距离',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 0,
    min: 0,
  },
};

const imageConfig = {
  widgetType: SysCustomWidgetType.Image,
  icon: 'online-icon icon-image',
  attribute: image,
  allowEventList: [OnlineFormEventType.VISIBLE],
  supportBindTable: true,
  supportBindColumn: true,
};

export default imageConfig;

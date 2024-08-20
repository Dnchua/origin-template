import {
  SysCustomWidgetType,
  OnlineFormEventType,
  SysCustomWidgetBindDataType,
} from '@/common/staticDict/index';
import { ANY_OBJECT } from '@/types/generic';

const text = {
  span: {
    name: '组件宽度',
    widgetType: SysCustomWidgetType.Slider,
    value: 12,
    min: 1,
    max: 24,
  },
  padding: {
    name: '内部边距',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 2,
    min: 0,
  },
  paddingBottom: {
    name: '底部距离',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 0,
    min: 0,
  },
  height: {
    name: '组件高度',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 25,
    min: 0,
  },
  textIndent: {
    name: '首行缩进',
    widgetType: SysCustomWidgetType.NumberInput,
    value: 0,
    min: 0,
  },
  align: {
    name: '水平对齐',
    value: 'left',
    widgetType: SysCustomWidgetType.Select,
    dropdownList: [
      {
        id: 'left',
        name: '左对齐',
      },
      {
        id: 'center',
        name: '居中',
      },
      {
        id: 'right',
        name: '右对齐',
      },
    ],
  },
  valign: {
    name: '垂直对齐',
    value: 'center',
    widgetType: SysCustomWidgetType.Select,
    dropdownList: [
      {
        id: 'flex-start',
        name: '顶部',
      },
      {
        id: 'center',
        name: '居中',
      },
      {
        id: 'flex-end',
        name: '底部',
      },
    ],
  },
  fontSize: {
    name: '字号',
    value: 14,
    widgetType: SysCustomWidgetType.Slider,
    min: 10,
    max: 50,
  },
  fontColor: {
    name: '字体颜色',
    widgetType: SysCustomWidgetType.ColorPicker,
    value: '#383838',
  },
  bgColor: {
    name: '背景色',
    widgetType: SysCustomWidgetType.ColorPicker,
    value: undefined,
  },
  fontBold: {
    name: '粗体',
    widgetType: SysCustomWidgetType.Switch,
    value: false,
  },
  fontItalic: {
    name: '斜体',
    widgetType: SysCustomWidgetType.Switch,
    value: false,
  },
  text: {
    name: '内容',
    value: '文本内容',
    widgetType: SysCustomWidgetType.Input,
    props: {
      type: 'textarea',
      disabled: function (formConfig: ANY_OBJECT) {
        // 表单为非报表，并且绑定在字段上，那么内容不可输入
        return (
          formConfig &&
          formConfig.currentWidget?.bindData?.dataType !== SysCustomWidgetBindDataType.Fixed &&
          formConfig.form?.pageCode == null
        );
      },
    },
  },
};

const textConfig = {
  widgetType: SysCustomWidgetType.Text,
  icon: 'online-icon icon-text',
  attribute: text,
  allowEventList: [OnlineFormEventType.VISIBLE],
  supportBindTable: true,
  supportBindColumn: true,
};

export default textConfig;

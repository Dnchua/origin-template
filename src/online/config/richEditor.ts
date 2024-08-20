import {
  SysCustomWidgetType,
  SysOnlineFormType,
  OnlineFormEventType,
} from '@/common/staticDict/index';
import { ANY_OBJECT } from '@/types/generic';

const richEditor = {
  span: {
    name: '组件宽度',
    widgetType: SysCustomWidgetType.Slider,
    value: 24,
    visible: function (formConfig: ANY_OBJECT) {
      return formConfig && formConfig.form.formType !== SysOnlineFormType.QUERY;
    },
    min: 1,
    max: 24,
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
};

const richEditorConfig = {
  widgetType: SysCustomWidgetType.RichEditor,
  icon: 'online-icon icon-richeditor',
  attribute: richEditor,
  eventList: [OnlineFormEventType.VISIBLE],
  supportBindTable: true,
  supportBindColumn: true,
};

export default richEditorConfig;

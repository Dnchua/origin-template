import {
  SysCustomWidgetType,
  SysOnlineFormType,
  OnlineFormEventType,
} from '@/common/staticDict/index';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '@/api/config';

const upload = {
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
  fileFieldName: {
    name: '文件字段名',
    widgetType: SysCustomWidgetType.Input,
    value: 'uploadFile',
  },
  actionUrl: {
    name: '上传地址',
    widgetType: SysCustomWidgetType.Input,
    value: function (formConfig: ANY_OBJECT) {
      if (formConfig == null) return;
      const form = formConfig.form;
      const widget = formConfig.currentWidget;
      if (form == null || widget == null || widget.datasource == null) return '';
      if (
        form.formType === SysOnlineFormType.FLOW ||
        form.formType === SysOnlineFormType.FLOW_SLAVE_EDIT
      ) {
        return API_CONTEXT + '/flow/flowOnlineOperation/upload';
      } else {
        return (
          API_CONTEXT +
          '/online/onlineOperation/' +
          (widget.relation ? 'uploadOneToManyRelation/' : 'uploadDatasource/') +
          widget.datasource.variableName
        );
      }
    },
  },
  downloadUrl: {
    name: '下载地址',
    widgetType: SysCustomWidgetType.Input,
    value: function (formConfig: ANY_OBJECT) {
      if (formConfig == null) return;
      const form = formConfig.form;
      const widget = formConfig.currentWidget;
      if (form == null || widget == null || widget.datasource == null) return '';
      if (
        form.formType === SysOnlineFormType.FLOW ||
        form.formType === SysOnlineFormType.FLOW_SLAVE_EDIT
      ) {
        return API_CONTEXT + '/flow/flowOnlineOperation/download';
      } else {
        return (
          API_CONTEXT +
          '/online/onlineOperation/' +
          (widget.relation ? 'downloadOneToManyRelation/' : 'downloadDatasource/') +
          widget.datasource.variableName
        );
      }
    },
  },
  readOnly: {
    name: '是否只读',
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

const uploadConfig = {
  widgetType: SysCustomWidgetType.Upload,
  icon: 'online-icon icon-upload',
  attribute: upload,
  allowEventList: [
    OnlineFormEventType.CHANGE,
    OnlineFormEventType.DISABLE,
    OnlineFormEventType.VISIBLE,
  ],
  supportBindTable: true,
  supportBindColumn: true,
};

export default uploadConfig;

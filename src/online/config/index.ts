import { ANY_OBJECT } from '@/types/generic';
import { SysCustomWidgetType } from '@/common/staticDict/index';
import blockConfig from './customBlock';
import baseCardConfig from './baseCard';
import tabsConfig from './tabs';
import textConfig from './text';
import imageConfig from './image';
import labelConfig from './label';
import inputConfig from './input';
import numberInputConfig from './numberInput';
import numberRangeConfig from './numberRange';
import switchConfig from './switch';
import radioConfig from './radio';
import checkboxConfig from './checkbox';
import selectConfig from './select';
import cascaderConfig from './cascader';
import dateConfig from './date';
import dateRangeConfig from './dateRange';
import userSelectConfig from './userSelect';
import deptSelectConfig from './deptSelect';
import uploadConfig from './upload';
import richEditorConfig from './richEditor';
import tableConfig from './table';
import linkConfig from './link';
import treeConfig from './tree';

const formWidgetGroupList: ANY_OBJECT = {
  pc: [
    {
      id: 'layout',
      groupName: '布局组件',
      widgetList: [blockConfig, baseCardConfig, tabsConfig, textConfig, imageConfig],
    },
    {
      id: 'filter',
      groupName: '过滤组件',
      widgetList: [
        labelConfig,
        inputConfig,
        numberInputConfig,
        numberRangeConfig,
        switchConfig,
        radioConfig,
        checkboxConfig,
        selectConfig,
        cascaderConfig,
        dateConfig,
        dateRangeConfig,
        userSelectConfig,
        deptSelectConfig,
      ],
    },
    {
      id: 'base',
      groupName: '基础组件',
      widgetList: [
        labelConfig,
        inputConfig,
        numberInputConfig,
        numberRangeConfig,
        switchConfig,
        radioConfig,
        checkboxConfig,
        selectConfig,
        cascaderConfig,
        dateConfig,
        dateRangeConfig,
        uploadConfig,
        richEditorConfig,
        tableConfig,
        linkConfig,
      ],
    },
    {
      id: 'advance',
      groupName: '高级组件',
      widgetList: [userSelectConfig, deptSelectConfig],
    },
  ],
};

function getDefaultVariableName(widgetType: number) {
  const tempTime = new Date().getTime();
  switch (widgetType) {
    case SysCustomWidgetType.Label:
      return 'label' + tempTime;
    case SysCustomWidgetType.Input:
      return 'input' + tempTime;
    case SysCustomWidgetType.NumberInput:
      return 'numberInput' + tempTime;
    case SysCustomWidgetType.NumberRange:
      return 'numberRange' + tempTime;
    case SysCustomWidgetType.Switch:
      return 'switch' + tempTime;
    case SysCustomWidgetType.Slider:
      return 'slider' + tempTime;
    case SysCustomWidgetType.Radio:
      return 'radio' + tempTime;
    case SysCustomWidgetType.CheckBox:
      return 'checkBox' + tempTime;
    case SysCustomWidgetType.Select:
      return 'select' + tempTime;
    case SysCustomWidgetType.Cascader:
      return 'cascader' + tempTime;
    case SysCustomWidgetType.Date:
      return 'date' + tempTime;
    case SysCustomWidgetType.DateRange:
      return 'dateRange' + tempTime;
    case SysCustomWidgetType.Upload:
      return 'upload' + tempTime;
    case SysCustomWidgetType.RichEditor:
      return 'richEditor' + tempTime;
    case SysCustomWidgetType.Divider:
      return 'divider' + tempTime;
    case SysCustomWidgetType.Text:
      return 'text' + tempTime;
    case SysCustomWidgetType.Image:
      return 'image' + tempTime;
    case SysCustomWidgetType.ImageCard:
      return 'imageCard' + tempTime;
    case SysCustomWidgetType.Table:
      return 'table' + tempTime;
    case SysCustomWidgetType.PivotTable:
      return 'pivotTable' + tempTime;
    case SysCustomWidgetType.LineChart:
      return 'lineChart' + tempTime;
    case SysCustomWidgetType.BarChart:
      return 'barChart' + tempTime;
    case SysCustomWidgetType.PieChart:
      return 'pieChart' + tempTime;
    case SysCustomWidgetType.ScatterChart:
      return 'scatterChart' + tempTime;
    case SysCustomWidgetType.Block:
      return 'block' + tempTime;
    case SysCustomWidgetType.Link:
      return 'link' + tempTime;
    case SysCustomWidgetType.UserSelect:
      return 'userSelect' + tempTime;
    case SysCustomWidgetType.DeptSelect:
      return 'deptSelect' + tempTime;
    case SysCustomWidgetType.DataSelect:
      return 'dataSelect' + tempTime;
    case SysCustomWidgetType.Card:
      return 'baseCard' + tempTime;
    case SysCustomWidgetType.Tabs:
      return 'tabs' + tempTime;
    case SysCustomWidgetType.Tree:
      return 'tree' + tempTime;
    case SysCustomWidgetType.TableContainer:
      return 'tableContainer' + tempTime;
    case SysCustomWidgetType.List:
      return 'baseList' + tempTime;
    case SysCustomWidgetType.Rate:
      return 'rate' + tempTime;
    case SysCustomWidgetType.Stepper:
      return 'stepper' + tempTime;
    case SysCustomWidgetType.Calendar:
      return 'calendar' + tempTime;
    case SysCustomWidgetType.CellGroup:
      return 'group' + tempTime;
    case SysCustomWidgetType.MobileRadioFilter:
      return 'mbileRadioFilter' + tempTime;
    case SysCustomWidgetType.MobileCheckBoxFilter:
      return 'mobileCheckBoxFilter' + tempTime;
    case SysCustomWidgetType.MobileInputFilter:
      return 'mobileInputFilter' + tempTime;
    case SysCustomWidgetType.MobileSwitchFilter:
      return 'mobileSwitchFilter' + tempTime;
    case SysCustomWidgetType.MobileDateRangeFilter:
      return 'mobileDateRangeFilter' + tempTime;
    case SysCustomWidgetType.MobileNumberRangeFilter:
      return 'mobileNumberRangeFilter' + tempTime;
  }
}

function getWidgetAttribute(widgetType: number): ANY_OBJECT | null {
  switch (widgetType) {
    case SysCustomWidgetType.Label:
      return labelConfig;
    case SysCustomWidgetType.Text:
      return textConfig;
    case SysCustomWidgetType.Image:
      return imageConfig;
    case SysCustomWidgetType.Input:
      return inputConfig;
    case SysCustomWidgetType.NumberInput:
      return numberInputConfig;
    case SysCustomWidgetType.NumberRange:
      return numberRangeConfig;
    case SysCustomWidgetType.Switch:
      return switchConfig;
    case SysCustomWidgetType.Radio:
      return radioConfig;
    case SysCustomWidgetType.CheckBox:
      return checkboxConfig;
    case SysCustomWidgetType.Select:
      return selectConfig;
    case SysCustomWidgetType.Cascader:
      return cascaderConfig;
    case SysCustomWidgetType.Date:
      return dateConfig;
    case SysCustomWidgetType.DateRange:
      return dateRangeConfig;
    case SysCustomWidgetType.Upload:
      return uploadConfig;
    case SysCustomWidgetType.RichEditor:
      return richEditorConfig;
    case SysCustomWidgetType.Table:
      return tableConfig;
    case SysCustomWidgetType.Block:
      return blockConfig;
    case SysCustomWidgetType.Link:
      return linkConfig;
    case SysCustomWidgetType.UserSelect:
      return userSelectConfig;
    case SysCustomWidgetType.DeptSelect:
      return deptSelectConfig;
    case SysCustomWidgetType.Card:
      return baseCardConfig;
    case SysCustomWidgetType.Tabs:
      return tabsConfig;
    case SysCustomWidgetType.Tree:
      return treeConfig;
    default:
      return null;
  }
}

function getWidgetObject(widget: ANY_OBJECT): ANY_OBJECT {
  const temp = {
    // ...widget,
    widgetType: widget.widgetType,
    bindData: {
      //...bindDataConfig,
      defaultValue: {
        //...bindDataConfig.defaultValue,
      },
    },
    operationList: widget.operationList
      ? JSON.parse(JSON.stringify(widget.operationList))
      : undefined,
    showName: SysCustomWidgetType.getValue(widget.widgetType),
    variableName: getDefaultVariableName(widget.widgetType),
    props: Object.keys(widget.attribute).reduce((retObj: ANY_OBJECT, key) => {
      let tempValue;
      if (typeof widget.attribute[key].value === 'function') {
        tempValue = widget.attribute[key].value();
      } else {
        tempValue = widget.attribute[key].value;
      }
      if (Array.isArray(tempValue) || tempValue instanceof Object) {
        retObj[key] = JSON.parse(JSON.stringify(tempValue));
      } else {
        retObj[key] = tempValue;
      }
      return retObj;
    }, {}),
    eventList: [],
    childWidgetList: [],
    style: {},
    supportOperation: widget.supportOperation == null ? false : widget.supportOperation,
  };
  return temp;
}

function supportBindTable(widget: ANY_OBJECT) {
  const widgetInfo = getWidgetAttribute(widget.widgetType);
  return widgetInfo ? widgetInfo.supportBindTable : false;
}

function supportBindColumn(widget: ANY_OBJECT) {
  const widgetInfo = getWidgetAttribute(widget.widgetType);
  return widgetInfo ? widgetInfo.supportBindColumn : false;
}

export default {
  formWidgetGroupList,
  getWidgetObject,
  getWidgetAttribute,
  supportBindTable,
  supportBindColumn,
};

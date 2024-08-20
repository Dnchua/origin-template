import { SysCustomWidgetType, SysOnlineFormType } from '@/common/staticDict';
import { SysOnlineFieldKind } from '@/common/staticDict/online';
import { ANY_OBJECT } from '@/types/generic';

export const useWidgetToolkit = () => {
  function getColumnDataType(column: ANY_OBJECT) {
    switch (column.objectFieldType) {
      case 'String':
        return 'String';
      case 'Date':
        return 'Date';
      case 'Boolean':
        return 'Boolean';
      case 'Integer':
      case 'Long':
      case 'Float':
      case 'Double':
      case 'BigDecimal':
        return 'Number';
      default:
        return undefined;
    }
  }

  /**
   * 字段是否可以使用组件显示
   * @param {*} column 要显示的字段
   * @param {*} widgetType 使用的组件
   * @param {*} formType 表单类型
   * @return { disabled, warningMsg } 是否可以显示和提示文字
   */
  function columnIsValidByWidgetType(
    column: ANY_OBJECT | null,
    widgetType: number,
    formType: number,
  ) {
    if (column == null) {
      return {
        disabled: true,
        warningMsg: '错误的字段数据',
      };
    }
    const columnFieldType = getColumnDataType(column);
    let disabled = false;
    let warningMsg: string | null = null;
    if (column.fieldKind === SysOnlineFieldKind.UPLOAD) {
      disabled = widgetType !== SysCustomWidgetType.Upload;
      warningMsg = SysOnlineFieldKind.getValue(column.fieldKind);
    } else if (column.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE) {
      disabled =
        widgetType !== SysCustomWidgetType.Upload && widgetType !== SysCustomWidgetType.Image;
      warningMsg = SysOnlineFieldKind.getValue(column.fieldKind);
    } else if (column.fieldKind === SysOnlineFieldKind.RICH_TEXT) {
      disabled =
        widgetType !== SysCustomWidgetType.RichEditor && widgetType !== SysCustomWidgetType.Label;
      warningMsg = SysOnlineFieldKind.getValue(column.fieldKind);
    } else if (
      column.fieldKind === SysOnlineFieldKind.CREATE_TIME ||
      column.fieldKind === SysOnlineFieldKind.CREATE_USER_ID ||
      column.fieldKind === SysOnlineFieldKind.UPDATE_TIME ||
      column.fieldKind === SysOnlineFieldKind.UPDATE_USER_ID ||
      column.fieldKind === SysOnlineFieldKind.LOGIC_DELETE
    ) {
      disabled =
        widgetType !== SysCustomWidgetType.Label &&
        widgetType !== SysCustomWidgetType.Text &&
        [
          SysOnlineFormType.QUERY,
          SysOnlineFormType.ADVANCE_QUERY,
          SysOnlineFormType.ONE_TO_ONE_QUERY,
        ].indexOf(formType) === -1;
      warningMsg = SysOnlineFieldKind.getValue(column.fieldKind);
    } else {
      switch (widgetType) {
        case SysCustomWidgetType.Label:
        case SysCustomWidgetType.MobileInputFilter:
          disabled = false;
          break;
        case SysCustomWidgetType.Text:
          disabled = column.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE;
          break;
        case SysCustomWidgetType.Image:
          disabled = column.fieldKind !== SysOnlineFieldKind.UPLOAD_IMAGE;
          break;
        case SysCustomWidgetType.Input:
          disabled = columnFieldType !== 'String' && columnFieldType !== 'Number';
          break;
        case SysCustomWidgetType.NumberInput:
        case SysCustomWidgetType.NumberRange:
        case SysCustomWidgetType.MobileNumberRangeFilter:
          disabled = columnFieldType !== 'Number';
          break;
        case SysCustomWidgetType.Switch:
        case SysCustomWidgetType.MobileSwitchFilter:
          disabled = columnFieldType !== 'Boolean';
          break;
        case SysCustomWidgetType.Slider:
        case SysCustomWidgetType.Stepper:
        case SysCustomWidgetType.Rate:
          disabled = columnFieldType !== 'Number';
          break;
        case SysCustomWidgetType.Radio:
        case SysCustomWidgetType.Select:
        case SysCustomWidgetType.Cascader:
        case SysCustomWidgetType.CheckBox:
        case SysCustomWidgetType.Tree:
        case SysCustomWidgetType.MobileRadioFilter:
        case SysCustomWidgetType.MobileCheckBoxFilter:
          disabled =
            (columnFieldType !== 'String' && columnFieldType !== 'Number') || column.dictId == null;
          if (column.dictId == null) warningMsg = '未绑定字典';
          break;
        case SysCustomWidgetType.Date:
        case SysCustomWidgetType.DateRange:
        case SysCustomWidgetType.Calendar:
        case SysCustomWidgetType.MobileDateRangeFilter:
          disabled = columnFieldType !== 'Date';
          break;
        case SysCustomWidgetType.Upload:
          disabled = column.fieldKind !== SysOnlineFieldKind.UPLOAD;
          break;
        case SysCustomWidgetType.RichEditor:
          disabled = column.fieldKind !== SysOnlineFieldKind.RICH_TEXT;
          break;
        case SysCustomWidgetType.UserSelect:
        case SysCustomWidgetType.DeptSelect:
          disabled = columnFieldType !== 'String' && columnFieldType !== 'Number';
          break;
        case SysCustomWidgetType.DataSelect:
          disabled = !column.oneToOnyRelationColumn;
          break;
        default:
          disabled = true;
          break;
      }
    }

    if (disabled && warningMsg == null) {
      warningMsg =
        widgetType === SysCustomWidgetType.DataSelect ? '不是一对一关联字段' : '字段类型不匹配';
    }

    return {
      disabled,
      warningMsg,
    };
  }
  return {
    columnIsValidByWidgetType,
  };
};

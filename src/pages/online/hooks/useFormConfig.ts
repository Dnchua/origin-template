import {
  OnlineFormEventType,
  SysCustomWidgetOperationType,
  SysOnlineFormType,
} from '@/common/staticDict';
import { SysOnlinePageType } from '@/common/staticDict/online';
import { ANY_OBJECT } from '@/types/generic';
import { findItemFromList } from '@/common/utils';
import widgetData from '@/online/config/index';
import tableConfig from '@/online/config/table';
import treeConfig from '@/online/config/tree';
import workOrderListConfig from '@/online/config/workOrderList';

export const useFormConfig = () => {
  const baseQueryForm = {
    filterItemWidth: 350,
    gutter: 20,
    labelWidth: 100,
    labelPosition: 'right',
    tableWidget: {
      ...widgetData.getWidgetObject(tableConfig),
    },
    leftWidget: {
      ...widgetData.getWidgetObject(treeConfig),
    },
    operationList: [
      {
        id: 0,
        type: SysCustomWidgetOperationType.EXPORT,
        name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.EXPORT),
        enabled: false,
        builtin: true,
        rowOperation: false,
        btnType: 'primary',
        plain: true,
        formId: undefined,
        paramList: [],
        eventList: [],
        readOnly: false,
        showOrder: 0,
      },
      {
        id: 1,
        type: SysCustomWidgetOperationType.BATCH_DELETE,
        name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.BATCH_DELETE),
        enabled: false,
        builtin: true,
        rowOperation: false,
        btnType: 'danger',
        plain: true,
        formId: undefined,
        eventList: [],
        readOnly: false,
        showOrder: 1,
      },
      {
        id: 2,
        type: SysCustomWidgetOperationType.ADD,
        name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.ADD),
        enabled: false,
        builtin: true,
        rowOperation: false,
        btnType: 'primary',
        plain: false,
        formId: undefined,
        eventList: [],
        readOnly: false,
        showOrder: 2,
      },
      {
        id: 3,
        type: SysCustomWidgetOperationType.EDIT,
        name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.EDIT),
        enabled: false,
        builtin: true,
        rowOperation: true,
        btnClass: 'table-btn success',
        formId: undefined,
        eventList: [],
        readOnly: false,
        showOrder: 10,
      },
      {
        id: 4,
        type: SysCustomWidgetOperationType.DELETE,
        name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.DELETE),
        enabled: false,
        builtin: true,
        rowOperation: true,
        btnClass: 'table-btn delete',
        formId: undefined,
        eventList: [],
        readOnly: false,
        showOrder: 15,
      },
    ],
    customFieldList: [],
    widgetList: [],
    formEventList: [],
    maskFieldList: [],
    allowEventList: [OnlineFormEventType.AFTER_CREATE_FORM],
    fullscreen: true,
    advanceQuery: false,
    supportOperation: true,
    width: 800,
  };

  const baseEditForm = {
    gutter: 20,
    labelWidth: 100,
    labelPosition: 'right',
    operationList: [],
    customFieldList: [],
    widgetList: [],
    formEventList: [],
    maskFieldList: [],
    allowEventList: [
      OnlineFormEventType.AFTER_CREATE_FORM,
      OnlineFormEventType.AFTER_LOAD_FORM_DATA,
      OnlineFormEventType.BEFORE_COMMIT_FORM_DATA,
    ],
    fullscreen: false,
    supportOperation: true,
    width: 800,
  };

  const baseFlowForm = {
    gutter: 20,
    labelWidth: 100,
    labelPosition: 'right',
    customFieldList: [],
    widgetList: [],
    formEventList: [],
    maskFieldList: [],
    allowEventList: [
      OnlineFormEventType.AFTER_CREATE_FORM,
      OnlineFormEventType.AFTER_LOAD_FORM_DATA,
      OnlineFormEventType.BEFORE_COMMIT_FORM_DATA,
    ],
    fullscreen: true,
    supportOperation: false,
    width: 800,
  };

  const baseWorkflowForm = {
    gutter: 20,
    labelWidth: 100,
    labelPosition: 'right',
    tableWidget: {
      ...widgetData.getWidgetObject(tableConfig),
    },
    operationList: [],
    customFieldList: [],
    widgetList: [],
    formEventList: [],
    maskFieldList: [],
    allowEventList: [OnlineFormEventType.AFTER_CREATE_FORM],
    fullscreen: true,
    supportOperation: true,
    width: 800,
  };

  const getFormConfig = (formType: number, pageType: number | undefined) => {
    switch (formType) {
      case SysOnlineFormType.QUERY:
      case SysOnlineFormType.ADVANCE_QUERY:
      case SysOnlineFormType.ONE_TO_ONE_QUERY:
        return JSON.parse(
          JSON.stringify({
            pc: {
              ...baseQueryForm,
              advanceQuery: formType === SysOnlineFormType.ADVANCE_QUERY,
              supportOperation: formType !== SysOnlineFormType.ONE_TO_ONE_QUERY,
            },
          }),
        );
      case SysOnlineFormType.FORM:
        return JSON.parse(
          JSON.stringify({
            pc: {
              ...baseEditForm,
              supportOperation: pageType === SysOnlinePageType.BIZ,
            },
          }),
        );
      case SysOnlineFormType.FLOW:
        return JSON.parse(
          JSON.stringify({
            pc: baseFlowForm,
          }),
        );
      case SysOnlineFormType.WORK_ORDER:
        return JSON.parse(
          JSON.stringify({
            pc: baseWorkflowForm,
          }),
        );
      default:
        return null;
    }
  };

  /**
   * 合并数组，如果目标数组里的数据在原数组不存在，则加入到原数组，否则使用原数组数据
   */
  const mergeArray = (source: ANY_OBJECT[], target: ANY_OBJECT[], keyName: string) => {
    const tempList: ANY_OBJECT[] = [];
    if (Array.isArray(target)) {
      target.forEach(item => {
        const temp = findItemFromList(source, item[keyName], keyName);
        tempList.push({
          ...item,
          ...temp,
        });
      });
    }
    if (Array.isArray(source)) {
      source.forEach(item => {
        const temp = findItemFromList(tempList, item[keyName], keyName);
        if (temp == null) {
          tempList.push(item);
        }
      });
    }
    return tempList;
  };
  /**
   * 合并组件操作和属性
   */
  const mergeWidget = (widget: ANY_OBJECT) => {
    if (widget == null) return;
    const widgetConfig: ANY_OBJECT | null = widgetData.getWidgetAttribute(widget.widgetType);
    if (widgetConfig != null) {
      // 合并组件操作
      widget.supportOperation = widgetConfig.supportOperation;
      if (widget.supportOperation) {
        widget.operationList = mergeArray(widget.operationList, widgetConfig.operationList, 'id');
      }
      // 合并组件属性
      widget.props = {
        ...widgetConfig.props,
        ...widget.props,
      };
    }
  };

  const buildFormConfig = (formData: ANY_OBJECT) => {
    if (formData == null || formData.rawData == null || formData.rawData.onlineTableList == null)
      return;
    const formConfig = formData;
    formConfig.datasourceMap = new Map();
    formConfig.relationMap = new Map();
    formConfig.tableMap = new Map();
    formConfig.columnMap = new Map();
    formConfig.dictMap = new Map();
    formConfig.linkageMap = new Map();
    const rawData = formData.rawData;
    if (rawData == null) return formConfig;
    // 字典
    if (Array.isArray(rawData.onlineDictList)) {
      rawData.onlineDictList.forEach((dict: ANY_OBJECT) => {
        formConfig.dictMap.set(dict.dictId, dict);
      });
    }
    rawData.onlineDictList = null;
    // 数据表
    if (Array.isArray(rawData.onlineTableList)) {
      rawData.onlineTableList.forEach((table: ANY_OBJECT) => {
        formConfig.tableMap.set(table.tableId, table);
      });
    }
    rawData.onlineTableList = null;
    // 字段
    if (Array.isArray(rawData.onlineColumnList)) {
      rawData.onlineColumnList.forEach((column: ANY_OBJECT) => {
        if (column.dictId != null) {
          column.dictInfo = formConfig.dictMap.get(column.dictId);
        }
        const table = formConfig.tableMap.get(column.tableId);
        if (table) {
          if (!Array.isArray(table.columnList)) table.columnList = [];
          table.columnList.push(column);
        }
        formConfig.columnMap.set(column.columnId, column);
      });
    }
    rawData.onlineColumnList = null;
    // 虚拟字段
    if (Array.isArray(rawData.onlineVirtualColumnList)) {
      rawData.onlineVirtualColumnList.forEach((column: ANY_OBJECT) => {
        column.columnId = column.virtualColumnId;
        column.columnComment = column.columnPrompt;
        column.columnName = column.objectFieldName;
        column.primaryKey = false;
        column.isVirtualColumn = true;
        formConfig.columnMap.set(column.columnId, column);
      });
    }
    rawData.onlineVirtualColumnList = null;
    // 数据源
    if (Array.isArray(rawData.onlineDatasourceList)) {
      rawData.onlineDatasourceList.forEach((datasource: ANY_OBJECT) => {
        datasource.masterTable = formConfig.tableMap.get(datasource.masterTableId);
        if (datasource.masterTable) datasource.masterTable.datasource = datasource;
        formConfig.datasourceMap.set(datasource.datasourceId, datasource);
      });
    }
    rawData.onlineDatasourceList = null;
    // 关联
    if (Array.isArray(rawData.onlineDatasourceRelationList)) {
      rawData.onlineDatasourceRelationList.forEach((relation: ANY_OBJECT) => {
        const datasource = formConfig.datasourceMap.get(relation.datasourceId);
        if (datasource) {
          if (!Array.isArray(datasource.relationList)) datasource.relationList = [];
          datasource.relationList.push(relation);
        }
        relation.masterColumn = formConfig.columnMap.get(relation.masterColumnId);
        relation.slaveTable = formConfig.tableMap.get(relation.slaveTableId);
        if (relation.slaveTable) {
          relation.slaveTable.relation = relation;
          relation.slaveTable.datasource = datasource;
        }
        relation.slaveColumn = formConfig.columnMap.get(relation.slaveColumnId);
        formConfig.relationMap.set(relation.relationId, relation);
      });
    }
    rawData.onlineDatasourceRelationList = null;
    // 校验规则
    if (Array.isArray(rawData.onlineColumnRuleList)) {
      rawData.onlineColumnRuleList.forEach((rule: ANY_OBJECT) => {
        const column = formConfig.columnMap.get(rule.columnId);
        if (column) {
          if (!Array.isArray(column.ruleList)) column.ruleList = [];
          column.ruleList.push(rule);
        }
      });
    }
    rawData.onlineColumnRuleList = null;

    return formConfig;
  };

  return { getFormConfig, mergeWidget, mergeArray, buildFormConfig };
};

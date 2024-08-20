<template>
  <el-row style="width: 100%">
    <el-form label-position="top" size="default" style="width: 100%" @submit.prevent>
      <el-col :span="24">
        <el-form-item label="组件类型">
          <el-input :model-value="SysCustomWidgetType.getValue(data.widgetType)" :disabled="true" />
        </el-form-item>
        <el-form-item
          label="绑定类型"
          v-if="
            (supportBindTable || supportBindColumn) && data.widgetType !== SysCustomWidgetType.Table
          "
        >
          <el-select
            v-model="data.bindData.dataType"
            @change="onBindDataTypeChange"
            style="width: 100%"
          >
            <el-option
              v-for="item in getValidBindDataType"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="绑定表"
          v-if="data.bindData?.dataType === SysCustomWidgetBindDataType.Column && supportBindTable"
        >
          <el-select
            style="width: 100%"
            v-model="data.bindData.tableId"
            placeholder=""
            filterable
            @change="onBindTableChange"
          >
            <el-option
              v-for="item in getValidTableList"
              :key="item.tableId"
              :value="item.tableId"
              :label="item.tableName"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="绑定字段"
          v-if="data.bindData?.dataType === SysCustomWidgetBindDataType.Column && supportBindColumn"
        >
          <el-select
            style="width: 100%"
            v-model="data.bindData.columnId"
            placeholder=""
            clearable
            filterable
            :popper-options="{ placement: 'bottom-end' }"
            @change="onBindColumnChange"
          >
            <el-option
              v-for="item in getValidColumnList"
              :key="item.columnName"
              :value="item.columnId"
              :label="item.columnName"
              :disabled="item.disabled"
            >
              <el-row type="flex" justify="space-between" align="middle">
                <span>{{ item.columnName }}</span>
                <el-tag v-if="item.disabled" style="margin-left: 40px" size="default" type="info">{{
                  item.warningMsg
                }}</el-tag>
                <el-tag v-else style="margin-left: 40px" size="default" type="success">{{
                  item.objectFieldType
                }}</el-tag>
              </el-row>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="系统变量"
          v-if="data.bindData?.dataType === SysCustomWidgetBindDataType.SYSTEM_VARIABLE"
        >
          <el-select
            style="width: 100%"
            v-model="data.bindData.systemVariableType"
            placeholder=""
            filterable
          >
            <el-option
              v-for="item in OnlineSystemVariableType.getList()"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="自定义字段"
          v-if="data.bindData?.dataType === SysCustomWidgetBindDataType.Custom"
        >
          <el-select
            style="width: 100%"
            v-model="data.bindData.formFieldName"
            placeholder=""
            filterable
          >
            <el-option
              v-for="item in formConfig().form.customFieldList"
              :key="item.fieldName"
              :label="item.fieldName"
              :value="item.fieldName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="组件名称">
          <el-input v-model="data.showName" placeholder="" clearable filterable />
        </el-form-item>
        <el-form-item label="组件标识">
          <el-input v-model="data.variableName" placeholder="" clearable filterable />
        </el-form-item>
      </el-col>
    </el-form>
  </el-row>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';
import {
  SysCustomWidgetBindDataType,
  SysCustomWidgetType,
  OnlineSystemVariableType,
  SysOnlineFormType,
} from '@/common/staticDict';
import { findItemFromList } from '@/common/utils';
import { SysOnlineColumnFilterType } from '@/common/staticDict/online';
import { useWidgetToolkit } from '@/pages/online/hooks/useWidgetToolkit';
import widgetData from '@/online/config/index';

const emit = defineEmits<{ 'update:value': [ANY_OBJECT] }>();
const props = defineProps<{ value: ANY_OBJECT }>();
const formConfig = inject('formConfig', () => {
  console.error('CustomWidgetBindData: formConfig not injected');
  return {} as ANY_OBJECT;
});

const { columnIsValidByWidgetType } = useWidgetToolkit();

const data = computed({
  get() {
    console.log('widgetBindData >>>>>>>>>>', props.value);
    return props.value;
  },
  set(val) {
    console.log('widget bindData change', val);
    emit('update:value', val);
  },
});
const supportBindTable = computed(() => {
  return widgetData.supportBindTable(data.value);
});
const supportBindColumn = computed(() => {
  return widgetData.supportBindColumn(data.value);
});
const getValidBindDataType = computed(() => {
  return SysCustomWidgetBindDataType.getList().filter(item => {
    switch (item.id) {
      case SysCustomWidgetBindDataType.Column:
        return true;
      case SysCustomWidgetBindDataType.Custom:
        return data.value.widgetType !== SysCustomWidgetType.Table;
      case SysCustomWidgetBindDataType.SYSTEM_VARIABLE:
        return data.value.widgetType === SysCustomWidgetType.Label;
      case SysCustomWidgetBindDataType.Fixed:
        return (
          data.value.widgetType === SysCustomWidgetType.Image ||
          data.value.widgetType === SysCustomWidgetType.Text
        );
      default:
        return false;
    }
  });
});
const formType = computed(() => {
  return formConfig().form.formType;
});
const getValidTableList = computed(() => {
  if (data.value.parent != null) {
    return formConfig().getTableWidgetTableList;
  } else if (
    data.value.widgetType === SysCustomWidgetType.Table ||
    data.value.widgetType === SysCustomWidgetType.List
  ) {
    return formConfig().getTableWidgetTableList.filter((item: ANY_OBJECT) => {
      if (
        formType.value === SysOnlineFormType.QUERY ||
        formType.value === SysOnlineFormType.ONE_TO_ONE_QUERY
      ) {
        return item.tableId === formConfig().getMasterTable.tableId;
      } else {
        return true;
      }
    });
  } else if (data.value.widgetType === SysCustomWidgetType.DataSelect) {
    // 关联选择组件，只能从主表中选择
    return formConfig().getValidTableList.filter((item: ANY_OBJECT) => {
      return item.tableId === formConfig().getMasterTable.tableId;
    });
  } else {
    return formConfig().getValidTableList;
  }
});
const getBindTable = computed(() => {
  return findItemFromList(getValidTableList.value, data.value.bindData.tableId, 'tableId');
});
const getValidColumnList = computed(() => {
  let temp = getBindTable.value
    ? getBindTable.value.columnList
        .map((item: ANY_OBJECT) => {
          let { disabled, warningMsg } = columnIsValidByWidgetType(
            item,
            data.value.widgetType,
            formType.value,
          );
          // 查询页面仅能选择支持过滤的字段
          if (
            !disabled &&
            item.filterType === SysOnlineColumnFilterType.NONE &&
            [
              SysOnlineFormType.QUERY,
              SysOnlineFormType.ADVANCE_QUERY,
              SysOnlineFormType.ONE_TO_ONE_QUERY,
            ].indexOf(formType.value) !== -1
          ) {
            disabled = true;
            warningMsg = '未支持过滤';
          }
          return {
            ...item,
            disabled,
            warningMsg,
          };
        })
        .sort((val1: ANY_OBJECT, val2: ANY_OBJECT) => {
          return (val1.disabled ? 1 : 0) - (val2.disabled ? 1 : 0);
        })
    : [];
  return temp;
});
const getWidgetAttributeConfig = computed(() => {
  // return (widgetData.getWidgetAttribute(data.value.widgetType) || {}).attribute;
  return (formConfig().getWidgetAttribute(data.value.widgetType) || {}).attribute;
});

const clearDictInfo = () => {
  data.value.props.dictInfo = {
    dictId: undefined,
    paramList: [],
  };
};
const onBindDataTypeChange = () => {
  clearDictInfo();
};
const onBindColumnChange = (val: string | null = null) => {
  clearDictInfo();
  if (!val) return;
  console.log('## onBindColumnChange', data.value);
  data.value.bindData.column = findItemFromList(getValidColumnList.value, val, 'columnId');
  data.value.column = data.value.bindData.column;
  if (data.value.column) {
    data.value.showName = data.value.column.columnComment;
    data.value.variableName = data.value.column.objectFieldName || data.value.column.columnName;
    if (data.value.props.required != null) {
      if (data.value.column.required == null) {
        data.value.props.required = !data.value.column.nullable;
      } else {
        data.value.props.required = data.value.column.required;
      }
    }
  }
  // Text类型组件，设置默认显示内容
  if (data.value.widgetType === SysCustomWidgetType.Text) {
    data.value.props.text = (data.value.column || {}).columnComment || '文本组件';
  }
};
const resetWidgetProps = () => {
  let tempProps: ANY_OBJECT = {};
  if (getWidgetAttributeConfig.value != null) {
    Object.keys(getWidgetAttributeConfig.value).forEach(attributeKey => {
      let attributeItem = getWidgetAttributeConfig.value[attributeKey];
      if (typeof attributeItem.value === 'function') {
        tempProps[attributeKey] = attributeItem.value(formConfig());
      }
    });
  }
  data.value.props = {
    ...data.value.props,
    ...tempProps,
  };
};
const onBindTableChange = () => {
  data.value.bindData.table = getBindTable.value;
  if (getBindTable.value) {
    if (getBindTable.value.relationType == null) {
      data.value.datasource = getBindTable.value.tag;
    } else {
      data.value.relation = getBindTable.value.tag;
      let temp = findItemFromList(
        formConfig().getAllTableList,
        data.value.relation.datasourceId,
        'id',
      );
      data.value.datasource = temp ? temp.tag : undefined;
    }
  }
  if (data.value.datasource == null) console.error('没有找到组件绑定的数据源！');
  data.value.bindData.columnId = undefined;
  onBindColumnChange();
  resetWidgetProps();
};

watch(
  () => getValidTableList.value,
  () => {
    if (
      data.value.bindData?.tableId == null &&
      getValidTableList.value &&
      getValidTableList.value.length === 1
    ) {
      data.value.bindData.tableId = getValidTableList.value[0].tableId;
      onBindTableChange();
    }
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style scoped>
.full-line-btn {
  width: 100%;
  margin-top: 10px;
  border: 1px dashed #ebeef5;
}
</style>

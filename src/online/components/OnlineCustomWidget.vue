<template>
  <component
    v-bind="getWidgetProps"
    :ref="widget.variableName"
    :is="getComponent"
    :style="getWidgetStyle"
    :disabled="getDisabledStatus()"
    :widget="widget"
    v-model="bindValue"
    :value="bindValue"
    @change="onValueChange"
    :change="onValueChange"
    @widgetClick="onWidgetClick"
  >
    <template v-if="form().mode === 'pc' && widget.widgetType !== SysCustomWidgetType.Cascader" v-slot="scope">
      <template v-if="widget.widgetType === SysCustomWidgetType.Radio">
        <el-radio v-for="item in getAllDropdownData" :key="item.id" :value="item.id">
          {{ item.name }}
        </el-radio>
      </template>
      <template
        v-else-if="
          widget.widgetType === SysCustomWidgetType.Date ||
          widget.widgetType === SysCustomWidgetType.DateRange
        "
      >
        <div class="el-date-table-cell">
          <span class="el-date-table-cell__text">{{ scope.text }}</span>
        </div>
      </template>
      <template v-else-if="widget.widgetType === SysCustomWidgetType.CheckBox">
        <el-checkbox v-for="item in getAllDropdownData" :key="item.id" :label="item.id">
          {{ item.name }}
        </el-checkbox>
      </template>
      <template v-else-if="widget.widgetType === SysCustomWidgetType.Select">
        <el-option
          v-for="item in getAllDropdownData"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </template>
      <template v-if="widget.widgetType === SysCustomWidgetType.Link">
        <span>{{ widget.props.showText || widget.showName }}</span>
      </template>
    </template>
  </component>
</template>

<script setup lang="ts">
import {
  ElCascader,
  ElCheckboxGroup,
  ElDatePicker,
  ElInput,
  ElInputNumber,
  ElLink,
  ElRadioGroup,
  ElSelect,
  ElSwitch,
} from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import { OnlineFormEventType, SysCustomWidgetType, SysOnlineFormType } from '@/common/staticDict';
import { SysOnlineColumnFilterType, SysOnlineFieldKind } from '@/common/staticDict/online';
import {
  treeDataTranslate,
  findTreeNode,
  findItemFromList,
  findTreeNodePath,
} from '@/common/utils';
import RichEditor from '@/components/RichEditor/index.vue';
import UserSelect from '@/components/UserSelect/index.vue';
import DeptSelect from '@/components/DeptSelect/index.vue';
import InputNumberRange from '@/components/InputNumberRange/index.vue';
import OnlineCustomLabel from './OnlineCustomLabel.vue';
import OnlineCustomUpload from './OnlineCustomUpload.vue';
import OnlineCustomTree from './OnlineCustomTree.vue';
import OnlineCustomText from './OnlineCustomText.vue';
import OnlineCustomImage from './OnlineCustomImage.vue';
import { WidgetEmit, WidgetProps } from './types/widget';
import { useWidget } from './hooks/widget';

type ValueType = string | boolean | Date | number | ANY_OBJECT | Array<ANY_OBJECT>;

interface IEmit extends WidgetEmit {
  (event: 'change', value: ANY_OBJECT | undefined, params: ANY_OBJECT | null): void;
  (event: 'update:value', value: ValueType | undefined): void;
  (event: 'update:modelValue', value: ValueType | undefined): void;
  (event: 'update:widget', value: ANY_OBJECT): void;
  (event: 'input', value: ValueType | undefined): void;
}
const emit = defineEmits<IEmit>();

interface IProps extends WidgetProps {
  value?: ValueType;
  widget: ANY_OBJECT;
}
const pps = withDefaults(defineProps<IProps>(), {});

const form = inject('form', () => {
  return { isEdit: false } as ANY_OBJECT;
});
const parentWidget = inject<ANY_OBJECT | null>('parentWidget', null);

const { propsWidget, onWidgetClick } = useWidget(pps, emit);

const dictDataList = ref<ANY_OBJECT[]>([]);
const tempValue = ref();

const multiSelect = computed(() => {
  if (
    [
      SysCustomWidgetType.Select,
      SysCustomWidgetType.CheckBox,
      SysCustomWidgetType.Cascader,
      SysCustomWidgetType.Tree,
    ].indexOf(pps.widget.widgetType) === -1
  ) {
    return false;
  }
  if (pps.widget.widgetType === SysCustomWidgetType.CheckBox) return true;
  if (
    form().formType === SysOnlineFormType.QUERY ||
    form().formType === SysOnlineFormType.ADVANCE_QUERY
  ) {
    return (
      pps.widget.column &&
      pps.widget.column.filterType === SysOnlineColumnFilterType.MULTI_SELECT_FILTER
    );
  } else if (form().formType === SysOnlineFormType.REPORT) {
    return SysCustomWidgetType.CheckBox === pps.widget.widgetType;
  } else {
    return pps.widget.column && pps.widget.column.fieldKind === SysOnlineFieldKind.MULTI_SELECT;
  }
});
const isMobileFilter = computed(() => {
  return (
    [
      SysCustomWidgetType.MobileRadioFilter,
      SysCustomWidgetType.MobileCheckBoxFilter,
      SysCustomWidgetType.MobileInputFilter,
      SysCustomWidgetType.MobileDateRangeFilter,
      SysCustomWidgetType.MobileNumberRangeFilter,
      SysCustomWidgetType.MobileSwitchFilter,
    ].indexOf(pps.widget.widgetType) !== -1
  );
});
const getAllDropdownData = computed(() => {
  if (pps.widget.props.supportAll) {
    return [
      {
        id: '',
        name: '全部',
      },
      ...dictDataList.value,
    ];
  } else {
    return dictDataList.value;
  }
});
const getWidgetStyle = computed(() => {
  return {
    width: pps.widget.widgetType !== SysCustomWidgetType.Link ? '100%' : undefined,
  };
});
const getComponent = computed(() => {
  if (
    [
      SysCustomWidgetType.Text,
      SysCustomWidgetType.Image,
      SysCustomWidgetType.Upload,
      SysCustomWidgetType.Link,
    ].indexOf(pps.widget.widgetType) === -1 &&
    form().readOnly
  ) {
    return OnlineCustomLabel;
  }
  let mode = form().mode;

  switch (pps.widget.widgetType) {
    case SysCustomWidgetType.Label:
      return OnlineCustomLabel;
    case SysCustomWidgetType.Input:
      return ElInput;
    case SysCustomWidgetType.NumberInput:
      return ElInputNumber;
    case SysCustomWidgetType.NumberRange:
      return InputNumberRange;
    case SysCustomWidgetType.Switch:
      return ElSwitch;
    case SysCustomWidgetType.Radio:
      return ElRadioGroup;
    case SysCustomWidgetType.CheckBox:
      return ElCheckboxGroup;
    case SysCustomWidgetType.Select:
      return ElSelect;
    case SysCustomWidgetType.Cascader:
      return ElCascader;
    case SysCustomWidgetType.Date:
      return ElDatePicker;
    case SysCustomWidgetType.DateRange:
      return ElDatePicker;
    case SysCustomWidgetType.Upload:
      return OnlineCustomUpload;
    case SysCustomWidgetType.RichEditor:
      return RichEditor;
    case SysCustomWidgetType.Link:
      return ElLink;
    case SysCustomWidgetType.UserSelect:
      return UserSelect;
    case SysCustomWidgetType.DeptSelect:
      return DeptSelect;
    case SysCustomWidgetType.Tree:
      return OnlineCustomTree;
    case SysCustomWidgetType.Text:
      return OnlineCustomText;
    case SysCustomWidgetType.Image:
      return OnlineCustomImage;
    default:
      console.warn('widget getComponent 未知类型');
      return 'div';
  }
});
const getLinkHerf = computed(() => {
  let temp = pps.widget.widgetType === SysCustomWidgetType.Link ? pps.widget.props.href : undefined;
  return temp;
});
const isDictWidget = computed(() => {
  return (
    [
      SysCustomWidgetType.Select,
      SysCustomWidgetType.CheckBox,
      SysCustomWidgetType.Radio,
      SysCustomWidgetType.Cascader,
      SysCustomWidgetType.Tree,
      SysCustomWidgetType.MobileCheckBoxFilter,
      SysCustomWidgetType.MobileRadioFilter,
    ].indexOf(pps.widget.widgetType) !== -1
  );
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bindValue = computed<string | number | boolean | any[] | ANY_OBJECT | Date | undefined>({
  get() {
    let tempValue = pps.value === undefined ? '' : pps.value;
    if (isDictWidget.value) tempValue = tempValue == null ? '' : tempValue + '';
    if (multiSelect.value && pps.value && typeof tempValue === 'string') {
      tempValue = tempValue.split(',');
      if (Array.isArray(tempValue)) {
        tempValue = tempValue.filter(item => {
          return item != null && item !== '';
        });
      }
    }
    if (pps.widget.widgetType === SysCustomWidgetType.CheckBox) {
      return tempValue || [];
    } else if (pps.widget.widgetType === SysCustomWidgetType.Cascader) {
      if (multiSelect.value) {
        // 多选
        if (Array.isArray(tempValue)) {
          return tempValue
            .map(item => {
              let temp = findTreeNodePath(dictDataList.value, item);
              if (Array.isArray(temp) && temp.length > 0) return temp;
              return null;
            })
            .filter(item => item != null);
        } else {
          let temp = findTreeNodePath(dictDataList.value, tempValue.toString());
          return temp || [];
        }
      } else {
        // 单选
        let temp = findTreeNodePath(dictDataList.value, tempValue.toString());
        return temp.length > 0 ? temp : tempValue;
      }
    } else if (pps.widget.widgetType === SysCustomWidgetType.NumberInput) {
      return tempValue as number;
    } else {
      return tempValue;
    }
  },
  set(val) {
    onValueInput(val as ANY_OBJECT | undefined);
  },
});
const isUploadImage = computed(() => {
  if (pps.widget.widgetType !== SysCustomWidgetType.Upload) return false;
  let column = pps.widget.bindData.column || pps.widget.column;
  return column ? column.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE : false;
});
const showRightIcon = computed(() => {
  return (
    [
      SysCustomWidgetType.Select,
      SysCustomWidgetType.Cascader,
      SysCustomWidgetType.Date,
      SysCustomWidgetType.UserSelect,
      SysCustomWidgetType.DeptSelect,
      SysCustomWidgetType.Calendar,
    ].indexOf(pps.widget.widgetType) !== -1
  );
});

const getWidgetProps = computed(() => {
  let props = {
    ...(pps.widget.props || {}),
  };
  // 日期组件，根据类型设置format
  if (
    pps.widget.widgetType === SysCustomWidgetType.Date ||
    pps.widget.widgetType === SysCustomWidgetType.DateRange
  ) {
    props['value-format'] = 'YYYY-MM-DD HH:mm:ss';
  }
  return {
    ...props,
    clearable: true,
    filterable: true,
    readOnly:
      pps.widget.widgetType === SysCustomWidgetType.Upload
        ? form().readOnly || props.readOnly
        : undefined,
    options:
      pps.widget.widgetType === SysCustomWidgetType.Cascader ? dictDataList.value : undefined,
    props:
      pps.widget.widgetType === SysCustomWidgetType.Cascader
        ? {
            label: 'name',
            value: 'id',
            multiple: multiSelect.value,
            checkStrictly: true,
          }
        : undefined,
    operationList: pps.widget.operationList,
    multiple: multiSelect.value,
    'collapse-tags': multiSelect.value,
    dataList: pps.widget.widgetType === SysCustomWidgetType.Tree ? dictDataList.value : undefined,
    dictDataList: isMobileFilter.value ? getAllDropdownData.value : undefined,
    href: getLinkHerf.value,
    widget: pps.widget,
  };
});

const getDisabledStatus = () => {
  const formWidgetAuth: ANY_OBJECT | null =
    form().formAuth && form().formAuth() && form().formAuth().pc
      ? form().formAuth().pc[pps.widget.variableName]
      : null;
  if (formWidgetAuth && formWidgetAuth.disabled) return true;
  return pps.widget.props.disabled;
};

const parseValue = (val: ValueType): ANY_OBJECT => {
  if (pps.widget.widgetType === SysCustomWidgetType.Cascader) {
    if (multiSelect.value && Array.isArray(val)) {
      return val
        .map((item: ANY_OBJECT) => {
          return item[item.length - 1];
        })
        .filter((item: ANY_OBJECT) => item != null);
    } else {
      return Array.isArray(val) ? val[val.length - 1] : undefined;
    }
  } else {
    return val as ANY_OBJECT;
  }
};
const onValueInput = (val: ANY_OBJECT | undefined) => {
  let tempValue: ValueType | undefined = undefined;
  if (val) {
    if (val instanceof InputEvent) {
      return;
    } else if (val instanceof Event) {
      if (val.target instanceof HTMLInputElement) {
        tempValue = val.target.value;
      }
    } else {
      tempValue = parseValue(val);
    }

    if (multiSelect.value && Array.isArray(tempValue) /*&& tempValue.length > 0*/) {
      tempValue = tempValue.join(',') + ',';
    }
  } else {
    tempValue = val;
  }
  emit('update:value', tempValue);
  emit('update:modelValue', tempValue);
  // ElDatePicker(DateRange)有了这个事件才能更新显示
  emit('input', tempValue);
};
const onValueChange = (
  val: ANY_OBJECT | undefined,
  selectRow: ANY_OBJECT | undefined = undefined,
) => {
  let tempVal: ValueType | undefined = undefined;
  let dictData = null;
  tempVal = parseValue(val);
  if (val != null) {
    if (multiSelect.value) {
      dictData = val
        .map((item: string) => {
          if (pps.widget.widgetType === SysCustomWidgetType.Cascader) {
            if (Array.isArray(item)) {
              item = item[item.length - 1];
            }
            return findTreeNode(dictDataList.value, item, 'id', 'children');
          } else {
            return findItemFromList(dictDataList.value, item, 'id');
          }
        })
        .filter((item: ANY_OBJECT) => item != null);
    } else {
      let id = val.toString();
      if (pps.widget.widgetType === SysCustomWidgetType.Cascader) {
        if (Array.isArray(val)) {
          val = val[val.length - 1];
        }
        dictData = findTreeNode(dictDataList.value, id, 'id', 'children');
      } else {
        dictData = findItemFromList(dictDataList.value, id, 'id');
      }
    }
  }
  emit('change', tempVal, {
    dictData: dictData,
    selectRow: selectRow,
  });
};

const loadDropdownData = () => {
  if (pps.widget == null || !isDictWidget.value) {
    return;
  }
  dictDataList.value = [];
  setTimeout(() => {
    let dictInfo = (pps.widget.props.dictInfo || {}).dict;
    if (dictInfo && form().getDictDataList) {
      let dictCall;
      if (form().pageCode != null) {
        // 报表字典
        dictCall = form().getDictDataList(dictInfo, form().getDropdownParams(pps.widget));
      } else {
        // 在线表单字典
        dictCall = form().getDictDataList(dictInfo, form().getDropdownParams(pps.widget));
      }
      dictCall
        .then((res: ANY_OBJECT[]) => {
          res.forEach((item: ANY_OBJECT) => {
            item.id = item.id + '';
            if (item.parentId) item.parentId = item.parentId + '';
          });
          // 级联组件将列表转换成树
          if (pps.widget.widgetType === SysCustomWidgetType.Cascader) {
            res = treeDataTranslate(res, 'id', 'parentId');
          }
          dictDataList.value = res;
        })
        .catch((e: Error) => {
          console.log(e);
        });
    }
  }, 30);
};

const getHtml = () => {
  const refs = (getCurrentInstance()?.refs || {}) as ANY_OBJECT;
  if (pps.widget.widgetType === SysCustomWidgetType.RichEditor) {
    return refs[pps.widget.variableName] ? refs[pps.widget.variableName].getHtml() : undefined;
  }
};
const reset = () => {
  onValueInput(undefined);
  onValueChange(undefined);
  nextTick(() => {
    loadDropdownData();
  });
};
const refresh = () => {
  const refs = (getCurrentInstance()?.refs || {}) as ANY_OBJECT;
  if (
    refs[pps.widget.variableName] &&
    typeof refs[pps.widget.variableName].refresh === 'function'
  ) {
    refs[pps.widget.variableName].refresh();
  }
};

defineExpose({
  getHtml,
  reset,
  refresh,
});

watch(
  () => pps.widget,
  () => {
    if (pps.widget) loadDropdownData();
  },
  {
    deep: true,
    immediate: true,
  },
);

// watch(
//   () => pps.widget.props.dictInfo,
//   () => {
//     if (pps.widget) loadDropdownData();
//   },
//   {
//     deep: true,
//     immediate: true,
//   },
// );
// 如果父组件为数据表格或者列表组件，那么子组件绑定表必须跟父组件一致
watch(
  () => parentWidget,
  (newValue, oldValue) => {
    const widget = { ...propsWidget.value };
    if (parentWidget != null && propsWidget.value) {
      // 如果绑定的数据表改变了，修改子组件绑定的数据表
      if (parentWidget.bindData.tableId !== propsWidget.value.bindData.tableId) {
        widget.props.bindData = {
          ...parentWidget.bindData,
        };
        widget.showName = undefined;
        if (widget.widgetType === SysCustomWidgetType.Text) {
          widget.props.text = '文本内容';
        }
      }
    } else {
      if (newValue == null && oldValue != null) {
        widget.bindData = {
          dataType: 0,
          tableId: undefined,
          table: undefined,
          columnId: undefined,
          column: undefined,
        };
      }
    }
    propsWidget.value = widget;
  },
  {
    deep: true,
    immediate: true,
  },
);

onMounted(() => {
  //propsWidget.value.widgetImpl = getCurrentInstance();
  //propsWidget.value.parent = parentWidget;
});
</script>

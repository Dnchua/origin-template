<template>
  <el-form
    ref="filterBox"
    :size="layoutStore.defaultFormItemSize"
    :model="formData"
    :label-width="(form().labelWidth || 100) + 'px'"
    :label-position="form().labelPosition"
    @submit.prevent
  >
    <Draggable
      class="online-filter-box custom-widget-item"
      draggable=".custom-widget-item"
      v-model="dataList"
      group="componentsGroup"
      style="position: relative; width: 100%"
      :style="{
        border: isEdit && !isAdvance ? '1px solid #e8eaec' : 'none',
        'min-height': isEdit && widgetList.length <= 0 ? '70px' : '0px',
      }"
      :disabled="!isEdit"
    >
      <template v-if="Array.isArray(widgetList) && widgetList.length > 0">
        <el-form-item
          v-for="(widget, index) in widgetList"
          :key="widget.variableName"
          v-show="form().getWidgetVisible(widget)"
          :prop="widget.propString"
          class="custom-widget-item widget-item"
          :class="{ active: isEdit && form().isActive(widget) }"
          :style="getItemStyle(index, widget)"
          @click.stop="onWidgetClick(widget)"
        >
          <template v-slot:label>
            <div>
              <span>{{ widget.showName }}</span>
              <ActiveWidgetMenu
                v-if="isEdit && form().isActive(widget)"
                :widget="widget"
                @copy="onCopyWidget"
                @delete="onDeleteWidget(widget)"
              />
            </div>
          </template>
          <OnlineCustomWidget
            :widget="widget"
            style="width: 100%"
            :ref="el => setWidgetRef(el, widget.variableName)"
            :value="getWidgetValue(widget)"
            @input="(val:ANY_OBJECT) => onValueChange(widget, val)"
            @change="(val, dictData) => onWidgetValueChange(widget, val, dictData)"
          />
        </el-form-item>
        <div style="padding-left: 16px; margin-bottom: 16px">
          <el-button
            class="search-btn"
            :size="layoutStore.defaultFormItemSize"
            @click="onSearch"
            :icon="Search"
            >查询</el-button
          >
          <el-button
            :size="layoutStore.defaultFormItemSize"
            v-show="Array.isArray(widgetList) && widgetList.length > 0"
            @click="onReset"
            style="width: 72px"
            >重置</el-button
          >
        </div>
      </template>
      <div
        v-if="isEdit && widgetList.length <= 0"
        class="info"
        :style="{ height: isAdvance ? '40px' : '60px' }"
      >
        <div>
          <el-icon><UploadFilled /></el-icon>
        </div>
        <span>请拖入组件进行编辑</span>
      </div>
    </Draggable>
  </el-form>
</template>

<script setup lang="ts">
import { Search, UploadFilled } from '@element-plus/icons-vue';
import { VueDraggable as Draggable } from 'vue-draggable-plus';
import { FormInstance } from 'element-plus';
import OnlineCustomWidget from '@/online/components/OnlineCustomWidget.vue';
import ActiveWidgetMenu from '@/online/components/ActiveWidgetMenu.vue';
import { ANY_OBJECT } from '@/types/generic';
//import { findItemFromList } from '@/common/utils';

const emit = defineEmits<{
  widgetClick: [ANY_OBJECT | null];
  'update:widgetList': [ANY_OBJECT[]];
  reset: [];
  search: [];
  copy: [ANY_OBJECT];
  delete: [ANY_OBJECT];
  operationClick: [ANY_OBJECT, ANY_OBJECT | null];
}>();

const props = withDefaults(
  defineProps<{
    formData: ANY_OBJECT;
    // 是否表单编辑模式
    isEdit?: boolean;
    // 是否左树右表查询
    isAdvance?: boolean;
    // 是否选中
    isActive?: boolean;
    itemWidth?: number;
    widgetList?: ANY_OBJECT[];
    operationList?: ANY_OBJECT[];
  }>(),
  {
    isEdit: false,
    isAdvance: false,
    isActive: false,
    itemWidth: 350,
    widgetList: () => [],
    operationList: () => [],
  },
);

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();
const form = inject('form', () => {
  console.error('OnlineFilterBox: form not injected');
  return { isEdit: false } as ANY_OBJECT;
});

const widgetRefs: ANY_OBJECT = {};
const setWidgetRef = (el: Element | ComponentPublicInstance | null, name: string) => {
  if (el) {
    if (!widgetRefs[name]) {
      widgetRefs[name] = [];
    }
    widgetRefs[name].push(el);
  }
};

const filterBox = ref<FormInstance>();
// 操作栏宽度

// 总宽度
const totalWidth = ref(0);

// 每行过滤组件数量

// 过滤组件间隔

// 不能直接修改props属性，需要通过事件进行更新
const dataList = computed({
  get: () => {
    return props.widgetList;
  },
  set: (val: ANY_OBJECT[]) => {
    // 更新数据，调用的地方必须使用v-model:widgetList的方式
    emit('update:widgetList', val);
  },
});

// 过滤组件数量

// 最后一行过滤组件数量
// const offsetCount = computed(() => {
//   if (showInOneLine.value) {
//     return widgetCount.value;
//   } else {
//     return widgetCount.value % lineCount.value;
//   }
// });
// 操作栏间隔
// const operatorGutter = computed(() => {
//   if (offsetCount.value <= 0) return totalWidth.value - operatorWidth.value;
//   let tempWidth =
//     totalWidth.value -
//     props.itemWidth * offsetCount.value -
//     itemGutter.value * (offsetCount.value - 1);
//   return tempWidth >= operatorWidth.value
//     ? tempWidth - operatorWidth.value
//     : totalWidth.value - operatorWidth.value;
// });

const onCopyWidget = (widget: ANY_OBJECT) => {
  emit('copy', widget);
};
const onDeleteWidget = (widget: ANY_OBJECT) => {
  emit('delete', widget);
};
const getWidgetValue = (widget: ANY_OBJECT) => {
  if (props.isEdit) return;
  return form().getWidgetValue(widget);
};
const onValueChange = (widget: ANY_OBJECT, value: ANY_OBJECT) => {
  if (props.isEdit) return;
  return form().onValueChange(widget, value);
};
const onWidgetValueChange = (widget: ANY_OBJECT, value: ANY_OBJECT, dictData: ANY_OBJECT) => {
  if (props.isEdit) return;
  return form().onWidgetValueChange(widget, value, dictData);
};
const onWidgetClick = (widget: ANY_OBJECT) => {
  emit('widgetClick', widget);
};
const getItemStyle = (index: number, widget: ANY_OBJECT) => {
  console.log('getItemStyle', index, widget);
  return {
    width: props.itemWidth + 'px',
  };
};
// const hasOperator = (type: ANY_OBJECT) => {
//   let temp = getOperation(type);
//   return temp && temp.enabled;
// };
// const getOperation = (type: ANY_OBJECT) => {
//   return findItemFromList(form().operationList, type, 'type');
// };
// const operationVisible = (type: ANY_OBJECT) => {
//   if (props.isAdvance) return false;
//   let operation = getOperation(type);
//   return !form().readOnly && hasOperator(type) && form().checkOperationVisible(operation);
// };
// const operationDisabled = (type: ANY_OBJECT) => {
//   let operation = getOperation(type);
//   return form().checkOperationDisabled(operation) || !form().checkOperationPermCode(operation);
// };
const onSearch = () => {
  emit('search');
};
const onReset = () => {
  filterBox.value?.resetFields();
  emit('reset');
};
// const onOperationClick = (operation: ANY_OBJECT) => {
//   emit('operationClick', operation);
// };
const resetWidget = (widget: ANY_OBJECT) => {
  if (widgetRefs[widget.variableName]) {
    widgetRefs[widget.variableName].forEach((ref: ANY_OBJECT) => {
      ref.reset();
    });
  }
};

defineExpose({
  resetWidget,
});

watch(
  () => props.widgetList,
  () => {
    nextTick(() => {
      //const instance = getCurrentInstance();
      // TODO optionBox从哪里来？
      //operatorWidth.value = instance?.refs.optionBox ? instance.refs.optionBox.offsetWidth : 0;
    });
  },
  {
    deep: true,
    immediate: true,
  },
);

onMounted(() => {
  console.log('form()', form());
  const instance = getCurrentInstance();
  // 监听组件大小变化
  const resizeObserver = new ResizeObserver(() => {
    console.log('refs >>>', instance?.refs);
    if (filterBox.value)
      totalWidth.value = filterBox.value.$el.offsetWidth - (props.isEdit ? 14 : 2);
    //operatorWidth.value = instance?.refs.optionBox ? instance.refs.optionBox.offsetWidth : 0;
  });
  console.log('####', filterBox.value?.$el);
  resizeObserver.observe(filterBox.value?.$el);
  //   setTimeout(() => {
  //     if (this.$refs.optionBox) resizeObserver.observe(this.$refs.optionBox.$el);
  //   }, 30);
});
</script>

<style lang="scss" scoped>
.online-filter-box {
  display: flex;
  padding: 16px 24px 0;
  background-color: white;
  flex-wrap: wrap;
  vertical-align: middle;
  .placeholder {
    flex: 1 0 330px;
  }
  .option-box {
    flex: 1 0 100%;
  }
}
.el-form-item {
  margin-bottom: 16px !important;
}
.online-filter-box :deep(.el-form-item--mini.el-form-item) {
  margin-bottom: 10px !important;
}
.info {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  text-align: center;
  color: #d9dbdd;
  vertical-align: middle;
}
.info div {
  width: 40px;
  height: 40px;
  font-size: 24px;
  text-align: center;
  border: 1px dashed #d9dbdd;
  border-radius: 6px;
  line-height: 40px;
}
.info span {
  margin-left: 10px;
  font-size: 16px;
}
.search-btn {
  color: $color-primary;
  border-color: $color-primary;
  &:hover {
    background-color: $color-primary-light-9;
  }
}
.filter-line {
  width: 150%;
  height: 16px;
  margin: 0 -24px;
  background-color: rgb(245 248 249);
}
.option-box {
  img {
    cursor: pointer;
    margin-left: 8px;
  }
}
</style>

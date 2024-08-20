import { ElMessageBox } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import { WidgetProps, WidgetEmit } from '../types/widget';

export const useWidget = (props: WidgetProps, emit: WidgetEmit) => {
  const propsWidget = computed<ANY_OBJECT>({
    get() {
      return props.widget;
    },
    set(value: ANY_OBJECT) {
      console.log('widget change', value);
      emit('update:widget', value);
    },
  });
  const childWidgetList = computed<ANY_OBJECT[]>({
    get() {
      return props.widget.childWidgetList || [];
    },
    set(values: ANY_OBJECT[]) {
      console.log('childWidgetList change', values);
      const widget = props.widget;
      widget.childWidgetList = values;
      emit('update:widget', widget);
    },
  });

  const onWidgetClick = (widget: ANY_OBJECT | null = null) => {
    emit('widgetClick', widget);
  };

  const onDeleteWidget = (widget: ANY_OBJECT) => {
    ElMessageBox.confirm('是否删除此组件？', '', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        childWidgetList.value = childWidgetList.value.filter((item: ANY_OBJECT) => item !== widget);
        onWidgetClick(null);
      })
      .catch(e => {
        console.warn(e);
      });
  };

  const onCopyWidget = (widget: ANY_OBJECT) => {
    const childWidgetList = props.widget.childWidgetList;
    childWidgetList.push(widget);
  };

  return { propsWidget, childWidgetList, onWidgetClick, onDeleteWidget, onCopyWidget };
};

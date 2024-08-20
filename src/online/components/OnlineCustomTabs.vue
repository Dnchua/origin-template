<template>
  <div
    class="table-draggable"
    :style="{
      'margin-bottom':
        (widget.props.paddingBottom || (widget.props.basicInfo || {}).paddingBottom || 0) + 'px',
    }"
  >
    <el-tabs v-if="childWidgetList.length > 0" v-model="activePanel" :type="widget.props.type">
      <el-tab-pane
        v-for="subWidget in childWidgetList"
        :key="subWidget.variableName"
        :label="subWidget.showName"
        :name="subWidget.variableName"
        :lazy="true"
      >
        <OnlineCustomBlock
          v-model:value="subWidget.childWidgetList"
          :isEdit="isEdit"
          @widgetClick="onWidgetClick"
        />
      </el-tab-pane>
    </el-tabs>
    <div
      v-if="isEdit && (widget.childWidgetList || []).length <= 0"
      class="info"
      style="border: 1px solid #e8eaec"
    >
      <div style="width: 100px; height: 100px">
        <el-icon><UploadFilled /></el-icon>
      </div>
      <span>请添加标签页</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import OnlineCustomBlock from '@/online/components/OnlineCustomBlock.vue';
import { WidgetProps, WidgetEmit } from './types/widget';
import { useWidget } from './hooks/widget';

const emit = defineEmits<WidgetEmit>();
const props = withDefaults(defineProps<WidgetProps>(), { isEdit: false });
const activePanel = ref();

// const form = inject('form', () => {
//   return { isEdit: false } as ANY_OBJECT;
// });

const { childWidgetList, onWidgetClick } = useWidget(props, emit);

// TODO 监听到变化之后，行为是否妥当
watch(
  () => props.widget.childWidgetList,
  () => {
    if (Array.isArray(props.widget.childWidgetList) && props.widget.childWidgetList.length > 0) {
      activePanel.value = props.widget.childWidgetList[0].variableName;
    }
  },
  {
    // 不能使用深度监听，否则会导致组件属性变化之后，tabs会重置选中状态
    //deep: true,
    immediate: true,
  },
);
</script>

<style scoped>
.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 20px;
  text-align: center;
  vertical-align: middle;
  color: #999;
}
.info div {
  width: 80px;
  height: 80px;
  font-size: 60px;
  text-align: center;
  border: 1px dashed #d9dbdd;
  border-radius: 6px;
  line-height: 100px;
}
.info span {
  margin-top: 10px;
  font-size: 16px;
}
</style>

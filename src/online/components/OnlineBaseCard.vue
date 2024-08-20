<template>
  <el-card
    class="online-base-card form-card base-card"
    :shadow="widget.props.shadow"
    :body-style="{
      padding: (widget.props.padding == null ? 15 : widget.props.padding) + 'px',
    }"
    :style="{
      'margin-bottom':
        (widget.props.paddingBottom || (widget.props.basicInfo || {}).paddingBottom || 0) + 'px',
    }"
  >
    <template v-slot:header>
      <div class="base-card-header table-draggable">
        <span>{{ widget.showName }}</span>
        <div class="base-card-operation"></div>
      </div>
    </template>
    <el-row>
      <el-col :span="24">
        <el-row :gutter="form().gutter">
          <VueDraggable
            draggable=".custom-widget-item"
            v-model="childWidgetList"
            group="componentsGroup"
            :style="getDrableBoxStyle"
            style="position: relative; overflow: hidden; width: 100%"
            :disabled="!isEdit"
            :move="onDragMove"
          >
            <template v-if="childWidgetList.length > 0">
              <el-col
                class="custom-widget-item"
                :class="{ active: isEdit && form().isActive(subWidget) }"
                v-for="subWidget in childWidgetList"
                :key="subWidget.variableName"
                :span="subWidget.props.span"
              >
                <div
                  class="widget-item"
                  :class="{ active: isEdit && form().isActive(subWidget) }"
                  v-if="form().getWidgetVisible(subWidget)"
                >
                  <div
                    v-if="subWidget.widgetType === SysCustomWidgetType.Table"
                    :style="getTableStyle(subWidget)"
                    style="margin-bottom: 18px"
                  >
                    <OnlineCardTable
                      :widget="subWidget"
                      :value="form().getTableData(subWidget)"
                      @input="(dataList:ANY_OBJECT[]) => form().setTableData(subWidget, dataList)"
                      @click.stop="onWidgetClick(subWidget)"
                    />
                  </div>
                  <div
                    v-else-if="subWidget.widgetType === SysCustomWidgetType.Block"
                    :style="getBlockStyle(subWidget)"
                    @click.stop="onWidgetClick(subWidget)"
                  >
                    <OnlineCustomBlock
                      v-model:value="subWidget.childWidgetList"
                      :isEdit="isEdit"
                      @widgetClick="onWidgetClick"
                    />
                  </div>
                  <div
                    v-else-if="subWidget.widgetType === SysCustomWidgetType.Card"
                    @click.stop="onWidgetClick(subWidget)"
                  >
                    <OnlineBaseCard
                      :widget="subWidget"
                      :isEdit="isEdit"
                      @widgetClick="onWidgetClick"
                    />
                  </div>
                  <div
                    v-else-if="subWidget.widgetType === SysCustomWidgetType.Tabs"
                    @click.stop="onWidgetClick(subWidget)"
                  >
                    <OnlineCustomTabs
                      :widget="subWidget"
                      :isEdit="isEdit"
                      @widgetClick="onWidgetClick"
                    />
                  </div>
                  <div
                    v-else-if="subWidget.widgetType === SysCustomWidgetType.Text"
                    @click.stop="onWidgetClick(subWidget)"
                  >
                    <OnlineCustomWidget
                      :ref="subWidget.variableName"
                      :widget="subWidget"
                      :isEdit="isEdit"
                      :value="getWidgetValue(subWidget) || subWidget.props.text"
                      :style="{
                        'margin-bottom': (subWidget.props.paddingBottom || 0) + 'px',
                      }"
                      @widgetClick="onWidgetClick"
                    />
                  </div>
                  <div
                    v-else-if="subWidget.widgetType === SysCustomWidgetType.Image"
                    @click.stop="onWidgetClick(subWidget)"
                  >
                    <OnlineCustomWidget
                      :ref="subWidget.variableName"
                      :widget="subWidget"
                      :isEdit="isEdit"
                      :value="getWidgetValue(subWidget)"
                      :src="subWidget.props.src"
                      :style="{
                        'margin-bottom': (subWidget.props.paddingBottom || 0) + 'px',
                      }"
                      @widgetClick="onWidgetClick"
                    />
                  </div>
                  <el-form-item
                    v-else
                    :label="subWidget.showName"
                    :prop="subWidget.propString"
                    @click.stop="onWidgetClick(subWidget)"
                  >
                    <OnlineCustomWidget
                      :widget="subWidget"
                      :value="getWidgetValue(subWidget)"
                      @input="(val:ANY_OBJECT) => onValueChange(subWidget, val)"
                      @change="(val:ANY_OBJECT|null, dictData:ANY_OBJECT|null) => onWidgetValueChange(subWidget, val, dictData)"
                    />
                  </el-form-item>
                  <ActiveWidgetMenu
                    v-if="isEdit && form().isActive(subWidget)"
                    :widget="subWidget"
                    :clone="form().cloneWidget"
                    @copy="onCopyWidget"
                    @delete="onDeleteWidget(subWidget)"
                  />
                </div>
              </el-col>
            </template>
            <div v-else-if="isEdit" class="info">
              <div style="width: 100px; height: 100px">
                <el-icon><UploadFilled /></el-icon>
              </div>
              <span>请拖入组件进行编辑</span>
            </div>
          </VueDraggable>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>

<script lang="ts">
export default {
  name: 'OnlineBaseCard',
};
</script>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { VueDraggable } from 'vue-draggable-plus';
import { ANY_OBJECT } from '@/types/generic';
import { SysCustomWidgetType } from '@/common/staticDict';
import OnlineCustomBlock from '@/online/components/OnlineCustomBlock.vue';
import OnlineCardTable from './OnlineCardTable.vue';
import OnlineCustomWidget from './OnlineCustomWidget.vue';
import ActiveWidgetMenu from './ActiveWidgetMenu.vue';
import { WidgetProps, WidgetEmit } from './types/widget';
import { useWidget } from './hooks/widget';
import OnlineCustomTabs from './OnlineCustomTabs.vue';

const emit = defineEmits<WidgetEmit>();

interface CardProps extends WidgetProps {
  // 是否显示边框
  showBorder?: boolean;
  height?: string;
}
const props = withDefaults(defineProps<CardProps>(), {
  value: () => [],
  isEdit: false,
  showBorder: true,
});
const form = inject('form', () => {
  console.error('OnlineCustomBaseCard: form not injected');
  return { isEdit: false } as ANY_OBJECT;
});

const { childWidgetList, onWidgetClick, onDeleteWidget, onCopyWidget } = useWidget(props, emit);

const getDrableBoxStyle = computed(() => {
  let tempHeight = props.height;
  if (props.height == null || props.height === '') {
    tempHeight = props.isEdit && props.widget.childWidgetList.length <= 0 ? '150px' : '0px';
  }
  return {
    'min-height': tempHeight,
  };
});

const getTableStyle = (widget: ANY_OBJECT) => {
  if (widget.widgetType !== SysCustomWidgetType.Table) return;
  return {};
};
const getBlockStyle = (widget: ANY_OBJECT) => {
  return {
    'margin-bottom': (widget.props.paddingBottom || 0) + 'px',
    padding: props.isEdit ? '5px' : undefined,
    border: props.isEdit ? '1px solid #e8eaec' : undefined,
  };
};

const getWidgetValue = (widget: ANY_OBJECT) => {
  return form().getWidgetValue(widget);
};

const onDragMove = (e: ANY_OBJECT) => {
  // 容器组件不能改变位置
  let widgetType = e.relatedContext.element ? e.relatedContext.element.widgetType : undefined;
  return widgetType !== SysCustomWidgetType.Block && widgetType !== SysCustomWidgetType.Card;
};

const onValueChange = (widget: ANY_OBJECT, value: ANY_OBJECT) => {
  return form().onValueChange(widget, value);
};
const onWidgetValueChange = (
  widget: ANY_OBJECT,
  value: ANY_OBJECT | null,
  dictData: ANY_OBJECT | null,
) => {
  return form().onWidgetValueChange(widget, value, dictData);
};
</script>

<style scoped>
.info {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  text-align: center;
  color: #999;
  flex-direction: column;
  vertical-align: middle;
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

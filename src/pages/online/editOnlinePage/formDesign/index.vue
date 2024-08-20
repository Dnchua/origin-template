<template>
  <div class="form-design" @drop.prevent.stop>
    <!-- LEFT MENU BEGIN -->
    <div class="left-menu">
      <div
        class="left-menu-item"
        :class="{ active: activeLeftMenu === 'form' }"
        @click="activeLeftMenu = 'form'"
      >
        <div class="img-box">
          <img
            v-if="activeLeftMenu === 'form'"
            src="@/assets/img/document-active.png"
            alt=""
            style="width: 20px"
          />
          <img v-else src="@/assets/img/document.png" alt="" style="width: 20px" />
        </div>
        <span style="margin-top: 4px">表单</span>
      </div>
      <div
        class="left-menu-item"
        :class="{ active: activeLeftMenu === 'data' }"
        style="margin-top: 40px"
        @click="activeLeftMenu = 'data'"
      >
        <div class="img-box">
          <img
            v-if="activeLeftMenu === 'data'"
            src="@/assets/img/datasource-active.png"
            alt=""
            style="width: 20px"
          />
          <img v-else src="@/assets/img/datasource.png" alt="" style="width: 20px" />
        </div>
        <span style="margin-top: 4px">数据</span>
      </div>
    </div>
    <!-- LEFT MENU END -->
    <!-- LEFT PANEL BEGIN -->
    <div class="left-panel">
      <template v-if="activeLeftMenu === 'form'">
        <!-- 表单管理 -->
        <el-card
          class="form-card base-card"
          shadow="never"
          :body-style="{ padding: '0px' }"
          style="border: none"
        >
          <template v-slot:header>
            <div class="base-card-header">
              <i class="online-icon">
                <span>表单</span>
              </i>
              <div class="base-card-operation">
                <el-input
                  class="round-search"
                  :prefix-icon="Search"
                  v-model="filter.formName"
                  clearable
                  placeholder="表单名称查询"
                  style="width: 140px; margin-right: 10px"
                />
                <el-button
                  link
                  :icon="Plus"
                  style="font-size: 18px; color: #999"
                  @click.stop="onCreateNewForm"
                />
              </div>
            </div>
          </template>
          <el-row style="height: calc(100% - 65px)">
            <el-scrollbar style="width: 100%; height: 100%">
              <el-col :span="24" style="padding: 0 16px">
                <el-row
                  v-for="form in validFormList"
                  :key="form.formId"
                  :class="{ active: form.formId === currentFormId }"
                  class="form-item"
                  type="flex"
                  align="middle"
                  justify="space-between"
                >
                  <el-row
                    class="form-item-title"
                    type="flex"
                    align="middle"
                    @click.stop="currentFormId = form.formId"
                  >
                    <span>{{ form.formName }}</span>
                    <div class="tag">
                      {{ SysOnlineFormType.getValue(form.formType) }}
                    </div>
                  </el-row>
                  <el-dropdown @command="cmd => handleFormCommand(form, cmd)">
                    <el-button class="font-item-menu" link size="default" style="padding: 0"
                      ><img
                        class="font-item-menu"
                        src="@/assets/img/more.png"
                        alt=""
                        style="width: 16px; height: 16px; vertical-align: middle"
                    /></el-button>
                    <template v-slot:dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="copy">复制</el-dropdown-item>
                        <el-dropdown-item command="delete">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </el-row>
              </el-col>
            </el-scrollbar>
          </el-row>
        </el-card>
        <!-- 组件拖拽区域 -->
        <el-card
          class="base-card"
          shadow="never"
          :body-style="{ padding: '0px' }"
          style="margin-top: 10px; border: none; flex-grow: 1"
        >
          <template v-slot:header>
            <div class="base-card-header">
              <i class="online-icon">
                <span>组件</span>
              </i>
              <div class="base-card-operation">
                <el-input
                  class="round-search"
                  :prefix-icon="Search"
                  v-model="filter.widgetName"
                  clearable
                  placeholder="组件名称查询"
                  style="width: 140px"
                />
              </div>
            </div>
          </template>
          <el-row style="height: calc(100% - 65px)">
            <el-scrollbar style="width: 100%; height: 100%">
              <el-col :span="24" style="padding: 0 16px">
                <div class="widget-group" v-for="group in formValidWidgetGroup" :key="group.id">
                  <div class="group-title">{{ group.groupName }}</div>
                  <VueDraggable
                    class="group-widget-list"
                    v-model="group.widgetList"
                    :group="{
                      name: 'componentsGroup',
                      pull: 'clone',
                      put: false,
                    }"
                    :clone="cloneWidget"
                    :sort="false"
                  >
                    <div
                      class="group-widget-item"
                      v-for="widget in group.widgetList"
                      :key="widget.id"
                      @click="onAddWidget(widget)"
                    >
                      <div class="icon" :title="SysCustomWidgetType.getValue(widget.widgetType)">
                        <i class="" :class="widget.icon || ''" />
                      </div>
                      <div class="name">
                        {{ SysCustomWidgetType.getValue(widget.widgetType) }}
                      </div>
                    </div>
                    <div style="width: 64px" />
                  </VueDraggable>
                </div>
              </el-col>
            </el-scrollbar>
          </el-row>
        </el-card>
      </template>
      <template v-else>
        <!-- 数据模型 -->
        <el-card
          class="data-card base-card"
          shadow="never"
          :body-style="{ padding: '0px' }"
          style="border: none; flex-grow: 1"
        >
          <template v-slot:header>
            <div class="base-card-header">
              <i class="online-icon">
                <span>数据</span>
              </i>
              <div class="base-card-operation">
                <el-input
                  class="round-search"
                  :prefix-icon="Search"
                  v-model="filter.fieldName"
                  clearable
                  placeholder="字段名称查询"
                  size="default"
                  style="width: 140px"
                />
              </div>
            </div>
          </template>
          <el-row style="height: calc(100% - 65px)">
            <el-scrollbar style="width: 100%; height: 100%">
              <el-collapse v-model="activeDataTable" :accordion="true">
                <el-collapse-item
                  v-for="table in validTableList"
                  :key="table.id"
                  :title="table.tableName"
                  :name="table.id"
                >
                  <template v-slot:title>
                    <el-row class="data-column-title" type="flex" align="middle">
                      <span>{{ table.tableName }}</span>
                      <el-tag
                        :type="getRelationType(table.relationType)"
                        size="default"
                        style="margin-top: 5px"
                      >
                        {{ SysOnlineRelationType.getValue(table.relationType) || '数据主表' }}
                      </el-tag>
                    </el-row>
                  </template>
                  <el-row
                    class="table-column-item"
                    v-for="column in table.columnList"
                    :key="column.columnId"
                    type="flex"
                    justify="space-between"
                    align="middle"
                  >
                    <el-link
                      :disabled="column.aggregationColumn"
                      style="max-width: 130px"
                      @click="onEditTableColumn(table, column)"
                    >
                      {{ column.columnName }}
                    </el-link>
                    <div>
                      <i
                        class="flag online-icon icon-filter"
                        :class="{
                          active: column.filterType !== SysOnlineColumnFilterType.NONE,
                        }"
                        :title="SysOnlineColumnFilterType.getValue(column.filterType)"
                      />
                      <i
                        class="flag online-icon icon-relation"
                        style="margin-left: 5px"
                        :class="{ active: column.dictId != null }"
                        :title="getDictName(column.dictId)"
                      />
                    </div>
                  </el-row>
                </el-collapse-item>
              </el-collapse>
            </el-scrollbar>
          </el-row>
        </el-card>
      </template>
    </div>
    <!-- LEFT PANEL END -->
    <!-- DESIGN PANEL BEGIN -->
    <div class="design-panel">
      <el-row type="flex" justify="space-between" align="middle" style="height: 48px">
        <div style="font-size: 18px">
          <i
            class="device-item online-icon icon-pc"
            :class="{ active: activeMode === 'pc' }"
            title="PC 端"
            @click="onActiveModeChange('pc')"
          />
        </div>
        <el-button
          link
          size="default"
          :icon="Refresh"
          style="font-size: 12px; color: #999; font-weight: normal"
          @click="onClearWidget"
          >重置表单</el-button
        >
      </el-row>
      <div class="design-box" :key="currentFormId">
        <div style="max-width: 100%" :style="getDesignBoxStyle" @click="onFormClick">
          <!-- 基础查询页面 -->
          <OnlineQueryForm
            v-if="(currentForm || {}).formType === SysOnlineFormType.QUERY && activeMode === 'pc'"
            height="100%"
            :isEdit="true"
            :mode="activeMode"
            :formConfig="(currentForm || {})[activeMode]"
            :currentWidget="currentWidget"
            @tableClick="onWidgetClick"
            @widgetClick="onWidgetClick"
          />
          <!-- 左树右表页面 -->
          <OnlineAdvanceQueryForm
            v-if="(currentForm || {}).formType === SysOnlineFormType.ADVANCE_QUERY"
            height="100%"
            :isEdit="true"
            :mode="activeMode"
            :formConfig="(currentForm || {})[activeMode]"
            :currentWidget="currentWidget"
            @tableClick="onWidgetClick"
            @widgetClick="onWidgetClick"
          />
          <!-- 一对一查询页面 -->
          <OnlineOneToOneQueryForm
            v-if="
              (currentForm || {}).formType === SysOnlineFormType.ONE_TO_ONE_QUERY &&
              activeMode === 'pc'
            "
            height="100%"
            :isEdit="true"
            :mode="activeMode"
            :formConfig="(currentForm || {})[activeMode]"
            :currentWidget="currentWidget"
            @tableClick="onWidgetClick"
            @widgetClick="onWidgetClick"
          />
          <!-- 编辑表单 -->
          <OnlineEditForm
            v-if="(currentForm || {}).formType === SysOnlineFormType.FORM"
            :height="getClientHeight - 235 + 'px'"
            :isEdit="true"
            :mode="activeMode"
            :formConfig="(currentForm || {})[activeMode]"
            :currentWidget="currentWidget"
            @widgetClick="onWidgetClick"
          />
          <!-- 流程表单 -->
          <OnlineWorkFlowForm
            v-if="(currentForm || {}).formType === SysOnlineFormType.FLOW"
            :height="getClientHeight - 235 + 'px'"
            :isEdit="true"
            :mode="activeMode"
            :formConfig="(currentForm || {})[activeMode]"
            :currentWidget="currentWidget"
            @widgetClick="onWidgetClick"
          />
          <!-- 工单列表页面 -->
          <OnlineWorkOrderForm
            v-if="
              (currentForm || {}).formType === SysOnlineFormType.WORK_ORDER && activeMode === 'pc'
            "
            height="100%"
            :isEdit="true"
            :mode="activeMode"
            :formConfig="(currentForm || {})[activeMode]"
            :currentWidget="currentWidget"
            @tableClick="onWidgetClick"
          />
        </div>
      </div>
    </div>
    <!-- DESIGN PANEL END -->
    <!-- ATTRIBUTE PANEL BEGIN -->
    <div class="attribute-panel">
      <el-tabs v-model="rightActive">
        <el-tab-pane label="属性" name="props">
          <template v-slot:label>
            <span>属性</span>
          </template>
          <el-scrollbar :style="{ height: getClientHeight - 138 + 'px' }">
            <el-row style="padding: 10px 16px">
              <template v-if="currentWidget != null">
                <CustomWidgetBindData v-model:value="currentWidget" />
                <CustomWidgetAttributeSetting
                  class="attribute-setting"
                  v-model:value="currentWidget.props"
                  :widget="currentWidget"
                  :allFormList="allFormList"
                />
              </template>
              <CustomFormSetting v-else-if="currentForm != null && currentForm[activeMode]" />
            </el-row>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="操作" name="operate" v-if="showOperationTab">
          <template v-slot:label>
            <span>操作</span>
          </template>
          <el-scrollbar :style="{ height: getClientHeight - 138 + 'px' }">
            <el-row style="width: 100%; padding: 10px 16px">
              <!-- 组件操作 -->
              <CustomFormOperateSetting
                v-if="
                  currentWidget != null &&
                  (currentForm || {}).formType !== SysOnlineFormType.QUERY &&
                  (currentForm || {}).formType !== SysOnlineFormType.ADVANCE_QUERY
                "
                :formList="allFormList"
                :tableList="getValidTableList"
                v-model:value="currentWidget.operationList"
              />
              <!-- 表单操作 -->
              <CustomFormOperateSetting
                v-if="
                  currentForm != null &&
                  (currentWidget == null ||
                    currentForm.formType === SysOnlineFormType.QUERY ||
                    currentForm.formType === SysOnlineFormType.ADVANCE_QUERY)
                "
                :formList="allFormList"
                :tableList="getValidTableList"
                v-model:value="currentForm[activeMode].operationList"
              />
            </el-row>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- ATTRIBUTE PANEL END -->
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import { ElMessageBox } from 'element-plus';
import { useCommon } from '@/common/hooks/useCommon';
import { SysOnlineFormType, SysCustomWidgetType } from '@/common/staticDict/index';
import { SysOnlineColumnFilterType, SysOnlineRelationType } from '@/common/staticDict/online';
const { Plus, Search, Refresh } = useCommon();
import { findItemFromList } from '@/common/utils';
import { ANY_OBJECT } from '@/types/generic';
import { Dialog } from '@/components/Dialog';
import { ColumnInfo } from '@/types/online/column';
import { OnlineColumnController } from '@/api/online';
import { useFormConfig } from '@/pages/online/hooks/useFormConfig';
import widgetData from '@/online/config/index';
import { useLayoutStore } from '@/store';
import OnlineQueryForm from '../../OnlinePageRender/OnlineQueryForm/index.vue';
import OnlineOneToOneQueryForm from '../../OnlinePageRender/OnlineOneToOneForm/index.vue';
import OnlineAdvanceQueryForm from '../../OnlinePageRender/OnlineAdvanceQueryForm/index.vue';
import OnlineEditForm from '../../OnlinePageRender/OnlineEditForm/index.vue';
import OnlineWorkFlowForm from '../../OnlinePageRender/OnlineWorkFlowForm/index.vue';
import OnlineWorkOrderForm from '../../OnlinePageRender/OnlineWorkOrderForm/index.vue';
import EditTableColumn from './editTableColumn.vue';
import CustomFormSetting from './components/CustomFormSetting.vue';
import CustomFormOperateSetting from './components/CustomFormOperateSetting.vue';
import CustomWidgetBindData from './components/CustomWidgetBindData.vue';
import CustomWidgetAttributeSetting from './components/CustomWidgetAttributeSetting.vue';

const { getFormConfig } = useFormConfig();

const emit = defineEmits<{
  createForm: [];
  updateForm: [ANY_OBJECT | undefined | null];
  cloneForm: [ANY_OBJECT];
  deleteForm: [ANY_OBJECT];
}>();
const layoutStore = useLayoutStore();

const props = withDefaults(
  defineProps<{
    pageType: number;
    allFormList?: Array<ANY_OBJECT>;
    tableList?: Array<ANY_OBJECT>;
    dictList?: Array<ANY_OBJECT>;
    height: ANY_OBJECT;
  }>(),
  {
    allFormList: () => [],
    tableList: () => [],
    dictList: () => [],
  },
);
const getClientHeight = computed(() => {
  return props.height.value;
});

// LEFT
//  == 表单 ==
const activeLeftMenu = ref('form');
const filter = ref({
  formName: undefined,
  widgetName: undefined,
  fieldName: undefined,
});
const currentFormId = ref('');
const currentWidget = ref<ANY_OBJECT | null>(null);
const rightActive = ref('props');

const validFormList = computed(() => {
  return props.allFormList.filter(form => {
    return !filter.value.formName || form.formName.indexOf(filter.value.formName) >= 0;
  });
});

const activeMode = ref('pc');
const widgetGroup = computed(() => {
  return widgetData.formWidgetGroupList;
});
const currentForm = computed(() => {
  return findItemFromList(props.allFormList, currentFormId.value, 'formId');
});
const formValidWidgetGroup = computed(() => {
  let tempGroupList = JSON.parse(JSON.stringify(widgetGroup.value[activeMode.value] || []));
  let tempList = (tempGroupList || []).filter((group: ANY_OBJECT) => {
    if (currentForm.value == null) return true;
    if (
      currentForm.value?.formType === SysOnlineFormType.QUERY ||
      currentForm.value?.formType === SysOnlineFormType.ADVANCE_QUERY ||
      currentForm.value?.formType === SysOnlineFormType.ONE_TO_ONE_QUERY
    ) {
      if (group.id === 'base') {
        // 查询页面过滤掉列表组件
        group.widgetList = group.widgetList.filter((widget: ANY_OBJECT) => {
          return widget.widgetType !== SysCustomWidgetType.List;
        });
      }
      return group.id === 'filter';
    } else {
      return group.id !== 'filter';
    }
  });

  return tempList.map((item: ANY_OBJECT) => {
    return {
      ...item,
      widgetList: item.widgetList.filter((widget: ANY_OBJECT) => {
        if (currentForm.value == null) return true;
        // 查询过滤
        let isMatch = true;
        if (filter.value.widgetName) {
          isMatch =
            SysCustomWidgetType.getValue(widget.widgetType).indexOf(filter.value.widgetName) !== -1;
        }
        return isMatch;
      }),
    };
  });
});

const cloneWidget = (widget: ANY_OBJECT) => {
  let temp = widgetData.getWidgetObject(widget);
  temp['relation'] = undefined;
  temp['datasource'] = undefined;
  temp['column'] = undefined;
  return temp;
};
const onAddWidget = (widget: ANY_OBJECT) => {
  console.log('add widget', widget);
  if (
    currentWidget.value != null &&
    (currentWidget.value.widgetType === SysCustomWidgetType.Block ||
      currentWidget.value.widgetType === SysCustomWidgetType.Card)
  ) {
    currentWidget.value.childWidgetList.push(cloneWidget(widget));
  } else {
    if (currentForm.value && currentForm.value[activeMode.value]) {
      currentForm.value[activeMode.value].widgetList.push(cloneWidget(widget));
    }
  }
};

//  == 数据 ==
const activeDataTable = ref('');
const getAllTableList = computed<ANY_OBJECT[]>(() => {
  return (props.tableList || []).map(item => {
    return {
      ...item,
      showName: item.tag.variableName,
      isTable: true,
      children: item.columnList.map((column: ANY_OBJECT) => {
        return {
          ...column,
          id: column.columnId,
          showName: column.objectFieldName,
        };
      }),
    };
  });
});
const validTableList = computed<ANY_OBJECT[]>(() => {
  return getAllTableList.value.map((table: ANY_OBJECT) => {
    return {
      ...table,
      columnList: table.columnList.filter((column: ANY_OBJECT) => {
        return !filter.value.fieldName || column.columnName.indexOf(filter.value.fieldName) !== -1;
      }),
    };
  });
});
const getRelationType = (relationType: number) => {
  switch (relationType) {
    case SysOnlineRelationType.ONE_TO_ONE:
      return '';
    case SysOnlineRelationType.ONE_TO_MANY:
      return 'warning';
    default:
      return 'success';
  }
};
const getMasterTable = computed(() => {
  if (currentForm.value != null) {
    return findItemFromList(getAllTableList.value, currentForm.value?.masterTableId, 'tableId');
  } else {
    return null;
  }
});
const formatColumnRelationFlag = (table: ANY_OBJECT) => {
  // 所有关联从表
  let relationTableList = getAllTableList.value.filter((table: ANY_OBJECT) => {
    return table.relationType != null;
  });

  if (Array.isArray(table.columnList)) {
    table.columnList.forEach(column => {
      column.oneToOnyRelationColumn = false;
      column.oneToManyRelationColumn = false;
      // 主表字段判断这个字段是否和从表关联
      if (table.relationType == null) {
        relationTableList.forEach((relationTable: ANY_OBJECT) => {
          let relation = relationTable.tag;
          if (relation && relation.masterColumnId === column.columnId) {
            column.oneToOnyRelationColumn =
              column.oneToOnyRelationColumn ||
              relation.relationType === SysOnlineRelationType.ONE_TO_ONE;
            column.oneToManyRelationColumn =
              column.oneToManyRelationColumn ||
              relation.relationType === SysOnlineRelationType.ONE_TO_MANY;
          }
        });
      }
    });
  }
};
const refreshColumn = (table: ANY_OBJECT, column: ColumnInfo) => {
  console.log('table', table, 'column', column);
  let params = {
    onlineColumnDtoFilter: {
      tableId: column.tableId,
    },
  };
  OnlineColumnController.list(params)
    .then(res => {
      let columnList = res.data.dataList.map(item => {
        return {
          ...item,
          required: !item.nullable,
          uploadFileSystemType: item.uploadFileSystemType || 0,
        };
      });
      let temp = findItemFromList(getAllTableList.value, table.id, 'id');
      if (temp) {
        temp.columnList = columnList;
        formatColumnRelationFlag(temp);
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
const onEditTableColumn = (table: ANY_OBJECT, column: ColumnInfo) => {
  Dialog.show(
    '编辑字段',
    EditTableColumn,
    {
      area: ['650px'],
    },
    {
      rowData: column,
      dictList: props.dictList,
      isMasterTable: getMasterTable.value?.relation == null,
      path: 'thirdEditTableColumn',
    },
    {
      width: '650px',
      height: '600px',
      pathName: '/thirdParty/thirdEditTableColumn',
    },
  )
    .then(() => {
      refreshColumn(table, column);
    })
    .catch(e => {
      console.log(e);
    });
};
const getDictInfo = (dictId: string) => {
  return findItemFromList(props.dictList, dictId, 'dictId');
};
const getDictName = (dictId: string) => {
  let dictInfo = getDictInfo(dictId);
  return dictInfo ? dictInfo.dictName : '未绑定字典';
};

// DESIGN
const onActiveModeChange = (mode: string) => {
  if (mode !== 'pc' && currentForm.value?.formType === SysOnlineFormType.ADVANCE_QUERY) {
    // 移动端不支持左树右表类型页面
    return;
  }
  activeMode.value = mode;
  refreshFormInfo();
};
const refreshFormInfo = () => {
  currentWidget.value = null;
  if (currentForm.value) {
    if (currentForm.value?.formType === SysOnlineFormType.ADVANCE_QUERY) activeMode.value = 'pc';
    if (activeMode.value && Array.isArray(currentForm.value[activeMode.value].widgetList)) {
      if (currentForm.value[activeMode.value].tableWidget) {
        formatWidget(currentForm.value[activeMode.value].tableWidget);
        currentForm.value[activeMode.value].tableWidget['supportOperation'] = true;
      }
      if (currentForm.value[activeMode.value].leftWidget)
        formatWidget(currentForm.value[activeMode.value].leftWidget);
      currentForm.value[activeMode.value].widgetList.forEach((widget: ANY_OBJECT) => {
        formatWidget(widget);
      });
    }
  }
};
const formatWidget = (widget: ANY_OBJECT) => {
  widget['datasource'] = undefined;
  widget['relation'] = undefined;
  widget['column'] = undefined;
  if (widget.bindData && widget.bindData.tableId != null) {
    widget.bindData.table = findItemFromList(
      getAllTableList.value,
      widget.bindData.tableId,
      'tableId',
    );
    if (widget.bindData.table) {
      if (widget.bindData.table.relationType == null) {
        widget.datasource = widget.bindData.table.tag;
      } else {
        widget.relation = widget.bindData.table.tag;
        widget.datasource = findItemFromList(
          getAllTableList.value,
          widget.relation.datasourceId,
          'id',
        );
      }
    }
    if (widget.bindData.table && widget.bindData.columnId) {
      widget.bindData.column = findItemFromList(
        widget.bindData.table.columnList,
        widget.bindData.columnId,
        'columnId',
      );
      widget.column = widget.bindData.column;
    }
  }
  if (widget.props && widget.props.dictInfo && widget.props.dictInfo.dictId) {
    widget.props.dictInfo.dict = findItemFromList(
      props.dictList,
      widget.props.dictInfo.dictId,
      'dictId',
    );
  }
  if (widget.props && Array.isArray(widget.props.tableColumnList)) {
    widget.props.tableColumnList.forEach((tableColumn: ANY_OBJECT) => {
      tableColumn.table = findItemFromList(getAllTableList.value, tableColumn.tableId, 'tableId');
      if (tableColumn.table && Array.isArray(tableColumn.table.columnList))
        tableColumn.column = findItemFromList(
          tableColumn.table.columnList,
          tableColumn.columnId,
          'columnId',
        );
    });
  }
  if (Array.isArray(widget.childWidgetList)) {
    widget.childWidgetList.forEach(subWidget => {
      formatWidget(subWidget);
    });
  }
};
const onClearWidget = () => {
  ElMessageBox.confirm('是否重置表单？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      if (currentForm.value && currentForm.value[activeMode.value])
        currentForm.value[activeMode.value].widgetList = [];
    })
    .catch(e => {
      console.warn(e);
    });
};
const getDesignBoxStyle = computed(() => {
  let width, padding, background;
  let formInfo = (currentForm.value || {})[activeMode.value] || {};
  if (activeMode.value === 'pc') {
    width =
      currentForm.value == null || formInfo.fullscreen ? '100%' : (formInfo.width || 600) + 'px';
    padding =
      [
        SysOnlineFormType.ADVANCE_QUERY,
        SysOnlineFormType.QUERY,
        SysOnlineFormType.ONE_TO_ONE_QUERY,
        SysOnlineFormType.WORK_ORDER,
      ].indexOf((currentForm.value || {}).formType) !== -1
        ? '0px'
        : '25px';
    background =
      [
        SysOnlineFormType.ADVANCE_QUERY,
        SysOnlineFormType.QUERY,
        SysOnlineFormType.ONE_TO_ONE_QUERY,
        SysOnlineFormType.WORK_ORDER,
      ].indexOf((currentForm.value || {}).formType) !== -1
        ? undefined
        : 'white';
  } else {
    width = '375px';
    padding = '0px';
    background = undefined;
  }
  return {
    width,
    padding,
    background,
    border: activeMode.value === 'pc' ? undefined : '1px solid #E8E8E8',
  };
});
const onFormClick = () => {
  rightActive.value = 'props';
  currentWidget.value = null;
};
const onWidgetClick = (widget: ANY_OBJECT | null) => {
  console.log('CURRENT_WIDGET is ', widget);
  rightActive.value = 'props';
  currentWidget.value = widget;
};

// ATTRIBUTE
const showOperationTab = computed(() => {
  if (currentWidget.value) {
    return currentWidget.value.widgetType === SysCustomWidgetType.Table
      ? currentForm.value?.formType !== SysOnlineFormType.ONE_TO_ONE_QUERY
      : currentWidget.value.supportOperation;
  } else {
    if (currentForm.value && currentForm.value[activeMode.value]) {
      return currentForm.value[activeMode.value].supportOperation;
    }
  }
  return false;
});
const getValidTableList = computed(() => {
  if (getMasterTable.value == null) return [];
  if (getMasterTable.value.relationType == null) {
    // 返回主表以及一对一从表
    return getAllTableList.value.filter((table: ANY_OBJECT) => {
      return table.relationType == null || table.relationType === SysOnlineRelationType.ONE_TO_ONE;
    });
  } else {
    // 仅返回从表
    return getAllTableList.value.filter((table: ANY_OBJECT) => {
      return table.tableId === getMasterTable.value?.tableId;
    });
  }
});
const getTableWidgetTableList = computed(() => {
  if (getMasterTable.value == null) return [];
  if (getMasterTable.value.relationType == null) {
    return getAllTableList.value.filter((table: ANY_OBJECT) => {
      if (
        currentForm.value?.formType === SysOnlineFormType.QUERY ||
        currentForm.value?.formType === SysOnlineFormType.ADVANCE_QUERY
      ) {
        // 主表查询页面返回，主表以及一对一从表
        return (
          table.relationType == null || table.relationType === SysOnlineRelationType.ONE_TO_ONE
        );
      } else if (currentForm.value?.formType === SysOnlineFormType.WORK_ORDER) {
        // 工单列表页面返回主表
        return table.relationType == null;
      } else {
        // 返回一对多从表
        return table.relationType === SysOnlineRelationType.ONE_TO_MANY;
      }
    });
  } else if (
    currentForm.value?.formType === SysOnlineFormType.QUERY ||
    currentForm.value?.formType === SysOnlineFormType.ONE_TO_ONE_QUERY ||
    currentForm.value?.formType === SysOnlineFormType.ADVANCE_QUERY
  ) {
    return getAllTableList.value.filter((table: ANY_OBJECT) => {
      return table.id === getMasterTable.value?.id;
    });
  }
  return [];
});
const formConfig = computed(() => {
  return {
    form: currentForm.value ? currentForm.value[activeMode.value] : null,
    activeMode: activeMode.value,
    currentWidget: currentWidget.value,
    getMasterTable: getMasterTable.value,
    getAllTableList: getAllTableList.value,
    getValidTableList: getValidTableList.value,
    getTableWidgetTableList: getTableWidgetTableList.value,
    getWidgetAttribute: widgetData.getWidgetAttribute,
    getWidgetObject: widgetData.getWidgetObject,
    dictList: props.dictList,
  };
});

provide('formConfig', () => formConfig.value);

const buildFormConfig = computed(() => {
  return {
    form: {
      formType: formConfig.value.form.formType,
      customFieldList: formConfig.value.form.customFieldList,
    },
    getMasterTable: {
      relationType: formConfig.value.getMasterTable?.relationType,
      tag: {
        datasourceName: formConfig.value.getMasterTable?.tag.datasourceName,
        relationName: formConfig.value.getMasterTable?.tag.relationName,
        variableName: formConfig.value.getMasterTable?.tag.variableName,
      },
      columnList: formConfig.value.getMasterTable?.columnList.map((column: ANY_OBJECT) => {
        return {
          filterType: column.filterType,
          columnComment: column.columnComment,
          columnName: column.columnName,
          columnId: column.columnId,
        };
      }),
    },
    getAllTableList: formConfig.value.getAllTableList.map((table: ANY_OBJECT) => {
      return {
        relationType: table.relationType,
        tag: {
          datasourceName: table.tag.datasourceName,
          relationName: table.tag.relationName,
          variableName: table.tag.variableName,
        },
        columnList: table.columnList.map((column: ANY_OBJECT) => {
          return {
            filterType: column.filterType,
            columnComment: column.columnComment,
            columnName: column.columnName,
            columnId: column.columnId,
          };
        }),
      };
    }),
  };
});
const widgetAllowEventList = computed(() => {
  if (currentWidget.value == null) return [];
  return (widgetData.getWidgetAttribute(currentWidget.value.widgetType) || {}).allowEventList || [];
});
const formAllowEventList = computed(() => {
  if (currentForm.value == null) return [];
  let temp = (getFormConfig(currentForm.value?.formType, props.pageType) || {})[activeMode.value];
  return temp ? temp.allowEventList : [];
});

// WATCH
watch(
  () => currentForm.value,
  () => {
    refreshFormInfo();
  },
);

watch(
  () => props.allFormList,
  () => {
    if (
      Array.isArray(props.allFormList) &&
      props.allFormList.length > 0 &&
      currentForm.value == null
    ) {
      currentFormId.value = props.allFormList[0].formId;
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  () => getAllTableList.value,
  () => {
    if (Array.isArray(getAllTableList.value) && getAllTableList.value.length > 0) {
      getAllTableList.value.forEach((table: ANY_OBJECT) => {
        formatColumnRelationFlag(table);
      });
      let current = findItemFromList(getAllTableList.value, activeDataTable.value, 'id');
      if (current == null) activeDataTable.value = getAllTableList.value[0].id;
    } else {
      activeDataTable.value = '';
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  () => showOperationTab.value,
  newVal => {
    if (!newVal && rightActive.value == 'operate') {
      // 当操作面板隐藏且当前显示选项为操作面板时，选中属性面板
      rightActive.value = 'props';
    }
  },
);

// EVENT
const onCreateNewForm = () => {
  emit('createForm');
};
const saveForm = () => {
  emit('updateForm', currentForm.value);
};
const handleFormCommand = (form: ANY_OBJECT, command: string) => {
  console.log(form, command);
  if (command === 'copy') {
    emit('cloneForm', form);
  } else if (command === 'delete') {
    emit('deleteForm', form);
  }
};

// const currentOperationList = () => {
//   if (currentWidget.value != null) {
//     if (currentWidget.value.operationList == null) currentWidget.value.operationList = [];
//     return currentWidget.value.operationList;
//   } else {
//     if (currentForm.value != null) {
//       if (currentForm.value[activeMode.value] == null)
//         currentForm.value[activeMode.value]['operationList'] = [];
//       return currentForm.value[activeMode.value].operationList;
//     }
//   }
//   return null;
// };

defineExpose({
  saveForm,
});
</script>

<style lang="scss" scoped>
.form-design {
  display: flex;
  height: 100%;
}
.form-design .attribute-panel :deep(.el-form-item) {
  margin-bottom: 12px;
}
.form-design .left-menu {
  width: 48px;
  height: 100%;
  padding: 23px 0;
  background: #2d3039;
}
.form-design .left-menu .left-menu-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  text-align: center;
  color: white;
  color: #a4a5a7;
  flex-direction: column;
  justify-items: center;
  font-weight: 400;
  cursor: pointer;
}
.form-design .left-menu .left-menu-item.active {
  color: $color-primary;
}
.form-design .left-panel {
  display: flex;
  flex-direction: column;
  width: 240px;
  height: 100%;
  .form-card {
    flex-grow: 0;
    flex-shrink: 0;
    height: 280px;
  }

  .base-card-header {
    height: 56px;
    line-height: 56px;

    i {
      font-size: 14px;
      color: #999;

      span {
        font-size: 14px;
        color: #333;
        font-weight: bold;
      }
    }
  }
}
.form-item {
  height: 44px;
  .form-item-title {
    span {
      overflow: hidden;
      max-width: 100px;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #333;
      font-weight: 400;
      cursor: pointer;
    }
    .tag {
      padding: 3px 8px;
      margin-left: 8px;
      font-size: 12px;
      color: #999;
      background: #f6f7f9;
      border-radius: 4px;
    }
  }
  .font-item-menu {
    font-size: 18px;
    color: #999;
  }
}
.form-item.active {
  .form-item-title {
    span {
      color: $color-primary;
    }
    .tag {
      color: #ffb800;
      background: #fff8e5;
    }
  }
}
.widget-group {
  .group-title {
    height: 44px !important;
    color: #333 !important;
    font-weight: bold !important;
    line-height: 44px !important;
  }
  .group-widget-list {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .group-widget-item {
      margin-bottom: 10px;
      .icon {
        width: 64px;
        height: 64px;
        font-size: 26px;
        text-align: center;
        color: #666;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        cursor: pointer;
        line-height: 64px;
      }

      .icon:hover {
        background: #f6f7f9;
      }

      .name {
        overflow: hidden;
        width: 64px;
        height: 26px;
        font-size: 12px;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #666;
        line-height: 26px;
        font-weight: 400;
      }
    }
  }
}
.design-panel {
  flex-grow: 1;
  width: 200px;
  padding: 0 24px 24px;
  .design-box {
    display: flex;
    justify-content: center;
    width: 100%;
    height: calc(100% - 48px);
  }
}
.attribute-panel {
  flex-shrink: 0;
  width: 288px;
  background: white;
  flex-grow: 0;
}
.data-card .data-column-title {
  justify-content: flex-start;
  align-items: flex-start;
  padding-left: 16px;
  font-size: 14px;
  color: black;
  font-weight: 400;
  flex-direction: column;
  span {
    overflow: hidden;
    max-width: 185px;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: normal;
  }
}
:deep(.el-collapse-item__header) {
  height: auto !important;
  line-height: 20px !important;
  padding: 8px 0 !important;
}
.data-card .table-column-item {
  height: 44px;
  padding: 0 16px;
  font-size: 14px;
  color: #666;
  .online-icon {
    color: #333;
  }
  .online-icon.flag {
    width: 18px;
    height: 18px;
    font-size: 16px;
    text-align: center;
    color: #999;
    background: #f1f2f3;
    line-height: 18px;
  }

  .online-icon.flag.active {
    color: #ffb800;
    background: #fff8e5;
  }
}
.device-item {
  display: inline-block;
  width: 32px;
  height: 32px;
  font-size: 24px;
  text-align: center;
  color: #666;
  line-height: 32px;
  cursor: pointer;
}
.device-item.active {
  color: $color-primary;
  background: #fff1e5;
  cursor: pointer;
}
.device-item.disabled {
  cursor: not-allowed !important;
}
.active {
  .img-box {
    background-color: $color-primary;
  }
}
.img-box {
  display: flex;
  justify-content: center;
  padding: 5px;
  border-radius: 4px;
  img {
    vertical-align: middle;
  }
}

.round-search :deep(.el-input__wrapper) {
  border-radius: 16px;
}

.base-card :deep(.el-card__body) {
  height: 100%;
}
.attribute-panel :deep(.el-tabs__item) {
  height: 57px;
  padding-top: 10px;
  font-size: 14px;
}
.attribute-panel :deep(.el-tabs__nav-wrap) {
  background: #fcfcfc;
}
.attribute-panel :deep(.el-tabs__header) {
  margin: 0;
}
.attribute-panel :deep(.el-tabs__nav) {
  margin-left: 16px;
}
.attribute-panel :deep(.el-form-item__label) {
  padding-right: 0;
  font-size: 12px;
  color: #666;
}
.attribute-panel :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
.attribute-panel :deep(.el-radio__label) {
  padding-left: 8px;
}
.attribute-panel :deep(.el-radio) {
  margin-right: 24px;
}
.attribute-panel :deep(.el-radio:last-child) {
  margin-right: 0;
}
.data-card :deep(.el-collapse-item__content) {
  padding-bottom: 0;
  background: #fafbfc;
}
.data-card :deep(.el-collapse-item__header) {
  height: 50px;
  line-height: 50px;
}
.data-card :deep(.el-collapse-item__arrow) {
  margin-right: 24px;
}
.data-card .table-column-item :deep(.el-link--inner) {
  overflow: hidden;
  max-width: 240px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.data-card :deep(.el-tag.el-tag--success) {
  color: #00ae1c;
  background-color: #e5f7e7;
  border-color: #e5f7e7;
}
.data-card :deep(.el-tag.el-tag--warning) {
  color: $color-primary;
  background-color: #fff1e5;
  border-color: #fff1e5;
}
.data-card :deep(.el-tag.el-tag--primary) {
  color: #ffb800;
  background-color: #fff8e5;
  border-color: #fff8e5;
}
</style>

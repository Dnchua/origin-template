<template>
  <el-config-provider :locale="zhCn">
    <div class="edit-online-form">
      <el-container style="height: 100vh">
        <el-header class="step-header" style="height: 72px">
          <el-row type="flex" justify="space-between">
            <el-col class="title header" :span="6" style="height: auto; line-height: auto">
              <i
                class="header-logo logo online-icon icon-orange-icon"
                style="font-size: 40px; color: #fda834"
              />
              <span style="font-size: 22px; color: #333; font-weight: bold">橙单流程设计</span>
            </el-col>
            <div>
              <StepBar class="step" :value="activeStep" style="margin-top: 14px">
                <StepBarItem icon="online-icon icon-basic-info" :name="SysFlowEntryStep.BASIC"
                  >基础信息</StepBarItem
                >
                <StepBarItem
                  icon="online-icon icon-operator"
                  :name="SysFlowEntryStep.PROCESS_VARIABLE"
                  >流程变量</StepBarItem
                >
                <StepBarItem
                  icon="online-icon icon-flow-stauts"
                  :name="SysFlowEntryStep.PROCESS_STATUS"
                  >流程状态</StepBarItem
                >
                <StepBarItem
                  icon="online-icon icon-flow-design"
                  :name="SysFlowEntryStep.PROCESS_DESIGN"
                  >流程设计</StepBarItem
                >
              </StepBar>
            </div>
            <el-col :span="6">
              <el-row type="flex" justify="end" align="middle" style="height: 72px">
                <el-button
                  v-if="activeStep !== SysFlowEntryStep.PROCESS_DESIGN"
                  size="default"
                  @click="onPrevClick"
                  :disabled="activeStep === SysFlowEntryStep.BASIC"
                >
                  上一步
                </el-button>
                <el-button
                  type="primary"
                  v-if="activeStep !== SysFlowEntryStep.PROCESS_DESIGN"
                  size="default"
                  @click="onNextClick"
                  :disabled="activeStep === SysFlowEntryStep.PROCESS_DESIGN"
                  >下一步</el-button
                >
                <el-button
                  v-if="activeStep !== SysFlowEntryStep.PROCESS_DESIGN"
                  size="default"
                  @click="onClose"
                  >退出</el-button
                >
                <el-button
                  v-if="activeStep === SysFlowEntryStep.PROCESS_DESIGN"
                  size="default"
                  type="primary"
                  @click="onSave"
                  >保存</el-button
                >
                <el-button
                  v-if="activeStep === SysFlowEntryStep.PROCESS_DESIGN"
                  size="default"
                  @click="onPrevClick"
                  >返回</el-button
                >
              </el-row>
            </el-col>
          </el-row>
        </el-header>
        <el-main
          style="padding: 10px; background: #ebeef5"
          :style="{ height: clientHeight - 72 + 'px' }"
        >
          <el-row type="flex" justify="center" style="height: 100%">
            <!-- 流程基础信息设置 -->
            <el-col
              v-if="activeStep === SysFlowEntryStep.BASIC"
              class="main-box"
              style="min-width: 650px"
              :span="9"
            >
              <el-form
                ref="entryBasicInfo"
                class="full-width-input"
                size="default"
                :model="formFlowEntryData"
                :rules="formRules"
                label-position="right"
                label-width="80px"
                @submit.prevent
              >
                <el-col :span="24">
                  <el-form-item label="表单类型" prop="bindFormType">
                    <el-select
                      v-model="formFlowEntryData.bindFormType"
                      placeholder=""
                      @change="onBindFormTypeChange"
                      :disabled="isEdit"
                    >
                      <el-option
                        :label="
                          SysFlowEntryBindFormType.getValue(SysFlowEntryBindFormType.ROUTER_FORM)
                        "
                        :value="SysFlowEntryBindFormType.ROUTER_FORM"
                      />
                      <el-option
                        :label="
                          SysFlowEntryBindFormType.getValue(SysFlowEntryBindFormType.ONLINE_FORM)
                        "
                        :value="SysFlowEntryBindFormType.ONLINE_FORM"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="流程名称" prop="processDefinitionName">
                    <el-input v-model="formFlowEntryData.processDefinitionName" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="流程标识" prop="processDefinitionKey">
                    <el-input v-model="formFlowEntryData.processDefinitionKey" :disabled="isEdit" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="流程分类" prop="categoryId">
                    <el-select
                      v-model="formFlowEntryData.categoryId"
                      placeholder=""
                      :loading="categoryIdWidget.loading"
                      @visible-change="categoryIdWidget.onVisibleChange"
                    >
                      <el-option
                        v-for="item in categoryIdWidget.dropdownList"
                        :key="item.id"
                        :value="item.id"
                        :label="item.name"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="工单编码">
                    <el-row type="flex" align="middle" style="flex-wrap: nowrap">
                      <el-input
                        v-model="formFlowEntryData.encodedRule.prefix"
                        style="width: 150px"
                        placeholder="前缀"
                        :disabled="!formFlowEntryData.encodedRule.calculateWhenView"
                      >
                        <template v-slot:prepend>
                          <el-checkbox v-model="formFlowEntryData.encodedRule.calculateWhenView" />
                        </template>
                      </el-input>
                      <el-select
                        v-model="formFlowEntryData.encodedRule.precisionTo"
                        style="width: 160px; margin-left: 5px"
                        placeholder="日期精度"
                        :disabled="!formFlowEntryData.encodedRule.calculateWhenView"
                      >
                        <el-option
                          v-for="item in SysAutoCodeType.getList()"
                          :key="item.id"
                          :label="item.name"
                          :value="item.id"
                        />
                      </el-select>
                      <el-input
                        v-model="formFlowEntryData.encodedRule.middle"
                        style="width: 80px; margin-left: 5px"
                        placeholder="后缀"
                        :disabled="!formFlowEntryData.encodedRule.calculateWhenView"
                      />
                      <el-input-number
                        v-model="formFlowEntryData.encodedRule.idWidth"
                        style="width: 100px; margin-left: 5px"
                        :controls="false"
                        placeholder="序号宽度"
                        :disabled="!formFlowEntryData.encodedRule.calculateWhenView"
                      />
                    </el-row>
                  </el-form-item>
                </el-col>
                <el-col
                  :span="24"
                  v-if="formFlowEntryData.bindFormType === SysFlowEntryBindFormType.ONLINE_FORM"
                >
                  <el-form-item label="流程页面" prop="pageId">
                    <el-select
                      v-model="formFlowEntryData.pageId"
                      :disabled="isEdit"
                      placeholder=""
                      :loading="pageIdWidget.loading"
                      @visible-change="pageIdWidget.onVisibleChange"
                      @change="onEntryPageChange"
                    >
                      <el-option
                        v-for="item in pageIdWidget.dropdownList"
                        :key="item.pageId"
                        :value="item.pageId"
                        :label="item.pageName"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col
                  :span="24"
                  v-if="formFlowEntryData.bindFormType === SysFlowEntryBindFormType.ONLINE_FORM"
                >
                  <el-form-item label="默认表单" prop="defaultFormId">
                    <el-select
                      v-model="formFlowEntryData.defaultFormId"
                      placeholder=""
                      :loading="defaultFormIdWidget.loading"
                      @visible-change="defaultFormIdWidget.onVisibleChange"
                    >
                      <el-option
                        v-for="item in defaultFormIdWidget.dropdownList"
                        :key="item.formId"
                        :value="item.formId"
                        :label="item.formName"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col
                  :span="24"
                  v-if="formFlowEntryData.bindFormType === SysFlowEntryBindFormType.ROUTER_FORM"
                >
                  <el-form-item label="默认表单" prop="defaultRouterName">
                    <el-input
                      v-model="formFlowEntryData.defaultRouterName"
                      clearable
                      placeholder="请填写路由名称"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="通知类型">
                    <el-select
                      v-model="formFlowEntryData.notifyTypes"
                      placeholder=""
                      clearable
                      multiple
                    >
                      <el-option label="邮件" value="email" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="级联删除业务数据" label-width="128px">
                    <el-switch v-model="formFlowEntryData.cascadeDeleteBusinessData" />
                  </el-form-item>
                </el-col>
                <el-col :span="24" v-if="isEdit && shareFormList.length > 0">
                  <el-form-item label="工单分享">
                    <el-row type="flex">
                      <el-button
                        v-for="form in (defaultFormIdWidget.dropdownList || []).filter(
                          item => item.formType === SysOnlineFormType.WORK_ORDER,
                        )"
                        :key="form.formId"
                        :class="form.formCode"
                        :data-clipboard-text="getFormShareInfo(form)"
                        title="生成分享链接"
                        @click="handleShare(form.formCode)"
                      >
                        {{ form.formName }}
                      </el-button>
                    </el-row>
                  </el-form-item>
                </el-col>
              </el-form>
            </el-col>
            <!-- 流程变量设置 -->
            <el-col
              v-if="activeStep === SysFlowEntryStep.PROCESS_VARIABLE"
              class="main-box"
              :span="16"
            >
              <vxe-table
                :data="processVariableList"
                header-cell-class-name="table-header-gray"
                key="processVariableList"
                :size="formItemSize"
                :row-config="{ isHover: true }"
              >
                <vxe-column title="序号" type="seq" width="70px" />
                <vxe-column title="变量名称" field="showName" />
                <vxe-column title="变量标识" field="variableName" />
                <vxe-column title="变量类型">
                  <template v-slot="scope">
                    <el-tag
                      :size="formItemSize"
                      effect="dark"
                      :type="
                        scope.row.variableType === SysFlowVariableType.TASK ? 'primary' : 'success'
                      "
                    >
                      {{ SysFlowVariableType.getValue(scope.row.variableType) }}
                    </el-tag>
                  </template>
                </vxe-column>
                <vxe-column title="内置变量">
                  <template v-slot="scope">
                    <el-tag
                      :size="formItemSize"
                      effect="dark"
                      :type="scope.row.builtIn ? 'success' : 'danger'"
                    >
                      {{ scope.row.builtIn ? '是' : '否' }}
                    </el-tag>
                  </template>
                </vxe-column>
                <vxe-column title="操作" width="100px">
                  <template v-slot="scope">
                    <el-button
                      :size="formItemSize"
                      type="primary"
                      link
                      :disabled="scope.row.builtin"
                      @click="editEntryVariable(scope.row)"
                      style="padding: 0"
                      >编辑</el-button
                    >
                    <el-button
                      :size="formItemSize"
                      type="danger"
                      link
                      :disabled="scope.row.builtin"
                      @click="deleteEntryVariable(scope.row)"
                      style="padding: 0"
                      >删除</el-button
                    >
                  </template>
                </vxe-column>
                <template v-slot:empty>
                  <div class="table-empty unified-font">
                    <img src="@/assets/img/empty.png" />
                    <span>暂无数据</span>
                  </div>
                </template>
              </vxe-table>
              <el-button class="btn-add" :icon="Plus" @click="addEntryVariable" :size="formItemSize"
                >添加变量</el-button
              >
            </el-col>
            <!-- 流程状态设置 -->
            <el-col
              v-if="activeStep === SysFlowEntryStep.PROCESS_STATUS"
              class="main-box"
              :span="16"
            >
              <vxe-table
                :data="formFlowEntryData.extensionData.approvalStatusDict"
                :row-config="{ isHover: true }"
                header-cell-class-name="table-header-gray"
                key="processStatusList"
                :size="formItemSize"
              >
                <vxe-column title="序号" type="seq" width="70px" />
                <vxe-column title="状态显示名" field="name" />
                <vxe-column title="状态标识" field="id" />
                <vxe-column title="操作" width="100px">
                  <template v-slot="scope">
                    <el-button
                      :size="formItemSize"
                      type="primary"
                      link
                      :disabled="scope.row.builtin"
                      @click="editEntryStatus(scope.row)"
                      style="padding: 0"
                      >编辑</el-button
                    >
                    <el-button
                      :size="formItemSize"
                      type="danger"
                      link
                      :disabled="scope.row.builtin"
                      @click="deleteEntryStatus(scope.row)"
                      style="padding: 0"
                      >删除</el-button
                    >
                  </template>
                </vxe-column>
                <template v-slot:empty>
                  <div class="table-empty unified-font">
                    <img src="@/assets/img/empty.png" />
                    <span>暂无数据</span>
                  </div>
                </template>
              </vxe-table>
              <el-button
                class="btn-add"
                :icon="Plus"
                :size="formItemSize"
                @click="editEntryStatus(null)"
                >新建状态</el-button
              >
            </el-col>
            <!-- 流程设计 -->
            <el-col
              v-if="activeStep === SysFlowEntryStep.PROCESS_DESIGN"
              class="main-box"
              :span="24"
              style="min-width: 1100px; padding: 0"
            >
              <ProcessDesigner
                ref="designer"
                :flowEntryInfo="formFlowEntryData"
                @save="onSaveFlowEntry"
              />
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { VxeTable, VxeColumn } from 'vxe-table';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { ElMessage, ElMessageBox, FormItemRule } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import Clipboard from 'clipboard';
import { Arrayable } from 'element-plus/es/utils/typescript';
import StepBar from '@/components/StepBar/index.vue';
import StepBarItem from '@/components/StepBar/stepItem.vue';
import {
  FlowEntryController,
  FlowEntryVariableController,
  FlowDictionaryController,
} from '@/api/flow';
import {
  OnlinePageController,
  OnlineFormController,
  OnlineColumnController,
  OnlineDatasourceRelationController,
  OnlineVirtualColumnController,
} from '@/api/online';
import {
  DiagramType,
  SysAutoCodeType,
  SysFlowEntryBindFormType,
  SysFlowEntryStep,
  SysFlowVariableType,
} from '@/common/staticDict/flow';
import { SysOnlineFormType } from '@/common/staticDict/index';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import { SysOnlinePageType, SysOnlineRelationType } from '@/common/staticDict/online';
import { TableData } from '@/common/types/table';
import { ResponseDataType } from '@/common/http/types';
import { Dialog } from '@/components/Dialog';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
import ProcessDesigner from '../components/ProcessDesigner.vue';
import EditFlowEntryStatus from './formEditFlowEntryStatus.vue';
import EditFlowEntryVariable from './formEditFlowEntryVariable.vue';
const layoutStore = useLayoutStore();
const defaultApprovalStatus = [
  { id: 1, name: '同意' },
  { id: 2, name: '拒绝' },
  { id: 3, name: '驳回' },
  { id: 4, name: '会签同意' },
  { id: 5, name: '会签拒绝' },
];
interface IProps extends ThirdProps {
  flowEntry?: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const clientHeight = inject('documentClientHeight', 200);

const entryBasicInfo = ref();
const designer = ref();

const activeStep = ref(SysFlowEntryStep.BASIC);
const formFlowEntryData = ref<ANY_OBJECT>({
  entryId: undefined,
  processDefinitionName: undefined,
  processDefinitionKey: undefined,
  categoryId: undefined,
  bindFormType: SysFlowEntryBindFormType.ROUTER_FORM,
  pageId: undefined,
  defaultFormId: undefined,
  defaultRouterName: undefined,
  bpmnXml: undefined,
  diagramType: DiagramType.ORDINARY,
  encodedRule: {
    calculateWhenView: false,
    prefix: undefined,
    precisionTo: SysAutoCodeType.DAYS,
    middle: undefined,
    idWidth: undefined,
  },
  extensionData: {},
  notifyTypes: undefined,
  cascadeDeleteBusinessData: false,
  supportRevive: false,
  keptReviveDays: undefined,
});
const formRules: Partial<Record<string, Arrayable<FormItemRule>>> = {
  processDefinitionKey: [
    { required: true, message: '流程标识不能为空！', trigger: 'blur' },
    {
      type: 'string',
      pattern: /^[A-Za-z0-9]+$/,
      message: '流程标识只允许输入字母和数字',
      trigger: 'blur',
    },
    {
      type: 'string',
      pattern: /^[A-Za-z][A-Za-z0-9]+$/,
      message: '流程标识不能以数字开头',
      trigger: 'blur',
    },
  ],
  processDefinitionName: [{ required: true, message: '流程名称不能为空！', trigger: 'blur' }],
  categoryId: [{ required: true, message: '流程分类不能为空！', trigger: 'blur' }],
  pageId: [{ required: true, message: '流程页面不能为空！', trigger: 'blur' }],
  defaultFormId: [
    {
      required: true,
      message: '默认在线表单不能为空！',
      trigger: 'blur',
    },
  ],
  defaultRouterName: [
    {
      required: true,
      message: '默认路由表单不能为空！',
      trigger: 'blur',
    },
  ],
};
const processVariableList = ref<ANY_OBJECT[]>([]);
const defaultOnlineFormList = ref<ANY_OBJECT[]>([]);
let entryDatasource: ANY_OBJECT | undefined | null = undefined;
// 获取流程分类
const loadCategoryIdDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    FlowDictionaryController.dictFlowCategory({})
      .then(res => {
        resolve({ dataList: res.getList() });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const categoryIdDropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadCategoryIdDropdownList,
};
const categoryIdWidget = reactive(useDropdown(categoryIdDropdownOptions));
// 获取在线表单列表
const loadPageIdDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    OnlinePageController.list({
      onlinePageDtoFilter: {
        pageType: SysOnlinePageType.FLOW,
      },
    })
      .then(res => {
        resolve({ dataList: res.data.dataList.filter(item => item.published) });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const pageIdDropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadPageIdDropdownList,
};
const pageIdWidget = reactive(useDropdown(pageIdDropdownOptions));
// 获取默认表单页面列表
const loadDefaultFormIdDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    if (formFlowEntryData.value.pageId == null || formFlowEntryData.value.pageId === '') {
      resolve({ dataList: [] });
      return;
    }
    OnlineFormController.list({
      onlineFormDtoFilter: {
        pageId: formFlowEntryData.value.pageId,
      },
      orderParam: [
        {
          fieldName: 'createTime',
          asc: true,
        },
      ],
    })
      .then(res => {
        defaultOnlineFormList.value = res.data.dataList || [];
        resolve({
          dataList: (res.data.dataList || []).filter(
            item => item.formType === SysOnlineFormType.FLOW,
          ),
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const defaultFormIdDropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadDefaultFormIdDropdownList,
};
const defaultFormIdWidget = reactive(useDropdown(defaultFormIdDropdownOptions));
const dialogParams = computed(() => {
  return {
    flowEntry: props.flowEntry || thirdParams.value.flowEntry,
  };
});
const isEdit = computed(() => {
  return dialogParams.value.flowEntry != null || formFlowEntryData.value.entryId != null;
});
const shareFormList = computed(() => {
  return (defaultOnlineFormList.value || []).filter(
    item => item.formType === SysOnlineFormType.WORK_ORDER,
  );
});

const onPrevClick = () => {
  switch (activeStep.value) {
    case SysFlowEntryStep.PROCESS_VARIABLE:
      activeStep.value = SysFlowEntryStep.BASIC;
      break;
    case SysFlowEntryStep.PROCESS_STATUS:
      activeStep.value = SysFlowEntryStep.PROCESS_VARIABLE;
      break;
    case SysFlowEntryStep.PROCESS_DESIGN:
      activeStep.value = SysFlowEntryStep.PROCESS_STATUS;
      break;
  }
};
// 保存流程基础信息
const saveFlowEntryInfo = () => {
  if (formFlowEntryData.value.extensionData == null) {
    formFlowEntryData.value.extensionData = {};
  }
  if (!Array.isArray(formFlowEntryData.value.extensionData.approvalStatusDict)) {
    formFlowEntryData.value.extensionData['approvalStatusDict'] = [...defaultApprovalStatus];
  }
  formFlowEntryData.value.extensionData['notifyTypes'] = formFlowEntryData.value.notifyTypes;
  formFlowEntryData.value.extensionData['cascadeDeleteBusinessData'] =
    formFlowEntryData.value.cascadeDeleteBusinessData;
  formFlowEntryData.value.extensionData['supportRevive'] = formFlowEntryData.value.supportRevive;
  formFlowEntryData.value.extensionData['keptReviveDays'] = formFlowEntryData.value.keptReviveDays;
  let params = {
    flowEntryDto: {
      ...formFlowEntryData.value,
      diagramType:
        designer.value?.processDesigner?.diagramType || formFlowEntryData.value.diagramType,
      extensionData: JSON.stringify(formFlowEntryData.value.extensionData),
    },
  };
  console.log(
    'formEditFlowEntry.saveFlowEntryInfo params',
    params,
    'designer.value',
    designer.value,
  );

  return isEdit.value ? FlowEntryController.update(params) : FlowEntryController.add(params);
};
/**
 * 获取数据模型关联信息
 */
const loadDatasourceRelation = (res: ResponseDataType<TableData<ANY_OBJECT>>) => {
  if (entryDatasource == null) return Promise.resolve(res);
  return OnlineDatasourceRelationController.list({
    onlineDatasourceRelationDtoFilter: {
      datasourceId: entryDatasource.datasourceId,
    },
  });
};
// 获取在线表单数据表字段列表
const loadOnlineTableColumns = (
  tableId: string | null,
  owner: ANY_OBJECT,
): Promise<ResponseDataType<TableData<ANY_OBJECT>>> => {
  if (tableId == null || tableId === '') return Promise.reject();

  return new Promise((resolve, reject) => {
    let params = {
      onlineColumnDtoFilter: {
        tableId,
      },
    };

    OnlineColumnController.list(params)
      .then(res => {
        owner.columnList = res.data.dataList;
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 获取数据源下所有表字段
 */
const loadDatasourceAllColumnList = (res: ResponseDataType<TableData<ANY_OBJECT>>) => {
  if (entryDatasource == null) return Promise.resolve(res);
  let allHttpCalls = [loadOnlineTableColumns(entryDatasource.masterTableId, entryDatasource)];
  entryDatasource.relationList.forEach((relation: ANY_OBJECT) => {
    if (relation.relationType === SysOnlineRelationType.ONE_TO_ONE) {
      allHttpCalls.push(loadOnlineTableColumns(relation.slaveTableId, relation));
    }
  });

  Promise.all(allHttpCalls).then(res => {
    return Promise.resolve(res);
  });
};
// 获取流程绑定页面数据源信息
const initFlowDatasourceInfo = () => {
  return new Promise((resolve, reject) => {
    if (entryDatasource != null) return resolve(null);
    if (formFlowEntryData.value.bindFormType === SysFlowEntryBindFormType.ONLINE_FORM) {
      OnlinePageController.listOnlinePageDatasource({
        pageId: formFlowEntryData.value.pageId,
      })
        .then(res => {
          entryDatasource = res.data.dataList[0];
          return loadDatasourceRelation(res);
        })
        .then(res => {
          if (entryDatasource) {
            entryDatasource.relationList = res.data.dataList || [];
          } else {
            console.error('formEditFlowEntry.entryDatasource is null');
          }
          return loadDatasourceAllColumnList(res);
        })
        .then(() => {
          return OnlineVirtualColumnController.list({
            onlineVirtualColumnDtoFilter: {
              datasourceId: entryDatasource?.datasourceId,
            },
          });
        })
        .then(res => {
          let virtualColumnList = res.data.dataList;
          if (Array.isArray(virtualColumnList) && entryDatasource) {
            if (!Array.isArray(entryDatasource.columnList)) entryDatasource.columnList = [];
            entryDatasource?.columnList.push(
              ...virtualColumnList.map(item => {
                return {
                  ...item,
                  columnId: item.virtualColumnId,
                  columnName: item.objectFieldName,
                  columnComment: item.columnPrompt,
                };
              }),
            );
          }
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    } else {
      entryDatasource = null;
      resolve(null);
    }
  });
};
const onSaveFlowEntryBasicInfo = () => {
  return saveFlowEntryInfo();
};
// 获取流程变量列表
const loadEntryVariableList = () => {
  return new Promise((resolve, reject) => {
    let params = {
      flowEntryVariableDtoFilter: {
        entryId: formFlowEntryData.value.entryId || dialogParams.value.flowEntry?.entryId,
      },
    };

    FlowEntryVariableController.list(params)
      .then(res => {
        // VxeTable要求对象必须有hasOwnerProperty方法，需要重新组装对象
        processVariableList.value = res.data.dataList.map(item => {
          return { ...item };
        });
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};
const onNextClick = () => {
  switch (activeStep.value) {
    case SysFlowEntryStep.BASIC:
      entryBasicInfo.value.validate((valid: boolean) => {
        if (!valid) return;
        if (formFlowEntryData.value.encodedRule.calculateWhenView) {
          /*
        if (formFlowEntryData.value.encodedRule.prefix == null || formFlowEntryData.value.encodedRule.prefix === '') {
          ElMessage.error('工单编码前缀不能为空！');
          return;
        }
        */
          if (
            formFlowEntryData.value.encodedRule.precisionTo == null ||
            formFlowEntryData.value.encodedRule.precisionTo === ''
          ) {
            ElMessage.error('工单编码精度类型！');
            return;
          }
          if (
            formFlowEntryData.value.encodedRule.idWidth == null ||
            formFlowEntryData.value.encodedRule.idWidth <= 0
          ) {
            ElMessage.error('工单编码编号长度不能小于1！');
            return;
          }
        }
        // 保存流程基本信息
        onSaveFlowEntryBasicInfo()
          .then(res => {
            if (!isEdit.value) formFlowEntryData.value.entryId = res.data;
            ElMessage.success('保存成功');
            // 获取流程页面数据源信息
            initFlowDatasourceInfo()
              .then(() => {
                // 获取流程变量
                return loadEntryVariableList();
              })
              .then(() => {
                activeStep.value = SysFlowEntryStep.PROCESS_VARIABLE;
              })
              .catch(e => {
                console.log(e);
              });
          })
          .catch(e => {
            console.log(e);
          });
      });
      break;
    case SysFlowEntryStep.PROCESS_VARIABLE:
      activeStep.value = SysFlowEntryStep.PROCESS_STATUS;
      break;
    case SysFlowEntryStep.PROCESS_STATUS:
      // 保存状态信息
      onSaveFlowEntryBasicInfo()
        .then(() => {
          ElMessage.success('保存成功');
          activeStep.value = SysFlowEntryStep.PROCESS_DESIGN;
        })
        .catch(e => {
          console.log(e);
        });
      break;
  }
};

const onClose = () => {
  // this.$emit('close');
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(true);
  }
};
const onSave = () => {
  designer.value.processDesigner.onSave();
};
// 流程绑定表单类型改变
const onBindFormTypeChange = () => {
  formFlowEntryData.value.pageId = undefined;
  formFlowEntryData.value.defaultFormId = undefined;
  formFlowEntryData.value.defaultRouterName = undefined;
  entryDatasource = undefined;
};
// 流程绑定表单页面改变
const onEntryPageChange = () => {
  formFlowEntryData.value.defaultFormId = undefined;
  defaultFormIdWidget.setDirty(true);
  entryDatasource = null;
};
const getFormShareInfo = (form: ANY_OBJECT) => {
  let shareInfo = {
    url:
      window.location.origin +
      '/#/thirdParty/thirdOnlineForm?formId=' +
      form.formId +
      '&entryId=' +
      formFlowEntryData.value.entryId,
    processDefinitionKey: formFlowEntryData.value.processDefinitionKey,
  };

  return JSON.stringify(shareInfo);
};

const handleShare = (formId: string) => {
  try {
    let clipboard = new Clipboard('.' + formId);
    clipboard.on('success', e => {
      ElMessage.success('接入信息复制成功！');
      clipboard.destroy();
    });
    clipboard.on('error', e => {
      // TODO 没找到shareUrl的定义
      //ElMessage.error('浏览器不支持复制，请手动复制接入信息：' + this.shareUrl);
      ElMessage.error('浏览器不支持复制，请手动复制接入信息');
      clipboard.destroy();
    });
  } catch (e) {
    console.log(e);
  }
};
const editEntryVariable = (row: ANY_OBJECT) => {
  Dialog.show(
    '编辑变量',
    EditFlowEntryVariable,
    {
      area: '500px',
    },
    {
      entryId: formFlowEntryData.value.entryId || dialogParams.value.flowEntry.entryId,
      datasource: entryDatasource,
      rowData: row,
      path: 'thirdFormEditFlowEntryVariable',
    },
    {
      width: '500px',
      height: '260px',
      pathName: '/thirdParty/thirdFormEditFlowEntryVariable',
    },
  )
    .then(() => {
      loadEntryVariableList();
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};
const deleteEntryVariable = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此流程变量？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {
        variableId: row.variableId,
      };

      return FlowEntryVariableController.delete(params);
    })
    .then(() => {
      ElMessage.success('删除成功！');
      loadEntryVariableList();
    })
    .catch(e => {
      console.warn(e);
    });
};
const addEntryVariable = () => {
  Dialog.show(
    '添加变量',
    EditFlowEntryVariable,
    {
      area: '500px',
    },
    {
      entryId: formFlowEntryData.value.entryId || dialogParams.value.flowEntry.entryId,
      datasource: entryDatasource,
      path: 'thirdFormEditFlowEntryVariable',
    },
    {
      width: '500px',
      height: '260px',
      pathName: '/thirdParty/thirdFormEditFlowEntryVariable',
    },
  )
    .then(() => {
      loadEntryVariableList();
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};
const editEntryStatus = (row: ANY_OBJECT | null) => {
  Dialog.show<ANY_OBJECT[]>(
    row ? '编辑状态' : '添加状态',
    EditFlowEntryStatus,
    {
      area: '500px',
    },
    {
      rowData: row,
      flowEntry: formFlowEntryData.value,
      path: 'thirdFormEditFlowEntryStatus',
    },
    {
      width: '500px',
      height: '220px',
      pathName: '/thirdParty/thirdFormEditFlowEntryStatus',
    },
  )
    .then(approvalStatusDict => {
      formFlowEntryData.value.extensionData.approvalStatusDict = [...approvalStatusDict];
    })
    .catch(e => {
      console.warn(e);
    });
};
const deleteEntryStatus = (row: ANY_OBJECT) => {
  console.log('formEditFlowEntry.deleteEntryStatus row', row);
  ElMessageBox.confirm('是否删除此流程状态？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(res => {
      console.log(
        'formEditFlowEntry.deleteEntryStatus formFlowEntryData.extensionData.approvalStatusDict',
        formFlowEntryData.value.extensionData.approvalStatusDict,
      );
      let approvalStatusDict = formFlowEntryData.value.extensionData.approvalStatusDict.filter(
        (item: ANY_OBJECT) => {
          return item.id !== row.id;
        },
      );
      console.log('formEditFlowEntry.deleteEntryStatus approvalStatusDict', approvalStatusDict);
      let params = {
        flowEntryDto: {
          ...formFlowEntryData.value,
          extensionData: JSON.stringify({
            approvalStatusDict,
          }),
        },
      };
      FlowEntryController.update(params)
        .then(res => {
          ElMessage.success('删除成功！');
          formFlowEntryData.value.extensionData.approvalStatusDict = approvalStatusDict;
        })
        .catch(e => {
          console.warn(e);
        });
    })
    .catch(e => {
      console.warn(e);
    });
};
const onSaveFlowEntry = (xml: string) => {
  formFlowEntryData.value.bpmnXml = xml;
  onSaveFlowEntryBasicInfo()
    .then(() => {
      ElMessage.success('保存成功');
    })
    .catch(e => {
      console.warn(e);
    });
};

// 初始化流程基础信息
const initFlowEntryInfo = () => {
  formFlowEntryData.value = {
    processDefinitionName: undefined,
    processDefinitionKey: undefined,
    categoryId: undefined,
    bindFormType: SysFlowEntryBindFormType.ONLINE_FORM,
    pageId: undefined,
    defaultFormId: undefined,
    defaultRouterName: undefined,
    bpmnXml: undefined,
    diagramType: DiagramType.ORDINARY,
    encodedRule: {
      calculateWhenView: false,
      prefix: undefined,
      precisionTo: SysAutoCodeType.DAYS,
      middle: undefined,
      idWidth: undefined,
    },
    extensionData: {},
    notifyTypes: undefined,
    cascadeDeleteBusinessData: false,
    supportRevive: false,
    keptReviveDays: undefined,
  };
  activeStep.value = SysFlowEntryStep.BASIC;

  FlowEntryController.view({
    entryId: dialogParams.value.flowEntry?.entryId,
  })
    .then(res => {
      formFlowEntryData.value = {
        ...formFlowEntryData.value,
        ...res.data,
        encodedRule:
          res.data.encodedRule != null
            ? JSON.parse(res.data.encodedRule)
            : {
                calculateWhenView: false,
                prefix: undefined,
                precisionTo: SysAutoCodeType.DAYS,
                middle: undefined,
                idWidth: undefined,
              },
        extensionData: res.data.extensionData != null ? JSON.parse(res.data.extensionData) : {},
      };
      formFlowEntryData.value.notifyTypes = formFlowEntryData.value.extensionData.notifyTypes || [];
      formFlowEntryData.value.cascadeDeleteBusinessData =
        formFlowEntryData.value.extensionData.cascadeDeleteBusinessData || false;
      formFlowEntryData.value.supportRevive =
        formFlowEntryData.value.extensionData.supportRevive || false;
      formFlowEntryData.value.keptReviveDays = formFlowEntryData.value.extensionData.keptReviveDays;
      if (formFlowEntryData.value.bindFormType === SysFlowEntryBindFormType.ONLINE_FORM) {
        defaultFormIdWidget.onVisibleChange(true);
      }
      if (designer.value?.processDesigner) {
        designer.value.processDesigner.diagramType = res.data.diagramType;
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
onMounted(() => {
  // 初始化页面数据
  categoryIdWidget.onVisibleChange(true);
  pageIdWidget.onVisibleChange(true);
  if (isEdit.value) {
    initFlowEntryInfo();
  }
});

provide('flowEntry', () => formFlowEntryData);
provide('formList', () => (defaultFormIdWidget ? defaultFormIdWidget.dropdownList : []));
provide('allVariableList', () => processVariableList);

// 获取流程绑定页面数据源信息
// const initFlowEntryDatasourceInfo = (entryId: string) => {
//   return FlowEntryController.viewDatasource({
//     entryId,
//   });
// };

const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdFormEditFlowEntryVariable' && data.isSuccess) {
    loadEntryVariableList();
  } else if (data.path === 'thirdFormEditFlowEntryStatus' && data.isSuccess) {
    formFlowEntryData.value.extensionData.approvalStatusDict = [...data.data];
  }
};
defineExpose({
  refreshData,
});
</script>

<style scoped>
.edit-online-form {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  background: white;
}
.edit-online-form :deep(.el-steps--simple) {
  width: 800px;
  padding: 13px 0;
  background: white !important;
}
.edit-online-form :deep(.vxe th),
.edit-online-form :deep(.vxe td) {
  padding: 6px 0;
}
.edit-online-form :deep(.el-scrollbar__bar) {
  display: none;
}
.edit-online-form .header {
  height: 72px;
  line-height: 72px;
}
.edit-online-form .title {
  font-size: 24px;
  flex-grow: 0 !important;
}
.edit-online-form .title > i {
  margin-right: 10px;
  color: #fda834;
}
.edit-online-form .main-box {
  height: 100%;
  padding: 20px;
  background: white;
}
.edit-online-form .btn-add {
  width: 100%;
  margin-top: 10px;
  border: 1px dashed #ebeef5;
}
.edit-online-form :deep(.vxe td) {
  font-size: 12px;
  color: #666;
}
.append-add {
  background: #f5f7fa;
  border: none;
  border-radius: 0;
  border-left: 1px solid #dcdfe6;
}
</style>

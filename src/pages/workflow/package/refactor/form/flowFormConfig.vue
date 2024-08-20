<template>
  <div>
    <el-form
      v-if="tabType === 'baseInfo'"
      ref="form"
      :size="layoutStore.defaultFormItemSize"
      :model="formData"
      :rules="rules"
      @submit.prevent
      label-position="top"
    >
      <el-form-item
        label="表单路由"
        prop="routerName"
        v-if="flowEntryComputed.bindFormType === SysFlowEntryBindFormType.ROUTER_FORM"
      >
        <el-input v-model="formData.routerName" clearable @change="updateElementFormKey" />
      </el-form-item>
      <el-form-item
        label="在线表单"
        prop="formId"
        v-if="flowEntryComputed.bindFormType === SysFlowEntryBindFormType.ONLINE_FORM"
      >
        <el-select
          v-model="formData.formId"
          clearable
          placeholder=""
          @change="updateElementFormKey"
        >
          <el-option
            v-for="item in formList().filter((item:ANY_OBJECT) => item.formType === SysOnlineFormType.FLOW)"
            :key="item.formId"
            :label="item.formName"
            :value="item.formId"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="允许编辑" style="margin-bottom: 4px">
            <template #label>
              <span>允许编辑</span>
              <el-switch
                v-model="formData.editable"
                @change="updateElementFormKey"
                style="margin-left: 18px"
              />
            </template>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            v-if="flowEntryComputed.bindFormType === SysFlowEntryBindFormType.ONLINE_FORM"
          >
            <template #label>
              <span>表单权限设置</span>
              <el-button
                type="primary"
                size="mini"
                style="margin-left: 18px"
                @click="onSetOnlineFormAuth"
                >设置</el-button
              >
            </template>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row v-else-if="tabType === 'button'" style="padding-top: 3px">
      <!-- <el-col :span="24">
        <el-divider>按钮设置</el-divider>
      </el-col> -->
      <el-col :span="24">
        <vxe-table
          :data="formOperationList"
          :row-config="{ isHover: true }"
          header-cell-class-name="table-header-gray"
        >
          <vxe-column title="序号" width="70px" type="seq" />
          <vxe-column title="按钮名称" min-width="100px">
            <template v-slot="scope">
              <span style="font-size: 12px">{{ scope.row.label }}</span>
            </template>
          </vxe-column>
          <vxe-column title="按钮类型" min-width="100px">
            <template v-slot="scope">
              <el-tag :size="layoutStore.defaultFormItemSize" effect="dark">{{
                SysFlowTaskOperationType.getValue(scope.row.type)
              }}</el-tag>
            </template>
          </vxe-column>
          <!-- <vxe-column title="显示顺序" min-width="100px" prop="showOrder"></vxe-column> -->
          <vxe-column title="操作" width="95px">
            <template v-slot="scope">
              <el-button
                :size="layoutStore.defaultFormItemSize"
                link
                type="primary"
                @click="onEditOperation(scope.row)"
                style="padding: 0"
                >编辑</el-button
              >
              <el-button
                :size="layoutStore.defaultFormItemSize"
                link
                type="danger"
                @click="onDeleteOperation(scope.row)"
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
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { getUUID } from '@/common/utils/index';
import { ElMessageBox, ElMessage } from 'element-plus';
import { VxeTable, VxeColumn } from 'vxe-table';
import { ANY_OBJECT } from '@/types/generic';
import { Dialog } from '@/components/Dialog';
import { SysOnlineFormType } from '@/common/staticDict/index';
import { SysFlowEntryBindFormType, SysFlowTaskOperationType } from '@/common/staticDict/flow';
import EditOperation from './formEditOperation.vue';
import FormSetOnlineFormAuth from './formSetOnlineFormAuth.vue';
import { useLayoutStore } from '@/store';

const layoutStore = useLayoutStore();

const props = defineProps<{ id: string; type: string; tabType: string }>();
const flowEntry = inject('flowEntry', () => {
  console.warn('flowFormConfig not inject flowEntry yet.');
  return {} as ANY_OBJECT;
});
console.log('flowEntry()', flowEntry());
const formList = inject('formList', () => {
  console.warn('flowFormConfig not inject formList yet.');
  return {} as ANY_OBJECT;
});
console.log('formList()', formList());
const prefix = inject('prefix');

const win: ANY_OBJECT = window;

const form = ref();
const formData = ref<ANY_OBJECT>({
  formId: flowEntry().value.defaultFormId,
  routerName: flowEntry().value.defaultRouterName,
  formAuth: {},
  editable: false,
});
const operationList = ref<ANY_OBJECT>({});
const formOperationList = ref<ANY_OBJECT[]>([]);
const rules = {
  formId: [{ required: true, message: '请选择在线表单！', trigger: 'blur' }],
  routerName: [{ required: true, message: '表单路由不能为空！', trigger: 'blur' }],
};

let bpmnElement: ANY_OBJECT = {};

const flowEntryComputed = computed(() => {
  console.log('flowEntryComputed', flowEntry().value);
  return flowEntry().value;
});
const getFlowEntryValidStatus = computed(() => {
  if (
    flowEntry().value.extensionData &&
    Array.isArray(flowEntry().value.extensionData.approvalStatusDict)
  ) {
    return flowEntry().value.extensionData.approvalStatusDict;
  } else {
    return [];
  }
});

const currentForm = computed(() => {
  return formList().find((item: ANY_OBJECT) => item.formId === formData.value.formId);
});

const formatOnlineFormInfo = formInfo => {
  if (formInfo == null) return null;
  let children;
  if (Array.isArray(formInfo.childWidgetList) && formInfo.childWidgetList.length > 0) {
    children = formInfo.childWidgetList.map(subWidget => formatOnlineFormInfo(subWidget));
  }
  return {
    formId: getUUID(),
    showName: formInfo.showName,
    variableName: formInfo.variableName,
    widgetType: formInfo.widgetType,
    children: children,
  };
};

const onSetOnlineFormAuth = () => {
  if (currentForm.value == null) {
    ElMessage.error('请先选择表单！');
    return;
  }
  let formWidgetConfig = JSON.parse(currentForm.value.widgetJson);
  let tempConfig = {
    pc: {
      widgetList: [],
    },
    mobile: {
      widgetList: [],
    },
  };
  if (formWidgetConfig != null) {
    if (
      formWidgetConfig.pc &&
      Array.isArray(formWidgetConfig.pc.widgetList) &&
      formWidgetConfig.pc.widgetList.length > 0
    ) {
      tempConfig.pc = {
        widgetList: formWidgetConfig.pc.widgetList.map(subWidget =>
          formatOnlineFormInfo(subWidget),
        ),
      };
    }
    if (
      formWidgetConfig.mobile &&
      Array.isArray(formWidgetConfig.mobile.widgetList) &&
      formWidgetConfig.mobile.widgetList.length > 0
    ) {
      tempConfig.mobile = {
        widgetList: formWidgetConfig.mobile.widgetList.map(subWidget =>
          formatOnlineFormInfo(subWidget),
        ),
      };
    }
  }
  console.log(tempConfig);
  Dialog.show<ANY_OBJECT>(
    '设置表单权限',
    FormSetOnlineFormAuth,
    {
      area: ['1000px', '700px'],
    },
    {
      formAuth: formData.value.formAuth || {},
      formWidgetConfig: tempConfig,
      path: 'thirdSetOnlineFormAuth',
    },
    {
      width: '1000px',
      height: '700px',
      pathName: '/thirdParty/formSetOnlineFormAuth',
    },
  )
    .then(res => {
      formData.value.formAuth = res;
      updateElementFormKey();
    })
    .catch(e => {
      console.warn(e);
    });
};

const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdEditOperation' && data.isSuccess) {
    updateEditOperation(data.data);
  } else if (data.path === 'thirdSetOnlineFormAuth' && data.isSuccess) {
    formData.value.formAuth = data.data;
    updateElementFormKey();
  }
};
const resetFormList = () => {
  bpmnElement = win.bpmnInstances.bpmnElement;
  let formKey = bpmnElement.businessObject.formKey;
  let formObj = formKey ? JSON.parse(formKey) : undefined;
  if (formObj) {
    formData.value = {
      formId: formObj.formId,
      routerName: formObj.routerName,
      formAuth: formObj.formAuth || {},
      editable: !formObj.readOnly,
      groupType: formObj.groupType || 'ASSIGNEE',
    };
  }
  let elExtensionElements =
    bpmnElement.businessObject.get('extensionElements') ||
    win.bpmnInstances.moddle.create('bpmn:ExtensionElements', { values: [] });
  operationList.value =
    elExtensionElements.values.filter(
      (ex: ANY_OBJECT) => ex.$type === `${prefix}:OperationList`,
    )?.[0] || win.bpmnInstances.moddle.create(`${prefix}:OperationList`, { operationList: [] });
  formOperationList.value = JSON.parse(JSON.stringify(operationList.value.operationList || []));
  formOperationList.value.forEach(item => {
    item.showOrder = Number.parseInt(item.showOrder);
  });
  // 更新元素扩展属性，避免后续报错
  updateElementFormKey();
  updateElementExtensions();
};
const updateElementFormKey = () => {
  console.log('updateElementFormKey');
  form.value?.validate((valid: boolean) => {
    if (!valid) return;
    let formKeyString = JSON.stringify({
      formId:
        flowEntry().value.bindFormType === SysFlowEntryBindFormType.ONLINE_FORM
          ? formData.value.formId
          : undefined,
      routerName:
        flowEntry().value.bindFormType === SysFlowEntryBindFormType.ONLINE_FORM
          ? undefined
          : formData.value.routerName,
      formAuth: formData.value.formAuth,
      readOnly: !formData.value.editable,
      groupType: formData.value.groupType || 'ASSIGNEE',
    });
    win.bpmnInstances.modeling.updateProperties(bpmnElement, {
      formKey: formKeyString,
    });
  });
};
const updateElementExtensions = () => {
  // 更新回扩展元素
  let elExtensionElements =
    bpmnElement.businessObject.get('extensionElements') ||
    win.bpmnInstances.moddle.create('bpmn:ExtensionElements', { values: [] });
  let otherExtensions = elExtensionElements.values.filter(
    (ex: ANY_OBJECT) => ex.$type !== `${prefix}:OperationList`,
  );
  const newElExtensionElements = win.bpmnInstances.moddle.create(`bpmn:ExtensionElements`, {
    values: otherExtensions.concat(operationList.value),
  });
  operationList.value.operationList = formOperationList.value.map((item: ANY_OBJECT) => {
    return win.bpmnInstances.moddle.create(`${prefix}:FormOperation`, {
      id: item.id,
      label: item.label,
      type: item.type,
      showOrder: item.showOrder,
      latestApprovalStatus: item.latestApprovalStatus,
      multiSignAssignee: item.multiSignAssignee,
    });
  });

  // 更新到元素上
  win.bpmnInstances.modeling.updateProperties(bpmnElement, {
    extensionElements: newElExtensionElements,
  });
};
const onEditOperation = (operation: ANY_OBJECT) => {
  Dialog.show<ANY_OBJECT>(
    operation ? '编辑按钮' : '添加按钮',
    EditOperation,
    {
      area: '500px',
    },
    {
      rowData: operation,
      validStatusList: getFlowEntryValidStatus,
      path: 'thirdEditOperation',
    },
    {
      width: '500px',
      height: '450px',
      pathName: '/thirdParty/thirdEditOperation',
    },
  )
    .then(res => {
      updateEditOperation(res);
    })
    .catch(e => {
      console.warn(e);
    });
};
const updateEditOperation = (res: ANY_OBJECT) => {
  //console.log('>>> updateEditOperation', res);
  if (res.id == null) {
    res.id = new Date().getTime();
    formOperationList.value.push(res);
  } else {
    formOperationList.value.forEach(item => {
      if (item.id === res.id) {
        item.label = res.label;
        item.type = res.type;
        item.showOrder = res.showOrder;
        item.multiSignAssignee = res.multiSignAssignee;
        item.latestApprovalStatus = res.latestApprovalStatus;
      }
    });
  }
  formOperationList.value.sort((value1: ANY_OBJECT, value2: ANY_OBJECT) => {
    return value1.showOrder - value2.showOrder;
  });
  updateElementExtensions();
};
const onDeleteOperation = (operation: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此按钮？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      formOperationList.value = formOperationList.value.filter(item => {
        return item.id !== operation.id;
      });
      updateElementExtensions();
    })
    .catch(e => {
      console.warn(e);
    });
};

watch(
  () => props.id,
  val => {
    val && val.length && nextTick(() => resetFormList());
  },
  {
    immediate: true,
  },
);

defineExpose({ refreshData, onEditOperation });
</script>

<style lang="scss" scoped>
.full-line-btn {
  width: 100%;
  margin-top: 10px;
  border: 1px dashed #ebeef5;
}
.el-tag {
  color: #ffb800;
  background: #fff8e5;
  border-color: #fff8e5;
}
:deep(.table-btn) {
  color: #999;
}
</style>

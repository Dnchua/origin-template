<template>
  <div class="online-work-flow-form" style="position: relative; height: 100%; min-height: 200px">
    <div class="form-box" :style="{ 'min-height': isEdit ? height : '0px' }">
      <el-scrollbar style="height: 100%" class="custom-scroll">
        <component
          :is="mode === 'pc' ? ElForm : VanForm"
          ref="componentRef"
          :model="formData"
          class="full-width-input"
          :rules="rules"
          style="width: 100%"
          :label-width="(form.labelWidth || 100) + 'px'"
          :label-position="form.labelPosition || 'right'"
          :size="layoutStore.defaultFormItemSize"
          @submit.prevent
        >
          <OnlineCustomBlock
            v-show="isReady"
            ref="root"
            v-model:value="form.widgetList"
            :height="height"
            :isEdit="isEdit"
            :showBorder="false"
            @widgetClick="onWidgetClick"
          />
        </component>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Form as VanForm } from 'vant';
import { ElForm } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import { post, get } from '@/common/http/request';
import OnlineCustomBlock from '@/online/components/OnlineCustomBlock.vue';
import { OnlineFormEventType } from '@/common/staticDict';
import { FlowOperationController } from '@/api/flow';
import { SysOnlineRelationType } from '@/common/staticDict/online';
import widgetData from '@/online/config/index';
import { useLayoutStore, useLoginStore } from '@/store';
import { useDict } from '../../hooks/useDict';
import { useForm } from '../hooks/useForm';
import { useFormExpose } from '../hooks/useFormExpose';

const layoutStore = useLayoutStore();

const emit = defineEmits<{
  widgetClick: [ANY_OBJECT | null];
}>();

const props = withDefaults(
  defineProps<{
    formConfig: ANY_OBJECT;
    height?: string;
    flowInfo?: ANY_OBJECT;
    // 是否表单编辑模式
    isEdit?: boolean;
    readOnly?: boolean;
    // 当前选中组件
    currentWidget?: ANY_OBJECT | null;
    // 是否全屏弹窗
    fullscreen?: boolean;
    mode?: string;
  }>(),
  {
    isEdit: false,
    readOnly: false,
    fullscreen: false,
    flowInfo: undefined,
    mode: 'pc',
  },
);

const componentRef = ref();

const { getDictDataList } = useDict();

const {
  isReady,
  form,
  rules,
  masterTable,
  formData,
  formAuth,
  richEditWidgetList,
  tableWidgetList,
  getWidgetValue,
  getWidgetVisible,
  onValueChange,
  onWidgetValueChange,
  getPrimaryData,
  getDropdownParams,
  checkOperationPermCode,
  checkOperationDisabled,
  checkOperationVisible,
  cloneWidget,
  handlerOperation,
  loadOnlineFormConfig,
  getTableData,
  setTableData,
  initPage,
  initFormWidgetList,
  initWidgetRule,
  initWidgetLinkage,
} = useForm(props);

provide('form', () => {
  console.log('provide form6', props, form);
  return {
    ...form.value,
    mode: props.mode || 'pc',
    isEdit: props.isEdit,
    readOnly: props.readOnly,
    formData: formData,
    getWidgetValue: getWidgetValue,
    getWidgetVisible: getWidgetVisible,
    onValueChange: onValueChange,
    onWidgetValueChange: onWidgetValueChange,
    getTableData: getTableData,
    setTableData: setTableData,
    getPrimaryData: getPrimaryData,
    getDropdownParams: getDropdownParams,
    checkOperationPermCode: checkOperationPermCode,
    checkOperationDisabled: checkOperationDisabled,
    checkOperationVisible: checkOperationVisible,
    cloneWidget: cloneWidget,
    handlerOperation: handlerOperation,
    getDictDataList: getDictDataList,
    loadOnlineFormConfig: loadOnlineFormConfig,
    flowData: props.flowInfo,
    isActive: (widget: ANY_OBJECT) => {
      return props.currentWidget === widget;
    },
    getWidgetObject: widgetData.getWidgetObject,
    instanceData: () => useFormExpose(formData),
    formAuth: () => {
      return formAuth.value;
    },
  };
});

const onWidgetClick = (widget: ANY_OBJECT | null) => {
  console.log('OnlineWorkFlowForm onWidgetClick', widget);
  emit('widgetClick', widget);
};

const isDraft = computed(() => {
  return props.flowInfo ? props.flowInfo.isDraft || props.flowInfo.isDraft === 'true' : false;
});

const initFormData = () => {
  if (props.flowInfo == null || props.flowInfo.processInstanceId == null) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let params = {
      processInstanceId: props.flowInfo?.processInstanceId,
      taskId: props.flowInfo?.taskId,
    };
    // 判断是展示历史流程的数据还是待办流程的数据
    let httpCall = null;
    if (isDraft.value) {
      // 草稿数据
      httpCall = FlowOperationController.viewOnlineDraftData({
        processDefinitionKey: props.flowInfo?.processDefinitionKey,
        processInstanceId: props.flowInfo?.processInstanceId,
      });
    } else if (props.flowInfo?.messageId != null) {
      // 抄送消息
      httpCall = FlowOperationController.viewOnlineCopyBusinessData({
        messageId: props.flowInfo.messageId,
      });
    } else {
      httpCall =
        props.flowInfo?.taskId != null && props.flowInfo?.isRuntime
          ? FlowOperationController.viewUserTask(params)
          : FlowOperationController.viewHistoricProcessInstance(params);
    }
    httpCall
      .then(res => {
        // 流程数据
        let masterData = (res.data || {})[masterTable.value?.datasource?.variableName] || {};
        // 初始化表单字段
        let relationNameList = new Map();
        let datasourceName: string;
        form.value.tableMap.forEach((table: ANY_OBJECT) => {
          if (table.relation) {
            if (table.relation.relationType === SysOnlineRelationType.ONE_TO_ONE || isDraft.value) {
              relationNameList.set(table.relation.variableName, table.relation);
            } else {
              relationNameList.set(table.relation.variableName + 'List', table.relation);
            }
            if (table.relation.relationType === SysOnlineRelationType.ONE_TO_ONE) {
              formData[table.relation.variableName] = table.columnList.reduce(
                (retObj: ANY_OBJECT, column: ANY_OBJECT) => {
                  retObj[column.columnName] = undefined;
                  return retObj;
                },
                {},
              );
            } else {
              formData[table.relation.variableName] = [];
            }
          } else if (table.relation == null) {
            datasourceName = table.datasource.variableName;
          }
        });
        Object.keys(masterData).forEach(key => {
          let relation = relationNameList.get(key);
          let relationVariableName = (relation || {}).variableName;
          if (relationVariableName == null) {
            // 主表字段
            formData[datasourceName][key] = masterData[key];
          } else {
            // 从表字段
            if (masterData[key]) {
              if (!Array.isArray(masterData[key])) {
                formData[relationVariableName] = {
                  ...formData[relationVariableName],
                  ...masterData[key],
                };
              } else {
                formData[relationVariableName] = masterData[key];
              }
            }
          }
        });
        relationNameList.clear();
        resolve(true);
      })
      .catch(e => {
        reject(e);
      });
  });
};

const viewTaskFormKey = () => {
  if (
    props.flowInfo == null ||
    props.flowInfo.taskId == null ||
    props.flowInfo.taskId === '' ||
    props.flowInfo.processInstanceId == null ||
    props.flowInfo.processInstanceId === ''
  ) {
    return Promise.resolve();
  }
  let paraams = {
    processInstanceId: props.flowInfo.processInstanceId,
    taskId: props.flowInfo.taskId,
  };
  return new Promise<void>((resolve, reject) => {
    FlowOperationController.viewTaskFormKey(paraams)
      .then(res => {
        try {
          let temp = JSON.parse(res.data);
          formAuth.value = temp.formAuth;
          Object.keys(formAuth.value || {}).forEach(key => {
            let formAuthItem = formAuth.value[key];
            Object.keys(formAuthItem).forEach(subKey => {
              let authItem = formAuthItem[subKey];
              if (authItem && authItem != null && authItem !== '') {
                formAuthItem[subKey] = authItem.split(',').map(item => parseInt(item));
              } else {
                formAuthItem[subKey] = [0, 0];
              }
              let disabled = formAuthItem[subKey][0] === 1;
              let hide = formAuthItem[subKey][1] === 1;
              formAuthItem[subKey].disabled = disabled;
              formAuthItem[subKey].hide = hide;
            });
          });
          console.log(formAuth.value);
        } catch (e) {
          formAuth.value = null;
        }
        resolve();
      })
      .catch(e => {
        reject(e);
      });
  });
};

onMounted(() => {
  isReady.value = false;
  if (!props.isEdit) {
    viewTaskFormKey().then(() => {
      initWidgetRule();
      initFormData()
        .then(() => {
          initWidgetLinkage();
          setTimeout(() => {
            componentRef.value.clearValidate();
          });
        })
        .catch((e: Error) => {
          console.warn(e);
        });
      isReady.value = true;
    });
  } else {
    isReady.value = true;
  }
});

const getFormDataImpl = (variableList: ANY_OBJECT[] | null = null) => {
  // 将formData传递到函数内，vue3中没有this指针了
  let tempObj: ANY_OBJECT = { formData };
  console.log('OnlineWorkFlowForm getFormDataImpl 1', tempObj);
  // 获取表单数据
  form.value.tableMap.forEach((table: ANY_OBJECT) => {
    if (table.relation) {
      if (tempObj.slaveData == null) tempObj.slaveData = {};
      tempObj.slaveData[table.relation.variableName] = formData[table.relation.variableName];
    } else if (table.relation == null) {
      tempObj.masterData = formData[table.datasource.variableName];
    }
  });
  // 获取流程变量
  if (variableList && variableList.value) {
    variableList.value.forEach(variable => {
      if (!variable.builtin) {
        let column = form.value.columnMap.get(variable.bindColumnId);
        let relation = form.value.relationMap.get(variable.bindRelationId);
        if (column != null) {
          if (tempObj.taskVariableData == null) tempObj.taskVariableData = {};
          if (relation == null) {
            tempObj.taskVariableData[variable.variableName] =
              formData[masterTable.value.datasource.variableName][column.columnName] || '';
          } else {
            tempObj.taskVariableData[variable.variableName] =
              formData[relation.variableName][column.columnName] || '';
          }
        }
      }
    });
  }
  console.log('OnlineWorkFlowForm getFormDataImpl 2', tempObj);
  if (tempObj == null) return null;
  // 把slaveData里的relationVariableName替换成relationId
  if (tempObj.slaveData) {
    let slaveDataKeyList = Object.keys(tempObj.slaveData);
    if (slaveDataKeyList.length > 0) {
      let relationVariableNameMap = new Map();
      form.value.tableMap.forEach((table: ANY_OBJECT) => {
        if (table.relation != null) {
          relationVariableNameMap.set(table.relation.variableName, table.relation.relationId);
        }
      });
      slaveDataKeyList.forEach(key => {
        let relationId = relationVariableNameMap.get(key);
        if (relationId != null) {
          tempObj.slaveData[relationId] = tempObj.slaveData[key];
        }
        tempObj.slaveData[key] = undefined;
      });
    }
  }

  console.log('OnlineWorkFlowForm getFormDataImpl 3', tempObj);
  return tempObj;
};
const getFormData = (isDraft: boolean, variableList: ANY_OBJECT[]) => {
  // 获取富文本内容
  if (richEditWidgetList && !props.readOnly) {
    richEditWidgetList.forEach(richWidget => {
      if (richWidget && richWidget.widgetImpl) {
        onValueChange(richWidget, richWidget.widgetImpl.getHtml());
      }
    });
  }
  return new Promise((resolve, reject) => {
    console.log('getFormData isDraft  >>>>>>>>>>>>>>', isDraft);
    if (isDraft) {
      resolve(getFormDataImpl());
    } else {
      nextTick(() => {
        componentRef.value.validate((valid: boolean) => {
          console.log('getFormData valid  >>>>>>>>>>>>>>', valid, componentRef, variableList);
          if (!valid) return reject();
          resolve(getFormDataImpl(variableList));
        });
      });
    }
  });
};

defineExpose({
  getFormData,
});
</script>

<style scoped>
.online-work-flow-form {
  display: flex;
  flex-direction: column;
}
.online-work-flow-form .info {
  position: absolute;
  top: 30%;
  width: 100%;
  text-align: center;
  vertical-align: middle;
}
.form-box {
  flex-grow: 1;
  flex-shrink: 1;
  height: 300px;
}
.menu-box {
  flex-grow: 0;
  flex-shrink: 0;
}
</style>

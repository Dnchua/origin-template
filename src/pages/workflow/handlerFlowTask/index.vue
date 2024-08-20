<template>
  <HandlerFlowTask
    ref="handlerFlowTaskRef"
    :processInstanceId="dialogParams.processInstanceId"
    :processDefinitionId="dialogParams.processDefinitionId"
    :flowEntryName="dialogParams.flowEntryName"
    :processInstanceInitiator="dialogParams.processInstanceInitiator"
    :taskId="dialogParams.taskId"
    :taskName="dialogParams.taskName"
    :operationList="dialogParams.operationList"
    :isRuntime="isRuntime"
    :isDraft="isDraft"
    @close="handlerClose"
    @start="handlerStart"
    @submit="handlerOperation"
    @draft="handlerDraft"
  >
    <!-- 在线表单页面 -->
    <WorkflowForm
      v-if="dialogParams.routerName == null && dialogParams.formId != null"
      ref="workflowFormRef"
      style="width: 100%"
      :style="{ height: mainContextHeight - 188 + 'px' }"
      :formId="dialogParams.formId"
      :readOnly="readOnly"
      :flowInfo="getFlowInfo"
    />
    <!-- 路由页面 -->
    <router-view v-slot:="{ Component, route }">
      <component
        :is="Component"
        ref="routerFlowForm"
        :key="route.path"
        style="width: 100%"
        :isRuntimeTask="isRuntime"
        :isDraft="isDraft"
        :readOnly="readOnly"
        :processInstanceId="dialogParams.processInstanceId"
        :taskId="dialogParams.taskId"
        :taskVariableList="variableList"
      />
    </router-view>
  </HandlerFlowTask>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus';
import WorkflowForm from '@/pages/online/OnlinePageRender/index.vue';
import { FlowOperationController } from '@/api/flow';
import { ANY_OBJECT } from '@/types/generic';
import { SysFlowTaskOperationType } from '@/common/staticDict/flow';
import { useMessage } from '@/store';
import HandlerFlowTask from '../components/HandlerFlowTask.vue';
import { useFlowAction } from './hook';
import { IProp } from './types';

const props: IProp = defineProps<IProp>();

const mainContextHeight = inject('mainContextHeight', 200);

const workflowFormRef = ref();
const routerFlowForm = ref();

const isStart = ref(false);
// 保存草稿后流程taskId
const draftTaskId = ref<string>();
// 保存草稿后流程实例ID
const draftProcessInstanceId = ref<string>();
// 在线表单页面数据
const formData = ref<ANY_OBJECT>();
// 在线表单页面一对多数据
const oneToManyRelationData = ref<ANY_OBJECT>();

const { handlerFlowTaskRef, preHandlerOperation, submitConsign, handlerClose, dialogParams } =
  useFlowAction(props);

const isOnlineForm = computed(() => {
  return !!dialogParams.value.formId;
});

const isDraft = computed(() => {
  return typeof dialogParams.value.isDraft === 'string'
    ? dialogParams.value.isDraft === 'true'
    : dialogParams.value.isDraft;
});
const isPreview = computed(() => {
  return typeof dialogParams.value.isPreview === 'string'
    ? dialogParams.value.isPreview === 'true'
    : dialogParams.value.isPreview;
});
const isRuntime = computed(() => {
  return typeof dialogParams.value.isRuntime === 'string'
    ? dialogParams.value.isRuntime === 'true'
    : dialogParams.value.isRuntime;
});
const readOnly = computed(() => {
  return typeof dialogParams.value.readOnly === 'string'
    ? dialogParams.value.readOnly === 'true'
    : dialogParams.value.readOnly;
});

const getFlowInfo = computed(() => {
  return {
    processInstanceId: dialogParams.value.processInstanceId,
    taskId: dialogParams.value.taskId,
    processDefinitionKey: dialogParams.value.processDefinitionKey,
    processInstanceInitiator: dialogParams.value.processInstanceInitiator,
    messageId: dialogParams.value.messageId,
    isRuntime: isRuntime.value,
    isDraft: isDraft.value,
  };
});
const variableList = computed(() => {
  let temp = dialogParams.value.variableList;
  const variableList = Array.isArray(temp) ? temp : JSON.parse(temp || '[]');
  return variableList;
});

const messageStore = useMessage();

/**
 * 获得路由组件下的函数
 * @param {string} functionName 函数名称
 * @returns {function}
 */
const getRouterCompomentFunction = (functionName: string) => {
  return routerFlowForm.value && typeof routerFlowForm.value[functionName] === 'function'
    ? routerFlowForm.value[functionName]
    : undefined;
};
/**
 * 获取表单数据
 */
const getMasterData = (
  operationType: string,
  assignee: string | Array<string> | undefined,
): Promise<ANY_OBJECT> => {
  return new Promise((resolve, reject) => {
    // TODO workflowFormRef.value.getFormData无须判断
    if (isOnlineForm.value && workflowFormRef.value.getFormData) {
      workflowFormRef.value
        .getFormData(false, variableList)
        .then((formData: ANY_OBJECT | null) => {
          console.log('handleerFlowTask.getMasterData 表单数据', formData);
          if (formData == null) {
            reject();
            return;
          }
          const assigneeArr =
            assignee && assignee !== '' ? (assignee as string).split(',') : undefined;
          if (operationType === SysFlowTaskOperationType.MULTI_SIGN) {
            // 会签操作设置多实例处理人集合
            if (formData.taskVariableData == null) formData.taskVariableData = {};
            formData.taskVariableData.assigneeList = assigneeArr;
          } else if (operationType === SysFlowTaskOperationType.SET_ASSIGNEE) {
            // 设置下一个任务节点处理人
            if (formData.taskVariableData == null) formData.taskVariableData = {};
            formData.taskVariableData.appointedAssignee = assigneeArr
              ? assigneeArr.join(',')
              : undefined;
          }
          resolve(formData);
        })
        .catch((e: Error) => {
          reject(e);
        });
    } else {
      // 获得静态表单页面的getMasterData函数
      let funGetMasterData = getRouterCompomentFunction('getMasterData');
      return funGetMasterData ? funGetMasterData(variableList) : reject();
    }
  });
};
const preHandlerOperationThen = (
  operation: ANY_OBJECT,
  copyItemList: Array<ANY_OBJECT>,
  res: ANY_OBJECT | null,
) => {
  // 加签、减签操作
  if (
    operation.type === SysFlowTaskOperationType.CO_SIGN ||
    operation.type === SysFlowTaskOperationType.SIGN_REDUCTION
  ) {
    submitConsign((res || {}).assignee, operation.type === SysFlowTaskOperationType.CO_SIGN)
      .then(() => {
        handlerClose();
      })
      .catch(e => {
        console.warn(e);
      });
    return;
  }
  // 驳回操作
  if (
    operation.type === SysFlowTaskOperationType.REJECT ||
    operation.type === SysFlowTaskOperationType.REJECT_TO_TASK
  ) {
    FlowOperationController.rejectRuntimeTask({
      processInstanceId: dialogParams.value.processInstanceId,
      taskId: dialogParams.value.taskId,
      targetTaskKey: (res || {}).targetTaskKey,
      taskComment: (res || {}).message,
      taskVariableData: {
        latestApprovalStatus: operation.latestApprovalStatus,
      },
    })
      .then(() => {
        handlerClose();
      })
      .catch(e => {
        console.warn(e);
      });
    return;
  }
  // 驳回到起点
  if (operation.type === SysFlowTaskOperationType.REJECT_TO_START) {
    FlowOperationController.rejectToStartUserTask({
      processInstanceId: dialogParams.value.processInstanceId,
      taskId: dialogParams.value.taskId,
      taskComment: (res || {}).message,
      taskVariableData: {
        latestApprovalStatus: operation.latestApprovalStatus,
      },
    })
      .then(() => {
        handlerClose();
      })
      .catch(e => {
        console.warn(e);
      });
    return;
  }
  // 撤销操作
  if (operation.type === SysFlowTaskOperationType.REVOKE) {
    ElMessageBox.confirm('是否撤销此任务？', '', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        FlowOperationController.revokeHistoricTask({
          processInstanceId: dialogParams.value.processInstanceId,
          taskId: dialogParams.value.taskId,
          taskComment: '任务处理人撤销任务',
          taskVariableData: {
            latestApprovalStatus: operation.latestApprovalStatus,
          },
        })
          .then(() => {
            handlerClose();
          })
          .catch(e => {
            console.warn(e);
          });
      })
      .catch(e => {
        console.warn(e);
      });
    return;
  }
  getMasterData(operation.type, (res || {}).assignee).then(formData => {
    let params = {
      taskId: dialogParams.value.taskId || draftTaskId.value,
      processInstanceId: dialogParams.value.processInstanceId || draftProcessInstanceId.value,
      masterData: formData.masterData,
      slaveData: formData.slaveData,
      flowTaskCommentDto: {
        taskComment: (res || {}).message,
        approvalType: operation.type,
        delegateAssignee:
          operation.type === SysFlowTaskOperationType.TRANSFER ? (res || {}).assignee : undefined,
      },
      taskVariableData: {
        ...formData.taskVariableData,
        latestApprovalStatus: operation.latestApprovalStatus,
      },
      copyData: (copyItemList || []).reduce((retObj, item) => {
        retObj[item.type] = item.id;
        return retObj;
      }, {}),
    };

    FlowOperationController.submitUserTask(params)
      .then(() => {
        handlerClose();
        messageStore.reloadMessage();
        ElMessage.success('提交成功！');
      })
      .catch(e => {
        console.warn(e);
      });
  });
};
/**
 * 流程操作
 * @param {Object} operation 流程操作
 */
const handlerOperation = (
  operation: ANY_OBJECT,
  copyItemList: ANY_OBJECT[],
  xml?: string | undefined,
) => {
  if (isOnlineForm.value) {
    preHandlerOperation(operation, isStart.value || isDraft.value, xml, copyItemList)
      .then(res => {
        preHandlerOperationThen(operation, copyItemList, res);
      })
      .catch(e => {
        console.warn(e);
      });
  } else {
    let funHandlerOperation = getRouterCompomentFunction('handlerOperation');
    if (funHandlerOperation) {
      funHandlerOperation(operation, copyItemList, xml)
        .then(() => {
          handlerClose();
        })
        .catch((e: Error) => {
          console.warn(e);
        });
    } else {
      ElMessage.error('当前流程并未实现处理功能，请联系管理员！');
    }
  }
};
/**
 * 启动流程
 */
const handlerStart = (
  operation: ANY_OBJECT,
  copyItemList: ANY_OBJECT[],
  xml?: string | undefined,
) => {
  // 启动并保存草稿后再次提交
  if (draftProcessInstanceId.value != null && draftTaskId.value != null) {
    handlerOperation(operation, copyItemList, xml);
    return;
  }
  if (!isOnlineForm.value) {
    let funHandlerStart = getRouterCompomentFunction('handlerStart');
    if (funHandlerStart != null) {
      funHandlerStart(operation, copyItemList, xml)
        .then(() => {
          handlerClose();
        })
        .catch((e: Error) => {
          console.warn(e);
        });
    } else {
      ElMessage.error('当前流程并未实现启动功能，请联系管理员！');
    }
  } else {
    preHandlerOperation(operation, true, xml)
      .then(res => {
        getMasterData(operation.type, (res || {}).assignee)
          .then(formData => {
            FlowOperationController.startAndTakeUserTask(
              {
                processDefinitionKey: dialogParams.value.processDefinitionKey,
                masterData: formData.masterData || {},
                slaveData: formData.slaveData,
                taskVariableData: {
                  ...formData.taskVariableData,
                  latestApprovalStatus: operation.latestApprovalStatus,
                },
                flowTaskCommentDto: {
                  approvalType: operation.type,
                },
                copyData: (copyItemList || []).reduce((retObj, item) => {
                  retObj[item.type] = item.id;
                  return retObj;
                }, {}),
              },
              {
                // 判断是否是从流程设计里启动
                processDefinitionKey: isPreview.value
                  ? undefined
                  : dialogParams.value.processDefinitionKey,
              },
            )
              .then(() => {
                handlerClose();
                ElMessage.success('启动成功！');
              })
              .catch(e => {
                console.warn(e);
              });
          })
          .catch(e => {
            console.warn(e);
          });
      })
      .catch(e => {
        console.warn(e);
      });
  }
};

/**
 * 获得草稿数据
 */
const getDraftData = () => {
  return new Promise<ANY_OBJECT>((resolve, reject) => {
    workflowFormRef.value
      .getFormData(true)
      .then((res: ANY_OBJECT) => {
        resolve(res);
      })
      .catch((e: Error) => {
        reject(e);
      });
  });
};

/**
 * 保存草稿
 */
const handlerDraft = () => {
  if (isOnlineForm.value) {
    getDraftData()
      .then(formData => {
        if (formData == null) {
          return;
        }
        let params = {
          processDefinitionKey: dialogParams.value.processDefinitionKey,
          processInstanceId: dialogParams.value.processInstanceId || draftProcessInstanceId.value,
          masterData: formData.masterData,
          slaveData: formData.slaveData,
        };
        FlowOperationController.startAndSaveDraft(params, {
          processDefinitionKey: dialogParams.value.processDefinitionKey,
        })
          .then(res => {
            ElMessage.success('草稿保存成功！');
            draftProcessInstanceId.value = res.data.processInstanceId;
            draftTaskId.value = res.data.taskId;
          })
          .catch(e => {
            console.warn(e);
          });
      })
      .catch(e => {
        console.warn(e);
      });
  } else {
    let funHandlerOperation = getRouterCompomentFunction('handlerDraft');
    if (funHandlerOperation) {
      funHandlerOperation().catch((e: Error) => {
        console.warn(e);
      });
    } else {
      ElMessage.error('当前流程并未实现保存草稿，请联系管理员！');
    }
  }
};

/**
 * 初始化流程表单数据
 */
const initFormData = () => {
  if (
    dialogParams.value.processInstanceId == null ||
    dialogParams.value.processInstanceId === '' ||
    dialogParams.value.formId == null
  ) {
    return;
  }
  if (isOnlineForm.value) {
    let params = {
      processInstanceId: dialogParams.value.processInstanceId,
      taskId: dialogParams.value.taskId,
    };
    // 判断是展示历史流程的数据还是待办流程的数据
    let httpCall: ANY_OBJECT | null = null;
    if (isDraft.value) {
      // 草稿数据
      httpCall = FlowOperationController.viewOnlineDraftData({
        processDefinitionKey: dialogParams.value.processDefinitionKey,
        processInstanceId: dialogParams.value.processInstanceId,
      });
    } else if (dialogParams.value.messageId != null) {
      // 抄送消息
      httpCall = FlowOperationController.viewOnlineCopyBusinessData({
        messageId: dialogParams.value.messageId,
      });
    } else {
      httpCall =
        dialogParams.value.taskId != null && isRuntime.value
          ? FlowOperationController.viewUserTask(params)
          : FlowOperationController.viewHistoricProcessInstance(params);
    }
    httpCall
      .then(res => {
        isStart.value = res.data == null;
        // 一对多数据
        oneToManyRelationData.value = (res.data || {}).oneToMany;
        // 草稿一对多数据，添加唯一主键
        if (isDraft.value) {
          if (oneToManyRelationData.value != null) {
            let tempTime = new Date().getTime();
            Object.keys(oneToManyRelationData.value).forEach(key => {
              const oneToManyRelationDataValue = oneToManyRelationData.value
                ? oneToManyRelationData.value[key]
                : null;
              if (Array.isArray(oneToManyRelationDataValue)) {
                oneToManyRelationDataValue.forEach(item => {
                  item.__cascade_add_id__ = tempTime++;
                });
              }
            });
          }
        }
        // 主表数据以及一对一关联数据
        if ((res.data || {}).masterAndOneToOne != null) {
          formData.value = {
            ...res.data.masterAndOneToOne,
          };
        }
      })
      .catch(e => {
        console.warn(e);
      });
  } else {
    let funInitFormData = getRouterCompomentFunction('initFormData');
    funInitFormData
      ? funInitFormData()
      : ElMessage.error('当前流程并未实现页面初始化功能，请联系管理员！');
  }
};

onMounted(() => {
  initFormData();
});

const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdTaskCommit' && data.isSuccess) {
    preHandlerOperationThen(data.rowData.operation, data.rowData.copyItemList, data.data);
  }
};

defineExpose({
  refreshData,
});
</script>

<style scoped>
.task-title {
  display: flex;
  justify-content: space-between;
  padding-bottom: 5px;
  margin-bottom: 10px;
  border-bottom: 3px solid #409eff;
}
.task-title .text {
  height: 28px;
  line-height: 28px;
  font-weight: 600;
  font-size: 16px;
  color: #383838;
}
.task-title .el-tag {
  margin-left: 10px;
}
</style>

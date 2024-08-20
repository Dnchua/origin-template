import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import { FlowOperationController } from '@/api/flow';
import { Dialog } from '@/components/Dialog';
import { SysFlowTaskOperationType } from '@/common/staticDict/flow';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { useLayoutStore } from '@/store';
import TaskCommit from '../components/TaskCommit.vue';
import { IProp } from './types';

export const useFlowAction = (props: IProp) => {
  const layoutStore = useLayoutStore();
  const router = useRouter();
  const route = useRoute();
  const handlerFlowTaskRef = ref();
  const { thirdParams } = useThirdParty(props);

  const dialogParams = computed(() => {
    console.log('dialogParams props', props);
    return {
      isRuntime: props.isRuntime === 'true' || thirdParams.value.isRuntime || false,
      isDraft: props.isDraft === 'true' || thirdParams.value.isDraft || false,
      isPreview: props.isPreview === 'true' || thirdParams.value.isPreview || false,
      processDefinitionKey: props.processDefinitionKey || thirdParams.value.processDefinitionKey,
      formId: props.formId || thirdParams.value.formId,
      routerName: props.routerName || thirdParams.value.routerName,
      readOnly: props.readOnly === 'true' || thirdParams.value.readOnly,
      messageId: props.messageId || thirdParams.value.messageId,
      processInstanceId: props.processInstanceId || thirdParams.value.processInstanceId,
      processDefinitionId: props.processDefinitionId || thirdParams.value.processDefinitionId,
      taskId: props.taskId || thirdParams.value.taskId,
      flowEntryName: props.flowEntryName || thirdParams.value.flowEntryName,
      processInstanceInitiator:
        props.processInstanceInitiator || thirdParams.value.processInstanceInitiator,
      taskName: props.taskName || thirdParams.value.taskName,
      operationList:
        typeof props.operationList == 'string'
          ? JSON.parse(props.operationList)
          : props.operationList, // || thirdParams.value.operationList,
      variableList:
        typeof props.variableList == 'string'
          ? JSON.parse(props.variableList)
          : props.variableList || thirdParams.value.variableList,
    };
  });
  // 加签
  const submitConsign = (assignee: Array<string> | string, isAdd = true) => {
    return new Promise((resolve, reject) => {
      const params = {
        taskId: dialogParams.value.taskId,
        processInstanceId: dialogParams.value.processInstanceId,
        newAssignees: Array.isArray(assignee) ? assignee : assignee.split(','),
        isAdd,
      };

      FlowOperationController.submitConsign(params)
        .then(() => {
          ElMessage.success(isAdd ? '加签成功！' : '减签成功！');
          resolve(true);
        })
        .catch(e => {
          console.warn('加签异常', e);
          reject();
        });
    });
  };
  // 关闭流程处理
  const handlerClose = () => {
    if (props.dialog) {
      props.dialog.cancel();
    } else {
      route.meta.refreshParentCachedPage = true;
      router.go(-1);
    }
  };
  // 预处理工作流操作
  const preHandlerOperation = (
    operation: ANY_OBJECT | null,
    isStart: boolean,
    xml: string | undefined,
    copyItemList: Array<ANY_OBJECT> | null = null,
  ) => {
    return new Promise<ANY_OBJECT | null>((resolve, reject) => {
      if (operation == null) {
        isStart ? resolve(null) : reject();
        return;
      }
      // 撤销操作不弹出选择窗口
      let showCommitDig =
        (!isStart && operation.type !== SysFlowTaskOperationType.REVOKE) ||
        operation.type === SysFlowTaskOperationType.SET_ASSIGNEE;
      if (operation.type === SysFlowTaskOperationType.MULTI_SIGN) {
        showCommitDig =
          !operation.multiSignAssignee ||
          !Array.isArray(operation.multiSignAssignee.assigneeList) ||
          operation.multiSignAssignee.assigneeList.length <= 0;
      }
      if (showCommitDig) {
        let title = '提交';
        if (!isStart) {
          switch (operation.type) {
            case SysFlowTaskOperationType.CO_SIGN:
            case SysFlowTaskOperationType.SIGN_REDUCTION:
              title = SysFlowTaskOperationType.getValue(operation.type);
              break;
            default:
              title = '审批';
              break;
          }
        }
        Dialog.show<ANY_OBJECT>(
          title,
          TaskCommit,
          {
            area: '500px',
          },
          {
            operation,
            rowData: {
              copyItemList,
              operation,
            },
            copyItemList,
            processInstanceId: dialogParams.value.processInstanceId,
            taskId: dialogParams.value.taskId,
            xml: xml,
            finishedInfo: (handlerFlowTaskRef.value || {}).finishedInfo,
            path: 'thirdTaskCommit',
          },
          {
            width: '500px',
            height: '380px',
            pathName: '/thirdParty/thirdTaskCommit',
          },
        )
          .then(res => {
            resolve(res);
          })
          .catch(e => {
            reject(e);
          });
      } else {
        resolve(null);
      }
    });
  };

  return {
    handlerFlowTaskRef,
    dialogParams,
    submitConsign,
    handlerClose,
    preHandlerOperation,
  };
};

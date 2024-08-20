import { DialogProp } from '@/components/Dialog/types';
import { ThirdProps } from '@/components/thirdParty/types';
import { ANY_OBJECT } from '@/types/generic';

export interface IProp extends ThirdProps {
  isRuntime?: boolean | string;
  isDraft?: boolean | string;
  isPreview?: boolean | string;
  // 流程标识
  processDefinitionKey: string;
  // 在线表单formId
  formId?: string;
  // 路由名称
  routerName?: string;
  // 只读页面
  readOnly: boolean | string;
  // 消息id，用于抄送消息回显
  messageId?: string;
  // 流程实例id
  processInstanceId?: string;
  // 流程定义id
  processDefinitionId?: string;
  // 当前任务节点id
  taskId?: string;
  // 流程名称
  flowEntryName: string;
  // 发起人
  processInstanceInitiator?: string;
  // 当前任务节点名称
  taskName?: string;
  // 当前任务节点操作列表
  operationList?: Array<ANY_OBJECT> | string;
  // 当前任务节点变量列表
  variableList?: Array<ANY_OBJECT> | string;
  // 弹窗句柄
  dialog?: DialogProp<ANY_OBJECT>;
}

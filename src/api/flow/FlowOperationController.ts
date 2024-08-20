import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class FlowOperationController extends BaseController {
  // 保存草稿
  static startAndSaveDraft(params: ANY_OBJECT, httpOptions?: RequestOption) {
    let url = API_CONTEXT + '/flow/flowOnlineOperation/startAndSaveDraft';
    if (httpOptions && httpOptions.processDefinitionKey) {
      url += '/' + httpOptions.processDefinitionKey;
    }
    return super.post<ANY_OBJECT>(url, params, httpOptions);
  }
  // 获取在线表单工作流草稿数据
  static viewOnlineDraftData(params: ANY_OBJECT, httpOptions?: RequestOption) {
    const url = API_CONTEXT + '/flow/flowOnlineOperation/viewDraftData';
    return super.get<ANY_OBJECT>(url, params, httpOptions);
  }
  // 启动流程实例并且提交表单信息
  static startAndTakeUserTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    let url = API_CONTEXT + '/flow/flowOnlineOperation/startAndTakeUserTask';
    if (httpOptions && httpOptions.processDefinitionKey) {
      url += '/' + httpOptions.processDefinitionKey;
    } else {
      // 从流程设计里启动
      url = API_CONTEXT + '/flow/flowOnlineOperation/startPreview';
    }
    return super.post(url, params, httpOptions);
  }
  // 获得流程以及工单信息
  static listWorkOrder(params: ANY_OBJECT, httpOptions?: RequestOption) {
    let url = API_CONTEXT + '/flow/flowOnlineOperation/listWorkOrder';
    if (httpOptions && httpOptions.processDefinitionKey) {
      url += '/' + httpOptions.processDefinitionKey;
    }
    return super.post<TableData<ANY_OBJECT>>(url, params, httpOptions);
  }
  // 提交用户任务数据
  static submitUserTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/flow/flowOnlineOperation/submitUserTask',
      params,
      httpOptions,
    );
  }
  // 获取历史流程数据
  static viewHistoricProcessInstance(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/flow/flowOnlineOperation/viewHistoricProcessInstance',
      params,
      httpOptions,
    );
  }
  // 获取用户任务数据
  static viewUserTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/flow/flowOnlineOperation/viewUserTask',
      params,
      httpOptions,
    );
  }
  // 获取在线表单工作流以及工作流下表单列表
  static listFlowEntryForm(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT[]>(
      API_CONTEXT + '/flow/flowOnlineOperation/listFlowEntryForm',
      params,
      httpOptions,
    );
  }
  // 获得草稿信息
  static viewDraftData(params: ANY_OBJECT, httpOptions?: RequestOption) {
    const url = API_CONTEXT + '/flow/flowOperation/viewDraftData';
    return super.get<ANY_OBJECT>(url, params, httpOptions);
  }
  // 撤销工单
  static cancelWorkOrder(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowOperation/cancelWorkOrder', params, httpOptions);
  }
  // 多实例加签
  static submitConsign(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowOperation/submitConsign', params, httpOptions);
  }
  // 已办任务列表
  static listHistoricTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/flow/flowOperation/listHistoricTask',
      params,
      httpOptions,
    );
  }
  // 获取已办任务信息
  static viewHistoricTaskInfo(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/flow/flowOperation/viewHistoricTaskInfo',
      params,
      httpOptions,
    );
  }
  // 仅启动流程实例
  static startOnly(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowOperation/startOnly', params, httpOptions);
  }
  // 获得流程定义初始化用户任务信息
  static viewInitialTaskInfo(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/flow/flowOperation/viewInitialTaskInfo',
      params,
      httpOptions,
    );
  }
  // 获取待办任务信息
  static viewRuntimeTaskInfo(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/flow/flowOperation/viewRuntimeTaskInfo',
      params,
      httpOptions,
    );
  }
  // 获取流程实例审批历史
  static listFlowTaskComment(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT[]>(
      API_CONTEXT + '/flow/flowOperation/listFlowTaskComment',
      params,
      httpOptions,
    );
  }
  // 获取历史任务信息
  static viewInitialHistoricTaskInfo(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/flow/flowOperation/viewInitialHistoricTaskInfo',
      params,
      httpOptions,
    );
  }
  // 获取所有待办任务
  static listRuntimeTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/flow/flowOperation/listRuntimeTask',
      params,
      httpOptions,
    );
  }
  // 获得流程实例审批路径
  static viewHighlightFlowData(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/flow/flowOperation/viewHighlightFlowData',
      params,
      httpOptions,
    );
  }
  // 获得流程实例的配置XML
  static viewProcessBpmn(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<string>(
      API_CONTEXT + '/flow/flowOperation/viewProcessBpmn',
      params,
      httpOptions,
    );
  }
  // 获得所有历史流程实例
  static listAllHistoricProcessInstance(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/flow/flowOperation/listAllHistoricProcessInstance',
      params,
      httpOptions,
    );
  }
  // 获得当前用户历史流程实例
  static listHistoricProcessInstance(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/flow/flowOperation/listHistoricProcessInstance',
      params,
      httpOptions,
    );
  }
  // 终止流程
  static stopProcessInstance(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowOperation/stopProcessInstance', params, httpOptions);
  }
  // 删除流程实例
  static deleteProcessInstance(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/flow/flowOperation/deleteProcessInstance',
      params,
      httpOptions,
    );
  }
  // 催办
  static remindRuntimeTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowOperation/remindRuntimeTask', params, httpOptions);
  }
  // 催办消息列表
  static listRemindingTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/flow/flowMessage/listRemindingTask',
      params,
      httpOptions,
    );
  }
  // 驳回
  static rejectRuntimeTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowOperation/rejectRuntimeTask', params, httpOptions);
  }
  // 驳回到起点
  static rejectToStartUserTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/flow/flowOperation/rejectToStartUserTask',
      params,
      httpOptions,
    );
  }
  // 撤销
  static revokeHistoricTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowOperation/revokeHistoricTask', params, httpOptions);
  }
  // 抄送消息列表
  static listCopyMessage(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/flow/flowMessage/listCopyMessage',
      params,
      httpOptions,
    );
  }
  // 消息个数
  static getMessageCount(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/flow/flowMessage/getMessageCount',
      params,
      httpOptions,
    );
  }
  // 在线表单流程抄送消息数据
  static viewOnlineCopyBusinessData(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/flow/flowOnlineOperation/viewCopyBusinessData',
      params,
      httpOptions,
    );
  }
  // 静态表单流程抄送消息数据
  static viewCopyBusinessData(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/flow/flowOperation/viewCopyBusinessData',
      params,
      httpOptions,
    );
  }
  // 获取指定任务处理人列表
  static viewTaskUserInfo(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT[]>(
      API_CONTEXT + '/flow/flowOperation/viewTaskUserInfo',
      params,
      httpOptions,
    );
  }
  // 获取驳回历史任务列表
  static listRejectCandidateUserTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/flow/flowOperation/listRejectCandidateUserTask',
      params,
      httpOptions,
    );
  }
  // 获取多实例任务中会签人员列表
  static listMultiSignAssignees(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/flow/flowOperation/listMultiSignAssignees',
      params,
      httpOptions,
    );
  }
  // 获取所有任务列表
  static listAllUserTask(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT[]>(
      API_CONTEXT + '/flow/flowOperation/listAllUserTask',
      params,
      httpOptions,
    );
  }
  // 获取用户任务信息
  static viewTaskFormKey(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/flow/flowOperation/viewTaskFormKey',
      params,
      httpOptions,
    );
  }
}

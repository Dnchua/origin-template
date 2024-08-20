import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class FlowEntryController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/flow/flowEntry/list',
      params,
      httpOptions,
    );
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(API_CONTEXT + '/flow/flowEntry/view', params, httpOptions);
  }

  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowEntry/add', params, httpOptions);
  }

  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowEntry/update', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowEntry/delete', params, httpOptions);
  }

  static publish(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowEntry/publish', params, httpOptions);
  }

  static listFlowEntryPublish(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/flow/flowEntry/listFlowEntryPublish',
      params,
      httpOptions,
    );
  }

  static updateMainVersion(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowEntry/updateMainVersion', params, httpOptions);
  }

  static suspendFlowEntryPublish(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/flow/flowEntry/suspendFlowEntryPublish', params, httpOptions);
  }

  static activateFlowEntryPublish(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/flow/flowEntry/activateFlowEntryPublish',
      params,
      httpOptions,
    );
  }

  static viewDict(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(API_CONTEXT + '/flow/flowEntry/viewDict', params, httpOptions);
  }

  static listDict(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/flow/flowEntry/listDict',
      params,
      httpOptions,
    );
  }

  static listAll(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>('/admin/flow/flowEntry/listAll', params, httpOptions);
  }
}

import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { TableData } from '@/common/types/table';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export default class OnlineRuleController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/online/onlineRule/list',
      params,
      httpOptions,
    );
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(API_CONTEXT + '/online/onlineRule/view', params, httpOptions);
  }

  //   static export(sender, params, fileName) {
  //     return sender.download(API_CONTEXT + '/online/onlineRule/export', params, fileName);
  //   }

  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineRule/add', params, httpOptions);
  }

  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineRule/update', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineRule/delete', params, httpOptions);
  }
}

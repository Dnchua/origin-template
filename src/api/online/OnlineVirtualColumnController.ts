import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { TableData } from '@/common/types/table';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export default class OnlineVirtualColumnController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/online/onlineVirtualColumn/list',
      params,
      httpOptions,
    );
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/online/onlineVirtualColumn/view',
      params,
      httpOptions,
    );
  }

  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineVirtualColumn/add', params, httpOptions);
  }

  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineVirtualColumn/update', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineVirtualColumn/delete', params, httpOptions);
  }
}

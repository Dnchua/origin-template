import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { Dict } from '@/types/online/dict';
import { API_CONTEXT } from '../config';

export default class OnlineDictController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<Dict>>(
      API_CONTEXT + '/online/onlineDict/list',
      params,
      httpOptions,
    );
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<Dict>(API_CONTEXT + '/online/onlineDict/view', params, httpOptions);
  }

  //   static export(sender, params, fileName) {
  //     return sender.download(API_CONTEXT +  '/online/onlineDict/export', params, fileName);
  //   }

  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineDict/add', params, httpOptions);
  }

  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineDict/update', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineDict/delete', params, httpOptions);
  }

  static listAllGlobalDict(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<Dict>>(
      API_CONTEXT + '/online/onlineDict/listAllGlobalDict',
      params,
      httpOptions,
    );
  }
}

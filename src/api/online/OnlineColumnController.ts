import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { ColumnInfo } from '@/types/online/column';
import { API_CONTEXT } from '../config';

export default class OnlineColumnController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ColumnInfo>>(
      API_CONTEXT + '/online/onlineColumn/list',
      params,
      httpOptions,
    );
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ColumnInfo>(API_CONTEXT + '/online/onlineColumn/view', params, httpOptions);
  }

  //   static export(sender, params, fileName) {
  //     return sender.download(API_CONTEXT +  '/online/onlineColumn/export', params, fileName);
  //   }

  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineColumn/add', params, httpOptions);
  }

  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineColumn/update', params, httpOptions);
  }

  static refreshColumn(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineColumn/refresh', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineColumn/delete', params, httpOptions);
  }

  static listOnlineColumnRule(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/online/onlineColumn/listOnlineColumnRule',
      params,
      httpOptions,
    );
  }

  static listNotInOnlineColumnRule(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/online/onlineColumn/listNotInOnlineColumnRule',
      params,
      httpOptions,
    );
  }

  static addOnlineColumnRule(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlineColumn/addOnlineColumnRule',
      params,
      httpOptions,
    );
  }

  static deleteOnlineColumnRule(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlineColumn/deleteOnlineColumnRule',
      params,
      httpOptions,
    );
  }

  static updateOnlineColumnRule(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlineColumn/updateOnlineColumnRule',
      params,
      httpOptions,
    );
  }

  static viewOnlineColumnRule(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/online/onlineColumn/viewOnlineColumnRule',
      params,
      httpOptions,
    );
  }
}

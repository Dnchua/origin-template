import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { FormPage } from '@/types/online/page';
import { API_CONTEXT } from '../config';

export default class OnlinePageController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<FormPage>>(
      API_CONTEXT + '/online/onlinePage/list',
      params,
      httpOptions,
    );
  }

  static listAllPageAndForm(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(
      API_CONTEXT + '/online/onlinePage/listAllPageAndForm',
      params,
      httpOptions,
    );
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<FormPage>(API_CONTEXT + '/online/onlinePage/view', params, httpOptions);
  }

  //   static export(sender, params, fileName) {
  //     return sender.download(API_CONTEXT + '/online/onlinePage/export', params, fileName);
  //   }

  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<string>(API_CONTEXT + '/online/onlinePage/add', params, httpOptions);
  }

  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<string>(API_CONTEXT + '/online/onlinePage/update', params, httpOptions);
  }

  static updatePublished(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlinePage/updatePublished', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlinePage/delete', params, httpOptions);
  }

  static updateStatus(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlinePage/updateStatus', params, httpOptions);
  }

  static listOnlinePageDatasource(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/online/onlinePage/listOnlinePageDatasource',
      params,
      httpOptions,
    );
  }

  static listNotInOnlinePageDatasource(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlinePage/listNotInOnlinePageDatasource',
      params,
      httpOptions,
    );
  }

  static addOnlinePageDatasource(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlinePage/addOnlinePageDatasource',
      params,
      httpOptions,
    );
  }

  static deleteOnlinePageDatasource(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlinePage/deleteOnlinePageDatasource',
      params,
      httpOptions,
    );
  }

  static updateOnlinePageDatasource(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlinePage/updateOnlinePageDatasource',
      params,
      httpOptions,
    );
  }

  static viewOnlinePageDatasource(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(
      API_CONTEXT + '/online/onlinePage/viewOnlinePageDatasource',
      params,
      httpOptions,
    );
  }
}

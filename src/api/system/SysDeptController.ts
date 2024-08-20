import { BaseController } from '@/api/BaseController';
import { RequestOption, TableData } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { SysDept, SysDeptPost } from '@/types/upms/department';
import { API_CONTEXT } from '../config';

export default class SysDeptController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<SysDept>>(API_CONTEXT + '/upms/sysDept/list', params, httpOptions);
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<SysDept>(API_CONTEXT + '/upms/sysDept/view', params, httpOptions);
  }

  static export(params: ANY_OBJECT, fileName: string) {
    return super.download(API_CONTEXT + '/upms/sysDept/export', params, fileName);
  }

  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysDept/add', params, httpOptions);
  }

  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysDept/update', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysDept/delete', params, httpOptions);
  }

  static listNotInSysDeptPost(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<SysDeptPost>>(
      API_CONTEXT + '/upms/sysDept/listNotInSysDeptPost',
      params,
      httpOptions,
    );
  }

  static listSysDeptPost(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<SysDeptPost>>(
      API_CONTEXT + '/upms/sysDept/listSysDeptPost',
      params,
      httpOptions,
    );
  }

  static addSysDeptPost(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysDept/addSysDeptPost', params, httpOptions);
  }

  static updateSysDeptPost(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysDept/updateSysDeptPost', params, httpOptions);
  }

  static deleteSysDeptPost(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysDept/deleteSysDeptPost', params, httpOptions);
  }

  static viewSysDeptPost(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(API_CONTEXT + '/upms/sysDept/viewSysDeptPost', params, httpOptions);
  }
}

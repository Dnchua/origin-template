import { BaseController } from '@/api/BaseController';
import { RequestOption, TableData } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { Post } from '@/types/upms/post';
import { API_CONTEXT } from '../config';

export default class SysPostController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<Post>>(API_CONTEXT + '/upms/sysPost/list', params, httpOptions);
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<Post>(API_CONTEXT + '/upms/sysPost/view', params, httpOptions);
  }

  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysPost/add', params, httpOptions);
  }

  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysPost/update', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysPost/delete', params, httpOptions);
  }
}

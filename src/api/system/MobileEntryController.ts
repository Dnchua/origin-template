import { BaseController } from '@/api/BaseController';
import { RequestOption, TableData } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export default class MobileEntryController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/mobile/mobileEntry/list',
      params,
      httpOptions,
    );
  }

  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(API_CONTEXT + '/mobile/mobileEntry/view', params, httpOptions);
  }

  //   static export(sender, params, fileName) {
  //     return sender.download(API_CONTEXT +  '/mobile/mobileEntry/export', params, fileName);
  //   }

  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/mobile/mobileEntry/add', params, httpOptions);
  }

  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/mobile/mobileEntry/update', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/mobile/mobileEntry/delete', params, httpOptions);
  }

  static uploadImage(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/mobile/mobileEntry/uploadImage', params, httpOptions);
  }

  static downloadImage(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/mobile/mobileEntry/downloadImage', params, httpOptions);
  }
}

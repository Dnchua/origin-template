import { post, get } from '@/common/http/request';
import { RequestOption, TableData } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { DictCode, DictCodeItem } from '@/types/upms/dict';
import { API_CONTEXT } from '../config';

type listAllItemType = {
  cachedResultList: DictCodeItem[];
  fullResultList: DictCodeItem[];
};

export default class SysGlobalDictController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return post<TableData<DictCode>>(API_CONTEXT + '/upms/globalDict/list', params, httpOptions);
  }

  static listAll(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return get<listAllItemType>(API_CONTEXT + '/upms/globalDict/listAll', params, httpOptions);
  }

  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return post<ANY_OBJECT>(API_CONTEXT + '/upms/globalDict/add', params, httpOptions);
  }

  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return post<ANY_OBJECT>(API_CONTEXT + '/upms/globalDict/update', params, httpOptions);
  }

  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return post(API_CONTEXT + '/upms/globalDict/delete', params, httpOptions);
  }

  static addItem(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return post(API_CONTEXT + '/upms/globalDict/addItem', params, httpOptions);
  }

  static updateItem(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return post(API_CONTEXT + '/upms/globalDict/updateItem', params, httpOptions);
  }

  static updateItemStatus(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return post(API_CONTEXT + '/upms/globalDict/updateItemStatus', params, httpOptions);
  }

  static deleteItem(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return post(API_CONTEXT + '/upms/globalDict/deleteItem', params, httpOptions);
  }

  static reloadCachedData(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return get(API_CONTEXT + '/upms/globalDict/reloadCachedData', params, httpOptions);
  }
}

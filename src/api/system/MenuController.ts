import { MenuItem } from '@/types/upms/menu';
import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export default class SystemMenuController extends BaseController {
  static getMenuPermList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<MenuItem[]>(API_CONTEXT + '/upms/sysMenu/list', params, httpOptions);
  }

  static addMenu(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysMenu/add', params, httpOptions);
  }

  static updateMenu(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysMenu/update', params, httpOptions);
  }

  static deleteMenu(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysMenu/delete', params, httpOptions);
  }

  static viewMenu(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<MenuItem>(API_CONTEXT + '/upms/sysMenu/view', params, httpOptions);
  }

  static listMenuPermCode(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT[]>(API_CONTEXT + '/upms/sysMenu/listMenuPerm', params, httpOptions);
  }

  static listSysPermByMenuIdWithDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT[]>(
      API_CONTEXT + '/upms/sysMenu/listSysPermWithDetail',
      params,
      httpOptions,
    );
  }

  static listSysUserByMenuIdWithDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT[]>(
      API_CONTEXT + '/upms/sysMenu/listSysUserWithDetail',
      params,
      httpOptions,
    );
  }
}

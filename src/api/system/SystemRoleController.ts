import { BaseController } from '@/api/BaseController';
import { RequestOption, TableData } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { Role } from '@/types/upms/role';
import { User } from '@/types/upms/user';
import { API_CONTEXT } from '../config';

export default class SystemRoleController extends BaseController {
  static getRoleList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<Role>>(API_CONTEXT + '/upms/sysRole/list', params, httpOptions);
  }

  static getRole(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<Role>(API_CONTEXT + '/upms/sysRole/view', params, httpOptions);
  }

  static deleteRole(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysRole/delete', params, httpOptions);
  }

  static addRole(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysRole/add', params, httpOptions);
  }

  static updateRole(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysRole/update', params, httpOptions);
  }

  /**
   * @param params    {roleId, searchString}
   */
  static listRoleUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<User>>(
      API_CONTEXT + '/upms/sysRole/listUserRole',
      params,
      httpOptions,
    );
  }

  static listNotInUserRole(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<User>>(
      API_CONTEXT + '/upms/sysRole/listNotInUserRole',
      params,
      httpOptions,
    );
  }

  /**
   * @param params    {roleId, userIdListString}
   */
  static addRoleUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysRole/addUserRole', params, httpOptions);
  }

  /**
   * @param params    {roleId, userId}
   */
  static deleteRoleUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysRole/deleteUserRole', params, httpOptions);
  }
}

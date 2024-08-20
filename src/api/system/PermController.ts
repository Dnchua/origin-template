import { BaseController } from '@/api/BaseController';
import { RequestOption, TableData } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { MenuItem } from '@/types/upms/menu';
import { Perm, PermModule } from '@/types/upms/perm';
import { Role } from '@/types/upms/role';
import { User } from '@/types/upms/user';
import { API_CONTEXT } from '../config';

export default class PermController extends BaseController {
  static getPermList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<Perm>>(API_CONTEXT + '/upms/sysPerm/list', params, httpOptions);
  }

  static viewPerm(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(API_CONTEXT + '/upms/sysPerm/view', params, httpOptions);
  }

  static addPerm(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysPerm/add', params, httpOptions);
  }

  static updatePerm(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysPerm/update', params, httpOptions);
  }

  static deletePerm(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysPerm/delete', params, httpOptions);
  }

  static getAllPermList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT[]>(
      API_CONTEXT + '/upms/sysPermModule/listAll',
      params,
      httpOptions,
    );
  }

  static getPermGroupList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<PermModule[]>(API_CONTEXT + '/upms/sysPermModule/list', params, httpOptions);
  }

  static addPermGroup(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysPermModule/add', params, httpOptions);
  }

  static updatePermGroup(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysPermModule/update', params, httpOptions);
  }

  static deletePermGroup(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysPermModule/delete', params, httpOptions);
  }

  static listSysUserByPermIdWithDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<User[]>(
      API_CONTEXT + '/upms/sysPerm/listSysUserWithDetail',
      params,
      httpOptions,
    );
  }

  static listSysRoleByPermIdWithDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<Role[]>(
      API_CONTEXT + '/upms/sysPerm/listSysRoleWithDetail',
      params,
      httpOptions,
    );
  }

  static listSysMenuByPermIdWithDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<MenuItem[]>(
      API_CONTEXT + '/upms/sysPerm/listSysMenuWithDetail',
      params,
      httpOptions,
    );
  }

  static listSysPermByRoleIdWithDetail(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<TableData<Perm>>(
      API_CONTEXT + '/upms/sysRole/listSysPermWithDetail',
      params,
      httpOptions,
    );
  }
}

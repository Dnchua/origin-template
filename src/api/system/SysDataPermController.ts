import { BaseController } from '@/api/BaseController';
import { RequestOption, TableData } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { PermData } from '@/types/upms/permdata';
import { User } from '@/types/upms/user';
import { API_CONTEXT } from '../config';

export default class SysDataPermController extends BaseController {
  /**
   * @param params    {dataPermId, dataPermName, deptIdListString}
   */
  static add(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysDataPerm/add', params, httpOptions);
  }

  /**
   * @param params    {dataPermId, dataPermName, deptIdListString}
   */
  static update(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysDataPerm/update', params, httpOptions);
  }

  /**
   * @param params    {dataPermId}
   */
  static delete(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysDataPerm/delete', params, httpOptions);
  }

  /**
   * @param params    {dataPermName}
   */
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<PermData>>(
      API_CONTEXT + '/upms/sysDataPerm/list',
      params,
      httpOptions,
    );
  }

  /**
   * @param params    {dataPermId}
   */
  static view(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<PermData>(API_CONTEXT + '/upms/sysDataPerm/view', params, httpOptions);
  }

  /**
   * @param params    {dataPermId, searchString}
   */
  static listDataPermUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<User>>(
      API_CONTEXT + '/upms/sysDataPerm/listDataPermUser',
      params,
      httpOptions,
    );
  }

  /**
   * @param params    {dataPermId, userIdListString}
   */
  static addDataPermUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysDataPerm/addDataPermUser', params, httpOptions);
  }

  /**
   * @param params    {dataPermId, userId}
   */
  static deleteDataPermUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/sysDataPerm/deleteDataPermUser', params, httpOptions);
  }

  static listNotInDataPermUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<User>>(
      API_CONTEXT + '/upms/sysDataPerm/listNotInDataPermUser',
      params,
      httpOptions,
    );
  }
}

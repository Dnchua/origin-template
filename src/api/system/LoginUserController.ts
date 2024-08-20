import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { OnlineUser } from '@/types/upms/user';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class LoginUserController extends BaseController {
  // 在线用户查询
  static listSysLoginUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<OnlineUser>>(
      API_CONTEXT + '/upms/loginUser/list',
      params,
      httpOptions,
    );
  }
  // 强退
  static deleteSysLoginUser(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/loginUser/delete', params, httpOptions);
  }
}

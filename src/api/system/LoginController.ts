import { loginParam, LoginUserInfo } from '@/types/upms/login';
import { UserInfo } from '@/types/upms/user';
import { BaseController } from '@/api/BaseController';
import { RequestOption, TableData } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export default class LoginController extends BaseController {
  static login(params: loginParam) {
    return super.post<UserInfo>(API_CONTEXT + '/upms/login/doLogin', params);
  }

  static logout() {
    return super.post(API_CONTEXT + '/upms/login/doLogout', {});
  }

  static changePassword(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/upms/login/changePassword', params, httpOptions);
  }

  static changeHeadImageUrl() {
    return API_CONTEXT + '/upms/login/changeHeadImage';
  }
}

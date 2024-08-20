import { BaseController } from '@/api/BaseController';
import { RequestOption, TableData } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { PermCode } from '@/types/upms/permcode';
import { Role } from '@/types/upms/role';
import { User } from '@/types/upms/user';
import { API_CONTEXT } from '../config';

export default class PermCodeController extends BaseController {
  static getPermCodeList(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<PermCode[]>(API_CONTEXT + '/upms/login/getAllPermCodes', params, httpOptions);
  }
}

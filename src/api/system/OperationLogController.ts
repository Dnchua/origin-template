import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { TableData } from '@/common/types/table';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export default class OperationLogController extends BaseController {
  static listSysOperationLog(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/upms/sysOperationLog/list',
      params,
      httpOptions,
    );
  }
}

import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class SysCommonBizController extends BaseController {
  static list(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/commonext/bizwidget/list',
      params,
      httpOptions,
    );
  }
  static viewByIds(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT[]>(API_CONTEXT + '/commonext/bizwidget/view', params, httpOptions);
  }
}

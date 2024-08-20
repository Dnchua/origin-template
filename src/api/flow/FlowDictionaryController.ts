import { DictData, DictionaryBase } from '@/common/staticDict/types';
import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export default class FlowDictionaryController extends BaseController {
  static dictFlowCategory(
    params: ANY_OBJECT,
    httpOptions?: RequestOption,
  ): Promise<DictionaryBase> {
    return new Promise((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/flow/flowCategory/listDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}

import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';
import { TableData } from '@/common/types/table';
import { API_CONTEXT } from '../config';

export default class OnlineOperationController extends BaseController {
  static listDict(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT[]>(
      API_CONTEXT + '/online/onlineOperation/listDict',
      params,
      httpOptions,
    );
  }

  static listByDatasourceId(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/online/onlineOperation/listByDatasourceId',
      params,
      httpOptions,
    );
  }

  static listByOneToManyRelationId(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<TableData<ANY_OBJECT>>(
      API_CONTEXT + '/online/onlineOperation/listByOneToManyRelationId',
      params,
      httpOptions,
    );
  }

  static addDatasource(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(API_CONTEXT + '/online/onlineOperation/addDatasource', params, httpOptions);
  }

  static addOneToManyRelation(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlineOperation/addOneToManyRelation',
      params,
      httpOptions,
    );
  }

  static updateDatasource(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlineOperation/updateDatasource',
      params,
      httpOptions,
    );
  }

  static updateOneToManyRelation(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlineOperation/updateOneToManyRelation',
      params,
      httpOptions,
    );
  }

  static viewByDatasourceId(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/online/onlineOperation/viewByDatasourceId',
      params,
      httpOptions,
    );
  }

  static viewByOneToManyRelationId(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get<ANY_OBJECT>(
      API_CONTEXT + '/online/onlineOperation/viewByOneToManyRelationId',
      params,
      httpOptions,
    );
  }

  static deleteDatasource(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlineOperation/deleteDatasource',
      params,
      httpOptions,
    );
  }

  static deleteOneToManyRelation(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post(
      API_CONTEXT + '/online/onlineOperation/deleteOneToManyRelation',
      params,
      httpOptions,
    );
  }

  static getColumnRuleCode(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.get(
      API_CONTEXT + '/online/onlineOperation/getColumnRuleCode',
      params,
      httpOptions,
    );
  }

  static getPrintTemplate(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return super.post<ANY_OBJECT>(API_CONTEXT + '/report/reportPrint/listAll', params, httpOptions);
  }
}

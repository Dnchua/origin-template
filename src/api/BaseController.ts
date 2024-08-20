import { AxiosRequestConfig } from 'axios';
import { commonRequest, download, downloadBlob, upload } from '@/common/http/request';
import { RequestOption, RequestMethods } from '@/common/http/types';
import { ANY_OBJECT } from '@/types/generic';

export class BaseController {
  static async get<D>(
    url: string,
    params: ANY_OBJECT,
    options?: RequestOption,
    axiosOption?: AxiosRequestConfig,
  ) {
    return await commonRequest<D>(url, params, 'get', options, axiosOption);
  }
  static async post<D>(
    url: string,
    params: ANY_OBJECT,
    options?: RequestOption,
    axiosOption?: AxiosRequestConfig,
  ) {
    return await commonRequest<D>(url, params, 'post', options, axiosOption);
  }
  static download(
    url: string,
    params: ANY_OBJECT,
    filename: string,
    method?: RequestMethods,
    options?: RequestOption,
  ) {
    return download(url, params, filename, method, options);
  }
  static downloadBlob(
    url: string,
    params: ANY_OBJECT,
    method: RequestMethods = 'post',
    options?: RequestOption,
  ) {
    return downloadBlob(url, params, method, options);
  }
  static upload(url: string, params: ANY_OBJECT, options?: RequestOption) {
    return upload(url, params, options);
  }
}

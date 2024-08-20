import { Method } from 'axios';
import { ANY_OBJECT } from '@/types/generic';

export type RequestMethods = Extract<
  Method,
  'get' | 'post' | 'put' | 'delete' | 'patch' | 'option' | 'head'
>;

/**
 * @param showMask 是否显示Loading层
 * @param showError 是否显示错误消息
 * @param throttleFlag 是否节流
 * @param throttleTimeout 节流限制时长
 */
export type RequestOption = {
  /** 是否使用Mock请求 */
  mock?: boolean;
  showMask?: boolean;
  showError?: boolean;
  throttleFlag?: boolean;
  throttleTimeout?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

// 定义返回数据的类型
export type ResponseDataType<T> = {
  errorCode: string | null;
  data: T;
  errorMessage: string | null;
  success: boolean;
};

export type TableData<T> = {
  dataList: T[];
  totalCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

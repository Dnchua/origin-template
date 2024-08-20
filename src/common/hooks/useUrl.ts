import { ANY_OBJECT } from '@/types/generic';
import { objectToQueryString } from '../utils';

export const useUrlBuilder = () => {
  /**
   * 请求地址统一处理／组装
   * @param actionName 方法名称
   * @param params 请求参数
   * @returns 请求全路径（含参数）
   */
  const buildGetUrl = (actionName: string, params: ANY_OBJECT | null = null) => {
    const queryString = objectToQueryString(params);
    if (actionName != null && actionName !== '') {
      if (actionName.substring(0, 1) === '/') actionName = actionName.substring(1);
    }

    return (
      process.env.VUE_APP_SERVER_HOST + actionName + (queryString == null ? '' : '?' + queryString)
    );
  };

  /**
   * 请求地址统一处理／组装
   * @param actionName action方法名称
   */
  const requestUrl = (actionName: string) => {
    if (actionName) {
      if (actionName.substring(0, 1) === '/') actionName = actionName.substring(1);
    }
    if (actionName.indexOf('http://') === 0 || actionName.indexOf('https://') === 0) {
      return actionName;
    } else {
      return process.env.VUE_APP_SERVER_HOST + actionName;
    }
  };

  return { buildGetUrl, requestUrl };
};

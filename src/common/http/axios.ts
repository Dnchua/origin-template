import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from 'axios';
import JSONbig from 'json-bigint';
import { router } from '@/router';
import { getToken, setToken, getAppId } from '@/common/utils/index';
import { useLayoutStore } from '@/store';
import { Dialog } from '@/components/Dialog';
import { serverDefaultCfg } from './config';
import { ResponseDataType } from './types';

// 创建 axios 请求实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: serverDefaultCfg.baseURL, // 基础请求地址
  timeout: 30000, // 请求超时设置
  withCredentials: true, // 跨域请求是否需要携带 cookie
  headers: {
    //Accept: 'application/json, text/plain, */*',
    //'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json; charset=utf-8',
    deviceType: '4',
  },
  validateStatus: status => {
    return status === 200 || status === 401; // 放行哪些状态的请求
  },
  transformResponse: [
    function (data) {
      if (typeof data === 'string') {
        return JSONbig({ storeAsString: true }).parse(data);
      } else {
        return data;
      }
    },
  ],
});

// 创建请求拦截
axiosInstance.interceptors.request.use(
  config => {
    const token = getToken();
    const appId = getAppId();
    const currentMenuId = useLayoutStore().currentMenuId;
    if (token != null) config.headers['Authorization'] = token;
    if (appId != null && appId !== '') config.headers['AppCode'] = appId;
    if (currentMenuId != null) config.headers['MenuId'] = currentMenuId;
    return config;
  },
  error => {
    Promise.reject(error);
  },
);

const loginInvalid = () => {
  setToken(null);
  Dialog.closeAll();
  router.push({ name: 'login' });
};

// 创建响应拦截
axiosInstance.interceptors.response.use(
  <T>(response: AxiosResponse): AxiosPromise<ResponseDataType<T>> => {
    const { data, status } = response;
    // 如果401响应放行至此，执行此逻辑
    if (status === 401) {
      const appId = getAppId();
      if (appId == null) {
        loginInvalid();
      }
      return Promise.reject(new Error('您未登录，或者登录已经超时，请先登录！'));
    }
    if (response.data && response.data.errorCode === 'UNAUTHORIZED_LOGIN') {
      // 401, token失效
      const appId = getAppId();
      if (appId == null) {
        loginInvalid();
      } else {
        return Promise.reject(new Error(response.data.errorMessage));
      }
    } else {
      if (response.headers['refreshedtoken'] != null) {
        setToken(response.headers['refreshedtoken']);
      }
      // 判断请求是否成功
      if (!(response.data instanceof Blob) && !response.data.success) {
        return Promise.reject(new Error(response.data.errorMessage || 'error'));
      }
    }
    return data;
  },
  error => {
    //console.warn(error);
    let message = '';
    if (error && error.response) {
      switch (error.response.status) {
        case 302:
          message = '接口重定向了！';
          break;
        case 400:
          message = '参数不正确！';
          break;
        case 401:
          message = '您未登录，或者登录已经超时，请先登录！';
          break;
        case 403:
          message = '您没有权限操作！';
          break;
        case 404:
          message = `请求地址出错: ${error.response.config.url}`;
          break;
        case 408:
          message = '请求超时！';
          break;
        case 409:
          message = '系统已存在相同数据！';
          break;
        case 500:
          message = '服务器内部错误！';
          break;
        case 501:
          message = '服务未实现！';
          break;
        case 502:
          message = '网关错误！';
          break;
        case 503:
          message = '服务不可用！';
          break;
        case 504:
          message = '服务暂时无法访问，请稍后再试！';
          break;
        case 505:
          message = 'HTTP 版本不受支持！';
          break;
        default:
          message = '异常问题，请联系管理员！';
          break;
      }
      console.log('请求异常 ==>', message);
      return Promise.reject(new Error(message));
    } else {
      return Promise.reject(new Error(error.message));
    }
  },
);

export default axiosInstance;

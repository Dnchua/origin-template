import { ElMessage, ElLoading } from 'element-plus';
import { AxiosRequestConfig } from 'axios';
import { getAppId } from '@/common/utils/index';
import { ANY_OBJECT } from '@/types/generic';
import { useUrlBuilder } from '../hooks/useUrl';
import axiosInstance from './axios';
import { serverDefaultCfg } from './config';
import { RequestMethods, RequestOption, ResponseDataType } from './types';

const { requestUrl } = useUrlBuilder();
const globalConfig = {
  requestOption: {
    mock: false,
    // 调用的时候是否显示蒙版
    showMask: true,
    // 是否显示公共的错误提示
    showError: true,
    // 是否开启节流功能，同一个url不能频繁重复调用
    throttleFlag: false,
    // 节流间隔
    throttleTimeout: 50,
  } as RequestOption,
  axiosOption: {
    responseType: 'json',
  } as AxiosRequestConfig,
};

function showErrorMessage(message: string | { showClose: boolean; message: string }) {
  const appId = getAppId();
  if (appId != null && appId !== '') {
    if (window.parent) {
      window.parent.postMessage(
        {
          type: 'message',
          data: {
            type: 'error',
            text: message,
          },
        },
        '*',
      );
    }
  } else {
    ElMessage.error(message);
  }
}

/**
 * 遮罩管理，多次调用支持引用计数
 */
class LoadingManager {
  private options: ANY_OBJECT;
  private refCount: number;
  private loading: ReturnType<typeof ElLoading.service> | null;

  constructor(options: ANY_OBJECT) {
    this.options = options;
    this.refCount = 0;
    this.loading = null;
  }

  showMask() {
    this.refCount++;
    if (this.refCount <= 1 && this.loading == null) {
      this.loading = ElLoading.service(this.options);
    }
  }

  hideMask() {
    if (this.refCount <= 1 && this.loading != null) {
      this.loading.close();
      this.loading = null;
    }
    this.refCount--;
    this.refCount = Math.max(0, this.refCount);
  }
}

const loadingManager = new LoadingManager({
  fullscreen: true,
  background: 'rgba(0, 0, 0, 0.1)',
});

// url调用节流Set
const ajaxThrottleSet = new Set();

/**
 * 核心函数，可通过它处理一切请求数据，并做横向扩展
 * @param url 请求地址
 * @param params 请求参数
 * @param method 请求方法，只接受"get" | "delete" | "head" | "post" | "put" | "patch"
 * @param requestOption 请求配置(针对当前本次请求)
 * @param axiosOption axios配置(针对当前本次请求)
 */
export async function commonRequest<D>(
  url: string,
  params: ANY_OBJECT,
  method: RequestMethods,
  requestOption?: RequestOption,
  axiosOption?: AxiosRequestConfig,
): Promise<ResponseDataType<D>> {
  const finalOption = {
    ...globalConfig.requestOption,
    ...requestOption,
  };
  const { showMask, showError, throttleFlag, throttleTimeout } = finalOption;

  let finalUrl = url;
  // 通过mock平台可对局部接口进行mock设置
  if (finalOption.mock) finalUrl = serverDefaultCfg.mockURL;

  if (ajaxThrottleSet.has(finalUrl) && throttleFlag) {
    return Promise.reject();
  } else {
    if (throttleFlag) {
      ajaxThrottleSet.add(url);
      setTimeout(() => {
        ajaxThrottleSet.delete(url);
      }, throttleTimeout || 50);
    }

    const finalAxiosOption = {
      ...globalConfig.axiosOption,
      ...axiosOption,
    };

    // get请求使用params字段
    let data: ANY_OBJECT = { params };
    // 非get请求使用data字段
    if (method !== 'get') data = { data: params };

    if (showMask) loadingManager.showMask();
    try {
      const result: ResponseDataType<D> = await axiosInstance({
        url: finalUrl,
        method,
        ...data,
        ...finalAxiosOption,
      });
      if (result instanceof Blob || result.success) {
        return Promise.resolve(result);
      } else {
        if (showError) {
          showErrorMessage({
            showClose: true,
            message: result.errorMessage ? result.errorMessage : '数据请求失败',
          });
        }
        return Promise.reject(result);
      }
    } catch (error) {
      console.warn('请求异常', error);
      if (showError) {
        const err = error as Error;
        showErrorMessage({
          showClose: true,
          message: err ? err.message : '网络请求错误',
        });
      }
      return Promise.reject(error);
    } finally {
      loadingManager.hideMask();
    }
  }
}

/***
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 * @param axiosOption
 */
export const get = async <D>(
  url: string,
  params: ANY_OBJECT,
  options?: RequestOption,
  axiosOption?: AxiosRequestConfig,
) => {
  return await commonRequest<D>(url, params, 'get', options, axiosOption);
};
/***
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 * @param axiosOption
 */
export const post = async <D>(
  url: string,
  params: ANY_OBJECT,
  options?: RequestOption,
  axiosOption?: AxiosRequestConfig,
) => {
  return await commonRequest<D>(url, params, 'post', options, axiosOption);
};
/***
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 * @param axiosOption
 */
export const put = async <D>(
  url: string,
  params: ANY_OBJECT,
  options?: RequestOption,
  axiosOption?: AxiosRequestConfig,
) => {
  return await commonRequest<D>(url, params, 'put', options, axiosOption);
};
/***
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 * @param axiosOption
 */
export const patch = async <D>(
  url: string,
  params: ANY_OBJECT,
  options?: RequestOption,
  axiosOption?: AxiosRequestConfig,
) => {
  return await commonRequest<D>(url, params, 'patch', options, axiosOption);
};
/***
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 * @param axiosOption
 */
export const del = async <D>(
  url: string,
  params: ANY_OBJECT,
  options?: RequestOption,
  axiosOption?: AxiosRequestConfig,
) => {
  return await commonRequest<D>(url, params, 'delete', options, axiosOption);
};
/**
 *
 * @param url 请求地址
 * @param params 请求参数
 * @param filename 文件名
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 */
export const download = async (
  url: string,
  params: ANY_OBJECT,
  filename: string,
  method?: RequestMethods,
  options?: RequestOption,
) => {
  return new Promise((resolve, reject) => {
    downloadBlob(url, params, method, options)
      .then(blobData => {
        const blobUrl = window.URL.createObjectURL(blobData);
        const linkDom = document.createElement('a');
        linkDom.style.display = 'none';
        linkDom.href = blobUrl;
        linkDom.setAttribute('download', filename);
        if (typeof linkDom.download === 'undefined') {
          linkDom.setAttribute('target', '_blank');
        }
        document.body.appendChild(linkDom);
        linkDom.click();
        document.body.removeChild(linkDom);
        window.URL.revokeObjectURL(blobUrl);
        resolve(true);
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 下载文件，返回blob
 * @param {String} url 请求的url
 * @param {Object} params 请求参数
 * @param {RequestMethods} method 请求方法
 * @returns {Promise}
 */
export const downloadBlob = (
  url: string,
  params: ANY_OBJECT,
  method: RequestMethods = 'post',
  options?: RequestOption,
) => {
  return new Promise<Blob>((resolve, reject) => {
    const axiosOption: AxiosRequestConfig = {
      responseType: 'blob',
      transformResponse: function (data) {
        return data instanceof Blob && data.size > 0 ? data : undefined;
      },
    };
    commonRequest<Blob>(requestUrl(url), params, method, options, axiosOption)
      .then(res => {
        if (res instanceof Blob) {
          const blobData = new Blob([res.data], { type: 'application/octet-stream' });
          resolve(blobData);
        } else {
          console.warn('下载文件失败', res);
          reject(new Error('下载文件失败'));
        }
      })
      .catch(e => {
        if (e instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            reject(
              reader.result ? JSON.parse(reader.result.toString()).errorMessage : '下载文件失败',
            );
          };
          reader.readAsText(e);
        } else {
          reject('下载文件失败');
        }
      });
  });
};
/**
 * 上传
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 */
export const upload = async (url: string, params: ANY_OBJECT, options?: RequestOption) => {
  const axiosOption: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: [
      function (data) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          formData.append(key, data[key]);
        });
        return formData;
      },
    ],
  };

  const finalOption = {
    ...globalConfig.requestOption,
    ...options,
  };
  const { showError } = finalOption;
  return new Promise((resolve, reject) => {
    commonRequest<ANY_OBJECT>(requestUrl(url), params, 'post', options, axiosOption)
      .then(res => {
        if (res?.success) {
          resolve(res);
        } else {
          if (showError)
            showErrorMessage({
              showClose: true,
              message: res.data.errorMessage ? res.data.errorMessage : '数据请求失败',
            });
          reject('数据请求失败');
        }
      })
      .catch(e => {
        if (showError)
          showErrorMessage({
            showClose: true,
            message: e.errorMessage ? e.errorMessage : '网络请求错误',
          });
        reject(e);
      });
  });
};

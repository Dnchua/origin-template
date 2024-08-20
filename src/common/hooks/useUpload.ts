import { useLayoutStore } from '@/store';
import { ANY_OBJECT } from '@/types/generic';
import { getAppId, getToken } from '../utils';
import { post } from '../http/request';
import { useUrlBuilder } from './useUrl';

export const useUpload = () => {
  const { buildGetUrl, requestUrl } = useUrlBuilder();
  /**
   * 解析返回的上传文件数据
   * @param {String} jsonData 上传文件数据，[{name, downloadUri, filename}]
   * @param {Object} params 上传文件的参数
   * @returns {Array} 上传文件信息，[{name, downloadUri, filename, url}]
   */
  const parseUploadData = (
    jsonData: string | null | undefined,
    params: ANY_OBJECT,
  ): ANY_OBJECT[] => {
    let pathList: Array<ANY_OBJECT> = [];
    if (jsonData != null) {
      try {
        pathList = JSON.parse(jsonData);
      } catch (e) {
        console.error(e);
      }
    }

    return Array.isArray(pathList)
      ? pathList.map(item => {
          const downloadParams = { ...params };
          downloadParams.filename = item.filename;
          return {
            ...item,
            url: getUploadFileUrl(item, downloadParams),
          };
        })
      : [];
  };

  /**
   * 获得上传文件url
   * @param {*} item 上传文件
   * @param {*} params 上传文件的参数
   */
  const getUploadFileUrl = (item: ANY_OBJECT, params?: ANY_OBJECT) => {
    if (item == null || item.downloadUri == null) {
      return null;
    } else {
      const currentMenuId = useLayoutStore().currentMenuId;
      const query = { ...params };
      query.Authorization = getToken();
      query.MenuId = currentMenuId;
      query.AppCode = getAppId();
      return buildGetUrl(item.downloadUri, query);
    }
  };

  const getUploadHeaders = computed(() => {
    const token = getToken();
    const appId = getAppId();
    const currentMenuId = useLayoutStore().currentMenuId;
    const header: ANY_OBJECT = {
      Authorization: token,
      MenuId: currentMenuId,
    };
    if (appId) header.AppCode = appId;

    return header;
  });

  /**
   * 获得上传接口
   * @param {*} url 上传路径
   */
  const getUploadActionUrl = (url: string) => {
    return buildGetUrl(url, null);
  };

  /**
   * 上传文件
   * @param {*} url 请求的url
   * @param {*} params 请求参数
   */
  const fetchUpload = (url: string, params: ANY_OBJECT) => {
    return new Promise<ANY_OBJECT>((resolve, reject) => {
      post(
        requestUrl(url),
        {},
        { showError: true },
        {
          data: params,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          transformRequest: [
            function (data: ANY_OBJECT) {
              const formData = new FormData();
              Object.keys(data).map(key => {
                formData.append(key, data[key]);
              });
              return formData;
            },
          ],
        },
      )
        .then((res: ANY_OBJECT) => {
          if (res.data && res.success) {
            resolve(res.data);
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  };

  /**
   * 获得上传文件url列表
   * @param {*} jsonData 上传文件数据，[{name, downloadUri, filename}]
   * @param {*} params 上传文件的参数
   * @returns {Array} 文件url列表
   */
  const getPictureList = (jsonData: string, params: ANY_OBJECT) => {
    const tempList = parseUploadData(jsonData, params);
    if (Array.isArray(tempList)) {
      return tempList.map(item => item.url);
    } else {
      return [];
    }
  };

  /**
   * 将选中文件信息格式化成json信息
   * @param {Array} fileList 上传文件列表，[{name, fileUrl, data}]
   */
  const fileListToJson = (fileList: ANY_OBJECT[]) => {
    if (Array.isArray(fileList)) {
      return JSON.stringify(
        fileList.map(item => {
          return {
            name: item.name,
            downloadUri: item.downloadUri || item.response.data.downloadUri,
            filename: item.filename || item.response.data.filename,
            uploadPath: item.uploadPath || item.response.data.uploadPath,
          };
        }),
      );
    } else {
      return undefined;
    }
  };

  return {
    getUploadFileUrl,
    parseUploadData,
    getUploadHeaders,
    getUploadActionUrl,
    fetchUpload,
    getPictureList,
    fileListToJson,
  };
};

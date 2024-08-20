import { ElMessage } from 'element-plus';
import { get } from '../http/request';

/**
 * 文件下载Hooks
 *
 * @returns downloadFile
 */
export const useDownload = () => {
  /**
   * 下载上传的文件
   * @param {*} url 下载文件的url
   * @param {*} fileName 下载文件名
   */
  const downloadFile = (url: string, fileName: string) => {
    get<Blob>(
      url,
      {},
      {},
      {
        responseType: 'blob',
        transformResponse: function (data) {
          return data;
        },
      },
    )
      .then(res => {
        const data = res instanceof Blob ? res : res.data;
        if (data instanceof Blob) {
          const url = window.URL.createObjectURL(data);
          const link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          ElMessage.error('下载文件失败');
        }
      })
      .catch(e => {
        if (e instanceof Blob) {
          const reader = new FileReader();
          reader.onload = function () {
            ElMessage.error(
              reader.result ? JSON.parse(reader.result.toString()).errorMessage : '下载文件失败',
            );
          };
          reader.readAsText(e);
        } else {
          ElMessage.error('下载文件失败');
        }
      });
  };

  return { downloadFile };
};

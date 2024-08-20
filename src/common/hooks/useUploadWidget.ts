import { UploadFile } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';

export const useUploadWidget = (maxFileCount = 1) => {
  const fileList = ref<Array<UploadFile | ANY_OBJECT>>([]);
  const maxCount = ref(maxFileCount);

  /**
   * 上传文件列表改变
   * @param {Object} uploadFile 改变的文件
   * @param {Array} uploadFiles 改变后的文件列表
   */
  const onFileChange = (
    uploadFile: UploadFile | ANY_OBJECT | null,
    uploadFiles: Array<UploadFile | ANY_OBJECT> | null,
  ) => {
    if (uploadFiles && uploadFiles.length > 0) {
      if (maxFileCount == 1) {
        fileList.value = [uploadFiles[uploadFiles.length - 1]];
      } else {
        fileList.value = uploadFiles;
      }
    } else {
      fileList.value = [];
    }
  };

  return { fileList, onFileChange, maxCount };
};

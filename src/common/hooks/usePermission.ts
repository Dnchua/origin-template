import { useLoginStore } from '@/store';
import { getAppId } from '../utils';

export const usePermissions = () => {
  const loginStorage = useLoginStore();

  const checkPermCodeExist = (permCode: string) => {
    if (getAppId() != null && getAppId() !== '') return true;

    if (loginStorage.userInfo == null) {
      return false;
    }

    if (loginStorage.userInfo.permCodeList != null) {
      return loginStorage.userInfo.permCodeList.indexOf(permCode) != -1;
    } else {
      return loginStorage.userInfo.isAdmin;
    }
  };

  return {
    checkPermCodeExist,
  };
};

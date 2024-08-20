import { defineStore } from 'pinia';
import { UserInfo } from '@/types/upms/user';
import { initUserInfo } from './utils';

export default defineStore('login', {
  state: () => {
    return {
      token: '' as string | null,
      userInfo: {} as UserInfo | null,
    };
  },
  getters: {
    getPermCodeList(): Set<string> {
      if (this.userInfo == null) return new Set<string>();
      return new Set<string>(this.userInfo.permCodeList);
    },
  },
  actions: {
    setUserInfo(info: UserInfo) {
      this.userInfo = initUserInfo(info);
    },
    setHeadImage(headImage: (string & { downloadUri: string; filename: string }) | null) {
      if (this.userInfo == null) return;
      this.userInfo.headImageUrl = headImage;
    },
  },
  persist: {
    // 开启持久存储
    enabled: true,
    // 指定哪些state的key需要进行持久存储
    // storage默认是 sessionStorage存储
    // paths需要持久存储的key
    strategies: [{ key: 'userInfo', paths: ['userInfo'] }],
  },
});

import { defineStore } from 'pinia';
import { ANY_OBJECT } from '@/types/generic';

export default defineStore('other', {
  state: () => {
    return {
      userShowNameData: {
        '${startUserName}': '流程发起人',
        '${appointedAssignee}': '指定审批人',
      } as ANY_OBJECT,
    };
  },
  getters: {
    getUserShowNameData(): ANY_OBJECT {
      return this.userShowNameData;
    },
  },
  actions: {
    setUserShowNameData(data: ANY_OBJECT) {
      this.userShowNameData = data;
    },
  },
});

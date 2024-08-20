import { defineStore } from 'pinia';
import { ANY_OBJECT } from '@/types/generic';

export default defineStore('staticDict', {
  state: () => {
    return {
      staticDict: {} as ANY_OBJECT,
    };
  },
  actions: {
    setStaticDict(dict: ANY_OBJECT) {
      this.staticDict = dict;
    },
  },
});

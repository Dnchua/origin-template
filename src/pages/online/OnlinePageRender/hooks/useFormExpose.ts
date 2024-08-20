import { getCurrentInstance } from 'vue';
import { ANY_OBJECT } from '@/types/generic';
import { useLoginStore } from '@/store';
import { post, get } from '@/common/http/request';

export const useFormExpose = (formData: ANY_OBJECT) => {
  const loginStore = useLoginStore();
  const _this = getCurrentInstance();

  return {
    formData,
    props: _this?.props,
    loginStore,
    axios: {
      post,
      get,
    },
  };
};

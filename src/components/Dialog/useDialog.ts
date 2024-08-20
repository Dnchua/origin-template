import { EpPropMergeType } from 'element-plus/es/utils/vue/props';
import { Dialog } from '@/components/Dialog';
import { ANY_OBJECT } from '@/types/generic';

export const useDialog = () => {
  const defaultFormItemSize = inject<
    EpPropMergeType<StringConstructor, '' | 'default' | 'small' | 'large', never> | undefined
  >('defaultFormItemSize', 'default');

  const show = <D>(
    title: string,
    component: Component | string,
    options?: ANY_OBJECT,
    params?: ANY_OBJECT,
    thirdPartyOptions?: ANY_OBJECT,
  ) => {
    if (!params) {
      params = {};
    }
    params.defaultFormItemSize = defaultFormItemSize;

    return Dialog.show<D>(title, component, options, params, thirdPartyOptions);
  };

  return {
    show,
  };
};

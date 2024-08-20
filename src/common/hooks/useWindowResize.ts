import { onMounted, onUnmounted, provide, ref } from 'vue';
import { useLayoutStore } from '@/store';
import { getAppId } from '../utils';

// 屏幕宽度分界值，影响整体样式
const WIDTH = 1900;

const documentClientHeight = ref(0);

/**
 * 在最顶层使用该hook，一方面监听窗口大小变化，同时向下面提供一个计算属性
 */
export const useWindowResize = () => {
  const windowResize = () => {
    documentClientHeight.value = document.documentElement.clientHeight;
    if (window.innerWidth <= WIDTH) {
      layoutStore.defaultFormItemSize = 'default';
      document.body.className = 'orange-project container-default';
    } else {
      layoutStore.defaultFormItemSize = 'large';
      document.body.className = 'orange-project container-large';
    }

    layoutStore.documentClientHeight = document.documentElement.clientHeight;
    layoutStore.mainContextHeight = mainContextHeight.value;
  };

  const layoutStore = useLayoutStore();
  const mainContextHeight = computed(() => {
    const appId = getAppId();
    if (appId == null) {
      return documentClientHeight.value - (layoutStore.supportTags ? 110 : 60);
    } else {
      return documentClientHeight.value;
    }
  });

  provide('documentClientHeight', documentClientHeight);
  provide('mainContextHeight', mainContextHeight);

  onMounted(() => {
    windowResize();
    window.addEventListener('resize', windowResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', windowResize);
  });
};

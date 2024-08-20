import { useRoute } from 'vue-router';
import { ANY_OBJECT } from '@/types/generic';
import { getAppId, setToken } from '@/common/utils';
import { ThirdProps } from './types';

export const useThirdParty = (props: ThirdProps) => {
  console.log('接收到的第三方参数', props);

  const dialogIndex = ref(0);

  const thirdParams = computed(() => {
    let temp: ANY_OBJECT = {};
    try {
      if (props.thirdParamsString) temp = JSON.parse(props.thirdParamsString);
    } catch (e) {
      console.log(e);
      temp = {};
    }
    return temp;
  });

  console.log('thirdParams', thirdParams);

  const onCloseThirdDialog = <T>(isSuccess?: boolean, rowData?: T, data?: T) => {
    console.log('onCloseThirdDialog', rowData, data);
    if (window.parent) {
      window.parent.postMessage(
        {
          type: 'closeDialog',
          data: {
            index: dialogIndex.value,
            dialogKey: props.dialogKey,
            path: thirdParams.value.path,
            rowData: rowData ? JSON.parse(JSON.stringify(rowData)) : undefined,
            data: data ? JSON.parse(JSON.stringify(data)) : undefined,
            isSuccess,
          },
        },
        '*',
      );
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlerMessage = (msgType: string, data: any) => {
    //console.log('handlerMessage', msgType, data);
    switch (msgType) {
      case 'setToken':
        if (data.token) setToken(data.token);
        break;
      case 'dialogIndex':
        dialogIndex.value = data;
        break;
      case 'refreshData':
        break;
      case 'message':
        // handlerErrorMessage(data);
        break;
    }
  };

  const eventListener = (e: ANY_OBJECT) => {
    handlerMessage(e.data.type, e.data.data);
  };

  onMounted(() => {
    console.log('onMounted message');
    window.addEventListener('message', eventListener, false);
  });

  onUnmounted(() => {
    console.log('onUnmounted message');
    window.removeEventListener('message', eventListener);
  });

  return {
    thirdParams,
    onCloseThirdDialog,
  };
};

export const useThirdPartyAlive = () => {
  let refreshTimer: number | null | ReturnType<typeof setInterval>;

  const route = useRoute();

  const refreshToken = () => {
    if (window.parent) {
      window.parent.postMessage(
        {
          type: 'refreshToken',
        },
        '*',
      );
    }
  };

  if (route.path.indexOf('/thirdParty/') !== -1) {
    onMounted(() => {
      if (getAppId()) {
        refreshTimer = setInterval(() => {
          console.log('refreshToken thirdParty');
          refreshToken();
        }, 1000 * 60 * 3);
      }
    });

    onUnmounted(() => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    });
  }
};

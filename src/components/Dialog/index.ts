import { layer } from '@layui/layui-vue';
import { Component } from 'vue';
import { ANY_OBJECT } from '@/types/generic';
import { getAppId, getToken, getUUID } from '@/common/utils';
import { DialogProp } from './types';
import Layout from './layout.vue';

const LAYER_Z_INDEX = 500;

export class Dialog {
  private static index = 0;

  static closeAll = () => {
    layer.closeAll();
    Dialog.index = 0;
  };

  // 未提供单独关闭某个对话框的方法，涉及到z-index的变化规则，若需提供，须考虑z-index的变化规则
  // options可参考：http://www.layui-vue.com/zh-CN/components/layer 和 https://layui.dev/docs/2/layer/#options

  /**
   * 打开弹窗
   * @param {*} title 弹窗标题
   * @param {*} component 弹窗内容的组件
   * @param {*} options 弹窗设置（详情请见layui官网  http://www.layui-vue.com/zh-CN/components/layer 和 https://layui.dev/docs/2/layer/#options）
   * @param {*} params 弹窗组件参数
   * @param {*} thirdPartyOptions 第三方接入参数
   * @param {*} thirdPartyOptions.pathName 接入路由name
   * @param {*} thirdPartyOptions.width 弹窗宽度
   * @param {*} thirdPartyOptions.height 弹窗高度
   */
  static show = <D>(
    title: string,
    component: Component | string,
    options?: ANY_OBJECT,
    params?: ANY_OBJECT,
    thirdPartyOptions?: ANY_OBJECT,
  ) => {
    // 调用第三方弹窗方法
    if (getAppId() != null && getAppId() !== '') {
      if (thirdPartyOptions && window.parent) {
        showDialog(title, params, thirdPartyOptions);
        return new Promise<D>((resolve, reject) => {
          const eventListener = (e: ANY_OBJECT) => {
            if (e.data.type === 'refreshData') {
              console.log('第三方弹窗关闭后，回传的数据', e);
              window.removeEventListener('message', eventListener);
              resolve(e.data.data?.data as D);
            }
          };
          window.addEventListener('message', eventListener, false);
        });
      } else {
        console.warn('错误的第三方调用！');
        return Promise.reject('错误的第三方调用！');
      }
    }

    return new Promise<D>((resolve, reject) => {
      const observer: DialogProp<D> = {
        index: '',
        cancel: () => {
          layer.close(observer.index);
          reject({ message: 'canceled' });
        },
        submit: (data: D) => {
          //console.log('dialog index', observer.index);
          layer.close(observer.index);
          resolve(data);
        },
      };

      let layerOptions: ANY_OBJECT = {
        title: title,
        type: 1,
        skin:
          'layui-layer-page ' +
          (window.innerWidth <= 1900 ? 'container-default' : 'container-large'),
        resize: false,
        offset: 'auto',
        shadeClose: false,
        content: '' as string | Component,
        zIndex: LAYER_Z_INDEX + Dialog.index,
        end: () => {
          //console.log('layer end');
          Dialog.index--;
        },
      };
      // end之后，要执行index--
      if (options && options.end) {
        const end = options.end;
        layerOptions.end = () => {
          Dialog.index--;
          if (typeof end == 'function') {
            end();
          }
        };
      }

      layerOptions = { ...layerOptions, ...options };

      params = { ...params };
      params.dialog = observer;

      console.log('dialog params', params);
      //layerOptions.content = h(component, params);
      const vueComponent = h(Layout, () => h(component, params));
      layerOptions.content = vueComponent;

      const id = layer.open(layerOptions);
      observer.index = id;
      Dialog.index++;
    });
  };
}

function showDialog(title: string, params?: ANY_OBJECT, options?: ANY_OBJECT) {
  console.log('第三方弹窗', title, params, options);
  // 调用第三方弹窗方法
  if (options && window.parent) {
    const paramsCopy: ANY_OBJECT = {};
    if (params) {
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          const element = params[key];
          paramsCopy[key] = unref(element);
        }
      }
    }

    const dialogKey = getUUID();
    const location = window.location;
    let dlgUrl =
      location.origin +
      location.pathname +
      '#' +
      options.pathName +
      '?appId=' +
      getAppId() +
      '&token=' +
      getToken() +
      '&dlgFullScreen=' +
      (options.fullscreen ? '1' : '0') +
      '&dialogKey=' +
      dialogKey;

    dlgUrl += '&thirdParamsString=' + encodeURIComponent(JSON.stringify(paramsCopy));
    const data = {
      title: title,
      dlgFullScreen: options.fullscreen,
      width: options.width,
      height: options.height,
      top: options.top,
      params: paramsCopy,
      url: dlgUrl,
      dialogKey: dialogKey,
    };

    const dlgOption = {
      type: 'openDialog',
      data: JSON.parse(JSON.stringify(data)),
    };
    window.parent.postMessage(dlgOption, '*');
  }
}

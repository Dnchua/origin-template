import { Router, createRouter, createWebHashHistory } from 'vue-router';
import { getToken, getAppId } from '@/common/utils/index';
import { useLayoutStore } from '@/store';
import { Dialog } from '@/components/Dialog';
import { ANY_OBJECT } from '@/types/generic';
import { routers } from './systemRouters';

// 第三方页面路由跳转映射
const thirdRouteMap: ANY_OBJECT = {
  handlerFlowTask: 'thirdHandlerFlowTask',
};

// 创建路由实例
export const router: Router = createRouter({
  history: createWebHashHistory(), //createWebHistory(),
  routes: routers,
  scrollBehavior(to, from, savedPosition) {
    return new Promise(resolve => {
      if (savedPosition) {
        return savedPosition;
      }
      if (from.meta.saveSrollTop) {
        const top: number = document.documentElement.scrollTop || document.body.scrollTop;
        resolve({ left: 0, top });
      }
    });
  },
});
router.beforeEach((to, from, next) => {
  if (to.name === 'login') {
    next();
  } else if (to.path.indexOf('/thirdParty/') !== -1) {
    // 第三方接入URL
    next();
  } else {
    // 取token信息判断是否登录
    const token = getToken();
    const toName: string = to.name as string;
    if (!token || !/\S/.test(token)) {
      Dialog.closeAll();
      next({ name: 'login' });
    } else if (from.path.indexOf('/thirdParty/') !== -1 && thirdRouteMap[toName]) {
      // 第三方接入跳转页面，需要跳转到第三方的路由上
      let url =
        location.origin +
        location.pathname +
        '#/thirdParty/' +
        thirdRouteMap[toName] +
        '?appId=' +
        getAppId() +
        '&token=' +
        getToken();
      url += '&thirdParamsString=' + encodeURIComponent(JSON.stringify(to.query));
      location.href = url;
    } else {
      if (from.meta.refreshParentCachedPage) {
        const layoutStore = useLayoutStore();
        layoutStore.removeCachePage(toName);
        from.meta.refreshParentCachedPage = false;
      }
      next();
    }
  }
});
export default router;

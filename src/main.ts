import { createApp } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import '@/common/http/request';
// eslint-disable-next-line import/named
import { debounce } from 'lodash';
import { VxeTable, VxeColumn, Edit } from 'vxe-table';
import App from '@/App.vue';
import { router } from '@/router/index';
import pinia from '@/store';
import useStaticDictStore from '@/store/staticDict';

// 表格样式
import 'vxe-table/lib/style.css';
// layui样式
import '@layui/layui-vue/lib/index.css';
// vant样式
import 'vant/lib/index.css';
// element-plus 按需导入缺少的样式
import 'element-plus/theme-chalk/el-loading.css';
import 'element-plus/theme-chalk/el-message.css';
import 'element-plus/theme-chalk/el-message-box.css';
import 'element-plus/theme-chalk/el-notification.css';
import 'element-plus/theme-chalk/el-cascader.css';
import 'element-plus/theme-chalk/el-cascader-panel.css';
import 'element-plus/theme-chalk/el-tree.css';
import 'element-plus/theme-chalk/el-date-picker.css';
import 'element-plus/theme-chalk/el-input-number.css';
import 'element-plus/theme-chalk/el-switch.css';

// 其它样式
import '@/assets/online-icon/iconfont.css';
// 静态字典
import * as staticDict from '@/common/staticDict/index';
import * as olineDicgt from '@/common/staticDict/online';
import * as flowDict from '@/common/staticDict/flow';

import { ANY_OBJECT } from '@/types/generic';

// vxe-table设置
function useTable(app: ANY_OBJECT) {
  app.use(VxeTable).use(VxeColumn).use(Edit);
}
// 静态字典设置
function useStaticDict(app: ANY_OBJECT, staticDict: ANY_OBJECT) {
  if (app.config.globalProperties.StaticDict == null) {
    app.config.globalProperties.StaticDict = {};
  }
  Object.keys(staticDict).forEach(key => {
    app.config.globalProperties.StaticDict[key] = staticDict[key];
  });
}
// webpack需要重写ResizeObserver，否则会报错
const resizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends resizeObserver {
  constructor(callback) {
    callback = debounce(callback, 10);
    super(callback);
  }
};

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
useStaticDict(app, staticDict);
useStaticDict(app, olineDicgt);
useStaticDict(app, flowDict);
app.use(pinia).use(router).use(useTable);
app.mount('#app');
// 设置静态字典
const staticDictStore = useStaticDictStore();
staticDictStore.setStaticDict(app.config.globalProperties.StaticDict);

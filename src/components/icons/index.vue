<template>
  <el-icon><component :is="iconVal" /></el-icon>
</template>

<script lang="ts">
export default {
  name: 'OrangeIcon',
};
</script>

<script setup lang="ts">
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const props = defineProps<{ icon: string }>();

// 这里是ElementUI中的图标类与ElementPlus中的图标的对应关系
// but，因为layer通过h函数渲染组件，所以不能只通过名称来渲染组件，必须将组件本身放入缓存中
const icons: Map<string, string | Component> = new Map();
icons.set('el-icon-tickets', ElementPlusIconsVue.Tickets);
icons.set('el-icon-delete', ElementPlusIconsVue.Delete);
icons.set('el-icon-setting', ElementPlusIconsVue.Setting);
icons.set('el-icon-mobile-phone', ElementPlusIconsVue.Iphone);
icons.set('el-icon-mobile', ElementPlusIconsVue.Cellphone);
icons.set('el-icon-c-scale-to-original', ElementPlusIconsVue.ScaleToOriginal);
icons.set('el-icon-user', ElementPlusIconsVue.User);
icons.set('el-icon-user-solid', ElementPlusIconsVue.UserFilled);
icons.set('el-icon-s-operation', ElementPlusIconsVue.Operation);
icons.set('el-icon-goods', ElementPlusIconsVue.Goods);
icons.set('el-icon-menu', ElementPlusIconsVue.Menu);
icons.set('el-icon-s-opportunity', ElementPlusIconsVue.Opportunity);
icons.set('el-icon-s-tools', ElementPlusIconsVue.Tools);
icons.set('el-icon-s-data', ElementPlusIconsVue.Histogram);
icons.set('el-icon-folder-opened', ElementPlusIconsVue.FolderOpened);
icons.set('el-icon-star-off', ElementPlusIconsVue.Star);
icons.set('el-icon-star-on', ElementPlusIconsVue.StarFilled);
icons.set('el-icon-s-order', ElementPlusIconsVue.List);
// 如果icon本身就是ElementPlus的图标类名，直接返回即可
// but，由于layerui的原因，通过h函数渲染组件，必须将组件缓存起来使用
// 所以需要下面这个循环
//let count = 0;
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  //console.log(++count, key);
  icons.set(key, component);
}
const iconVal = computed(() => icons.get(props.icon) || props.icon);
</script>

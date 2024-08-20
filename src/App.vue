<script setup lang="ts">
import { useRoute } from 'vue-router';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { useWindowResize } from '@/common/hooks/useWindowResize';

const route = useRoute();

watch(
  () => route.name,
  () => {
    //console.log('路由发生了变化', route.name, route.fullPath, route.path, route);
    document.title = process.env.VUE_APP_PROJECT_NAME;
    if (route.meta && route.meta.title) {
      document.title += ' - ' + route.meta.title;
    }
  },
);

useWindowResize();
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view></router-view>
  </el-config-provider>
</template>

<template>
  <el-row class="third-party">
    <el-config-provider :locale="zhCn">
      <router-view
        style="min-height: 100vh; background-color: white; width: 100%"
        :style="{ padding: dlgFullScreen == '1' ? '0px' : '20px' }"
      />
    </el-config-provider>
  </el-row>
</template>

<script setup lang="ts">
import '@/common/staticDict/online';
import '@/common/staticDict/flow';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { watch } from 'vue';
import { setToken, setAppId } from '@/common/utils/index';

const props = defineProps<{ appId?: string; token?: string; dlgFullScreen?: string }>();

watch(
  () => props.appId,
  (newVal, oldVal) => {
    //console.log('third-party appId', newVal, oldVal);
    setAppId(newVal);
  },
  {
    immediate: true,
  },
);
watch(
  () => props.token,
  (newVal, oldVal) => {
    //console.log('third-party token', newVal, oldVal);
    setToken(newVal);
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
:deep(.table-box) {
  min-height: 80vh;
}
</style>

<template>
  <el-config-provider :locale="zhCn"><slot /></el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
</script>

<template>
  <label class="page-close-box" @click="onCancel()">
    <img src="@/assets/img/back2.png" alt="" />
  </label>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const emit = defineEmits<{ close: [] }>();

const router = useRouter();

const onCancel = () => {
  // TODO 刷新父页面
  router.go(-1);
  emit('close');
};
</script>

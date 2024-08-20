<template>
  <div class="step-bar" :style="{ background: backgroundColor }">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';

const emit = defineEmits<{ 'update:value': [string | number] }>();

const props = withDefaults(
  defineProps<{ value: string | number; backgroundColor?: string; textColor?: string }>(),
  {
    backgroundColor: '#F6F7F9',
    textColor: '#999999',
  },
);

const stepBarInfo = computed(() => {
  return {
    activeStep: props.value,
    backgroundColor: props.backgroundColor,
    textColor: props.textColor,
  };
});

provide('stepBarInfo', stepBarInfo);

const onchange = (name: string | number) => {
  emit('update:value', name);
};

provide('setActiveStep', onchange);
</script>

<style scoped>
.step-bar {
  display: flex;
  padding: 7px 8px !important;
  border-radius: 22px;
}
</style>

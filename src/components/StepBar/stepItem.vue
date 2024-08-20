<template>
  <div
    class="step-bar-item"
    :class="{ active: isActive }"
    :style="{
      background: !isActive ? stepBarInfo.backgroundColor : undefined,
      color: !isActive ? stepBarInfo.textColor : undefined,
    }"
    @click="onItemClick"
  >
    <i v-if="icon" :class="icon" style="margin-right: 3px" />
    <slot />
  </div>
</template>

<script lang="ts">
export default {
  name: 'StepBarItem',
};
</script>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';

const props = defineProps<{ name: string | number; icon?: string }>();

const stepBarInfo = inject(
  'stepBarInfo',
  ref({
    backgroundColor: '#F6F7F9',
    textColor: '#999999',
    activeStep: '',
  }),
);
const setActiveStep = inject('setActiveStep', (val: string | number) => {
  return val;
});
const onItemClick = () => {
  setActiveStep(props.name);
};

const isActive = computed(() => {
  return stepBarInfo.value.activeStep == props.name;
});
</script>

<style lang="scss" scoped>
.step-bar-item {
  height: 30px;
  padding: 5px 18px;
  text-align: center;
  color: #999;
  border-radius: 15px;
  line-height: 20px;
}
.step-bar-item.active {
  color: white;
  background: $color-primary;
}
</style>

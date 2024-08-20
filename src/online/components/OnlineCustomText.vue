<template>
  <div
    class="online-custom-text"
    :style="{
      background: bgColor,
      height: height ? height + 'px' : undefined,
      'justify-content': valign,
      padding: padding + 'px',
    }"
  >
    <div :style="getStyle">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
import { StyleValue } from 'vue';

const props = withDefaults(
  defineProps<{
    value?: number | string | Date;
    align?: string;
    valign?: string;
    bgColor?: string;
    height?: number;
    textIndent?: number;
    fontSize?: number;
    padding?: number;
    fontColor?: string;
    fontBold?: boolean;
    fontItalic?: boolean;
  }>(),
  {
    value: '',
    align: 'left',
    valign: 'center',
    height: 25,
    textIndent: 0,
    fontSize: 14,
    padding: 2,
    fontColor: '#383838',
    fontBold: false,
    fontItalic: false,
  },
);

const getStyle = computed<StyleValue>(() => {
  return {
    width: '100%',
    'text-indent': props.textIndent + 'em',
    'text-align': props.align,
    'max-height': props.height ? props.height + 'px' : undefined,
    'line-height': 1.5,
    'font-size': props.fontSize + 'px',
    color: props.fontColor,
    'font-weight': props.fontBold ? 600 : 400,
    'font-style': props.fontItalic ? 'italic' : undefined,
    overflow: 'hidden',
    'word-break': 'break-word',
  } as StyleValue;
});
</script>

<style scoped>
.online-custom-text {
  display: flex;
  flex-direction: column;
  padding: 2px;
}
</style>

<template>
  <div
    class="el-input el-date-editor el-range-editor el-input__wrapper el-input-number-range"
    :class="[
      inputSize ? 'el-range-editor--' + inputSize : '',
      focused ? 'is-active' : '',
      {
        'is-disabled': inputDisabled,
        'el-input--prefix': prefixIcon,
      },
    ]"
    style="height: 100%"
    @mouseenter="showClose = true"
    @mouseleave="showClose = false"
  >
    <div class="el-input__icon el-range__icon" :class="prefixIcon">
      <slot name="prepend"></slot>
    </div>
    <input
      autocomplete="off"
      :placeholder="startPlaceholder"
      :value="userInput && userInput[0]"
      :disabled="inputDisabled"
      :readonly="readonly"
      :name="name && name[0]"
      @input="handleStartInput"
      @change="handleStartChange"
      @focus="focused = true"
      @blur="focused = false"
      class="el-range-input el-input__wrappe"
      style="flex-grow: 1"
    />
    <slot name="range-separator">
      <span>{{ rangeSeparator }}</span>
    </slot>
    <input
      autocomplete="off"
      :placeholder="endPlaceholder"
      :value="userInput && userInput[1]"
      :disabled="inputDisabled"
      :readonly="readonly"
      :name="name && name[1]"
      @input="handleEndInput"
      @change="handleEndChange"
      @focus="focused = true"
      @blur="focused = false"
      class="el-range-input el-input__wrappe"
      style="flex-grow: 1"
    />
    <el-icon
      class="el-input__icon el-range__close-icon"
      style="margin-right: 5px"
      :style="{ visibility: showClear ? 'visible' : 'hidden' }"
      @click="handleClickClear"
    >
      <CircleClose />
    </el-icon>
  </div>
</template>

<script lang="ts">
export default {
  name: 'InputNumberRange',
};
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFormItem } from 'element-plus';
import { CircleClose } from '@element-plus/icons-vue';

const { form, formItem } = useFormItem();

function isNumber(val: string | null | undefined) {
  if (!val) return false;
  var regPos = /^\d+(\.\d+)?$/; // 非负浮点数
  var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; // 负浮点数
  if (regPos.test(val) || regNeg.test(val)) {
    return true;
  } else {
    return false;
  }
}

const emit = defineEmits<{
  'update:value': [(number | null)[] | null];
  change: [(number | null)[] | null];
}>();

const props = withDefaults(
  defineProps<{
    value?: number[];
    // small / default / large
    size?: 'small' | 'default' | 'large' | '';
    //禁用
    disabled?: boolean;
    // 完全只读
    readonly?: boolean;
    // 自定义头部图标的类名
    prefixIcon?: string;
    /**
     * 范围选择时最小值的占位内容
     */
    startPlaceholder?: string;
    /**
     * 范围选择时最大值的占位内容
     */
    endPlaceholder?: string;
    name?: string;
    /**
     * 选择范围时的分隔符
     */
    rangeSeparator?: string;
    validateEvent?: boolean;
    clearable?: boolean;
  }>(),
  {
    value: () => [],
    size: 'default',
    name: '',
    rangeSeparator: '-',
    validateEvent: true,
  },
);

const focused = ref(false);
const userInput = ref<null | (number | null)[]>(props.value);
const showClose = ref(false);

const inputSize = computed(() => {
  return props.size || formItem?.size;
});
const inputDisabled = computed(() => {
  return props.disabled || form?.disabled;
});
const showClear = computed(() => {
  let result =
    props.clearable &&
    !inputDisabled.value &&
    !props.readonly &&
    showClose.value &&
    userInput.value != null &&
    userInput.value.length > 0 &&
    (userInput.value[0] != null || userInput.value[1] != null);
  return result;
});

const handleStartInput = (event: Event) => {
  let value = null;
  if (event.target) {
    value = parseInt((event.target as HTMLInputElement).value);
  }
  if (value) {
    value = isNumber(value.toString()) ? value : null;
  }
  if (userInput.value) {
    userInput.value = [value, userInput.value[1]];
  } else {
    userInput.value = [value, null];
  }
};

const handleEndInput = (event: Event) => {
  let value = null;
  if (event.target) {
    value = parseInt((event.target as HTMLInputElement).value);
  }
  if (value) {
    value = isNumber(value.toString()) ? value : null;
  }
  if (userInput.value) {
    userInput.value = [userInput.value[0], value];
  } else {
    userInput.value = [null, value];
  }
};
const handleStartChange = () => {
  let value = userInput.value && userInput.value[0];
  if (userInput.value) {
    userInput.value[0] = value;
  } else {
    userInput.value = [value, null];
  }
  //event.srcElement.value = value;
  emitInput(userInput.value);
};
const handleEndChange = () => {
  let value = userInput.value && userInput.value[1];
  if (userInput.value) {
    userInput.value[1] = value;
  } else {
    userInput.value = [null, value];
  }
  //event.srcElement.value = value;
  emitInput(userInput.value);
};
const handleClickClear = () => {
  userInput.value = null;
  emitInput(userInput.value);
};
const emitInput = (values: (number | null)[] | null) => {
  emit('update:value', values);
  emit('change', values);
};

watch(
  () => props.value,
  val => {
    //console.log('number range changed', val);
    userInput.value = val;
    // 触发校验
    formItem?.validate('change').catch(e => {
      console.warn(e);
    });
  },
  {
    deep: true,
  },
);
</script>

<style lang="scss" scoped>
.el-input__inner {
  border: 1px solid #a7b2cb;
  border-radius: 4px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}
</style>

<style>
/*
.el-input-number-range.is-active .el-range__close-icon {
  visibility: visible !important;
}
*/
</style>

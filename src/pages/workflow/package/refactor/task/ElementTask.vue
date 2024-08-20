<template>
  <div class="element-task">
    <el-form :size="layoutStore.defaultFormItemSize" @submit.prevent label-position="top">
      <component :is="witchTaskComponent" v-bind="$props" />
      <!-- <el-form-item label="异步延续">
        <div class="checkbox-wrap" style="width: 100%;display: inline-block;">
          <el-checkbox v-model="taskConfigForm.asyncBefore" label="异步前" @change="changeTaskAsync" />
          <el-checkbox v-model="taskConfigForm.asyncAfter" label="异步后" @change="changeTaskAsync" />
          <el-checkbox v-model="taskConfigForm.exclusive" v-if="taskConfigForm.asyncAfter || taskConfigForm.asyncBefore" label="排除" @change="changeTaskAsync" />
        </div>
      </el-form-item> -->
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';
import UserTask from './task-components/UserTask.vue';
import ScriptTask from './task-components/ScriptTask.vue';
import ReceiveTask from './task-components/ReceiveTask.vue';

const props = defineProps<{ id: string; type: string; isCountersign: boolean }>();

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const taskConfigForm = ref({
  asyncAfter: false,
  asyncBefore: false,
  exclusive: false,
});
const witchTaskComponent = ref();
const installedComponent: ANY_OBJECT = {
  // 手工任务与普通任务一致，不需要其他配置
  // 接收消息任务，需要在全局下插入新的消息实例，并在该节点下的 messageRef 属性绑定该实例
  // 发送任务、服务任务、业务规则任务共用一个相同配置
  SubProcess: markRaw(UserTask),
  UserTask: markRaw(UserTask), // 用户任务配置
  ScriptTask: markRaw(ScriptTask), // 脚本任务配置
  ReceiveTask: markRaw(ReceiveTask), // 消息接收任务
};

const win: ANY_OBJECT = window;
watch(
  () => props.id,
  () => {
    const bpmnElement = win.bpmnInstances.bpmnElement;
    taskConfigForm.value.asyncBefore = bpmnElement?.businessObject?.asyncBefore;
    taskConfigForm.value.asyncAfter = bpmnElement?.businessObject?.asyncAfter;
    taskConfigForm.value.exclusive = bpmnElement?.businessObject?.exclusive;
  },
  {
    immediate: true,
  },
);
watch(
  () => props.type,
  () => {
    witchTaskComponent.value = installedComponent[props.type];
  },
  {
    immediate: true,
  },
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
</script>

<style lang="scss">
.element-task {
  .el-form-item__label {
    color: #333;
  }

  .el-checkbox {
    .el-checkbox__label {
      font-size: 12px;
      color: #333;
    }
    .el-checkbox__inner {
      width: 16px;
      height: 16px;
    }
    .el-checkbox__inner::after {
      top: 2px;
      left: 5px;
      width: 4px;
      height: 8px;
    }
  }
}
</style>

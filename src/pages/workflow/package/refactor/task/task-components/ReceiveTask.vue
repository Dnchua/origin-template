<template>
  <div style="margin-top: 16px">
    <el-form-item label="消息实例">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: nowrap;
        "
      >
        <el-select v-model="bindMessageId" @change="updateTaskMessage">
          <el-option
            v-for="id in Object.keys(messageMap)"
            :value="id"
            :label="messageMap[id]"
            :key="id"
          />
        </el-select>
        <el-button
          :size="layoutStore.defaultFormItemSize"
          type="primary"
          icon="el-icon-plus"
          style="margin-left: 8px"
          @click="openMessageModel"
        />
      </div>
    </el-form-item>
    <el-dialog
      :visible.sync="messageModelVisible"
      :close-on-click-modal="false"
      title="创建新消息"
      width="400px"
      append-to-body
      destroy-on-close
    >
      <el-form
        :model="newMessageForm"
        :size="layoutStore.defaultFormItemSize"
        label-width="90px"
        @submit.native.prevent
      >
        <el-form-item label="消息ID">
          <el-input v-model="newMessageForm.id" clearable />
        </el-form-item>
        <el-form-item label="消息名称">
          <el-input v-model="newMessageForm.name" clearable />
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button :size="layoutStore.defaultFormItemSize" type="primary" @click="createNewMessage"
          >确 认</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  id: string;
  type: string;
}>();

const bindMessageId = ref('');
const newMessageForm = ref<ANY_OBJECT>({});
const messageMap = ref<ANY_OBJECT>({});
const messageModelVisible = ref(false);

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

let bpmnElement: ANY_OBJECT | null = null;
let bpmnMessageRefsMap: ANY_OBJECT = {};
const bpmnRootElements = ref<ANY_OBJECT[]>([]);
const win: ANY_OBJECT = window;

const getBindMessage = () => {
  bpmnElement = win?.bpmnInstances?.bpmnElement;
  bindMessageId.value = bpmnElement?.businessObject?.messageRef?.id || '-1';
};
const openMessageModel = () => {
  messageModelVisible.value = true;
  newMessageForm.value = {};
};
const createNewMessage = () => {
  if (messageMap.value[newMessageForm.value.id]) {
    ElMessage.error('该消息已存在，请修改id后重新保存');
    return;
  }
  const newMessage = win?.bpmnInstances?.moddle?.create('bpmn:Message', newMessageForm.value);
  bpmnRootElements.value.push(newMessage);
  messageMap.value[newMessageForm.value.id] = newMessageForm.value.name;
  bpmnMessageRefsMap[newMessageForm.value.id] = newMessage;
  messageModelVisible.value = false;
};
const updateTaskMessage = (messageId: string) => {
  if (messageId === '-1') {
    win?.bpmnInstances?.modeling?.updateProperties(bpmnElement, {
      messageRef: null,
    });
  } else {
    win?.bpmnInstances?.modeling?.updateProperties(bpmnElement, {
      messageRef: bpmnMessageRefsMap[messageId],
    });
  }
};

watch(
  () => props.id,
  () => {
    bpmnElement = win?.bpmnInstances?.bpmnElement;

    nextTick(() => {
      getBindMessage();
    });
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  bpmnMessageRefsMap = {};
  bpmnRootElements.value = win?.bpmnInstances?.modeler?.getDefinitions().rootElements;
  bpmnRootElements.value
    .filter(el => el.$type === 'bpmn:Message')
    .forEach((m: ANY_OBJECT) => {
      bpmnMessageRefsMap[m.id] = m;
      messageMap.value[m.id] = m.name;
    });
  messageMap.value['-1'] = '无'; // 添加一个空对象，保证可以取消原消息绑定
});

onBeforeUnmount(() => {
  bpmnElement = null;
});
</script>

<template>
  <div class="panel-tab__content" style="padding-top: 0">
    <div
      class="panel-tab__content--title"
      style="height: 32px; padding-bottom: 3px; box-sizing: content-box"
    >
      <span class="panel-title">消息列表</span>
      <right-add-btn @click.prevent.stop="openModel('message')">添加</right-add-btn>
    </div>
    <vxe-table
      :data="messageList"
      :size="layoutStore.defaultFormItemSize"
      :row-config="{ isHover: true }"
      header-cell-class-name="table-header-gray"
    >
      <vxe-column type="seq" title="序号" width="70px" />
      <vxe-column title="消息ID" field="id" max-width="300px" show-overflow-tooltip />
      <vxe-column title="消息名称" field="name" max-width="300px" show-overflow-tooltip />
      <template v-slot:empty>
        <div class="table-empty unified-font">
          <img src="@/assets/img/empty.png" />
          <span>暂无数据</span>
        </div>
      </template>
    </vxe-table>
    <div class="panel-tab__content--title" style="padding-top: 10px; padding-bottom: 3px">
      <span class="panel-title">信号列表</span>
      <right-add-btn @click.prevent.stop="openModel('signal')">添加</right-add-btn>
    </div>
    <vxe-table
      :data="signalList"
      :size="layoutStore.defaultFormItemSize"
      :row-config="{ isHover: true }"
      style="margin-bottom: 10px"
      header-cell-class-name="table-header-gray"
    >
      <vxe-column type="seq" title="序号" width="70px" />
      <vxe-column title="信号ID" field="id" max-width="300px" show-overflow-tooltip />
      <vxe-column title="信号名称" field="name" max-width="300px" show-overflow-tooltip />
      <template v-slot:empty>
        <div class="table-empty unified-font">
          <img src="@/assets/img/empty.png" />
          <span>暂无数据</span>
        </div>
      </template>
    </vxe-table>

    <el-dialog
      v-model="modelVisible"
      :title="modelConfig.title"
      :close-on-click-modal="false"
      width="400px"
      append-to-body
      destroy-on-close
    >
      <el-form
        :model="modelObjectForm"
        :size="layoutStore.defaultFormItemSize"
        label-width="90px"
        @submit.prevent
      >
        <el-form-item :label="modelConfig.idLabel">
          <el-input v-model="modelObjectForm.id" clearable />
        </el-form-item>
        <el-form-item :label="modelConfig.nameLabel">
          <el-input v-model="modelObjectForm.name" clearable />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button :size="layoutStore.defaultFormItemSize" @click="modelVisible = false"
          >取 消</el-button
        >
        <el-button :size="layoutStore.defaultFormItemSize" type="primary" @click="addNewObject"
          >保 存</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { VxeTable, VxeColumn } from 'vxe-table';
import RightAddBtn from '@/components/Btns/RightAddBtn.vue';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const signalList = ref([]);
const messageList = ref([]);
const modelVisible = ref(false);
const modelType = ref('');
const modelObjectForm = ref({});

let rootElements = [];
let messageIdMap = {};
let signalIdMap = {};

const modelConfig = computed(() => {
  if (modelType.value === 'message') {
    return { title: '创建消息', idLabel: '消息ID', nameLabel: '消息名称' };
  } else {
    return { title: '创建信号', idLabel: '信号ID', nameLabel: '信号名称' };
  }
});

const openModel = (type: string) => {
  modelType.value = type;
  modelObjectForm.value = {};
  modelVisible.value = true;
};

const initDataList = () => {
  rootElements = window.bpmnInstances.modeler.getDefinitions().rootElements;
  messageIdMap = {};
  signalIdMap = {};
  messageList.value = [];
  signalList.value = [];
  rootElements.forEach(el => {
    if (el.$type === 'bpmn:Message') {
      messageIdMap[el.id] = true;
      messageList.value.push({ ...el });
    }
    if (el.$type === 'bpmn:Signal') {
      signalIdMap[el.id] = true;
      signalList.value.push({ ...el });
    }
  });
};

const addNewObject = () => {
  if (modelType.value === 'message') {
    if (messageIdMap[modelObjectForm.value.id]) {
      return ElMessage.error('该消息已存在，请修改id后重新保存');
    }
    const messageRef = window.bpmnInstances.moddle.create('bpmn:Message', modelObjectForm.value);
    rootElements.push(messageRef);
  } else {
    if (signalIdMap[modelObjectForm.value.id]) {
      return ElMessage.error('该信号已存在，请修改id后重新保存');
    }
    const signalRef = window.bpmnInstances.moddle.create('bpmn:Signal', modelObjectForm.value);
    rootElements.push(signalRef);
  }
  modelVisible.value = false;
  initDataList();
};

onMounted(() => {
  initDataList();
});
</script>

<style lang="scss" scoped>
.panel-tab__content--title {
  align-items: center;
  padding-bottom: 0;
  .el-button {
    display: flex;
    align-items: center;
    :deep(.el-icon-circle-plus) {
      font-size: 16px;
    }
    :deep(span) {
      margin-left: 2px !important;
    }
  }
}
</style>

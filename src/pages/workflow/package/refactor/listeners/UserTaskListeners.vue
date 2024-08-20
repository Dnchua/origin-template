<template>
  <div class="panel-tab__content" style="padding-top: 3px">
    <vxe-table
      :data="elementListenersList"
      :size="layoutStore.defaultFormItemSize"
      :row-config="{ isHover: true }"
      header-cell-class-name="table-header-gray"
    >
      <vxe-column title="序号" width="70px" type="seq" />
      <vxe-column title="事件类型" min-width="80px" show-overflow-tooltip>
        <template v-slot="scope">
          {{ listenerEventTypeObject[scope.row.event] }}
        </template>
      </vxe-column>
      <vxe-column title="监听器ID" min-width="80px" field="id" show-overflow-tooltip />
      <vxe-column title="监听器类型" min-width="80px" show-overflow-tooltip>
        <template v-slot="scope">
          {{ listenerTypeObject[scope.row.listenerType] }}
        </template>
      </vxe-column>
      <vxe-column title="操作" width="90px">
        <template v-slot="{ row, $rowIndex }">
          <el-button
            :size="layoutStore.defaultFormItemSize"
            link
            type="primary"
            @click="openListenerForm(row, $rowIndex)"
            >编辑</el-button
          >
          <!-- <el-divider direction="vertical" /> -->
          <el-button
            :size="layoutStore.defaultFormItemSize"
            link
            type="danger"
            @click="removeListener(row, $rowIndex)"
            >删除</el-button
          >
        </template>
      </vxe-column>
      <template v-slot:empty>
        <div class="table-empty unified-font">
          <img src="@/assets/img/empty.png" />
          <span>暂无数据</span>
        </div>
      </template>
    </vxe-table>

    <!-- 监听器 编辑/创建 部分 -->
    <el-drawer
      v-model="listenerFormModelVisible"
      title="任务监听器"
      :size="`${width}px`"
      class="process-drawer"
      append-to-body
      destroy-on-close
    >
      <el-form
        :size="layoutStore.defaultFormItemSize"
        :model="listenerForm"
        label-width="96px"
        ref="listenerFormRef"
        @submit.prevent
      >
        <el-form-item
          label="事件类型"
          prop="event"
          :rules="{ required: true, message: '请选择事件类型', trigger: ['blur', 'change'] }"
        >
          <el-select v-model="listenerForm.event">
            <el-option
              v-for="i in Object.keys(listenerEventTypeObject)"
              :key="i"
              :label="listenerEventTypeObject[i]"
              :value="i"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="监听器ID"
          prop="id"
          :rules="{ required: true, message: '请填写监听器ID', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerForm.id" clearable />
        </el-form-item>
        <el-form-item
          label="监听器类型"
          prop="listenerType"
          :rules="{ required: true, message: '请选择监听器类型', trigger: ['blur', 'change'] }"
        >
          <el-select v-model="listenerForm.listenerType">
            <el-option
              v-for="i in Object.keys(listenerTypeObject)"
              :key="i"
              :label="listenerTypeObject[i]"
              :value="i"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="listenerForm.listenerType === 'classListener'"
          label="Java类"
          prop="class"
          key="listener-class"
          :rules="{ required: true, message: '请填写Java类', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerForm.class" clearable />
        </el-form-item>
        <el-form-item
          v-if="listenerForm.listenerType === 'expressionListener'"
          label="表达式"
          prop="expression"
          key="listener-expression"
          :rules="{ required: true, message: '请填写表达式', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerForm.expression" clearable />
        </el-form-item>
        <el-form-item
          v-if="listenerForm.listenerType === 'delegateExpressionListener'"
          label="代理表达式"
          prop="delegateExpression"
          key="listener-delegate"
          :rules="{ required: true, message: '请填写代理表达式', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerForm.delegateExpression" clearable />
        </el-form-item>
        <template v-if="listenerForm.listenerType === 'scriptListener'">
          <el-form-item
            label="脚本格式"
            prop="scriptFormat"
            key="listener-script-format"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本格式' }"
          >
            <el-input v-model="listenerForm.scriptFormat" clearable />
          </el-form-item>
          <el-form-item
            label="脚本类型"
            prop="scriptType"
            key="listener-script-type"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请选择脚本类型' }"
          >
            <el-select v-model="listenerForm.scriptType">
              <el-option label="内联脚本" value="inlineScript" />
              <el-option label="外部脚本" value="externalScript" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="listenerForm.scriptType === 'inlineScript'"
            label="脚本内容"
            prop="value"
            key="listener-script"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本内容' }"
          >
            <el-input v-model="listenerForm.value" clearable />
          </el-form-item>
          <el-form-item
            v-if="listenerForm.scriptType === 'externalScript'"
            label="资源地址"
            prop="resource"
            key="listener-resource"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写资源地址' }"
          >
            <el-input v-model="listenerForm.resource" clearable />
          </el-form-item>
        </template>

        <template v-if="listenerForm.event === 'timeout'">
          <el-form-item label="定时器类型" prop="eventDefinitionType" key="eventDefinitionType">
            <el-select v-model="listenerForm.eventDefinitionType">
              <el-option label="日期" value="date" />
              <el-option label="持续时长" value="duration" />
              <el-option label="循环" value="cycle" />
              <el-option label="无" value="null" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="!!listenerForm.eventDefinitionType && listenerForm.eventDefinitionType !== 'null'"
            label="定时器"
            prop="eventTimeDefinitions"
            key="eventTimeDefinitions"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写定时器配置' }"
          >
            <el-input v-model="listenerForm.eventTimeDefinitions" clearable />
          </el-form-item>
        </template>
      </el-form>

      <el-divider />
      <p class="listener-filed__title" style="margin-top: 12px; margin-bottom: 12px">
        <span
          ><el-icon><Menu /></el-icon>注入字段：</span
        >
        <el-button
          :size="layoutStore.defaultFormItemSize"
          type="primary"
          @click="openListenerFieldForm(null)"
          >添加字段</el-button
        >
      </p>
      <vxe-table
        :data="fieldsListOfListener"
        :size="layoutStore.defaultFormItemSize"
        :row-config="{ isHover: true }"
        max-height="240"
        border
        fit
        style="flex: none"
        header-cell-class-name="table-header-gray"
      >
        <vxe-column title="序号" width="70px" type="seq" />
        <vxe-column title="字段名称" min-width="100px" field="name" />
        <vxe-column title="字段类型" min-width="80px" show-overflow-tooltip>
          <template v-slot="scope">
            {{ fieldTypeObject[scope.row.fieldType] }}
          </template>
        </vxe-column>
        <vxe-column title="字段值/表达式" min-width="100px" show-overflow-tooltip>
          <template v-slot="scope">
            {{ scope.row.string || scope.row.expression }}
          </template>
        </vxe-column>
        <vxe-column title="操作" width="100px">
          <template v-slot="{ row, $rowIndex }">
            <el-button
              :size="layoutStore.defaultFormItemSize"
              link
              type="primary"
              @click="openListenerFieldForm(row, $rowIndex)"
              >编辑</el-button
            >
            <!-- <el-divider direction="vertical" /> -->
            <el-button
              :size="layoutStore.defaultFormItemSize"
              link
              type="danger"
              @click="removeListenerField(row, $rowIndex)"
              >删除</el-button
            >
          </template>
        </vxe-column>
        <template v-slot:empty>
          <div class="table-empty unified-font">
            <img src="@/assets/img/empty.png" />
            <span>暂无数据</span>
          </div>
        </template>
      </vxe-table>

      <div class="element-drawer__button" style="margin-top: 8px">
        <el-button :size="layoutStore.defaultFormItemSize" @click="listenerFormModelVisible = false"
          >取 消</el-button
        >
        <el-button
          :size="layoutStore.defaultFormItemSize"
          type="primary"
          @click="saveListenerConfig"
          >保 存</el-button
        >
      </div>
    </el-drawer>

    <!-- 注入西段 编辑/创建 部分 -->
    <el-dialog
      title="字段配置"
      v-model="listenerFieldFormModelVisible"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form
        :model="listenerFieldForm"
        :size="layoutStore.defaultFormItemSize"
        label-width="96px"
        ref="listenerFieldFormRef"
        @submit.prevent
      >
        <el-form-item
          label="字段名称："
          prop="name"
          :rules="{ required: true, message: '请填写字段名称', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerFieldForm.name" clearable />
        </el-form-item>
        <el-form-item
          label="字段类型："
          prop="fieldType"
          :rules="{ required: true, message: '请选择字段类型', trigger: ['blur', 'change'] }"
        >
          <el-select v-model="listenerFieldForm.fieldType">
            <el-option
              v-for="i in Object.keys(fieldTypeObject)"
              :key="i"
              :label="fieldTypeObject[i]"
              :value="i"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="listenerFieldForm.fieldType === 'string'"
          label="字段值："
          prop="string"
          key="field-string"
          :rules="{ required: true, message: '请填写字段值', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerFieldForm.string" clearable />
        </el-form-item>
        <el-form-item
          v-if="listenerFieldForm.fieldType === 'expression'"
          label="表达式："
          prop="expression"
          key="field-expression"
          :rules="{ required: true, message: '请填写表达式', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerFieldForm.expression" clearable type="textarea" />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button
          :size="layoutStore.defaultFormItemSize"
          @click="listenerFieldFormModelVisible = false"
          >取 消</el-button
        >
        <el-button :size="layoutStore.defaultFormItemSize" type="primary" @click="saveListenerFiled"
          >确 定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import { Menu } from '@element-plus/icons-vue';
import { VxeTable, VxeColumn } from 'vxe-table';
import { ANY_OBJECT } from '@/types/generic';
import { createListenerObject, updateElementExtensions } from '../../utils';
import { initListenerType, initListenerForm, eventType, listenerType, fieldType } from './utilSelf';

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{ id: string; type: string }>();
const prefix = inject('prefix');
const width = inject('width');

const listenerFormRef = ref();
const listenerFieldFormRef = ref();

const elementListenersList = ref([]);
const listenerEventTypeObject = ref(eventType);
const listenerTypeObject = ref(listenerType);
const listenerFormModelVisible = ref(false);
const listenerForm = ref<ANY_OBJECT>({});
const fieldTypeObject = ref(fieldType);
const fieldsListOfListener = ref([]);
const listenerFieldFormModelVisible = ref(false); // 监听器 注入字段表单弹窗 显示状态
const editingListenerIndex = ref(-1); // 监听器所在下标，-1 为新增
const editingListenerFieldIndex = ref(-1); // 字段所在下标，-1 为新增
const listenerFieldForm = ref<ANY_OBJECT>({}); // 监听器 注入字段 详情表单

let bpmnElementListeners: ANY_OBJECT[] = [];
let bpmnElement: ANY_OBJECT = {};
let otherExtensionList: ANY_OBJECT[] = [];

const getOtherExtensionList = () => {
  otherExtensionList = [];
  let temp =
    bpmnElement.businessObject?.extensionElements?.values?.filter(ex => {
      if (ex.$type !== `${prefix}:TaskListener`) {
        otherExtensionList.push(ex);
      }
      return ex.$type === `${prefix}:TaskListener`;
    }) ?? [];
  return temp;
};
const resetListenersList = () => {
  bpmnElement = window.bpmnInstances.bpmnElement;
  bpmnElementListeners = getOtherExtensionList();
  elementListenersList.value = bpmnElementListeners.map(listener => initListenerType(listener));
};
const openListenerForm = (listener: ANY_OBJECT | null, index: number) => {
  if (listener) {
    listenerForm.value = initListenerForm(listener);
    editingListenerIndex.value = index;
  } else {
    listenerForm.value = {};
    editingListenerIndex.value = -1; // 标记为新增
  }
  if (listener && listener.fields) {
    fieldsListOfListener.value = listener.fields.map(field => ({
      ...field,
      fieldType: field.string ? 'string' : 'expression',
    }));
  } else {
    fieldsListOfListener.value = [];
    const val = { ...listenerForm.value };
    val.fields = [];
    listenerForm.value = val;
  }
  // 打开侧边栏并清楚验证状态
  listenerFormModelVisible.value = true;
  nextTick(() => {
    if (listenerFormRef.value) listenerFormRef.value.clearValidate();
  });
};
// 移除监听器
const removeListener = (listener: ANY_OBJECT | null, index: number) => {
  ElMessageBox.confirm('确认移除该监听器吗？', '提示', {
    confirmButtonText: '确 认',
    cancelButtonText: '取 消',
    type: 'warning',
  })
    .then(() => {
      getOtherExtensionList();
      bpmnElementListeners.splice(index, 1);
      elementListenersList.value.splice(index, 1);
      updateElementExtensions(bpmnElement, otherExtensionList.concat(bpmnElementListeners));
    })
    .catch(() => console.info('操作取消'));
};
// 保存监听器
const saveListenerConfig = async () => {
  let validateStatus = await listenerFormRef.value.validate();
  if (!validateStatus) return; // 验证不通过直接返回
  const listenerObject = createListenerObject(listenerForm.value, true, prefix);
  if (editingListenerIndex.value === -1) {
    bpmnElementListeners.push(listenerObject);
    elementListenersList.value.push(listenerForm.value);
  } else {
    bpmnElementListeners.splice(editingListenerIndex.value, 1, listenerObject);
    elementListenersList.value.splice(editingListenerIndex.value, 1, listenerForm.value);
  }
  getOtherExtensionList();
  updateElementExtensions(bpmnElement, otherExtensionList.concat(bpmnElementListeners));
  // 4. 隐藏侧边栏
  listenerFormModelVisible.value = false;
  listenerForm.value = {};
};
// 打开监听器字段编辑弹窗
const openListenerFieldForm = (field: ANY_OBJECT, index: number) => {
  listenerFieldForm.value = field ? JSON.parse(JSON.stringify(field)) : {};
  editingListenerFieldIndex.value = field ? index : -1;
  listenerFieldFormModelVisible.value = true;
  nextTick(() => {
    if (listenerFieldFormRef.value) listenerFieldFormRef.value.clearValidate();
  });
};
// 保存监听器注入字段
const saveListenerFiled = async () => {
  let validateStatus = await listenerFieldFormRef.value.validate();
  if (!validateStatus) return; // 验证不通过直接返回
  if (editingListenerFieldIndex.value === -1) {
    fieldsListOfListener.value.push(listenerFieldForm.value);
    listenerForm.value.fields.push(listenerFieldForm.value);
  } else {
    fieldsListOfListener.value.splice(editingListenerFieldIndex.value, 1, listenerFieldForm.value);
    listenerForm.value.fields.splice(editingListenerFieldIndex.value, 1, listenerFieldForm.value);
  }
  listenerFieldFormModelVisible.value = false;
  nextTick(() => (listenerFieldForm.value = {}));
};
// 移除监听器字段
const removeListenerField = (field: ANY_OBJECT, index: number) => {
  ElMessageBox.confirm('确认移除该字段吗？', '提示', {
    confirmButtonText: '确 认',
    cancelButtonText: '取 消',
    type: 'warning',
  })
    .then(() => {
      fieldsListOfListener.value.splice(index, 1);
      listenerForm.value.fields.splice(index, 1);
    })
    .catch(() => console.info('操作取消'));
};

watch(
  () => props.id,
  val => {
    val && val.length && nextTick(() => resetListenersList());
  },
  {
    immediate: true,
  },
);

defineExpose({ openListenerForm });
</script>

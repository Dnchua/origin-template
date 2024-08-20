<template>
  <div class="panel-tab__content" style="padding-top: 0">
    <el-form :size="layoutStore.defaultFormItemSize" @submit.prevent label-position="top">
      <el-form-item label="是否会签" style="margin-bottom: 4px">
        <template #label>
          <span>是否会签</span>
          <el-switch
            v-model="isCountersign"
            style="margin-left: 18px"
            @change="isCountersignChange"
          />
        </template>
      </el-form-item>
      <div v-if="isCountersign">
        <el-form-item label="内置变量" style="margin-bottom: 5px">
          <template #label>
            <span>内置变量</span>
            <el-button
              class="variables-btn"
              type="primary"
              @click="showVariableDlg = true"
              size="default"
              plain
            >
              查看
            </el-button>
          </template>
        </el-form-item>
        <!-- <el-form-item label="回路特性">
          <el-select v-model="loopCharacteristics" @change="changeLoopCharacteristicsType" disabled>
            bpmn:MultiInstanceLoopCharacteristics
            <el-option label="并行多重事件" value="ParallelMultiInstance" />
            <el-option label="时序多重事件" value="SequentialMultiInstance" />
            bpmn:StandardLoopCharacteristics
            <el-option label="循环事件" value="StandardLoop" />
            <el-option label="无" value="Null" />
          </el-select>
        </el-form-item> -->
        <template
          v-if="
            loopCharacteristics === 'ParallelMultiInstance' ||
            loopCharacteristics === 'SequentialMultiInstance'
          "
        >
          <!--
          <el-form-item label="循环基数" key="loopCardinality">
            <el-input v-model="loopInstanceForm.loopCardinality" clearable @change="updateLoopCardinality" />
          </el-form-item>
          -->
          <!-- <el-form-item label="集合" key="collection">
            <el-input v-model="loopInstanceForm.collection" clearable @change="updateLoopBase" />
          </el-form-item>
          <el-form-item label="元素变量" key="elementVariable">
            <el-input v-model="loopInstanceForm.elementVariable" clearable @change="updateLoopBase" />
          </el-form-item> -->
          <el-form-item label="完成条件" key="completionCondition">
            <el-input
              v-model="loopInstanceForm.completionCondition"
              clearable
              @change="updateLoopCondition"
            />
          </el-form-item>
          <!-- <el-form-item label="异步状态" key="async">
            <el-checkbox v-model="loopInstanceForm.asyncBefore" label="异步前" @change="updateLoopAsync('asyncBefore')" />
            <el-checkbox v-model="loopInstanceForm.asyncAfter" label="异步后" @change="updateLoopAsync('asyncAfter')" />
            <el-checkbox
              v-model="loopInstanceForm.exclusive"
              v-if="loopInstanceForm.asyncAfter || loopInstanceForm.asyncBefore"
              label="排除"
              @change="updateLoopAsync('exclusive')"
            />
          </el-form-item> -->
          <el-form-item
            label="重试周期"
            prop="timeCycle"
            v-if="loopInstanceForm.asyncAfter || loopInstanceForm.asyncBefore"
            key="timeCycle"
          >
            <el-input
              v-model="loopInstanceForm.timeCycle"
              clearable
              @change="updateLoopTimeCycle"
            />
          </el-form-item>
        </template>
      </div>
      <el-form-item label="任务通知">
        <el-select
          v-model="sendMessageType"
          multiple
          clearable
          @change="updateSendMessageType()"
          placeholder=""
        >
          <el-option label="邮件" value="email" />
        </el-select>
      </el-form-item>
    </el-form>
    <el-dialog
      title="内置变量"
      v-model="showVariableDlg"
      width="800px"
      append-to-body
      destroy-on-close
      class="panel-dialog"
    >
      <div style="padding: 16px 20px">
        <vxe-table
          :data="variableList"
          :size="layoutStore.defaultFormItemSize"
          :row-config="{ isHover: true }"
        >
          <vxe-column title="变量名称" field="name" width="180px" />
          <vxe-column title="描述" field="desc" />
          <template v-slot:empty>
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png" />
              <span>暂无数据</span>
            </div>
          </template>
        </vxe-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { VxeTable, VxeColumn } from 'vxe-table';
import TaskUserSelect from '@/pages/workflow/components/TaskUserSelect.vue';
import { SysCommonBizController } from '@/api/system';
import { ANY_OBJECT } from '@/types/generic';
import { Dialog } from '@/components/Dialog';

const props = defineProps<{ businessObject: ANY_OBJECT; type: string }>();
console.log('ElementMultiInstance props', props);

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();
const prefix = inject('prefix');

const win: ANY_OBJECT = window;
const isCountersign = ref(true);
const showVariableDlg = ref(false);
const loopCharacteristics = ref('ParallelMultiInstance');
const sendMessageType = ref<ANY_OBJECT[]>([]);
const timeoutHandleWay = ref<string>();
const timeoutHours = ref<number | string>();
const defaultAssignee = ref<string>();
const defaultAssigneeShowName = ref<string>();
const emptyUserHandleWay = ref('autoComplete');
const emptyUserToAssignee = ref<string>();
const emptyUserToAssigneeShowName = ref<string>();
//默认配置，用来覆盖原始不存在的选项，避免报错
const defaultLoopInstanceForm = {
  completionCondition: '',
  loopCardinality: '',
  extensionElements: [],
  asyncAfter: false,
  asyncBefore: false,
  exclusive: false,
};
const loopInstanceForm = ref<ANY_OBJECT>({
  collection: 'assigneeList',
  elementVariable: 'assignee',
});
const variableList = [
  {
    name: 'assigneeList',
    desc: '多实例用户集合变量',
  },
  {
    name: 'nrOfInstances',
    desc: '实例总数',
  },
  {
    name: 'nrOfActiveInstances',
    desc: '当前活动的（即未完成的），实例数量。对于顺序多实例，这个值总为1',
  },
  {
    name: 'nrOfCompletedInstances',
    desc: '已完成的实例数量',
  },
  {
    name: 'multiNumOfInstances',
    desc: '实例总数（多实例节点后使用这个变量判断）',
  },
  {
    name: 'multiAgreeCount',
    desc: '同意实例数量',
  },
  {
    name: 'multiRefuseCount',
    desc: '拒绝实例数量',
  },
  {
    name: 'multiAbstainCount',
    desc: '弃权实例数量',
  },
];

let bpmnElement: ANY_OBJECT | null = {};
let multiLoopInstance: ANY_OBJECT | null = {};

const loadUserInfo = (val: string, callback: (res: string | undefined) => void | null) => {
  let params = {
    widgetType: 'upms_user',
    fieldName: 'loginName',
    fieldValues: val,
  };
  SysCommonBizController.viewByIds(params)
    .then(res => {
      console.log(res);
      if (Array.isArray(res.data) && res.data.length > 0) {
        if (callback) callback(res.data[0].showName || res.data[0].loginName);
      } else {
        if (callback) callback(undefined);
      }
    })
    .catch(e => {
      console.log(e);
    });
};
const onSelectAssignee = (callback: (res: ANY_OBJECT) => void) => {
  Dialog.show<ANY_OBJECT>(
    '选择用户',
    TaskUserSelect,
    {
      area: ['1000px', '650px'],
    },
    {
      multiple: false,
      showAssignee: false,
      path: 'thirdTaskUserSelect',
    },
    {
      width: '1000px',
      height: '650px',
      pathName: '/thirdParty/thirdTaskUserSelect',
    },
  )
    .then(res => {
      console.log('onSelectAssignee >>>', res);
      callback(res);
    })
    .catch(e => {
      console.error(e);
    });
};
const getElementLoop = (businessObject: ANY_OBJECT) => {
  //console.log('getElementLoop businessObject', businessObject, win.bpmnInstances.bpmnElement);
  let value = (win.bpmnInstances.bpmnElement || {}).businessObject?.sendMessageType;
  sendMessageType.value = value != null && value !== '' ? value.split(',') : [];
  timeoutHandleWay.value = (win.bpmnInstances.bpmnElement || {}).businessObject?.timeoutHandleWay;
  timeoutHours.value = (win.bpmnInstances.bpmnElement || {}).businessObject?.timeoutHours;
  defaultAssignee.value = (win.bpmnInstances.bpmnElement || {}).businessObject?.defaultAssignee;
  emptyUserHandleWay.value =
    (win.bpmnInstances.bpmnElement || {}).businessObject.emptyUserHandleWay || 'autoComplete';
  emptyUserToAssignee.value = (
    win.bpmnInstances.bpmnElement || {}
  ).businessObject.emptyUserToAssignee;

  emit('isCountersignChange', !!businessObject.loopCharacteristics);

  if (!businessObject.loopCharacteristics) {
    loopCharacteristics.value = 'Null';
    loopInstanceForm.value = {};
    isCountersign.value = false;
    return;
  }
  if (businessObject.loopCharacteristics.$type === 'bpmn:StandardLoopCharacteristics') {
    loopCharacteristics.value = 'StandardLoop';
    loopInstanceForm.value = {};
    return;
  }
  if (businessObject.loopCharacteristics.isSequential) {
    loopCharacteristics.value = 'SequentialMultiInstance';
  } else {
    loopCharacteristics.value = 'ParallelMultiInstance';
  }
  // 合并配置
  loopInstanceForm.value = {
    ...defaultLoopInstanceForm,
    ...businessObject.loopCharacteristics,
    completionCondition: businessObject.loopCharacteristics?.completionCondition?.body ?? '',
    loopCardinality: businessObject.loopCharacteristics?.loopCardinality?.body ?? '',
  };
  // 保留当前元素 businessObject 上的 loopCharacteristics 实例
  multiLoopInstance = win.bpmnInstances.bpmnElement.businessObject.loopCharacteristics;
  // 更新表单
  if (
    businessObject.loopCharacteristics.extensionElements &&
    businessObject.loopCharacteristics.extensionElements.values &&
    businessObject.loopCharacteristics.extensionElements.values.length
  ) {
    const val = { ...loopInstanceForm.value };
    val.timeCycle = businessObject.loopCharacteristics.extensionElements.values[0].body;
    loopInstanceForm.value = val;
  }
};
const changeLoopCharacteristicsType = (type: string) => {
  // loopInstanceForm.value = { ...defaultLoopInstanceForm }; // 切换类型取消原表单配置
  // 取消多实例配置
  if (type === 'Null') {
    win.bpmnInstances.modeling.updateProperties(bpmnElement, {
      loopCharacteristics: null,
    });
    return;
  }
  // 配置循环
  if (type === 'StandardLoop') {
    const loopCharacteristicsObject = win.bpmnInstances.moddle.create(
      'bpmn:StandardLoopCharacteristics',
    );
    win.bpmnInstances.modeling.updateProperties(bpmnElement, {
      loopCharacteristics: loopCharacteristicsObject,
    });
    multiLoopInstance = null;
    return;
  }
  // 时序
  if (type === 'SequentialMultiInstance') {
    multiLoopInstance = win.bpmnInstances.moddle.create('bpmn:MultiInstanceLoopCharacteristics', {
      isSequential: true,
    });
  } else {
    multiLoopInstance = win.bpmnInstances.moddle.create('bpmn:MultiInstanceLoopCharacteristics');
  }

  win.bpmnInstances.modeling.updateProperties(bpmnElement, {
    loopCharacteristics: multiLoopInstance,
  });

  updateLoopBase();
};
// 循环基数

// 完成条件
const updateLoopCondition = (condition: string) => {
  let completionCondition = null;
  if (condition && condition.length) {
    completionCondition = win.bpmnInstances.moddle.create('bpmn:FormalExpression', {
      body: condition,
    });
  }
  win.bpmnInstances.modeling.updateModdleProperties(bpmnElement, multiLoopInstance, {
    completionCondition,
  });
};
// 重试周期
const updateLoopTimeCycle = (timeCycle: string) => {
  const extensionElements = win.bpmnInstances.moddle.create('bpmn:ExtensionElements', {
    values: [
      win.bpmnInstances.moddle.create(`${prefix}:FailedJobRetryTimeCycle`, {
        body: timeCycle,
      }),
    ],
  });
  win.bpmnInstances.modeling.updateModdleProperties(bpmnElement, multiLoopInstance, {
    extensionElements,
  });
};
// 直接更新的基础信息
const updateLoopBase = () => {
  win.bpmnInstances.modeling.updateModdleProperties(bpmnElement, multiLoopInstance, {
    collection: loopInstanceForm.value.collection || null,
    elementVariable: loopInstanceForm.value.elementVariable || null,
  });
};
// 各异步状态

const isCountersignChange = (bol: string | number | boolean) => {
  if (!bol) {
    loopCharacteristics.value = 'Null';
    loopInstanceForm.value = {};
    changeLoopCharacteristicsType('Null');
    win.bpmnInstances.modeling.updateProperties(win.bpmnInstances.bpmnElement, {
      assignee: undefined,
    });
  } else {
    loopCharacteristics.value = 'ParallelMultiInstance';
    loopInstanceForm.value = {
      collection: 'assigneeList',
      elementVariable: 'assignee',
    };
    changeLoopCharacteristicsType('ParallelMultiInstance');
  }
};
const updateSendMessageType = () => {
  let taskAttr = Object.create(null);
  taskAttr.sendMessageType = sendMessageType.value.join(',');
  win.bpmnInstances.modeling.updateProperties(win.bpmnInstances.bpmnElement, taskAttr);
};
const onTimeoutChange = () => {
  let taskAttr = Object.create(null);
  if (!timeoutHandleWay.value) {
    timeoutHandleWay.value = undefined;
    timeoutHours.value = undefined;
  } else {
    if (timeoutHours.value == null) timeoutHours.value = 24;
  }
  // 只有自动审批才能设置默认处理人
  if (timeoutHandleWay.value !== 'autoComplete') {
    defaultAssignee.value = undefined;
  }
  taskAttr.timeoutHandleWay = timeoutHandleWay.value;
  taskAttr.timeoutHours = timeoutHours.value;
  taskAttr.defaultAssignee = defaultAssignee.value;
  // TODO 调用该方法导致界面不更新，可能是值传过去的不正确
  win.bpmnInstances.modeling.updateProperties(win.bpmnInstances.bpmnElement, taskAttr);
  console.log('ElementMultiInstance onTimeoutChange', win.bpmnInstances.bpmnElement, taskAttr);
};
const onTimeoutAssigneeChang = (res: ANY_OBJECT) => {
  if (res) {
    defaultAssignee.value = res.loginName;
    defaultAssigneeShowName.value = res.showName;
  }
  onTimeoutChange();
};
const onEmptyUserChange = (res: ANY_OBJECT) => {
  if (res) {
    emptyUserToAssignee.value = res.loginName;
    emptyUserToAssigneeShowName.value = res.showName;
  }
  let taskAttr = Object.create(null);
  if (emptyUserHandleWay.value !== 'toAssignee') {
    emptyUserToAssignee.value = undefined;
  }
  taskAttr.emptyUserHandleWay = emptyUserHandleWay.value;
  taskAttr.emptyUserToAssignee = emptyUserToAssignee.value;
  // TODO
  win.bpmnInstances.modeling.updateProperties(win.bpmnInstances.bpmnElement, taskAttr);
  console.log('ElementMultiInstance onEmptyUserChange', win.bpmnInstances.bpmnElement, taskAttr);
};

onBeforeUnmount(() => {
  multiLoopInstance = null;
  bpmnElement = null;
});

const emit = defineEmits<{ isCountersignChange: [boolean] }>();

watch(
  () => props.type,
  () => {
    if (props.businessObject) {
      getElementLoop(props.businessObject);
    }
  },
);
watch(
  () => props.businessObject,
  val => {
    bpmnElement = win.bpmnInstances.bpmnElement;
    getElementLoop(val);
  },
  {
    immediate: true,
  },
);
watch(
  isCountersign,
  val => {
    emit('isCountersignChange', val);
  },
  {
    immediate: true,
  },
);
watch(
  emptyUserToAssignee,
  val => {
    if (val == null || val === '') {
      emptyUserToAssigneeShowName.value = undefined;
    } else if (val === '${startUserName}') {
      emptyUserToAssigneeShowName.value = '流程发起人';
    } else if (val === '${appointedAssignee}') {
      emptyUserToAssigneeShowName.value = '指定审批人';
    } else {
      if (emptyUserToAssigneeShowName.value == null || emptyUserToAssigneeShowName.value === '') {
        loadUserInfo(val, showName => {
          emptyUserToAssigneeShowName.value = showName;
        });
      }
    }
  },
  {
    immediate: true,
  },
);
watch(
  defaultAssignee,
  val => {
    if (val == null || val === '') {
      defaultAssigneeShowName.value = undefined;
    } else if (val === '${startUserName}') {
      defaultAssigneeShowName.value = '流程发起人';
    } else {
      if (defaultAssigneeShowName.value == null || defaultAssigneeShowName.value === '') {
        loadUserInfo(val, showName => {
          defaultAssigneeShowName.value = showName;
        });
      }
    }
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
.panel-dialog .el-dialog__body {
  overflow: hidden;
  padding: 0 1px;
}
.variables-btn {
  width: 64px;
  height: 24px;
  padding: 0 !important;
  margin-left: 18px !important;
  font-size: 12px !important;
  color: $color-primary !important;

  /* float: right; */
  background-color: #fff !important;
  border-color: $color-primary !important;
  line-height: 24px !important;
}
.variables-btn:hover {
  color: $color-primary !important;
  opacity: 0.8;
}
</style>

<style scoped>
.input-with-select {
  width: 88%;
}
.input-with-select :deep(.el-input-group__prepend) {
  padding: 0;
  background-color: #fff;
  width: 120px;
}
.input-with-select :deep(.el-select .el-input__inner) {
  cursor: pointer !important;
}

.empty-user .el-radio {
  margin-bottom: 8px;
}
.el-input :deep(.el-input-group__prepend .el-input__inner) {
  color: #606266;
}
.el-input :deep(.el-input-group__prepend .el-input__inner:hover) {
  color: #606266;
}
</style>

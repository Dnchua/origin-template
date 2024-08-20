<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input form-box"
      :rules="rules"
      style="width: 100%"
      label-width="100px"
      :size="itemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col
          :span="24"
          v-if="dialogParams.operation.type === SysFlowTaskOperationType.FREE_JUMP"
        >
          <el-form-item label="任务节点" prop="targetTaskKey">
            <UserTaskSelect
              v-model:value="formData.targetTaskKey"
              :xml="dialogParams.xml"
              :finishedInfo="dialogParams.finishedInfo"
              placeholder="请选择跳转任务节点"
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          v-if="
            showAssignSelect || dialogParams.operation.type === SysFlowTaskOperationType.FREE_JUMP
          "
        >
          <el-form-item
            label="指派用户"
            :prop="
              dialogParams.operation.type === SysFlowTaskOperationType.FREE_JUMP
                ? undefined
                : 'assignee'
            "
          >
            <TagSelect v-model:value="userName">
              <template #append>
                <el-button
                  class="append-add"
                  type="default"
                  :icon="Plus"
                  @click="onSelectAssignee"
                />
              </template>
            </TagSelect>
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          v-if="dialogParams.operation.type === SysFlowTaskOperationType.SIGN_REDUCTION"
        >
          <el-form-item label="减签用户" prop="assignee">
            <el-select
              v-model="formData.assignee"
              placeholder=""
              clearable
              multiple
              collapse-tags
              :loading="multiSignAssignees.loading"
              @visible-change="multiSignAssignees.onVisibleChange"
            >
              <el-option
                v-for="item in multiSignAssignees.dropdownList"
                :key="item.assignee"
                :value="item.assignee"
                :label="item.showName"
                :disabled="item.approved"
              >
                <el-row type="flex" justify="space-between" align="middle">
                  <span>{{ item.showName }}</span>
                  <el-tag v-if="item.approved" size="default" type="info" style="margin-right: 10px"
                    >已处理</el-tag
                  >
                </el-row>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          v-if="
            dialogParams.processInstanceId != null &&
            dialogParams.taskId != null &&
            dialogParams.operation.type === SysFlowTaskOperationType.REJECT_TO_TASK
          "
        >
          <el-form-item label="驳回节点" prop="targetTaskKey">
            <el-select
              v-model="formData.targetTaskKey"
              :loading="taskWidget.loading"
              @visible-change="taskWidget.onVisibleChange"
            >
              <el-option
                v-for="item in taskWidget.dropdownList"
                :key="item.taskKey"
                :value="item.taskKey"
                :label="item.showName"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          v-if="
            dialogParams.operation.type !== SysFlowTaskOperationType.CO_SIGN &&
            dialogParams.operation.type !== SysFlowTaskOperationType.SIGN_REDUCTION &&
            dialogParams.operation.type !== SysFlowTaskOperationType.MULTI_SIGN
          "
        >
          <el-form-item label="审批意见" prop="message">
            <el-input v-model="formData.message" clearable placeholder="请输入审批意见" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="no-scroll flex-box menu-box" type="flex" justify="end">
      <el-button :size="itemSize" :plain="true" @click="onCancel"> 取消 </el-button>
      <el-button type="primary" :size="itemSize" @click="onSubmit"> 提交 </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import TagSelect from '@/pages/workflow/components/TagSelect.vue';
import TaskUserSelect from '@/pages/workflow/components/TaskUserSelect.vue';
import UserTaskSelect from '@/pages/workflow/components/UserTaskSelect/index.vue';
import { FlowOperationController } from '@/api/flow';
import { SysFlowTaskOperationType } from '@/common/staticDict/flow';
import { ANY_OBJECT } from '@/types/generic';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import { DialogProp } from '@/components/Dialog/types';
import { Dialog } from '@/components/Dialog';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  operation?: ANY_OBJECT;
  processInstanceId?: string;
  taskId?: string;
  xml?: string;
  finishedInfo?: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
const itemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const form = ref();
const formData = ref<ANY_OBJECT>({
  message: undefined,
  assignee: undefined,
  targetTaskKey: undefined,
});
const dialogParams = computed(() => {
  return {
    operation: props.operation || thirdParams.value.operation || {},
    processInstanceId: props.processInstanceId || thirdParams.value.processInstanceId,
    taskId: props.taskId || thirdParams.value.taskId,
    xml: props.xml || thirdParams.value.xml,
    finishedInfo: props.finishedInfo || thirdParams.value.finishedInfo,
  };
});

const listMultiSignAssigneesDropdownData = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    FlowOperationController.listMultiSignAssignees({
      processInstanceId: dialogParams.value.processInstanceId,
      taskId: dialogParams.value.taskId,
    })
      .then(res => {
        console.log('>>>listMultiSignAssigneesDropdownData<<<', res);
        // 将已经处理过会签任务的处理人放到列表最后
        resolve({
          dataList: res.data.dataList.sort((val1, val2) => {
            return val1.approved === val2.approved ? 0 : val1.approved ? 1 : -1;
          }),
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const multiSignAssigneesOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: listMultiSignAssigneesDropdownData,
};
const multiSignAssignees = reactive(useDropdown(multiSignAssigneesOptions));

const loadTaskWidgetDropdownData = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    FlowOperationController.listRejectCandidateUserTask({
      processInstanceId: dialogParams.value.processInstanceId,
      taskId: dialogParams.value.taskId,
    })
      .then(res => {
        resolve({ dataList: res.data.dataList });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const taskWidgetOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadTaskWidgetDropdownData,
};
const taskWidget = reactive(useDropdown(taskWidgetOptions));
const rules = {
  message: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }],
  assignee: [{ required: true, message: '指派用户不能为空', trigger: 'blur' }],
  targetTaskKey: [{ required: true, message: '任务节点不能为空', trigger: 'blur' }],
};
const userName = ref<ANY_OBJECT[]>([]);
let otherFilterObject: ANY_OBJECT;

const showAssignSelect = computed(() => {
  let showAssignSelect = false;
  // 如果是会签操作，判断是否在流程内设置了会签人
  if (dialogParams.value.operation.type === SysFlowTaskOperationType.MULTI_SIGN) {
    showAssignSelect =
      !dialogParams.value.operation.multiSignAssignee ||
      !Array.isArray(dialogParams.value.operation.multiSignAssignee.assigneeList) ||
      dialogParams.value.operation.multiSignAssignee.assigneeList.length <= 0;
  }
  return (
    [
      SysFlowTaskOperationType.TRANSFER,
      SysFlowTaskOperationType.CO_SIGN,
      SysFlowTaskOperationType.SET_ASSIGNEE,
    ].indexOf(dialogParams.value.operation.type) !== -1 || showAssignSelect
  );
});
const multiSelect = computed(() => {
  // 转办、加签、会签允许多选
  return (
    [
      SysFlowTaskOperationType.CO_SIGN,
      SysFlowTaskOperationType.MULTI_SIGN,
      SysFlowTaskOperationType.TRANSFER,
      SysFlowTaskOperationType.SET_ASSIGNEE,
    ].indexOf(dialogParams.value.operation.type) !== -1
  );
});

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};
const onSubmit = () => {
  form.value.validate((valid: boolean) => {
    if (!valid) return;
    if (props.dialog) {
      props.dialog.submit(formData.value);
    } else {
      onCloseThirdDialog(true, thirdParams.value.rowData, formData.value);
    }
  });
};

const onSelectAssignee = () => {
  let usedUserIdList =
    formData.value.assignee == null || formData.value.assignee === ''
      ? []
      : formData.value.assignee.split(',');
  Dialog.show<ANY_OBJECT[] | ANY_OBJECT>(
    '选择用户',
    TaskUserSelect,
    {
      area: ['1000px', '650px'],
    },
    {
      showAssignee: false,
      showStartUser:
        dialogParams.value.operation.type !== SysFlowTaskOperationType.CO_SIGN &&
        dialogParams.value.operation.type !== SysFlowTaskOperationType.SIGN_REDUCTION,
      multiple: multiSelect.value,
      usedUserIdList,
      filterObject: otherFilterObject,
      path: 'thirdTaskUserSelect',
    },
    {
      width: '1000px',
      height: '690px',
      pathName: '/thirdParty/thirdTaskUserSelect',
    },
  )
    .then(res => {
      updateSelectAssignee(res);
    })
    .catch(e => {
      console.warn(e);
    });
};
const updateSelectAssignee = (res: ANY_OBJECT[] | ANY_OBJECT) => {
  if (Array.isArray(res)) {
    let oldUserList = userName.value.map(item => item.id);
    res.forEach(item => {
      if (oldUserList.indexOf(item.loginName) === -1) {
        userName.value.push({
          id: item.loginName,
          name: item.showName || item.loginName,
        });
      }
    });
  } else {
    userName.value = res
      ? [
          {
            id: res.loginName,
            name: res.showName || res.loginName,
          },
        ]
      : [];
  }
};

onMounted(() => {
  if (
    props.operation &&
    props.operation.type === SysFlowTaskOperationType.SET_ASSIGNEE &&
    props.operation.multiSignAssignee
  ) {
    if (
      props.operation.multiSignAssignee.assigneeType &&
      props.operation.multiSignAssignee.assigneeList
    ) {
      otherFilterObject = {
        USER_FILTER_GROUP: JSON.stringify({
          type: props.operation.multiSignAssignee.assigneeType,
          values: props.operation.multiSignAssignee.assigneeList,
        }),
      };
    }
  }
});

watch(
  userName,
  newValue => {
    if (newValue) {
      let usedUserIdList = newValue.map(item => item.id);
      formData.value.assignee = usedUserIdList.join(',');
    }
  },
  {
    deep: true,
  },
);

const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdTaskUserSelect' && data.isSuccess) {
    updateSelectAssignee(data.data);
  }
};
defineExpose({ refreshData });
</script>

<style scoped>
.append-add {
  background: #f5f7fa;
  border: none;
  border-radius: 0;
  border-left: 1px solid #dcdfe6;
}
</style>

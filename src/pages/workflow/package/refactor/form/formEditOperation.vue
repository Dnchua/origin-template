<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input form-box"
      :rules="rules"
      style="overflow-x: hidden; overflow-y: auto; width: 100%"
      label-width="100px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="按钮类型" prop="type">
            <el-select
              class="input-item"
              v-model="formData.type"
              :clearable="true"
              placeholder="按钮类型"
              @change="onOperationTypeChange"
            >
              <el-option
                v-for="item in getValidOperationList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="按钮名称" prop="label">
            <el-input
              class="input-item"
              v-model="formData.label"
              :clearable="true"
              placeholder="按钮名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="更新工单状态">
            <el-select
              class="input-item"
              v-model="formData.latestApprovalStatus"
              placeholder="不更新"
              clearable
            >
              <el-option label="不更新" :value="undefined" />
              <el-option
                v-for="item in dialogParams.validStatusList.value"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          v-if="
            formData.type === SysFlowTaskOperationType.MULTI_SIGN ||
            formData.type === SysFlowTaskOperationType.SET_ASSIGNEE
          "
        >
          <el-form-item
            :label="
              (formData.type === SysFlowTaskOperationType.MULTI_SIGN ? '会签' : '审批') + '用户类型'
            "
          >
            <el-select v-model="multiSignAssignee.assigneeType" placeholder="" @change="typeChange">
              <el-option label="用户" value="USER_GROUP" />
              <el-option label="角色" value="ROLE_GROUP" />
              <el-option label="部门" value="DEPT_GROUP" />
              <el-option label="岗位" value="POST_GROUP" />
              <el-option label="部门岗位" value="DEPT_POST_GROUP" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          v-if="
            formData.type === SysFlowTaskOperationType.MULTI_SIGN ||
            formData.type === SysFlowTaskOperationType.SET_ASSIGNEE
          "
        >
          <el-form-item
            :label="
              (formData.type === SysFlowTaskOperationType.MULTI_SIGN ? '会签' : '审批') + '用户选择'
            "
          >
            <TagSelect
              v-if="multiSignAssignee.assigneeType === 'USER_GROUP'"
              v-model:value="userName"
            >
              <template #append>
                <el-button class="append-add" type="default" :icon="Plus" @click="onSelectUser" />
              </template>
            </TagSelect>
            <el-select
              class="assignee-select"
              v-if="
                multiSignAssignee.assigneeType === 'ROLE_GROUP' ||
                multiSignAssignee.assigneeType === 'POST_GROUP'
              "
              v-model="multiSignAssignee.assigneeList"
              placeholder=""
              :multiple="true"
            >
              <el-option
                v-for="item in multiSignGroupList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <TagSelect
              v-if="multiSignAssignee.assigneeType === 'DEPT_GROUP'"
              v-model:value="deptItems"
            >
              <template #append>
                <el-button class="append-add" type="default" :icon="Plus" @click="onSelectDept" />
              </template>
            </TagSelect>
            <el-cascader
              v-if="multiSignAssignee.assigneeType === 'DEPT_POST_GROUP'"
              v-model="multiSignAssignee.assigneeList"
              :options="multiSignGroupList"
              key="dept_post_select"
              :props="{
                multiple: true,
                value: 'id',
                label: 'name',
              }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="显示顺序">
            <el-input-number
              class="input-item"
              v-model="formData.showOrder"
              :clearable="true"
              placeholder="显示顺序"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="no-scroll flex-box menu-box" type="flex" justify="end" style="padding-top: 10px">
      <el-button :size="layoutStore.defaultFormItemSize" :plain="true" @click="onCancel">
        取消
      </el-button>
      <el-button type="primary" :size="layoutStore.defaultFormItemSize" @click="onSubmit">
        保存
      </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { ANY_OBJECT } from '@/types/generic';
import TaskUserSelect from '@/pages/workflow/components/TaskUserSelect.vue';
import { SysCommonBizController } from '@/api/system';
import { findTreeNodePath, treeDataTranslate, findItemFromList } from '@/common/utils';
import TaskGroupSelect from '@/pages/workflow/components/TaskGroupSelect.vue';
import TagSelect from '@/pages/workflow/components/TagSelect.vue';
import { SysFlowTaskOperationType } from '@/common/staticDict/flow';
import { Dialog } from '@/components/Dialog';
import { DialogProp } from '@/components/Dialog/types';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';

const layoutStore = useLayoutStore();
interface IProps extends ThirdProps {
  rowData?: ANY_OBJECT;
  validStatusList?: Ref<ANY_OBJECT[]>;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT | ANY_OBJECT[] | undefined>;
}
const props = withDefaults(defineProps<IProps>(), {
  validStatusList: () => ref([]),
});
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const form = ref();
const formData = ref<ANY_OBJECT>({
  id: undefined,
  type: undefined,
  label: undefined,
  latestApprovalStatus: undefined,
  showOrder: 0,
});
const userList = ref<ANY_OBJECT[]>();
const roleList = ref<ANY_OBJECT[]>();
const deptList = ref<ANY_OBJECT[]>();
const deptItems = ref<ANY_OBJECT[]>([]);
let deptData: ANY_OBJECT[] = [];
const postList = ref<ANY_OBJECT[]>();
const deptPostList = ref<ANY_OBJECT[]>();
const multiSignAssignee = ref<ANY_OBJECT>({
  assigneeType: 'USER_GROUP',
  value: [],
  assigneeList: [],
});
const rules = {
  type: [{ required: true, message: '请选择按钮类型', trigger: 'blur' }],
  label: [{ required: true, message: '请输入按钮名称', trigger: 'blur' }],
};
const userName = ref<ANY_OBJECT[]>([]);
const dialogParams = computed(() => {
  return {
    rowData: props.rowData || thirdParams.value.rowData,
    validStatusList: props.validStatusList.value || thirdParams.value.validStatusList || [],
  };
});
const multiSignGroupList = computed(() => {
  switch (multiSignAssignee.value.assigneeType) {
    case 'USER_GROUP':
      return userList.value;
    case 'ROLE_GROUP':
      return roleList.value;
    case 'DEPT_GROUP':
      return deptList.value;
    case 'POST_GROUP':
      return postList.value;
    case 'DEPT_POST_GROUP':
      return deptPostList.value;
    default:
      return [] as ANY_OBJECT[];
  }
});
const getValidOperationList = computed(() => {
  return SysFlowTaskOperationType.getList().filter(item => {
    return (
      [
        SysFlowTaskOperationType.INTERVENE,
        SysFlowTaskOperationType.REVIVE,
        SysFlowTaskOperationType.TIMEOUT_AUTO_COMPLETE,
        SysFlowTaskOperationType.EMPTY_USER_AUTO_COMPLETE,
        SysFlowTaskOperationType.EMPTY_USER_AUTO_REJECT,
      ].indexOf(item.id) === -1
    );
  });
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
    if (valid) {
      if (
        (formData.value.type === SysFlowTaskOperationType.MULTI_SIGN ||
          formData.value.type === SysFlowTaskOperationType.SET_ASSIGNEE) &&
        Array.isArray(multiSignAssignee.value.assigneeList) &&
        multiSignAssignee.value.assigneeList.length > 0
      ) {
        let tempValue;
        if (
          multiSignAssignee.value.assigneeType === 'USER_GROUP' ||
          multiSignAssignee.value.assigneeType === 'ROLE_GROUP' ||
          multiSignAssignee.value.assigneeType === 'POST_GROUP'
        ) {
          tempValue = multiSignAssignee.value.assigneeList.join(',');
        } else if (
          multiSignAssignee.value.assigneeType === 'DEPT_GROUP' ||
          multiSignAssignee.value.assigneeType === 'DEPT_POST_GROUP'
        ) {
          tempValue = multiSignAssignee.value.assigneeList
            .map(item => {
              return item[item.length - 1];
            })
            .join(',');
        }
        formData.value.multiSignAssignee = JSON.stringify({
          assigneeType: multiSignAssignee.value.assigneeType,
          assigneeList: tempValue,
        });
      } else {
        formData.value.multiSignAssignee = undefined;
      }

      if (formData.value.latestApprovalStatus == 'undefined') {
        formData.value.latestApprovalStatus = undefined;
      }

      if (props.dialog) {
        props.dialog.submit(formData.value);
      } else {
        onCloseThirdDialog(true, undefined, formData.value);
      }
    }
  });
};

const typeChange = () => {
  multiSignAssignee.value.assigneeList = [];
  userName.value = [];
};
const onOperationTypeChange = (type: string) => {
  typeChange();
  if (type == null || type === '') {
    formData.value.label = undefined;
  } else {
    formData.value.label = SysFlowTaskOperationType.getValue(type);
  }
};

const loadGroupList = (type: string) => {
  return new Promise((resolve, reject) => {
    if (type === 'USER_GROUP') {
      resolve(true);
    } else if (type === 'ROLE_GROUP') {
      let params = {
        widgetType: 'upms_role',
        filter: {},
      };
      SysCommonBizController.list(params, {
        showMask: false,
      })
        .then(res => {
          roleList.value = res.data.dataList.map(item => {
            return {
              id: String(item.roleId),
              name: item.roleName,
              ...item,
            };
          });
          resolve(true);
        })
        .catch(e => {
          reject(e);
        });
    } else if (type === 'DEPT_GROUP') {
      let params = {
        widgetType: 'upms_dept',
        filter: {},
      };
      SysCommonBizController.list(params, {
        showMask: false,
      })
        .then(res => {
          deptList.value = [];
          res.data.dataList.forEach(item => {
            const obj = {
              id: String(item.deptId),
              name: item.deptName,
              parentId: String(item.parentId),
              ...item,
            };
            deptList.value?.push(obj);
          });
          deptData = JSON.parse(JSON.stringify(deptList.value));
          deptList.value = treeDataTranslate(deptList.value);
          resolve(true);
        })
        .catch(e => {
          reject(e);
        });
    } else if (type === 'POST_GROUP') {
      let params = {
        widgetType: 'upms_post',
        filter: {},
      };
      SysCommonBizController.list(params, {
        showMask: false,
      })
        .then(res => {
          postList.value = res.data.dataList.map(item => {
            return {
              id: String(item.postId),
              name: item.postName,
              ...item,
            };
          });
          resolve(true);
        })
        .catch(e => {
          reject(e);
        });
    } else if (type === 'DEPT_POST_GROUP') {
      let params = {
        widgetType: 'upms_dept_post',
        filter: {},
      };
      SysCommonBizController.list(params, {
        showMask: false,
      })
        .then(res => {
          let deptMap = new Map();
          res.data.dataList.forEach(item => {
            let deptItem = deptMap.get(item.deptId);
            if (deptItem == null) {
              deptItem = {
                id: item.deptId,
                name: item.deptName,
                children: [],
              };
              deptMap.set(item.deptId, deptItem);
            }
            deptItem.children.push({
              id: item.deptPostId,
              name: item.postShowName,
            });
          });

          deptPostList.value = [];
          deptMap.forEach(value => {
            deptPostList.value?.push(value);
          });
          resolve(true);
        })
        .catch(e => {
          reject(e);
        });
    }
  });
};
const updateSelectUser = (res: ANY_OBJECT[]) => {
  if (Array.isArray(res)) {
    let oldUserList = userName.value.map(item => item.id);
    const newUserList = [...userName.value];
    res.forEach(item => {
      if (oldUserList.indexOf(item.loginName) === -1) {
        newUserList.push({
          id: item.loginName,
          name: item.showName || item.loginName,
        });
      }
    });
    userName.value = newUserList;
  }
};
const onSelectUser = () => {
  let usedUserIdList = multiSignAssignee.value.assigneeList;
  Dialog.show<ANY_OBJECT[]>(
    '添加抄送人',
    TaskUserSelect,
    {
      area: ['1000px', '650px'],
    },
    {
      multiple: true,
      showAssignee: false,
      showStartUser: false,
      usedUserIdList: usedUserIdList,
      path: 'thirdTaskUserSelect',
    },
    {
      width: '1000px',
      height: '690px',
      pathName: '/thirdParty/thirdTaskUserSelect',
    },
  )
    .then(res => {
      updateSelectUser(res);
    })
    .catch(e => {
      console.warn(e);
    });
};
const updateSelectDept = (res: ANY_OBJECT[] | ANY_OBJECT) => {
  const newDeptList = [];
  if (Array.isArray(res)) {
    if (Array.isArray(deptItems.value)) {
      deptItems.value.forEach(item => {
        newDeptList.push(item);
      });
    } else {
      deptItems.value = [];
    }
    res.forEach(item => {
      if (findItemFromList(deptItems.value, item.id, 'id') == null) {
        newDeptList.push(item);
      }
    });
  } else {
    newDeptList.push({
      id: res.deptId,
      name: res.deptName,
    });
    multiSignAssignee.value.assigneeList.push([res.deptId]);
  }
  deptItems.value = newDeptList;
};
const onSelectDept = () => {
  let usedIdList = deptItems.value.map(row => row.id);
  Dialog.show<ANY_OBJECT[] | ANY_OBJECT>(
    '选择部门',
    TaskGroupSelect,
    {
      area: ['600px', '600px'],
    },
    {
      allGroupList: multiSignGroupList.value,
      usedIdList: usedIdList,
      path: 'thirdTaskGroupSelect',
    },
    {
      width: '600px',
      height: '630px',
      pathName: '/thirdParty/thirdTaskGroupSelect',
    },
  )
    .then(res => {
      updateSelectDept(res);
    })
    .catch(e => {
      console.error(e);
    });
};
const getDeptIds = (deptIds: string[], parentId: string, deptData: ANY_OBJECT) => {
  for (let i = 0; i < deptData.length; i++) {
    const item = deptData[i];
    if (item.deptId === parentId) {
      deptIds.unshift(parentId);
      item.parentId && getDeptIds(deptIds, item.parentId, deptData);
      break;
    }
  }
};

watch(
  () => multiSignAssignee.value.assigneeType,
  () => {
    if (!multiSignGroupList.value) {
      loadGroupList(multiSignAssignee.value.assigneeType).catch(e => {
        console.warn(e);
      });
    }
  },
  {
    deep: true,
    immediate: true,
  },
);
watch(
  () => userName.value,
  val => {
    const usedUserIdList = val.map(item => item.id);
    multiSignAssignee.value.assigneeList = usedUserIdList;
  },
  {
    deep: true,
  },
);
watch(
  () => deptItems.value,
  val => {
    let assigneeList: ANY_OBJECT[] = [];
    if (val) {
      val.forEach(item => {
        const deptIds: string[] = [item.deptId];
        getDeptIds(deptIds, item.parentId, deptData);
        assigneeList.push(deptIds);
      });
    }
    multiSignAssignee.value.assigneeList = assigneeList;
  },
  {
    deep: true,
  },
);

onMounted(() => {
  if (dialogParams.value.rowData) {
    formData.value = {
      ...dialogParams.value.rowData,
      latestApprovalStatus: dialogParams.value.rowData.latestApprovalStatus
        ? Number.parseInt(dialogParams.value.rowData.latestApprovalStatus)
        : undefined,
    };
    if (dialogParams.value.rowData.multiSignAssignee) {
      multiSignAssignee.value = JSON.parse(dialogParams.value.rowData.multiSignAssignee);
      let assigneeValue = multiSignAssignee.value.assigneeList;
      multiSignAssignee.value.assigneeList = undefined;

      let params = {
        widgetType: 'upms_user',
        fieldName: 'loginName',
        fieldValues: assigneeValue,
      };

      params.fieldValues = params.fieldValues
        .split(',')
        .filter((row: ANY_OBJECT) => {
          return ['${startUserName}', '${appointedAssignee}'].indexOf(row) === -1;
        })
        .join(',');

      if (params.fieldValues) {
        SysCommonBizController.viewByIds(params).then(res => {
          let loginNames = assigneeValue.split(',');
          let userNames = assigneeValue.split(',');
          res.data.forEach(item => {
            userNames[loginNames.indexOf(item.loginName)] = item.showName;
          });
          userName.value = loginNames.map((row: ANY_OBJECT, i: number) => {
            return {
              id: row,
              name: userNames[i],
            };
          });
        });
      } else {
        userName.value = assigneeValue.map((row: ANY_OBJECT) => {
          return {
            id: row,
            name: row,
          };
        });
      }

      loadGroupList(multiSignAssignee.value.assigneeType)
        .then(() => {
          if (
            multiSignAssignee.value.assigneeType === 'USER_GROUP' ||
            multiSignAssignee.value.assigneeType === 'ROLE_GROUP' ||
            multiSignAssignee.value.assigneeType === 'POST_GROUP'
          ) {
            multiSignAssignee.value.assigneeList = assigneeValue.split(',');
          } else if (
            multiSignAssignee.value.assigneeType === 'DEPT_GROUP' ||
            multiSignAssignee.value.assigneeType === 'DEPT_POST_GROUP'
          ) {
            const tempDeptItems: ANY_OBJECT[] = [];
            multiSignAssignee.value.assigneeList = assigneeValue.split(',').map((item: string) => {
              for (let i = 0; i < deptData.length; i++) {
                const row = deptData[i];
                if (row.deptId === item) {
                  tempDeptItems.push(row);
                  break;
                }
              }
              let nodePath = findTreeNodePath(multiSignGroupList.value!, item);
              return nodePath;
            });
            deptItems.value = tempDeptItems;
          }
        })
        .catch((e: Error) => {
          console.warn(e);
        });
    }
  }
});

const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdTaskUserSelect' && data.isSuccess) {
    updateSelectUser(data.data);
  } else if (data.path === 'thirdTaskGroupSelect' && data.isSuccess) {
    updateSelectDept(data.data);
  }
};
defineExpose({ refreshData });
</script>

<style scoped>
.assignee-select :deep(.el-input__inner) {
  min-height: 28px !important;
}
.append-add {
  background: #f5f7fa;
  border: none;
  border-radius: 0;
  border-left: 1px solid #dcdfe6;
}
</style>

<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input form-box"
      style="width: 100%"
      label-width="150px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-form-item label="抄送类型" prop="type">
        <el-select
          class="input-item"
          v-model="formData.type"
          placeholder="抄送类型"
          @change="onCopyForTypeChange"
        >
          <el-option
            v-for="item in SysFlowCopyForType.getList()"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.type === SysFlowCopyForType.USER" label="抄送人" prop="id">
        <TagSelect v-model:value="userName">
          <template #append>
            <el-button class="append-add" type="default" :icon="Plus" @click="onSelectUser" />
          </template>
        </TagSelect>
      </el-form-item>
      <el-form-item v-if="formData.type === SysFlowCopyForType.ROLE" label="抄送角色" prop="id">
        <el-select v-model="formData.id" placeholder="" :multiple="true">
          <el-option
            v-for="role in dialogParams.roleList"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.type === SysFlowCopyForType.DEPT" label="抄送部门" prop="id">
        <TagSelect v-model:value="selectDeptList">
          <template #append>
            <el-button class="append-add" type="default" :icon="Plus" @click="onSelectDept" />
          </template>
        </TagSelect>
      </el-form-item>
      <el-form-item
        v-if="
          [
            SysFlowCopyForType.POST,
            SysFlowCopyForType.SELF_DEPT_POST,
            SysFlowCopyForType.SLIBING_DEPT_POST,
            SysFlowCopyForType.UP_DEPT_POST,
          ].indexOf(formData.type) !== -1
        "
        :label="SysFlowCopyForType.getValue(formData.type)"
        prop="id"
      >
        <el-select v-model="formData.id" placeholder="" :multiple="true">
          <el-option
            v-for="post in dialogParams.postList"
            :key="post.postId"
            :label="post.postName"
            :value="post.postId"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="formData.type === SysFlowCopyForType.DEPT_POST"
        label="抄送部门"
        prop="deptId"
      >
        <el-cascader
          v-model="deptId"
          :clearable="true"
          :size="layoutStore.defaultFormItemSize"
          placeholder=""
          :props="{ value: 'id', label: 'name', checkStrictly: true }"
          :options="dialogParams.deptList"
          @change="onDeptChange"
        >
        </el-cascader>
      </el-form-item>
      <el-form-item
        v-if="formData.type === SysFlowCopyForType.DEPT_POST"
        label="抄送岗位"
        prop="id"
      >
        <el-select v-model="formData.id" placeholder="" :multiple="true">
          <el-option
            v-for="post in validDeptPostList"
            :key="post.deptPostId"
            :label="post.postShowName"
            :value="post.deptPostId"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <el-row type="flex" justify="end" class="no-scroll menu-box">
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
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { findItemFromList } from '@/common/utils';
import { ANY_OBJECT } from '@/types/generic';
import TagSelect from '@/pages/workflow/components/TagSelect.vue';
import TaskUserSelect from '@/pages/workflow/components/TaskUserSelect.vue';
import TaskGroupSelect from '@/pages/workflow/components/TaskGroupSelect.vue';
import { DialogProp } from '@/components/Dialog/types';
import { Dialog } from '@/components/Dialog';
import { SysFlowCopyForType } from '@/common/staticDict/flow';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';

const layoutStore = useLayoutStore();
interface IProps extends ThirdProps {
  deptList: ANY_OBJECT[];
  postList: ANY_OBJECT[];
  deptPostList: ANY_OBJECT[];
  roleList: ANY_OBJECT[];
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT | ANY_OBJECT[] | undefined>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
const deptId = ref<string>();
const selectDeptList = ref<ANY_OBJECT[]>([]);
const formData = ref<ANY_OBJECT>({
  type: SysFlowCopyForType.USER,
  id: undefined,
});
const userName = ref<ANY_OBJECT[]>([]);
const dialogParams = computed(() => {
  return {
    deptList: props.deptList || thirdParams.value.deptList,
    postList: props.postList || thirdParams.value.postList,
    deptPostList: props.deptPostList || thirdParams.value.deptPostList,
    roleList: props.roleList || thirdParams.value.roleList,
  };
});
const validDeptPostList = computed(() => {
  let id = Array.isArray(deptId.value) ? deptId.value[deptId.value.length - 1] : undefined;
  if (id == null) return [];
  return dialogParams.value.deptPostList.filter(item => {
    return item.deptId === id;
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
  if (
    formData.value.type === SysFlowCopyForType.DEPT_POST &&
    (deptId.value == null || deptId.value === '')
  ) {
    ElMessage.warning('请选择抄送部门');
    return;
  }
  if (
    (formData.value.id == null || formData.value.id === '') &&
    formData.value.type !== SysFlowCopyForType.SELF_DEPT_LEADER &&
    formData.value.type !== SysFlowCopyForType.UP_DEPT_LEADER
  ) {
    ElMessage.warning('请选择' + SysFlowCopyForType.getValue(formData.value.type));
    return;
  }
  let tempId = null;
  switch (formData.value.type) {
    case SysFlowCopyForType.ROLE:
      tempId = formData.value.id.join(',');
      break;
    case SysFlowCopyForType.USER:
    case SysFlowCopyForType.DEPT:
      tempId = formData.value.id;
      break;
    case SysFlowCopyForType.POST:
    case SysFlowCopyForType.SELF_DEPT_POST:
    case SysFlowCopyForType.SLIBING_DEPT_POST:
    case SysFlowCopyForType.UP_DEPT_POST:
    case SysFlowCopyForType.DEPT_POST:
      tempId = formData.value.id.join(',');
      break;
    default:
      tempId = '';
      break;
  }
  const data = {
    type: formData.value.type,
    id: tempId,
    userName: userName.value,
  };
  if (props.dialog) {
    props.dialog.submit(data);
  } else {
    onCloseThirdDialog(false, undefined, data);
  }
};

const onDeptChange = () => {
  formData.value.id = undefined;
};
const onCopyForTypeChange = () => {
  formData.value.id = undefined;
  deptId.value = undefined;
  userName.value = [];
  selectDeptList.value = [];
};
const onSelectUser = () => {
  let usedUserIdList =
    formData.value.id == null || formData.value.id === '' ? [] : formData.value.id.split(',');
  Dialog.show<ANY_OBJECT[] | ANY_OBJECT>(
    '添加抄送人',
    TaskUserSelect,
    {
      area: ['1000px', '650px'],
    },
    {
      multiple: true,
      props: {
        label: 'showName',
        value: 'userId',
      },
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
const updateSelectUser = (res: ANY_OBJECT[] | ANY_OBJECT) => {
  if (Array.isArray(res)) {
    let oldUserList = userName.value.map(item => item.id);
    const selectedUsers: ANY_OBJECT[] = [];
    res.forEach(item => {
      if (oldUserList.indexOf(item.loginName) === -1) {
        selectedUsers.push({
          id: item.loginName,
          name: item.showName || item.loginName,
        });
      }
    });
    userName.value = userName.value.concat(selectedUsers);
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
const onSelectDept = () => {
  let usedIdList =
    formData.value.id == null || formData.value.id === '' ? [] : formData.value.id.split(',');
  Dialog.show<ANY_OBJECT[]>(
    '选择部门',
    TaskGroupSelect,
    {
      area: ['600px', '600px'],
    },
    {
      allGroupList: dialogParams.value.deptList,
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
      console.warn(e);
    });
};
const updateSelectDept = (res: ANY_OBJECT[]) => {
  if (Array.isArray(res)) {
    const list: ANY_OBJECT[] = [];
    res.forEach(item => {
      if (findItemFromList(selectDeptList.value, item.id, 'id') == null) {
        list.push(item);
      }
    });
    selectDeptList.value = list;
  }
  formData.value.id = Array.isArray(selectDeptList.value)
    ? selectDeptList.value.map(item => item.id).join(',')
    : '';
};

watch(
  userName,
  newValue => {
    let usedUserIdList = newValue.map(item => item.id);
    formData.value.id = usedUserIdList.join(',');
  },
  {
    deep: true,
  },
);

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
.append-add {
  background: #f5f7fa;
  border: none;
  border-radius: 0;
  border-left: 1px solid #dcdfe6;
}
</style>

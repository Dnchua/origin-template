<template>
  <el-form
    ref="form"
    :model="formData"
    :rules="rules"
    label-width="80px"
    :size="formItemSize"
    label-position="right"
    @submit.prevent
  >
    <el-row :gutter="20" class="full-width-input">
      <el-col :span="24">
        <el-form-item label="登录名称" prop="loginName">
          <el-input
            v-model="formData.loginName"
            placeholder="用户登录名称"
            clearable
            :disabled="isEdit"
            maxlength="30"
          />
        </el-form-item>
        <el-form-item label="登录密码" v-if="!isEdit" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="用户登录密码"
            clearable
            maxlength="64"
          />
        </el-form-item>
        <el-form-item label="确认密码" v-if="!isEdit" prop="passwordRepeat">
          <el-input
            v-model="formData.passwordRepeat"
            type="password"
            placeholder="再次输入用户密码"
            clearable
            maxlength="64"
          />
        </el-form-item>
        <el-form-item label="用户昵称" prop="showName">
          <el-input v-model="formData.showName" placeholder="用户昵称" clearable maxlength="30" />
        </el-form-item>
        <el-form-item label="账号类型" prop="userType">
          <el-select v-model="formData.userType">
            <el-option
              v-for="item in SysUserType.getList()"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户状态" prop="userStatus" v-if="isEdit">
          <el-radio-group v-model="formData.userStatus">
            <el-radio v-for="item in SysUserStatus.getList()" :key="item.id" :value="item.id">{{
              item.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属部门" prop="deptId">
          <el-cascader
            class="input-item"
            v-model="deptIdPath"
            :clearable="true"
            placeholder="所属部门"
            :loading="deptId.impl.loading"
            :props="{ value: 'deptId', label: 'deptName', checkStrictly: true }"
            @visible-change="onDeptIdVisibleChange"
            :options="deptId.impl.dropdownList"
            @change="onDeptIdValueChange"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="用户岗位" prop="deptPostIdList">
          <el-select v-model="formData.deptPostIdList" multiple placeholder="用户岗位">
            <el-option
              v-for="deptPost in deptPostList"
              :key="deptPost.deptPostId"
              :label="deptPost.postShowName"
              :value="deptPost.deptPostId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户角色" prop="roleIdList">
          <el-select v-model="formData.roleIdList" multiple placeholder="用户角色">
            <el-option
              v-for="role in roleList"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据权限" prop="dataPermIdList">
          <el-select v-model="formData.dataPermIdList" multiple placeholder="数据权限">
            <el-option
              v-for="dataPerm in dataPermList"
              :key="dataPerm.dataPermId"
              :label="dataPerm.dataPermName"
              :value="dataPerm.dataPermId"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <!-- 弹窗下发按钮栏，必须设置class为dialog-btn-layer -->
    <el-row type="flex" justify="end" class="dialog-btn-layer">
      <el-button :plain="true" @click="onCancel">取消</el-button>
      <el-button
        type="primary"
        @click="onSubmit"
        :disabled="
          !(
            checkPermCodeExist('formSysUser:fragmentSysUser:update') ||
            checkPermCodeExist('formSysUser:fragmentSysUser:add')
          )
        "
      >
        确定
      </el-button>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { Ref, computed, inject, onMounted, reactive, ref } from 'vue';
import { CascaderValue, ElCascader, ElMessage } from 'element-plus';
import { SysUserStatus, SysUserType } from '@/common/staticDict/index';
import { findTreeNodePath } from '@/common/utils';
import { DialogProp } from '@/components/Dialog/types';
import { usePermissions } from '@/common/hooks/usePermission';
import {
  DictionaryController,
  SysDeptController,
  SystemUserController,
  SysDataPermController,
  SystemRoleController,
} from '@/api/system';
import { ANY_OBJECT } from '@/types/generic';
import { User } from '@/types/upms/user';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  rowData?: User;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const { checkPermCodeExist } = usePermissions();

const form = ref();
const formData: Ref<User> = ref({
  userType: 2,
  userStatus: 0,
  dataPermIdList: [],
  deptPostIdList: [],
  roleIdList: [],
});
const validatePasswordRepeat = (
  rule: ANY_OBJECT,
  value: string,
  callback: (error?: Error) => void,
) => {
  //console.log(rule, value, callback);
  if (!value) {
    callback(new Error('重输密码不能为空'));
  } else if (value != formData.value.password) {
    callback(new Error('两次密码输入不一致，请重新输入'));
  } else {
    callback();
  }
};
const rules = ref({
  loginName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }],
  passwordRepeat: [
    {
      validator: validatePasswordRepeat,
      trigger: 'blur',
    },
  ],
  showName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  dataPermIdList: [{ required: true, message: '数据权限不能为空', trigger: 'change' }],
  deptPostIdList: [{ required: true, message: '用户岗位不能为空', trigger: 'change' }],
  roleIdList: [{ required: true, message: '用户角色不能为空', trigger: 'change' }],
});
const deptIdPath = ref<CascaderValue | undefined>([]);
const dataPermList = ref<ANY_OBJECT>([]);
const deptPostList = ref<ANY_OBJECT[]>();
const roleList = ref<ANY_OBJECT>([]);

const isEdit = computed(() => {
  return formData.value.userId != null;
});
/**
 * 所属部门下拉数据获取函数
 */
const loadDeptmentDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    let params = {};
    SysDeptController.list(params)
      .then(res => {
        resolve({
          dataList: res.data.dataList,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};

const dropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadDeptmentDropdownList,
  idKey: 'deptId',
  isTree: true,
};

const deptId = reactive({
  impl: useDropdown(dropdownOptions),
  value: [],
});
/**
 * 所属部门下拉框显隐
 */
const onDeptIdVisibleChange = (show: boolean) => {
  deptId.impl.onVisibleChange(show).catch(e => {
    console.warn(e);
  });
};
/**
 * 所属部门选中值改变
 */
const onDeptIdValueChange = (value: CascaderValue) => {
  formData.value.deptId = Array.isArray(value) ? value[value.length - 1].toString() : undefined;
  formData.value.deptPostIdList = undefined;
  loadDeptPost();
};
/**
 * 获取部门岗位列表
 */
const loadDeptPost = () => {
  if (formData.value.deptId == null || formData.value.deptId === '') {
    deptPostList.value = [];
    return;
  }
  DictionaryController.dictDeptPost({
    deptId: formData.value.deptId,
  })
    .then(res => {
      console.log('dictDeptPost', res);
      deptPostList.value = res;
    })
    .catch(e => {
      console.warn(e);
    });
};
const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
};
const onSubmit = () => {
  form.value.validate((valid: boolean) => {
    if (valid) {
      let params = {
        sysUserDto: {
          userId: formData.value.userId,
          loginName: formData.value.loginName,
          password: formData.value.password,
          showName: formData.value.showName,
          userType: formData.value.userType,
          deptId: formData.value.deptId,
          userStatus: formData.value.userStatus,
        },
        dataPermIdListString: Array.isArray(formData.value.dataPermIdList)
          ? formData.value.dataPermIdList.join(',')
          : undefined,
        deptPostIdListString: Array.isArray(formData.value.deptPostIdList)
          ? formData.value.deptPostIdList.join(',')
          : undefined,
        roleIdListString: Array.isArray(formData.value.roleIdList)
          ? formData.value.roleIdList.join(',')
          : undefined,
      };

      let operation: Promise<ANY_OBJECT>;
      if (formData.value.userId != null) {
        operation = SystemUserController.updateUser(params);
      } else {
        operation = SystemUserController.addUser(params);
      }

      operation
        .then(res => {
          ElMessage.success(formData.value.userId != null ? '编辑成功' : '添加成功');
          props.dialog.submit(res);
        })
        .catch(e => {
          console.warn(e);
        });
    }
  });
};
const loadRole = () => {
  SystemRoleController.getRoleList({})
    .then(res => {
      roleList.value = res.data.dataList;
    })
    .catch(e => {
      console.warn(e);
    });
};
const loadDataPerm = () => {
  SysDataPermController.list({})
    .then(res => {
      dataPermList.value = res.data.dataList;
    })
    .catch(e => {
      console.warn(e);
    });
};
onMounted(() => {
  if (props.rowData != null) {
    formData.value = {
      ...props.rowData,
      dataPermIdList: [],
      deptPostIdList: [],
      roleIdList: [],
    };
    if (Array.isArray(formData.value.sysDataPermUserList)) {
      formData.value.dataPermIdList = formData.value.sysDataPermUserList.map(
        item => item.dataPermId,
      );
    }
    if (Array.isArray(formData.value.sysUserPostList)) {
      formData.value.deptPostIdList = formData.value.sysUserPostList.map(item => item.deptPostId);
    }
    if (Array.isArray(formData.value.sysUserRoleList)) {
      formData.value.roleIdList = formData.value.sysUserRoleList.map(item => item.roleId);
    }
  }
  deptId.impl.onVisibleChange(true).then(() => {
    deptIdPath.value = formData.value.deptId
      ? findTreeNodePath(deptId.impl.dropdownList, formData.value.deptId, 'deptId')
      : [];
  });
  loadRole();
  loadDataPerm();
  loadDeptPost();
});
</script>

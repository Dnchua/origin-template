<template>
  <div class="form-single-fragment" style="position: relative">
    <el-form
      ref="formModifyPassword"
      :model="formData"
      class="full-width-input"
      :rules="rules"
      style="width: 100%"
      label-width="120px"
      :size="defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input
              class="input-item"
              v-model.trim="formData.oldPassword"
              type="password"
              show-password
              :clearable="true"
              placeholder="旧密码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="新密码" prop="password">
            <el-input
              class="input-item"
              v-model.trim="formData.password"
              type="password"
              show-password
              :clearable="true"
              placeholder="新密码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="新密码确认" prop="repeatPassword">
            <el-input
              class="input-item"
              v-model.trim="formData.repeatPassword"
              type="password"
              show-password
              :clearable="true"
              placeholder="新密码确认"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-row class="no-scroll flex-box" type="flex" justify="end">
            <el-button :size="defaultFormItemSize" :plain="true" @click="onCancel(false)">
              取消
            </el-button>
            <el-button type="primary" :size="defaultFormItemSize" @click="onSave()">
              保存
            </el-button>
          </el-row>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { encrypt } from '@/common/utils';
import LoginController from '@/api/system/LoginController';
import { DialogProp } from '@/components/Dialog/types';
import { ANY_OBJECT } from '@/types/generic';

const props = defineProps<{
  dialog?: DialogProp<ANY_OBJECT>;
}>();

const formModifyPassword = ref();
const formData = reactive({
  oldPassword: undefined,
  password: undefined,
  repeatPassword: undefined,
});

const rules = ref({
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  password: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  repeatPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
});

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
};
const onSave = () => {
  formModifyPassword.value.validate(valid => {
    if (!valid) return;
    if (formData.password !== formData.repeatPassword) {
      ElMessage.error('两次密码输入不一致，请核对！');
      return;
    }
    let params = {
      oldPass: encrypt(formData.oldPassword),
      newPass: encrypt(formData.password),
    };

    LoginController.changePassword(params)
      .then(res => {
        ElMessage.success('密码修改成功');
        if (props.dialog) {
          props.dialog.submit(res);
        }
      })
      .catch(e => {
        console.error(e);
      });
  });
};
</script>

<style></style>

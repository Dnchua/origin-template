<template>
  <div class="form-single-fragment" style="position: relative">
    <el-form
      ref="formModifyPassword"
      class="full-width-input"
      style="width: 100%"
      label-width="80px"
      :size="defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="用户头像">
            <el-upload
              class="upload-image-item"
              name="uploadFile"
              :headers="getUploadHeaders"
              :action="headImageUploadUrl"
              :show-file-list="false"
              accept=".jpg,.png,.jpeg"
              :on-success="onHeadImageUploadSuccess"
              :on-error="onUploadError"
              :on-exceed="onUploadLimit"
            >
              <img v-if="getHeadImageUrl()" class="upload-image-show" :src="getHeadImageUrl()" />
              <i v-else class="el-icon-plus upload-image-item" />
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, UploadFile } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import { useUpload } from '@/common/hooks/useUpload';
import { useLoginStore } from '@/store';
import LoginController from '@/api/system/LoginController';

const { getUploadFileUrl, getUploadActionUrl, getUploadHeaders } = useUpload();
const loginStore = useLoginStore();
const userInfo = loginStore.userInfo;

const onHeadImageUploadSuccess = (
  response: ANY_OBJECT,
  file: UploadFile,
  fileList: UploadFile[],
) => {
  if (response.success) {
    loginStore.setHeadImage(response.data);
  } else {
    ElMessage.error(response.message);
  }
};

const onUploadError = (e, file, fileList) => {
  ElMessage.error('文件上传失败');
};
const onUploadLimit = (files, fileList) => {
  ElMessage.error('已经超出最大上传个数限制');
};

const getHeadImageUrl = () => {
  if (userInfo && userInfo.headImageUrl != null && userInfo.headImageUrl !== '') {
    let temp = getUploadFileUrl(userInfo.headImageUrl, {
      filename: userInfo.headImageUrl.filename,
    });
    return temp;
  } else {
    return null;
  }
};

const headImageUploadUrl = computed(() => {
  return getUploadActionUrl(LoginController.changeHeadImageUrl());
});
</script>

<style></style>

<template>
  <div class="form-single-fragment" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input"
      :rules="rules"
      style="width: 100%"
      label-width="80px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="岗位名称" prop="SysPost.postName">
            <el-input
              class="input-item"
              v-model="formData.SysPost.postName"
              :clearable="true"
              placeholder="岗位名称"
              maxlength="30"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="岗位层级" prop="SysPost.postLevel">
            <el-input-number
              class="input-item"
              v-model="formData.SysPost.postLevel"
              :clearable="true"
              controls-position="right"
              placeholder="岗位层级"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="领导岗位">
            <el-switch class="input-item" v-model="formData.SysPost.leaderPost" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-row class="no-scroll flex-box" type="flex" justify="end">
            <el-button :plain="true" @click="onCancel" :size="formItemSize"> 取消 </el-button>
            <el-button
              type="primary"
              :size="formItemSize"
              :disabled="
                !(
                  checkPermCodeExist('formSysPost:fragmentSysPost:add') ||
                  checkPermCodeExist('formSysPost:fragmentSysPost:update')
                )
              "
              @click="onSaveClick()"
            >
              保存
            </el-button>
          </el-row>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { DialogProp } from '@/components/Dialog/types';
import { usePermissions } from '@/common/hooks/usePermission';
import { SysPostController } from '@/api/system';
import { ANY_OBJECT } from '@/types/generic';
import { Post } from '@/types/upms/post';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  postId?: string;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const { checkPermCodeExist } = usePermissions();

const form = ref();
const formData = reactive({
  SysPost: {} as Post,
});
const rules = {
  'SysPost.postName': [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  'SysPost.postLevel': [{ required: true, message: '请输入岗位层级', trigger: 'blur' }],
};
const isEdit = computed(() => {
  return props.postId != null;
});
const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
};
const loadSysPostData = () => {
  if (isEdit.value) {
    let params = {
      postId: props.postId,
    };
    SysPostController.view(params)
      .then(res => {
        formData.SysPost = { ...res.data };
      })
      .catch(e => {
        console.warn(e);
      });
  }
};
/**
 * 保存
 */
const onSaveClick = () => {
  form.value.validate((valid: boolean) => {
    if (!valid) return;
    if (formData.SysPost.postName == null || formData.SysPost.postLevel == null) {
      ElMessage.error('请求失败，发现必填参数为空！');
      return;
    }
    let params = {
      sysPostDto: {
        postId: props.postId,
        postName: formData.SysPost.postName,
        postLevel: formData.SysPost.postLevel,
        leaderPost: formData.SysPost.leaderPost,
      },
    };

    let httpCall = isEdit.value ? SysPostController.update(params) : SysPostController.add(params);
    httpCall
      .then(res => {
        ElMessage.success('保存成功');
        if (props.dialog) {
          props.dialog.submit(res);
        }
      })
      .catch(e => {
        console.warn(e);
      });
  });
};

onMounted(() => {
  loadSysPostData();
});
</script>

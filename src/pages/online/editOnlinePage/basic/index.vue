<template>
  <div>
    <el-form
      ref="form"
      class="full-width-input"
      size="default"
      :model="formPageData"
      :rules="formRules"
      label-position="right"
      label-width="80px"
      @submit.prevent
    >
      <el-col :span="24">
        <el-form-item label="页面类型">
          <el-select v-model="formPageData.pageType" :disabled="isEdit">
            <el-option
              :value="SysOnlinePageType.BIZ"
              :label="SysOnlinePageType.getValue(SysOnlinePageType.BIZ)"
            />
            <el-option
              :value="SysOnlinePageType.FLOW"
              :label="SysOnlinePageType.getValue(SysOnlinePageType.FLOW)"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="页面编码" prop="pageCode">
          <el-input v-model="formPageData.pageCode" :disabled="isEdit" @change="dirty = true" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="页面名称" prop="pageName">
          <el-input v-model="formPageData.pageName" @change="dirty = true" />
        </el-form-item>
      </el-col>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { FormItemRule } from 'element-plus/es/components/form';
import { Arrayable } from 'element-plus/es/utils';
import { ElMessage } from 'element-plus';
import { FormPage } from '@/types/online/page';
import { SysOnlinePageStatus, SysOnlinePageType } from '@/common/staticDict/online';
import { OnlinePageController } from '@/api/online';

const props = defineProps<{ modelValue: FormPage }>();

const form = ref();
const formPageData = ref<FormPage>({} as FormPage);
const dirty = ref(false);
const formRules: Partial<Record<string, Arrayable<FormItemRule>>> = {
  pageCode: [
    { required: true, message: '页面编码不能为空！', trigger: 'blur' },
    {
      type: 'string',
      pattern: /^[A-Za-z0-9]+$/,
      message: '页面编码只允许输入字母和数字',
      trigger: 'blur',
    },
  ],
  pageName: [{ required: true, message: '页面名称不能为空！', trigger: 'blur' }],
};
const isEdit = computed(() => {
  return !!formPageData.value.pageId;
});
watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    if (newVal != oldVal) {
      formPageData.value = { ...newVal };
    }
  },
  {
    deep: true,
  },
);

/**
 * 保存页面基础信息
 */
const savePageInfo = (status: number) => {
  let params = {
    onlinePageDto: {
      ...formPageData.value,
      status: status,
      published: false,
    },
  };
  return isEdit.value ? OnlinePageController.update(params) : OnlinePageController.add(params);
};

/**
 * 保存页面基础信息
 */
const save = (): Promise<FormPage | undefined> => {
  return new Promise((resolve, reject) => {
    form.value.validate((valid: boolean) => {
      if (!valid || !dirty.value) {
        valid ? resolve(formPageData.value) : reject();
        return;
      }
      savePageInfo(SysOnlinePageStatus.DATASOURCE)
        .then(res => {
          ElMessage.success('保存页面基础信息成功！');
          if (!isEdit.value) {
            formPageData.value.pageId = res.data;
          }
          dirty.value = false;
          resolve(formPageData.value);
        })
        .catch(e => {
          reject(e);
        });
    });
  });
};

defineExpose({
  save,
});

onMounted(() => {
  formPageData.value = { ...props.modelValue };
});
</script>

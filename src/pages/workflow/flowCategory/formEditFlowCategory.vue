<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input form-box"
      :rules="rules"
      style="width: 100%"
      label-width="80px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="分类名称" prop="FlowCategory.name">
            <el-input
              class="input-item"
              v-model="formData.FlowCategory.name"
              :clearable="true"
              placeholder="流程分类名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="分类编码" prop="FlowCategory.code">
            <el-input
              class="input-item"
              v-model="formData.FlowCategory.code"
              :disabled="isEdit"
              :clearable="true"
              placeholder="分类编码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="显示顺序" prop="FlowCategory.showOrder">
            <el-input-number
              class="input-item"
              v-model="formData.FlowCategory.showOrder"
              :clearable="true"
              controls-position="right"
              placeholder="显示顺序"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="no-scroll flex-box menu-box" type="flex" justify="end">
      <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
      <el-button type="primary" :size="formItemSize" @click="onSubmit()"> 保存 </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { FormItemRule, ElMessage } from 'element-plus';
import { Arrayable } from 'element-plus/es/utils/typescript';
import FlowCategoryController from '@/api/flow/FlowCategoryController';
import { DialogProp } from '@/components/Dialog/types';
import { ANY_OBJECT } from '@/types/generic';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  categoryId?: string;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const form = ref();

const formData = reactive<ANY_OBJECT>({
  FlowCategory: {
    categoryId: undefined,
    name: undefined,
    code: undefined,
    showOrder: undefined,
    isDatasourceInit: false,
  },
});

const formEditFlowCategory = reactive<ANY_OBJECT>({
  formFilter: {},
  formFilterCopy: {},
  menuBlock: {
    isInit: false,
  },
  isInit: false,
});

const rules: Partial<Record<string, Arrayable<FormItemRule>>> = {
  'FlowCategory.code': [
    {
      required: true,
      message: '请输入分类编码',
      trigger: 'blur',
    },
    {
      type: 'string',
      pattern: /^[A-Za-z0-9]+$/,
      message: '分类编码只能输入英文字母和数字',
      trigger: 'blur',
    },
  ],
  'FlowCategory.showOrder': [
    {
      required: true,
      message: '请输入显示顺序',
      trigger: 'blur',
    },
    {
      type: 'integer',
      message: '显示顺序只允许输入整数',
      trigger: 'blur',
      transform: (value: string) => Number(value),
    },
    {
      type: 'number',
      min: 0,
      message: '显示顺序必须大于0',
      trigger: 'blur',
      transform: (value: string) => Number(value),
    },
  ],
  'FlowCategory.name': [
    {
      required: true,
      message: '请输入流程分类名称',
      trigger: 'blur',
    },
  ],
};

const dialogParams = computed(() => {
  return {
    categoryId: props.categoryId || thirdParams.value.categoryId,
  };
});
const isEdit = computed(() => {
  return dialogParams.value.categoryId != null && dialogParams.value.categoryId !== '';
});

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};

/**
 * 保存
 */
const onSubmit = () => {
  form.value.validate((valid: boolean) => {
    if (!valid) return;
    if (
      formData.FlowCategory.name == null ||
      formData.FlowCategory.code == null ||
      formData.FlowCategory.showOrder == null
    ) {
      ElMessage.error('请求失败，发现必填参数为空！');
      return;
    }
    let params = {
      flowCategoryDto: {
        categoryId: isEdit.value ? dialogParams.value.categoryId : undefined,
        name: formData.FlowCategory.name,
        code: formData.FlowCategory.code,
        showOrder: formData.FlowCategory.showOrder,
      },
    };

    let httpCall = isEdit.value
      ? FlowCategoryController.update(params)
      : FlowCategoryController.add(params);
    httpCall
      .then(res => {
        ElMessage.success('保存成功');
        if (props.dialog) {
          props.dialog.submit(res);
        } else {
          onCloseThirdDialog(true);
        }
      })
      .catch(e => {
        console.warn(e);
      });
  });
};

/**
 * 重置表单数据
 */
const resetFormData = () => {
  form.value.resetFields();
};

/**
 * 获取FlowCategory详细信息
 */
const loadFlowCategoryData = () => {
  return new Promise((resolve, reject) => {
    if (!formData.FlowCategory.isDatasourceInit && isEdit.value) {
      if (dialogParams.value.categoryId == null) {
        resetFormData();
        reject();
        return;
      }
      let params = { categoryId: dialogParams.value.categoryId };
      FlowCategoryController.view(params)
        .then(res => {
          formData.FlowCategory = {
            ...res.data,
            isDatasourceInit: true,
          };
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    } else {
      resolve(null);
    }
  });
};

/**
 * 更新编辑流程分类
 */
const refreshFormEditFlowCategory = () => {
  loadFlowCategoryData()
    .then(() => {
      if (!formEditFlowCategory.isInit) {
        // 初始化下拉数据
        console.log('');
      }
      formEditFlowCategory.isInit = true;
    })
    .catch(e => {
      console.warn(e);
    });
};

const formInit = () => {
  refreshFormEditFlowCategory();
};

onMounted(() => {
  // 初始化页面数据
  formInit();
});
</script>

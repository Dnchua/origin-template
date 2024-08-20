<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input form-box"
      :rules="rules"
      style="width: 100%"
      label-width="100px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="表单编码" prop="formCode">
            <el-input
              class="input-item"
              v-model="formData.formCode"
              :clearable="true"
              placeholder="表单编码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="表单名称" prop="formName">
            <el-input
              class="input-item"
              v-model="formData.formName"
              :clearable="true"
              placeholder="表单名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="表单类型" prop="formType">
            <el-select
              class="input-item"
              v-model="formData.formType"
              placeholder="表单类型"
              :disabled="isEdit"
              @change="onFormTypeChange"
            >
              <el-option
                v-for="item in getValidFormType"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="表单数据" prop="masterTableId">
            <el-select
              class="input-item"
              v-model="formData.masterTableId"
              :clearable="true"
              placeholder="表单数据"
              :disabled="isEdit"
            >
              <el-option
                v-for="item in getValidTableList"
                :key="item.tableId"
                :value="item.tableId"
                :label="item.tableName"
              >
                <el-row type="flex" justify="space-between" align="middle">
                  <span>{{ item.tableName }}</span>
                  <el-tag
                    :size="formItemSize"
                    :type="getDatasourceTableTagType(item.relationType)"
                    effect="dark"
                    style="margin-left: 30px"
                  >
                    {{ getDatasourceTableTagName(item.relationType) }}
                  </el-tag>
                </el-row>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="menu-box">
      <el-col :span="24">
        <el-row class="no-scroll flex-box" type="flex" justify="end">
          <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
          <el-button type="primary" :size="formItemSize" @click="onSubmit()"> 保存 </el-button>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { Arrayable } from 'element-plus/es/utils';
import { FormItemRule } from 'element-plus/es/components/form';
import { ANY_OBJECT } from '@/types/generic';
import {
  SysOnlineFormKind,
  SysOnlinePageType,
  SysOnlineRelationType,
} from '@/common/staticDict/online';
import { DialogProp } from '@/components/Dialog/types';
import { SysOnlineFormType } from '@/common/staticDict';
import { OnlineFormController } from '@/api/online';
import { useFormConfig } from '@/pages/online/hooks/useFormConfig';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  pageId: string;
  pageType: number;
  datasourceTableList: Array<ANY_OBJECT>;
  datasourceId: string;
  form?: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();

const { getFormConfig } = useFormConfig();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const formData = ref<ANY_OBJECT>({
  formId: undefined,
  formCode: undefined,
  formName: undefined,
  formKind: SysOnlineFormKind.PAGE,
  formType: undefined,
  masterTableId: undefined,
  widgetJson: undefined,
});
const rules: Partial<Record<string, Arrayable<FormItemRule>>> = {
  formCode: [
    { required: true, message: '表单编码不能为空', trigger: 'blur' },
    {
      type: 'string',
      pattern: /^[A-Za-z0-9]+$/,
      message: '表单编码只允许输入字母和数字',
      trigger: 'blur',
    },
  ],
  formName: [{ required: true, message: '表单名称不能为空', trigger: 'blur' }],
  masterTableId: [{ required: true, message: '请选择表单数据', trigger: 'blur' }],
};

const getValidFormType = computed(() => {
  return SysOnlineFormType.getList().filter(item => {
    if (item.id === SysOnlineFormType.FLOW) {
      return dialogParams.value.pageType === SysOnlinePageType.FLOW;
    } else if (item.id === SysOnlineFormType.QUERY || item.id === SysOnlineFormType.ADVANCE_QUERY) {
      return dialogParams.value.pageType !== SysOnlinePageType.FLOW;
    } else if (item.id === SysOnlineFormType.WORK_ORDER) {
      return dialogParams.value.pageType === SysOnlinePageType.FLOW;
    } else if (item.id === SysOnlineFormType.REPORT) {
      return false;
    } else {
      return true;
    }
  });
});

const getValidTableList = computed(() => {
  return dialogParams.value.datasourceTableList.filter(item => {
    switch (formData.value.formType) {
      // 工单列表页面和工作流流程页面，只能选择主表
      case SysOnlineFormType.FLOW:
      case SysOnlineFormType.WORK_ORDER:
        return item.relationType == null;
      // 流程编辑页面只支持一对多从表，普通编辑页面只支持主表和一对多从表
      case SysOnlineFormType.FORM:
        return dialogParams.value.pageType === SysOnlinePageType.FLOW
          ? item.relationType === SysOnlineRelationType.ONE_TO_MANY
          : item.relationType == null || item.relationType === SysOnlineRelationType.ONE_TO_MANY;
      // 查询页面可以选择主表或者一对多从表
      case SysOnlineFormType.QUERY:
      case SysOnlineFormType.ADVANCE_QUERY:
        return item.relationType == null || item.relationType === SysOnlineRelationType.ONE_TO_MANY;
      case SysOnlineFormType.ONE_TO_ONE_QUERY:
        return item.relationType === SysOnlineRelationType.ONE_TO_ONE;
      default:
        return false;
    }
  });
});

const dialogParams = computed(() => {
  return {
    pageId: props.pageId || thirdParams.value.pageId,
    pageType: props.pageType || thirdParams.value.pageType,
    datasourceTableList: props.datasourceTableList || thirdParams.value.datasourceTableList,
    datasourceId: props.datasourceId || thirdParams.value.datasourceId,
    form: props.form || thirdParams.value.form,
  };
});
const isEdit = computed(() => {
  return dialogParams.value.form != null;
});

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};
const onSubmit = () => {
  let params = {
    onlineFormDto: {
      ...formData.value,
      pageId: dialogParams.value.pageId,
      widgetJson: isEdit.value
        ? formData.value.widgetJson
        : JSON.stringify(getFormConfig(formData.value.formType, props.pageType)),
      paramsJson: isEdit.value ? formData.value.paramsJson : JSON.stringify([]),
      datasourceIdList: [dialogParams.value.datasourceId],
    },
  };

  let httpCall = isEdit.value
    ? OnlineFormController.update(params)
    : OnlineFormController.add(params);
  httpCall
    .then((res: ANY_OBJECT) => {
      ElMessage.success('保存成功');
      if (props.dialog) {
        props.dialog.submit(res);
      } else {
        onCloseThirdDialog(true);
      }
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};

const getDatasourceTableTagType = (relationType: number) => {
  if (relationType == null) return 'success';
  switch (relationType) {
    case SysOnlineRelationType.ONE_TO_ONE:
      return '';
    case SysOnlineRelationType.ONE_TO_MANY:
      return 'warning';
    default:
      return 'info';
  }
};
const getDatasourceTableTagName = (relationType: number) => {
  if (relationType == null) return '数据主表';
  return SysOnlineRelationType.getValue(relationType) || '未知类型';
};
const onFormTypeChange = (val: number) => {
  if (dialogParams.value.pageType === SysOnlinePageType.FLOW) {
    formData.value.formKind =
      val === SysOnlineFormType.FORM ? SysOnlineFormKind.DIALOG : SysOnlineFormKind.PAGE;
  }
};

onMounted(() => {
  if (isEdit.value) {
    formData.value = {
      ...dialogParams.value.form,
    };
  } else {
    formData.value.formType =
      dialogParams.value.pageType === SysOnlinePageType.FLOW
        ? SysOnlineFormType.FLOW
        : SysOnlineFormType.QUERY;
  }
});
</script>

<template>
  <div class="form-single-fragment" style="position: relative">
    <el-form
      ref="formCreatePerm"
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
          <el-form-item label="权限名称" prop="SysPerm.permName">
            <el-input
              class="input-item"
              v-model="formData.SysPerm.permName"
              :clearable="true"
              placeholder="权限名称"
              maxlength="30"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="所属模块" prop="SysPerm.moduleId">
            <el-cascader
              class="input-item"
              :options="permModuleList"
              v-model="formData.SysPerm.moduleId"
              placeholder="选择所属模块"
              :clearable="true"
              :size="formItemSize"
              :props="{ value: 'moduleId', label: 'moduleName' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="关联的url" prop="SysPerm.url">
            <el-input
              class="input-item"
              v-model="formData.SysPerm.url"
              :clearable="true"
              placeholder="关联的url"
              maxlength="128"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="显示顺序" prop="SysPerm.showOrder">
            <el-input-number
              class="input-item"
              v-model="formData.SysPerm.showOrder"
              :clearable="true"
              controls-position="right"
              placeholder="权限在当前模块下的顺序"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-row type="flex" justify="end">
            <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
            <el-button
              type="primary"
              :size="formItemSize"
              @click="onAddClick()"
              :disabled="
                !(
                  checkPermCodeExist('formSysPerm:fragmentSysPerm:updatePerm') ||
                  checkPermCodeExist('formSysPerm:fragmentSysPerm:addPerm')
                )
              "
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
import { ElMessage } from 'element-plus';
import { Perm, PermModule } from '@/types/upms/perm';
import { usePermissions } from '@/common/hooks/usePermission';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { PermController } from '@/api/system';
import { findTreeNodePath } from '@/common/utils';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  permId?: string;
  moduleId?: string;
  currentPermGroupId?: string;
  rowData?: Perm;
  permModuleList: PermModule[];
  defaultFormItemSize: Ref<'' | 'default' | 'small' | 'large'>;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const { checkPermCodeExist } = usePermissions();

const formCreatePerm = ref();
const formData = reactive({
  SysPerm: {
    moduleId: props.currentPermGroupId,
  } as Perm,
});

const rules = {
  'SysPerm.permName': [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  'SysPerm.url': [{ required: true, message: '请输入关联的url', trigger: 'blur' }],
  'SysPerm.showOrder': [{ required: true, message: '请输入显示顺序', trigger: 'blur' }],
  //'SysPerm.moduleId': [{ required: true, message: '请选择所属模块', trigger: 'blur' }],
};

const isEdit = computed(() => {
  return !!props.rowData?.permId;
});

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
};

const onAddClick = () => {
  formCreatePerm.value.validate((valid: boolean) => {
    if (!valid) return;
    let params = {
      sysPermDto: {
        permId: props.permId,
        showOrder: formData.SysPerm.showOrder,
        moduleId: Array.isArray(formData.SysPerm.moduleId)
          ? formData.SysPerm.moduleId[formData.SysPerm.moduleId.length - 1]
          : undefined,
        url: formData.SysPerm.url,
        permName: formData.SysPerm.permName,
      },
    };

    if (isEdit.value) {
      PermController.updatePerm(params)
        .then(res => {
          ElMessage.success('编辑成功');
          if (props.dialog) {
            props.dialog.submit(res);
          }
        })
        .catch(e => {
          console.warn(e);
        });
    } else {
      PermController.addPerm(params)
        .then(res => {
          ElMessage.success('新增成功');
          if (props.dialog) {
            props.dialog.submit(res);
          }
        })
        .catch(e => {
          console.warn(e);
        });
    }
  });
};

const refreshFormCreatePerm = () => {
  formData.SysPerm.moduleId = findTreeNodePath(
    props.permModuleList,
    Array.isArray(formData.SysPerm.moduleId)
      ? formData.SysPerm.moduleId[formData.SysPerm.moduleId.length - 1]
      : formData.SysPerm.moduleId,
    'moduleId',
  );
};
const initFormData = () => {
  if (props.rowData != null) formData.SysPerm = { ...formData.SysPerm, ...props.rowData };
};
const formInit = () => {
  initFormData();
  refreshFormCreatePerm();
};

onMounted(() => {
  formInit();
});
</script>

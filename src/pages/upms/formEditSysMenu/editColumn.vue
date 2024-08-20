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
        <el-form-item label="栏目名称" prop="menuName">
          <el-input v-model="formData.menuName" placeholder="栏目名称" clearable maxlength="30" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="显示顺序" prop="showOrder">
          <el-input-number
            v-model="formData.showOrder"
            controls-position="right"
            :min="1"
            :max="99999"
            placeholder="请输入显示顺序"
          ></el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="栏目图标" prop="icon">
          <icon-select v-model:value="formData.icon" :height="28" />
        </el-form-item>
      </el-col>
    </el-row>
    <!-- 弹窗按钮 -->
    <el-row type="flex" justify="end" class="dialog-btn-layer mt20">
      <el-button :plain="true" @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onSubmit">确定</el-button>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { MenuItem } from '@/types/upms/menu';
import { SystemMenuController } from '@/api/system/index';
import { DialogProp } from '@/components/Dialog/types';
import { SysMenuType } from '@/common/staticDict/index';
import { T } from '@/types/generic';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  columnId?: string;
  columnName?: string;
  showOrder?: number;
  icon?: string;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<T>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});

const form = ref();
const formData = ref<MenuItem>({
  menuId: props.columnId,
  parentId: undefined,
  menuName: props.columnName,
  showOrder: props.showOrder,
  menuType: SysMenuType.DIRECTORY,
  icon: props.icon,
} as MenuItem);
const rules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  showOrder: [{ required: true, message: '请输入菜单显示顺序', trigger: 'blur' }],
};

const isEdit = computed(() => {
  return formData.value.menuId != null;
});

const onCancel = () => {
  //console.log('onCancel');
  if (props.dialog) {
    props.dialog.cancel();
  }
};
const onSubmit = () => {
  console.log('onSubmit');
  form.value.validate((valid: boolean) => {
    if (valid) {
      if (props.dialog) {
        let params: T = {};
        params.sysMenuDto = { ...formData.value };
        if (isEdit.value) {
          SystemMenuController.updateMenu(params)
            .then(res => {
              ElMessage.success('编辑成功');
              props.dialog.submit(res);
            })
            .catch(e => {
              console.error(e);
              ElMessage.error('编辑异常');
            });
        } else {
          SystemMenuController.addMenu(params)
            .then(res => {
              ElMessage.success('添加成功');
              props.dialog.submit(res);
            })
            .catch(e => {
              console.error(e);
              ElMessage.error('添加异常');
            });
        }
      }
    } else {
      console.log('表单验证失败');
    }
  });
};
</script>
@/types/upms/menu

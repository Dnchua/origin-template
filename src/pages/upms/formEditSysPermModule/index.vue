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
          <el-form-item label="模块名称" prop="SysPermModule.moduleName">
            <el-input
              class="input-item"
              v-model="formData.SysPermModule.moduleName"
              :clearable="true"
              placeholder="权限模块名称"
              maxlength="30"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="模块类型">
            <el-select
              class="input-item"
              v-model="formData.SysPermModule.moduleType"
              placeholder="模块类型"
              :clearable="true"
              :size="formItemSize"
              :disabled="isEdit"
            >
              <el-option
                v-for="item in SysPermModuleType.getList()"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="所属模块">
            <el-cascader
              class="input-item"
              :options="getPermGroupTree"
              v-model="formData.SysPermModule.parentId"
              placeholder="选择所属模块"
              :clearable="true"
              :size="formItemSize"
              :props="{
                value: 'moduleId',
                label: 'moduleName',
                checkStrictly: true,
              }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="显示顺序" prop="SysPermModule.showOrder">
            <el-input-number
              class="input-item"
              v-model="formData.SysPermModule.showOrder"
              :clearable="true"
              controls-position="right"
              placeholder="权限模块在当前层级下的顺序"
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
                  checkPermCodeExist('formSysPerm:fragmentSysPerm:addPermModule') ||
                  checkPermCodeExist('formSysPerm:fragmentSysPerm:updatePermModule')
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
import { PermModule } from '@/types/upms/perm';
import { usePermissions } from '@/common/hooks/usePermission';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { PermController } from '@/api/system';
import { SysPermModuleType } from '@/common/staticDict/index';
import { treeDataTranslate, findTreeNodePath } from '@/common/utils';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  parentId?: string;
  moduleType?: number;
  moduleId?: string;
  rowData?: PermModule;
  moduleList: PermModule[];
  defaultFormItemSize: Ref<'' | 'default' | 'small' | 'large'>;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const { checkPermCodeExist } = usePermissions();

const form = ref();
const formData = reactive({
  SysPermModule: {} as PermModule,
});
const rules = {
  'SysPermModule.moduleName': [{ required: true, message: '请输入模块名称', trigger: 'blur' }],
  'SysPermModule.showOrder': [{ required: true, message: '请输入显示顺序', trigger: 'blur' }],
};
const formCreatePermModule = ref<ANY_OBJECT>({
  formFilter: {},
  formFilterCopy: {},
  isInit: false,
});

const isEdit = computed(() => {
  return !!formData.SysPermModule.moduleId;
});

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
};

// function platModuleList(list: PermModule[], res: PermModule[]) {
//   for (const module of list) {
//     if (module.moduleType == SysPermModuleType.GROUP) {
//       res.push({ ...module, children: undefined });
//       if (module.children) {
//         platModuleList(module.children, res);
//       }
//     }
//   }
// }

const getPermGroupTree = computed(() => {
  let tempList: PermModule[] = props.moduleList
    .map(item => {
      if (item.moduleType === SysPermModuleType.GROUP) {
        return { ...item, children: undefined } as PermModule;
      }
      return null;
    })
    .filter(item => {
      return item != null;
    }) as PermModule[];
  return treeDataTranslate(tempList, 'moduleId');
});

/**
 * 更新新建权限模块
 */
// const refresh = (reloadData = false) => {
//   if (reloadData) {
//     if (formData.SysPermModule.parentId) {
//       let path = findTreeNodePath(
//         getPermGroupTree.value,
//         formData.SysPermModule.parentId,
//         'moduleId',
//       );
//       formData.SysPermModule.parentId =
//         path != null && path.length > 0 ? path[path.length - 1] : undefined;
//     }
//   }
// };
/**
 * 更新新建权限模块
 */
const refreshFormCreatePermModule = () => {
  if (!formCreatePermModule.value.isInit) {
    // formData.SysPermModule.parentId = findTreeNodePath(
    //   getPermGroupTree.value,
    //   formData.SysPermModule.parentId,
    //   'moduleId',
    // );
    if (formData.SysPermModule.parentId) {
      let path = findTreeNodePath(
        getPermGroupTree.value,
        formData.SysPermModule.parentId,
        'moduleId',
      );
      formData.SysPermModule.parentId =
        path != null && path.length > 0 ? path[path.length - 1] : undefined;
    }
  }
  formCreatePermModule.value.isInit = true;
};
/**
 * 新增
 */
const onAddClick = () => {
  form.value.validate((valid: boolean) => {
    if (!valid) return;
    let params = {
      sysPermModuleDto: {
        moduleId: props.moduleId,
        moduleName: formData.SysPermModule.moduleName,
        showOrder: formData.SysPermModule.showOrder,
        moduleType: formData.SysPermModule.moduleType,
        parentId: Array.isArray(formData.SysPermModule.parentId)
          ? formData.SysPermModule.parentId[formData.SysPermModule.parentId.length - 1]
          : undefined,
      },
    };

    if (isEdit.value) {
      PermController.updatePermGroup(params)
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
      PermController.addPermGroup(params)
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
const initFormData = () => {
  if (props.rowData) {
    formData.SysPermModule = {
      ...formData.SysPermModule,
      ...props.rowData,
    };
  }
  if (props.parentId != null) formData.SysPermModule.parentId = props.parentId;
  if (props.moduleType != null) formData.SysPermModule.moduleType = props.moduleType;
};
const formInit = () => {
  initFormData();
  refreshFormCreatePermModule();
};

onMounted(() => {
  formInit();
});
</script>

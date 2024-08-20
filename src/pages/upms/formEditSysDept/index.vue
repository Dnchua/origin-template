<template>
  <div class="form-single-fragment" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      style="width: 100%"
      label-width="80px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="所属部门" prop="sysDept.parentId">
            <el-cascader
              class="input-item"
              v-model="formEditSysDept.parentId.value"
              :clearable="true"
              placeholder="所属部门"
              :size="formItemSize"
              :loading="formEditSysDept.parentId.impl.loading"
              :props="{ value: 'id', label: 'name', checkStrictly: true }"
              @visible-change="onParentIdVisibleChange"
              :options="formEditSysDept.parentId.impl.dropdownList"
            >
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="部门名称" prop="sysDept.deptName">
            <el-input
              class="input-item"
              v-model="formData.sysDept.deptName"
              :size="formItemSize"
              :clearable="true"
              placeholder="部门名称"
              maxlength="30"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="显示顺序" prop="sysDept.showOrder">
            <el-input-number
              class="input-item"
              v-model="formData.sysDept.showOrder"
              :clearable="true"
              :size="formItemSize"
              controls-position="right"
              placeholder="显示顺序"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-row type="flex" justify="end">
            <el-button :size="formItemSize" :plain="true" @click="onCancel()"> 取消 </el-button>
            <el-button
              type="primary"
              @click="onUpdateClick()"
              :size="formItemSize"
              :disabled="
                !(
                  checkPermCodeExist('formSysDept:fragmentSysDept:update') ||
                  checkPermCodeExist('formSysDept:fragmentSysDept:add')
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
import { findTreeNodePath } from '@/common/utils';
import { usePermissions } from '@/common/hooks/usePermission';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import { SysDept } from '@/types/upms/department';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { DictionaryController, SysDeptController } from '@/api/system/index';
import { DictData } from '@/common/staticDict/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  deptId?: string;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});

const { checkPermCodeExist } = usePermissions();
const form = ref();
const formData = reactive({ sysDept: {} as SysDept });
const rules = {
  'sysDept.deptName': [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  'sysDept.showOrder': [{ required: true, message: '请输入显示顺序', trigger: 'blur' }],
};

/**
 * 所属部门下拉数据获取函数
 */
const loadParentIdDropdownList = (): Promise<ListData<DictData>> => {
  return new Promise((resolve, reject) => {
    let params = {};
    DictionaryController.dictSysDept(params)
      .then(res => {
        resolve({
          dataList: res.getList(),
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};

const dropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadParentIdDropdownList,
  idKey: 'id',
  isTree: true,
};

const formEditSysDept = reactive({
  formFilter: {},
  formFilterCopy: {},
  parentId: {
    impl: useDropdown(dropdownOptions),
    value: [] as string[],
  },
  isInit: false,
});

const isEdit = computed(() => {
  return props.deptId != null;
});

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
};

/**
 * 所属部门下拉框显隐
 */
const onParentIdVisibleChange = (show: boolean) => {
  formEditSysDept.parentId.impl.onVisibleChange(show).catch(e => {
    console.warn(e);
  });
};

/**
 * 更新编辑用户
 */
const refreshFormEditSysDept = () => {
  formEditSysDept.parentId.impl.onVisibleChange(true).then(() => {
    if (!formEditSysDept.isInit) {
      formEditSysDept.parentId.value = findTreeNodePath(
        formEditSysDept.parentId.impl.dropdownList,
        formData.sysDept.parentId,
        'id',
      );
      formEditSysDept.isInit = true;
    }
  });
};
/**
 * 编辑
 */
const onUpdateClick = () => {
  form.value.validate((valid: boolean) => {
    if (!valid) return;
    // 判断父部门是否为当前部门的子部门
    let parentId = Array.isArray(formEditSysDept.parentId.value)
      ? formEditSysDept.parentId.value[formEditSysDept.parentId.value.length - 1]
      : undefined;
    if (parentId != null && isEdit.value) {
      let path = findTreeNodePath(formEditSysDept.parentId.impl.dropdownList, parentId);
      if (Array.isArray(path) && path.indexOf(props.deptId) !== -1) {
        ElMessage.error('所属部门不能为当前部门的子部门！');
        return;
      }
    }
    let params = {
      sysDeptDto: {
        deptName: formData.sysDept.deptName,
        showOrder: formData.sysDept.showOrder,
        parentId: parentId,
        deptId: props.deptId,
      },
    };
    if (isEdit.value) {
      SysDeptController.update(params)
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
      SysDeptController.add(params)
        .then(res => {
          ElMessage.success('新建成功');
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
/**
 * 获取部门管理详细信息
 */
const loadSysDeptData = (): Promise<void> => {
  if (!isEdit.value) return Promise.reject();
  let params = {
    deptId: props.deptId,
  };

  return new Promise((resolve, reject) => {
    SysDeptController.view(params)
      .then(res => {
        formData.sysDept = { ...res.data };
        resolve();
      })
      .catch(e => {
        console.warn(e);
        reject();
      });
  });
};
const formInit = () => {
  let loadAllDatasource = [loadSysDeptData()];
  Promise.all(loadAllDatasource)
    .then(() => {
      refreshFormEditSysDept();
    })
    .catch(e => {
      console.warn(e);
    });
};

onMounted(() => {
  formInit();
});
</script>

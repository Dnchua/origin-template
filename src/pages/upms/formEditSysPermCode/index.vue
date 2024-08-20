<template>
  <el-form
    ref="form"
    :model="formData"
    :rules="rules"
    label-width="100px"
    :size="formItemSize"
    label-position="right"
    @submit.prevent
  >
    <el-row :gutter="20" class="full-width-input">
      <el-col :span="24">
        <el-form-item label="所属权限字">
          <el-cascader
            :options="permCodeTree"
            v-model="parentPermCodePath"
            :props="permCodeProps"
            filterable
            :disabled="formData.permCodeId != null || formData.parentId == null"
            placeholder="选择父权限字"
            :clearable="true"
            :change-on-select="true"
            :size="formItemSize"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="权限字名称" prop="showName">
          <el-input
            v-model="formData.showName"
            placeholder="权限字名称"
            clearable
            maxlength="30"
          ></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="权限字标识" prop="permCode">
          <el-input v-model="formData.permCode" placeholder="权限字标识" clearable></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="权限字类型" prop="permCode">
          <el-select v-model="formData.permCodeType" placeholder="权限字类型" :disabled="true">
            <el-option
              v-for="item in SysPermCodeType.getList()"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
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
        <el-card shadow="never">
          <template v-slot:header>
            <div class="card-header">
              <span>权限列表</span>
              <el-input
                :size="formItemSize"
                v-model="permNameFilter"
                placeholder="输入权限名称过滤"
                style="width: 250px"
                clearable
                :suffix-icon="Search"
              />
            </div>
          </template>
          <el-scrollbar style="height: 205px" wrap-class="scrollbar_dropdown__wrap">
            <el-tree
              ref="permTree"
              :data="formData.permCodeType == SysPermCodeType.FORM ? [] : getPermTree"
              :props="treeProps"
              show-checkbox
              node-key="id"
              empty-text="暂无权限资源"
              :filter-node-method="filterPermNode"
              :default-expanded-keys="defaultExpandedKeys"
            >
              <template v-slot="{ data }">
                <div style="display: flex; justify-content: space-between; width: 100%">
                  <span>{{ data.name }}</span>
                  <span style="margin-right: 10px">{{ data.url }}</span>
                </div>
              </template>
            </el-tree>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
    <!-- 弹窗按钮 -->
    <el-row type="flex" justify="end" class="dialog-btn-layer mt20">
      <el-button :size="formItemSize" :plain="true" @click="onCancel">取消</el-button>
      <el-button
        type="primary"
        :size="formItemSize"
        @click="onSubmit"
        :disabled="
          !(
            checkPermCodeExist('formSysPermCode:fragmentSysPermCode:add') ||
            checkPermCodeExist('formSysPermCode:fragmentSysPermCode:update')
          )
        "
      >
        确定
      </el-button>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { TreeKey } from 'element-plus/es/components/tree/src/tree.type';
import { PermCode } from '@/types/upms/permcode';
import { usePermissions } from '@/common/hooks/usePermission';
import { ANY_OBJECT } from '@/types/generic';
import { SysPermCodeType } from '@/common/staticDict/index';
import { findTreeNodePath, treeDataTranslate } from '@/common/utils';
import { DialogProp } from '@/components/Dialog/types';
import { PermController, PermCodeController } from '@/api/system';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  permCodeTree: ANY_OBJECT[];
  permCodeType?: number;
  permCodeKind?: number;
  rowData?: PermCode;
  defaultFormItemSize: Ref<'' | 'default' | 'small' | 'large'>;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const { checkPermCodeExist } = usePermissions();
const form = ref();
const permTree = ref();

const permNameFilter = ref();
let allowParentList: ANY_OBJECT[] = [];
const parentPermCodePath = ref<string[]>([]);
const permList = ref<ANY_OBJECT[]>([]);
const defaultExpandedKeys = ref<TreeKey[]>([]);
const formData = ref<PermCode>({
  permCodeType: props.permCodeType || SysPermCodeType.FORM,
  permIdList: [] as string[],
} as PermCode);
const treeProps = {
  label: 'name',
  isLeaf: function (data: ANY_OBJECT) {
    //console.log(data, node);
    return data.isPerm;
  },
};
const permCodeProps = {
  label: 'showName',
  value: 'permCodeId',
};
const rules = {
  showName: [{ required: true, message: '权限字名称不能为空', trigger: 'blur' }],
  permCode: [{ required: true, message: '权限字标识不能为空', trigger: 'blur' }],
  showOrder: [{ required: true, message: '请输入权限字显示顺序', trigger: 'blur' }],
  permCodeType: [{ required: true, message: '请选择权限字类型', trigger: 'blur' }],
};
const getPermTree = computed(() => {
  return treeDataTranslate(permList.value, 'id', 'parentId');
});
const filterPermNode = (value: ANY_OBJECT, data: ANY_OBJECT) => {
  if (!value) return true;
  if (data.name.indexOf(value) !== -1) {
    allowParentList.push(data.id);
    return true;
  } else {
    return allowParentList.indexOf(data.parentId) !== -1;
  }
};
const getTreeLeafKeys = () => {
  let selectPermNodeList = permTree.value.getCheckedNodes();
  let tempList: ANY_OBJECT[] = [];
  selectPermNodeList.forEach((item: ANY_OBJECT) => {
    if (item.isPerm) {
      tempList.push(item.id);
    }
  });

  return tempList;
};
const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
};
const initData = () => {
  PermController.getAllPermList({})
    .then(res => {
      res.data.forEach(item => {
        item.id = item.id + '';
        item.parentId = item.parentId + '';
      });
      permList.value = res.data.map(item => {
        return { ...item };
      });
      defaultExpandedKeys.value = formData.value.permIdList;
      if (Array.isArray(formData.value.permIdList)) {
        permTree.value.setCheckedKeys(formData.value.permIdList, true);
      }
    })
    .catch(e => {
      console.warn(e);
    });
};

const onSubmit = () => {
  form.value.validate((valid: boolean) => {
    if (valid) {
      let selectedPermList = getTreeLeafKeys();
      let params: ANY_OBJECT = {};
      params.sysPermCodeDto = { ...formData.value };
      delete params.sysPermCodeDto.children;
      params.sysPermCodeDto.permCodeType =
        props.permCodeType == null ? SysPermCodeType.FORM : props.permCodeType;
      params.sysPermCodeDto.permCodeKind = props.permCodeKind || 0;
      if (parentPermCodePath.value.length > 0) {
        params.sysPermCodeDto.parentId =
          parentPermCodePath.value[parentPermCodePath.value.length - 1];
      }
      params.permIdListString = selectedPermList.join(',');
      if (params.sysPermCodeDto.permCodeId != null) {
        PermCodeController.updatePermCode(params)
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
        PermCodeController.addPermCode(params)
          .then(res => {
            ElMessage.success('添加成功');
            if (props.dialog) {
              props.dialog.submit(res);
            }
          })
          .catch(e => {
            console.warn(e);
          });
      }
    }
  });
};

watch(permNameFilter, val => {
  allowParentList = [];
  permTree.value.filter(val);
});

onMounted(() => {
  if (props.rowData != null) {
    formData.value = { ...formData.value, ...props.rowData };
    if (Array.isArray(formData.value.sysPermCodePermList)) {
      formData.value.permIdList = formData.value.sysPermCodePermList.map(item => item.permId);
    }
    if (formData.value.parentId && props.permCodeTree != null) {
      parentPermCodePath.value = findTreeNodePath(
        props.permCodeTree,
        formData.value.parentId,
        'permCodeId',
      );
    } else {
      parentPermCodePath.value = [];
    }
  }

  initData();
});
</script>

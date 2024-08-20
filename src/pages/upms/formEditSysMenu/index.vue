<template>
  <el-form
    class="edit-menu"
    ref="form"
    :model="formData"
    :rules="rules"
    label-width="90px"
    :size="formItemSize"
    label-position="right"
    @submit.prevent
  >
    <el-row :gutter="20" class="full-width-input">
      <el-col :span="12">
        <el-form-item label="上级菜单">
          <el-cascader
            ref="menuCascader"
            :options="menuTree"
            v-model="parentMenuPath"
            :props="menuProps"
            placeholder="选择父菜单"
            :clearable="true"
            :change-on-select="true"
            @change="onParentMenuChange"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="formData.menuName" placeholder="菜单名称" clearable maxlength="30" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="菜单编码">
          <el-input v-model="formData.menuCode" placeholder="菜单编码" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="菜单类型" prop="menuType">
          <el-select v-model="formData.menuType" :disabled="isEdit" placeholder="菜单类型">
            <el-option
              v-for="item in getValidMenuType"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="显示顺序" prop="showOrder">
          <el-input-number
            v-model="formData.showOrder"
            style="width: 100%"
            :min="1"
            :max="99999"
            controls-position="right"
            placeholder="显示顺序"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12" v-if="formData.menuType === SysMenuType.MENU">
        <el-form-item label="绑定类型">
          <el-select
            v-model="formData.bindType"
            plaaceholder="菜单绑定类型"
            :disabled="formData.menuType !== 1 || isEdit"
            @change="onBindTypeChange"
          >
            <el-option
              v-for="item in SysMenuBindType.getList()"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col
        :span="12"
        v-if="
          formData.menuType === SysMenuType.MENU && formData.bindType === SysMenuBindType.ROUTER
        "
      >
        <el-form-item label="菜单路由">
          <el-input
            v-model="formData.formRouterName"
            placeholder="菜单路由"
            :disabled="formData.menuType !== 1"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12" v-if="formData.bindType === SysMenuBindType.THRID_URL">
        <el-form-item label="链接URL" prop="targetUrl">
          <el-input
            v-model="formData.targetUrl"
            placeholder="链接URL"
            :disabled="formData.menuType !== 1"
          />
        </el-form-item>
      </el-col>
      <el-col
        :span="12"
        v-if="
          formData.menuType === SysMenuType.MENU &&
          formData.bindType === SysMenuBindType.ONLINE_FORM
        "
      >
        <el-form-item label="在线表单" prop="onlineFormId">
          <el-cascader
            v-model="onlineFormPath"
            :options="formTreeData"
            filterable
            :clearable="true"
            placeholder="选择菜单绑定的在线表单"
            :props="{ value: 'id', label: 'name' }"
            @change="onOnlineFormChange"
          />
        </el-form-item>
      </el-col>
      <el-col
        :span="12"
        v-if="
          formData.menuType === SysMenuType.MENU && formData.bindType === SysMenuBindType.WORK_ORDER
        "
      >
        <el-form-item label="工作流" prop="onlineFlowEntryId">
          <el-cascader
            v-model="onlineFlowPath"
            :options="entryTreeData"
            filterable
            :clearable="true"
            placeholder="选择菜单绑定的工单"
            :props="{ value: 'id', label: 'name' }"
            @change="onOnlineEntryChange"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="菜单图标" prop="icon">
          <icon-select v-model:value="formData.icon" :height="28" />
        </el-form-item>
      </el-col>
    </el-row>
    <!-- 权限字设置 -->
    <el-row class="perm-code-box full-width-input">
      <el-col :span="24">
        <el-form-item label="权限字列表">
          <el-select
            v-model="formData.permCodeList"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请从列表中选择权限字或输入后按回车添加新的权限字"
          >
            <el-option v-for="item in permCodeList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <!-- 弹窗按钮 -->
    <el-row type="flex" justify="end" class="dialog-btn-layer mt20">
      <el-button :plain="true" @click="onCancel">取消</el-button>
      <el-button
        type="primary"
        @click="onSubmit"
        :disabled="
          !(
            checkPermCodeExist('formSysMenu:fragmentSysMenu:add') ||
            checkPermCodeExist('formSysMenu:fragmentSysMenu:update')
          )
        "
      >
        确定
      </el-button>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { Search as ElIconSearch } from '@element-plus/icons-vue';
import { VxeTable, VxeColumn, SizeType } from 'vxe-table';
import { CascaderValue, ElCascader, ElMessage } from 'element-plus';
import { CascaderOption } from 'vant/lib/cascader/types';
import { MenuItem } from '@/types/upms/menu';
import {
  SysMenuType,
  SysMenuBindType,
  SysPermCodeType,
  SysOnlineFormType,
} from '@/common/staticDict/index';
import {
  treeDataTranslate,
  findTreeNode,
  findTreeNodePath,
  findItemFromList,
} from '@/common/utils';
import { DialogProp } from '@/components/Dialog/types';
import { usePermissions } from '@/common/hooks/usePermission';
import { PermCodeController, SystemMenuController } from '@/api/system/index';
import { DictDataIdType } from '@/common/staticDict/types';
import { ANY_OBJECT } from '@/types/generic';
import { SysOnlineFormKind } from '@/common/staticDict/online';
import { OnlinePageController } from '@/api/online';
import { FlowOperationController } from '@/api/flow';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  menuId?: string;
  parentId?: string;
  menuList: MenuItem[];
  rowData?: MenuItem;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const form = ref();
const menuCascader = ref();
const table = ref();
const tableSize = computed(() => {
  return formItemSize.value as SizeType;
});
const formData = ref<MenuItem & ANY_OBJECT>({
  menuId: undefined,
  parentId: undefined,
  menuName: undefined,
  showOrder: undefined,
  menuType: undefined,
  icon: '',
  bindType: SysMenuBindType.ROUTER,
  onlineFormId: undefined,
  onlineFlowEntryId: undefined,
  formRouterName: undefined,
  targetUrl: undefined,
  extraData: undefined,
  menuCode: undefined,
  permCodeList: [],
} as MenuItem);
const rules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  showOrder: [{ required: true, message: '请输入菜单显示顺序', trigger: 'blur' }],
  onlineFormId: [
    {
      required: true,
      message: '请选择菜单绑定的在线表单',
      trigger: 'blur',
    },
  ],
  onlineFlowEntryId: [{ required: true, message: '请选择菜单绑定的工单', trigger: 'blur' }],
  formRouterName: [{ required: true, message: '请输入菜单路由名称', trigger: 'blur' }],
  targetUrl: [{ required: true, message: '请输入跳转链接地址', trigger: 'blur' }],
};

const isEdit = computed(() => {
  return formData.value.menuId != null;
});
// 是否自动用上级菜单的名称过滤权限字列表，当这个开关打开后，会使用getAutoFilterString返回的字符串当做过滤字符串
const autoFilter = false;
const permCodeNameFilter = ref(null);
const menuTree: Ref<MenuItem[] & CascaderOption[]> = ref([]);
const parentMenuPath = ref<string[]>([]);
const onlineFormPath = ref<string[]>([]);
const formTreeData = ref<ANY_OBJECT[]>([]);
const onlineFlowPath = ref<string[]>([]);
const entryTreeData = ref<ANY_OBJECT[]>([]);
const menuProps = {
  label: 'menuName',
  value: 'menuId',
  checkStrictly: true,
};
const permCodeList = ref<ANY_OBJECT[]>([]);
const permCodeReady = ref(false);
const parentMenuType: Ref<number | null> = ref(null);
const getValidMenuType = computed(() => {
  let allList = SysMenuType.getList();
  if (parentMenuType.value == null) {
    return allList.filter(item => {
      return [SysMenuType.MENU, SysMenuType.DIRECTORY].indexOf(item.id) !== -1;
    });
  } else {
    return allList.filter(item => {
      switch (parentMenuType.value) {
        case SysMenuType.DIRECTORY:
          return [SysMenuType.MENU, SysMenuType.DIRECTORY].indexOf(item.id) !== -1;
        case SysMenuType.MENU:
          return [SysMenuType.FRAGMENT, SysMenuType.BUTTON].indexOf(item.id) !== -1;
        case SysMenuType.FRAGMENT:
          return item.id === SysMenuType.BUTTON;
        default:
          return false;
      }
    });
  }
});
const onParentMenuChange = (value: CascaderValue, isInit?: boolean) => {
  //console.log('onParentMenuChange', value, isInit);
  // 选中选项后自动关闭
  !isInit && menuCascader.value.togglePopperVisible();
  parentMenuType.value = null;
  if (Array.isArray(value) && value.length > 0) {
    let node = findTreeNode(menuTree.value, value[value.length - 1].toString(), 'menuId');
    if (node) parentMenuType.value = node.menuType;
  }
  // 父菜单切换后判断可用菜单类型是否改变，如果改变则清空
  if (
    !isInit &&
    getValidMenuType.value.map(item => item.id).indexOf(formData.value.menuType) === -1
  )
    formData.value.menuType = undefined;
};
const onBindTypeChange = (value: DictDataIdType) => {
  console.log(value);
  formData.value.onlineFormId = undefined;
  formData.value.formRouterName = undefined;
  formData.value.targetUrl = undefined;
  formData.value.onlineFlowEntryId = undefined;
  formData.value.permCodeList = [];
};
const onOnlineFormChange = (values: CascaderValue) => {
  if (Array.isArray(values)) {
    formData.value.onlineFormId = values[1] as string;
  }
};
const onOnlineEntryChange = (values: CascaderValue) => {
  if (Array.isArray(values)) {
    formData.value.onlineFlowEntryId = values[0] as string;
    formData.value.onlineFormId = values[1] as string;
  }
};
const loadPageAndForms = () => {
  OnlinePageController.listAllPageAndForm({})
    .then(res => {
      let formList = res.data.formList;
      let pageList = res.data.pageList;
      if (!Array.isArray(formList) || !Array.isArray(pageList)) {
        formTreeData.value = [];
        return;
      }
      formTreeData.value = pageList
        .map(page => {
          let children = formList
            .filter((form: ANY_OBJECT) => {
              return (
                form.pageId === page.pageId &&
                form.formKind === SysOnlineFormKind.PAGE &&
                (form.formType === SysOnlineFormType.QUERY ||
                  form.formType === SysOnlineFormType.ADVANCE_QUERY)
              );
            })
            .map((form: ANY_OBJECT) => {
              return {
                id: form.formId,
                name: form.formName,
              };
            });

          return {
            id: page.pageId,
            name: page.pageName,
            disabled: !page.published,
            children,
          };
        })
        .filter(page => page.children.length > 0);
      if (formData.value.onlineFormId) {
        onlineFormPath.value = findTreeNodePath(
          formTreeData.value,
          formData.value.onlineFormId,
          'id',
        );
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
const loadFlowEntryForms = () => {
  FlowOperationController.listFlowEntryForm({})
    .then(res => {
      entryTreeData.value = res.data
        .map(entry => {
          let formList: ANY_OBJECT[] = [];
          if (Array.isArray(entry.formList)) {
            formList = entry.formList
              .filter(form => form.formType === SysOnlineFormType.WORK_ORDER)
              .map(form => {
                return {
                  id: form.formId,
                  name: form.formName,
                };
              });
          }
          if (formList.length > 0) {
            return {
              id: entry.entryId,
              name: entry.processDefinitionName,
              children: formList,
            };
          }
          return null;
        })
        .filter(entry => entry != null) as ANY_OBJECT[];

      if (formData.value.onlineFlowEntryId) {
        onlineFlowPath.value = [
          formData.value.onlineFlowEntryId,
          formData.value.onlineFormId || '',
        ];
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
};
const onSubmit = () => {
  form.value.validate((valid: boolean) => {
    if (valid) {
      if (props.dialog) {
        let params: ANY_OBJECT = {};
        params.sysMenuDto = { ...formData.value };
        params.sysMenuDto.extraData = JSON.stringify({
          bindType: formData.value.bindType,
          onlineFormId: formData.value.onlineFormId,
          onlineFlowEntryId: formData.value.onlineFlowEntryId,
          formRouterName: formData.value.formRouterName,
          targetUrl: formData.value.targetUrl,
          menuCode: formData.value.menuCode,
          permCodeList: formData.value.permCodeList,
        });
        if (formData.value.bindType === SysMenuBindType.ROUTER) {
          params.sysMenuDto.onlineFormId = undefined;
          params.sysMenuDto.onlineFlowEntryId = undefined;
        }
        if (parentMenuPath.value.length > 0) {
          params.sysMenuDto.parentId = parentMenuPath.value[parentMenuPath.value.length - 1];
        } else {
          params.sysMenuDto.parentId = undefined;
        }
        console.log('isEdit', isEdit.value, 'dialog submit', params);
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

const { checkPermCodeExist } = usePermissions();

const formatMenuTree = () => {
  menuTree.value = [];
  if (props.menuList && props.menuList.length > 0) {
    menuTree.value = props.menuList
      .map(item => {
        return {
          ...item,
        };
      })
      .filter(item => {
        return item.menuType !== SysMenuType.BUTTON && item.menuId !== formData.value.menuId;
      });
  }
  menuTree.value = treeDataTranslate(menuTree.value, 'menuId', 'parentId') as MenuItem[] &
    CascaderOption[];
  //console.log(menuTree.value);
};

const initData = () => {
  formatMenuTree();
  if (formData.value.parentId) {
    parentMenuPath.value = findTreeNodePath(menuTree.value, formData.value.parentId, 'menuId');
  }
  onParentMenuChange(parentMenuPath.value, true);
  permCodeReady.value = false;
  PermCodeController.getPermCodeList({})
    .then(res => {
      permCodeList.value = res.data;
      permCodeReady.value = true;
    })
    .catch(e => {
      permCodeReady.value = true;
      console.log(e);
    });
  loadPageAndForms();
  loadFlowEntryForms();
};

onMounted(() => {
  setTimeout(() => {
    if (props.rowData != null) {
      formData.value = { ...formData.value, ...props.rowData };
      let extraData = null;
      if (props.rowData.extraData) {
        extraData = JSON.parse(formData.value.extraData || '');
      }
      if (extraData != null) {
        formData.value = {
          ...formData.value,
          ...extraData,
        };
      } else {
        if (formData.value.onlineFlowEntryId != null) {
          // 绑定工作流
          formData.value.bindType = SysMenuBindType.WORK_ORDER;
        } else if (formData.value.targetUrl != null) {
          // 绑定外部链接
          formData.value.bindType = SysMenuBindType.THRID_URL;
        } else {
          formData.value.bindType =
            formData.value.onlineFormId == null
              ? SysMenuBindType.ROUTER
              : SysMenuBindType.ONLINE_FORM;
        }
      }
    }
    if (props.parentId != null) formData.value.parentId = props.parentId;
    initData();
  });
});
</script>

<style lang="scss" scoped>
.edit-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.perm-code-box {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 100px;
  flex-wrap: nowrap;
}
</style>

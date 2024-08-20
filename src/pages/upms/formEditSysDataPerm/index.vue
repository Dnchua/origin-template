<template>
  <div class="form-single-fragment" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input"
      :rules="rules"
      style="width: 100%"
      label-width="110px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="数据权限名称" prop="SysDataPerm.dataPermName">
            <el-input
              class="input-item"
              v-model="formData.SysDataPerm.dataPermName"
              :clearable="true"
              placeholder="显示名称"
              maxlength="30"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="过滤规则" prop="SysDataPerm.ruleType" label-width="80px">
            <el-select
              class="input-item"
              v-model="formData.SysDataPerm.ruleType"
              :clearable="true"
              placeholder="过滤规则"
            >
              <el-option
                v-for="item in SysDataPermType.getList()"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-tabs class="dataperm-data" type="border-card">
            <el-tab-pane label="部门列表">
              <el-row>
                <el-col :span="24" style="margin-bottom: 15px">
                  <el-input
                    :size="formItemSize"
                    v-model="deptNameFilter"
                    placeholder="输入部门名称过滤"
                    style="width: 250px"
                    clearable
                    :suffix-icon="Search"
                  />
                </el-col>
                <el-col :span="24">
                  <el-scrollbar style="height: 279px" wrap-class="scrollbar_dropdown__wrap">
                    <div
                      class="table-empty unified-font"
                      v-if="deptTree.length <= 0"
                      style="margin-top: 35px"
                    >
                      <img src="@/assets/img/empty.png" />
                      <span>暂无数据</span>
                    </div>
                    <el-tree
                      v-show="deptTree.length > 0"
                      ref="deptTreeNode"
                      :data="deptTree"
                      show-checkbox
                      node-key="id"
                      default-expand-all
                      :check-strictly="true"
                      :props="{
                        ...deptProps,
                        disabled: () => {
                          return (
                            formData.SysDataPerm.ruleType !=
                              SysDataPermType.CUSTOM_DEPT_AND_CHILD &&
                            formData.SysDataPerm.ruleType != SysDataPermType.CUSTOM_DEPT
                          );
                        },
                      }"
                      :filter-node-method="filterDeptNode"
                    />
                  </el-scrollbar>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="菜单列表">
              <el-scrollbar style="height: 330px" wrap-class="scrollbar_dropdown__wrap">
                <div
                  class="table-empty unified-font"
                  v-if="menuTree.length <= 0"
                  style="margin-top: 50px"
                >
                  <img src="@/assets/img/empty.png" />
                  <span>暂无数据</span>
                </div>
                <el-tree
                  v-show="menuTree.length > 0"
                  ref="menuTreeNode"
                  :data="menuTree"
                  show-checkbox
                  node-key="id"
                  default-expand-all
                  :check-strictly="false"
                  :props="{ ...menuProps }"
                />
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <el-col :span="24" style="margin-top: 20px">
        <el-row type="flex" justify="end">
          <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
          <el-button
            type="primary"
            :size="formItemSize"
            @click="onUpdateClick()"
            :disabled="
              !(
                checkPermCodeExist('formSysDataPerm:fragmentSysDataPerm:add') ||
                checkPermCodeExist('formSysDataPerm:fragmentSysDataPerm:update')
              )
            "
          >
            保存
          </el-button>
        </el-row>
      </el-col>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { ElTree, ElMessage } from 'element-plus';
import { DialogProp } from '@/components/Dialog/types';
import { usePermissions } from '@/common/hooks/usePermission';
import { ANY_OBJECT } from '@/types/generic';
import { SysDataPermController, DictionaryController } from '@/api/system';
import { treeDataTranslate } from '@/common/utils';
import { SysDataPermType, MobileEntryType } from '@/common/staticDict';
import { DictData } from '@/common/staticDict/types';
import { PermData } from '@/types/upms/permdata';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const props = defineProps<{
  dataPermId?: string;
  defaultFormItemSize: Ref<'' | 'default' | 'small' | 'large'>;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const { checkPermCodeExist } = usePermissions();

const form = ref();
const deptTreeNode = ref();
const menuTreeNode = ref();
const deptTree = ref<DictData[]>([]);
const menuTree = ref<DictData[]>([]);
const deptNameFilter = ref(null);
const deptProps = {
  label: 'name',
};
const menuProps = {
  label: 'name',
};
const entryProps = {
  label: 'entryName',
};
const formData = reactive({
  SysDataPerm: {} as PermData,
});
const rules = {
  'SysDataPerm.dataPermName': [{ required: true, message: '请输入数据权限名称', trigger: 'blur' }],
  'SysDataPerm.ruleType': [{ required: true, message: '请选择过滤规则', trigger: 'blur' }],
};
const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  }
};

const filterDeptNode = (value: ANY_OBJECT, data: ANY_OBJECT) => {
  if (!value) return true;
  return data.deptName ? data.deptName.indexOf(value) !== -1 : true;
};
/**
 * 部门列表数据获取函数
 */
const loadDeptList = () => {
  let params = {};
  DictionaryController.dictSysDept(params)
    .then(res => {
      deptTree.value = treeDataTranslate(res.getList(), 'id');
      if (Array.isArray(formData.SysDataPerm.dataPermDeptList)) {
        deptTreeNode.value.setCheckedKeys(
          formData.SysDataPerm.dataPermDeptList.map(item => {
            return item.deptId;
          }),
        );
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
const loadMenuList = () => {
  let params = {};
  DictionaryController.dictSysMenu(params)
    .then(res => {
      menuTree.value = treeDataTranslate(res.getList(), 'id');
      if (Array.isArray(formData.SysDataPerm.dataPermMenuList)) {
        menuTreeNode.value.setCheckedKeys(
          formData.SysDataPerm.dataPermMenuList.map(item => {
            return item.menuId;
          }),
        );
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 编辑
 */
const onUpdateClick = () => {
  form.value.validate((valid: boolean) => {
    if (!valid) return;
    let params = {
      sysDataPermDto: {
        dataPermId: props.dataPermId,
        ruleType: formData.SysDataPerm.ruleType,
        dataPermName: formData.SysDataPerm.dataPermName,
      },
    } as ANY_OBJECT;
    if (
      formData.SysDataPerm.ruleType === SysDataPermType.CUSTOM_DEPT_AND_CHILD ||
      formData.SysDataPerm.ruleType === SysDataPermType.CUSTOM_DEPT
    ) {
      let deptList = deptTreeNode.value.getCheckedKeys();
      if (deptList.length <= 0) {
        ElMessage.error('请选择数据权限部门');
        return;
      }
      params.deptIdListString = Array.isArray(deptList) ? deptList.join(',') : undefined;
    }
    // 获取菜单列表
    let menuList = menuTreeNode.value.getCheckedKeys();
    params.menuIdListString = Array.isArray(menuList) ? menuList.join(',') : undefined;

    if (props.dataPermId == null) {
      SysDataPermController.add(params)
        .then(res => {
          ElMessage.success('添加成功');
          if (props.dialog) {
            props.dialog.submit(res);
          }
        })
        .catch(e => {
          console.warn(e);
        });
    } else {
      SysDataPermController.update(params)
        .then(res => {
          ElMessage.success('编辑成功');
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
 * 获取数据权限详细信息
 */
const loadSysDataPermData = () => {
  return new Promise((resolve, reject) => {
    if (props.dataPermId == null) {
      resolve(null);
    } else {
      let params = {
        dataPermId: props.dataPermId,
      };
      SysDataPermController.view(params)
        .then(res => {
          formData.SysDataPerm = { ...res.data };
          resolve(res);
        })
        .catch(e => {
          console.warn(e);
          reject();
        });
    }
  });
};
const formInit = () => {
  let loadAllDatasource = [loadSysDataPermData()];
  Promise.all(loadAllDatasource)
    .then(() => {
      loadDeptList();
      loadMenuList();
    })
    .catch(e => {
      console.warn(e);
    });
};

onMounted(() => {
  formInit();
});
watch(deptNameFilter, val => {
  deptTreeNode.value.filter(val);
});
</script>

<style scoped>
.dataperm-data {
  box-shadow: none !important;
}
.dataperm-data :deep(.el-tabs__header) {
  margin-bottom: 0;
}
.dataperm-data :deep(.el-tabs__content) {
  overflow: hidden;
  height: 360px;
}
</style>

<template>
  <div class="tab-dialog-box" style="position: relative">
    <el-tabs v-model="activeFragment">
      <el-tab-pane label="栏目管理" name="fragmentSysColumn" style="width: 100%">
        <div class="tab-content-box" :style="'min-height:' + (mainContextHeight - 76) + 'px'">
          <table-box
            class="border-bottom-0 page-table"
            :data="columnList"
            :size="layoutStore.defaultFormItemSize"
            @refresh="initFormData"
          >
            <template v-slot:operator>
              <el-button
                type="primary"
                :icon="Plus"
                :size="layoutStore.defaultFormItemSize"
                :disabled="!checkPermCodeExist('formSysMenu:fragmentSysMenu:add')"
                @click="onCreateSysColumnClick()"
              >
                新建
              </el-button>
            </template>
            <vxe-column title="序号" type="seq" width="55px" />
            <vxe-column title="栏目名称" field="columnName" />
            <vxe-column title="栏目图标" field="icon">
              <template v-slot="scope">
                <orange-icon v-if="scope.row.icon" :icon="scope.row.icon" />
              </template>
            </vxe-column>
            <vxe-column title="显示顺序" field="showOrder" />
            <vxe-column title="操作" width="100px">
              <template v-slot="scope">
                <el-button
                  @click="onEditSysColumnClick(scope.row)"
                  type="primary"
                  link
                  :size="layoutStore.defaultFormItemSize"
                  :disabled="!checkPermCodeExist('formSysMenu:fragmentSysMenu:update')"
                >
                  编辑
                </el-button>
                <el-button
                  @click="onDeleteClick(scope.row, 1)"
                  link
                  type="danger"
                  :size="layoutStore.defaultFormItemSize"
                  :disabled="!checkPermCodeExist('formSysMenu:fragmentSysMenu:delete')"
                >
                  删除
                </el-button>
              </template>
            </vxe-column>
          </table-box>
        </div>
      </el-tab-pane>
      <el-tab-pane label="菜单管理" name="fragmentSysMenu" style="width: 100%">
        <div class="tab-content-box" :style="'min-height:' + (mainContextHeight - 76) + 'px'">
          <el-form
            label-width="80px"
            :size="layoutStore.defaultFormItemSize"
            label-position="right"
            @submit.prevent
          >
            <filter-box :item-width="350" :hasSearch="false">
              <el-form-item label="所属栏目" style="flex-grow: 1">
                <el-select
                  class="filter-item"
                  v-model="currentColumnId"
                  filterable
                  placeholder="所属栏目"
                >
                  <el-option
                    v-for="item in columnList"
                    :key="item.columnId"
                    :value="item.columnId"
                    :label="item.columnName"
                  />
                </el-select>
              </el-form-item>
            </filter-box>
          </el-form>
          <table-box
            :data="currentMenuTree"
            :size="layoutStore.defaultFormItemSize"
            :tree-config="{ rowField: 'menuId', parentField: 'parentId' }"
            @refresh="initFormData"
            class="border-bottom-0 page-table"
          >
            <template v-slot:operator>
              <el-button
                type="primary"
                :icon="Plus"
                :size="layoutStore.defaultFormItemSize"
                :disabled="!checkPermCodeExist('formSysMenu:fragmentSysMenu:add')"
                @click="onCreateSysMenuClick()"
              >
                新建
              </el-button>
            </template>
            <vxe-column title="菜单名称" field="menuName" width="300px" tree-node> </vxe-column>
            <vxe-column title="菜单图标" field="icon" width="100px">
              <template v-slot="scope">
                <orange-icon v-if="scope.row.icon" :icon="scope.row.icon" />
              </template>
            </vxe-column>
            <vxe-column title="菜单顺序" field="showOrder" width="100px"> </vxe-column>
            <vxe-column title="菜单类型" field="menuType" width="100px">
              <template v-slot="scope">
                <el-tag :size="layoutStore.defaultFormItemSize" :type="getMenuType(scope.row)">{{
                  SysMenuType.getValue(scope.row.menuType)
                }}</el-tag>
              </template>
            </vxe-column>
            <vxe-column title="菜单路由" field="formRouterName" min-width="250px"> </vxe-column>
            <vxe-column title="操作" width="220px">
              <template v-slot="scope">
                <el-button
                  @click="onEditSysMenuClick(scope.row)"
                  type="primary"
                  link
                  :size="layoutStore.defaultFormItemSize"
                  :disabled="!checkPermCodeExist('formSysMenu:fragmentSysMenu:update')"
                >
                  编辑
                </el-button>
                <el-button
                  @click="onAddChildSysMenuClick(scope.row)"
                  type="primary"
                  link
                  :size="layoutStore.defaultFormItemSize"
                  :disabled="
                    !checkPermCodeExist('formSysMenu:fragmentSysMenu:add') ||
                    scope.row.menuType === SysMenuType.BUTTON
                  "
                >
                  添加
                </el-button>
                <el-button
                  @click="onDeleteClick(scope.row, 2)"
                  link
                  type="danger"
                  :size="layoutStore.defaultFormItemSize"
                  :disabled="!checkPermCodeExist('formSysMenu:fragmentSysMenu:delete')"
                >
                  删除
                </el-button>
              </template>
            </vxe-column>
          </table-box>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
export default {
  name: 'formSysMenu',
};
</script>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import OrangeIcon from '@/components/icons/index.vue';
import { usePermissions } from '@/common/hooks/usePermission';
import { SysMenuType } from '@/common/staticDict/index';
import { treeDataTranslate } from '@/common/utils/index';
import SysMenuEditForm from '@/pages/upms/formEditSysMenu/index.vue';
import FormEditColumn from '@/pages/upms/formEditSysMenu/editColumn.vue';
import { Dialog } from '@/components/Dialog';
import { MenuItem } from '@/types/upms/menu';
import { SystemMenuController } from '@/api/system';
import { useLayoutStore } from '@/store';
import { useMenuTools } from './hooks';
const { checkPermCodeExist } = usePermissions();
const activeFragment = ref('fragmentSysColumn');
const currentColumnId: Ref<string | undefined> = ref();
let allMenuList: MenuItem[] = [];
const menuTree: Ref<MenuItem[]> = ref([]);
const layoutStore = useLayoutStore();
const mainContextHeight = inject('mainContextHeight', document.documentElement.clientHeight);

const currentMenuTree = computed(() => {
  if (!currentColumnId.value) return [];
  for (let i = 0; i < menuTree.value.length; i++) {
    if (menuTree.value[i].menuId === currentColumnId.value) return menuTree.value[i].children;
  }
  return [];
});
const columnList = computed(() => {
  return menuTree.value.map(item => {
    return {
      menuId: item.menuId,
      menuName: item.menuName,
      columnId: item.menuId,
      columnName: item.menuName,
      icon: item.icon,
      showOrder: item.showOrder,
    };
  });
});

const { getMenuType } = useMenuTools();
const onCreateSysColumnClick = () => {
  Dialog.show(
    '新建',
    FormEditColumn,
    {
      area: ['500px'],
    },
    {},
  )
    .then(() => {
      initFormData();
    })
    .catch(e => {
      console.log(e);
    });
};
/**
 * 编辑栏目
 */
const onEditSysColumnClick = (row: MenuItem) => {
  Dialog.show(
    '编辑',
    FormEditColumn,
    {
      area: ['500px'],
    },
    {
      ...row,
    },
  )
    .then(() => {
      initFormData();
    })
    .catch(e => {
      console.log(e);
    });
};
/**
 * 新建菜单
 */
const onCreateSysMenuClick = () => {
  let params = {
    parentId: currentColumnId.value,
    menuList: allMenuList,
  };
  Dialog.show(
    '新建',
    SysMenuEditForm,
    {
      area: ['944px', '650px'],
    },
    params,
  )
    .then(() => {
      initFormData();
    })
    .catch(e => {
      console.log(e);
    });
};
/**
 * 编辑菜单
 */
const onEditSysMenuClick = (row: MenuItem) => {
  SystemMenuController.viewMenu({ menuId: row.menuId })
    .then(res => {
      let params = {
        rowData: res.data,
        menuId: row.menuId,
        menuList: allMenuList,
      };

      Dialog.show(
        '编辑',
        SysMenuEditForm,
        {
          area: ['944px', '650px'],
        },
        params,
      )
        .then(() => {
          initFormData();
        })
        .catch(e => {
          console.log(e);
        });
    })
    .catch(e => {
      console.log(e);
    });
};
/**
 * 添加子菜单
 */
const onAddChildSysMenuClick = (row: MenuItem) => {
  let params = {
    parentId: row.menuId,
    menuList: allMenuList,
  };

  Dialog.show(
    '添加子菜单',
    SysMenuEditForm,
    {
      area: ['800px', '650px'],
    },
    params,
  )
    .then(() => {
      initFormData();
    })
    .catch(e => {
      console.log(e);
    });
};
/**
 * 删除
 */
const onDeleteClick = (row: MenuItem, type: number) => {
  let params = {
    menuId: row.menuId,
  };

  ElMessageBox.confirm(`是否删除${type == 1 ? '栏目' : '菜单项'}【${row.menuName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      SystemMenuController.deleteMenu(params)
        .then(() => {
          initFormData();
        })
        .catch(e => {
          console.log(e);
        });
    })
    .catch(e => {
      console.log(e);
    });
};

const initFormData = () => {
  SystemMenuController.getMenuPermList({})
    .then(res => {
      allMenuList = res.data.map(item => {
        return { ...item };
      });
      menuTree.value = treeDataTranslate(res.data, 'menuId');
      // 获取默认的栏目
      let oldCoumnId = currentColumnId.value;
      currentColumnId.value = undefined;
      for (let i = 0; i < menuTree.value.length; i++) {
        if (menuTree.value[i].menuType === SysMenuType.DIRECTORY) {
          if (currentColumnId.value == null) currentColumnId.value = menuTree.value[i].menuId;
          if (menuTree.value[i].menuId === oldCoumnId) currentColumnId.value = oldCoumnId;
        }
      }
    })
    .catch(e => {
      console.log(e);
    });
};

onMounted(() => {
  initFormData();
});
</script>

<style lang="scss" scoped>
.tab-dialog-box {
  padding: 0 !important;
  margin: 0 !important;
  background-color: #f6f6f6 !important;
  :deep(.el-tabs__header) {
    margin-bottom: 0;
    background-color: white;
    border-top: 1px solid #e8e8e8;
  }
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  :deep(.el-tabs__item) {
    height: 44px;
    line-height: 44px;
  }
  :deep(.el-tabs__nav-wrap) {
    padding-left: 24px;
  }
  :deep(.el-tabs__content) {
    overflow: hidden;
  }

  .tab-content-box {
    display: flex;
    margin: 16px;
    flex-direction: column;
    flex: 1;
  }
}
</style>
@/types/upms/menu

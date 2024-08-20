<template>
  <div>
    <table-box
      class="border-bottom-0 page-table"
      :data="formSysMenu.SysMenu.impl.dataList"
      :tree-config="{ rowField: 'menuId', parentField: 'parentId' }"
      @refresh="refreshFormSysMenu"
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
          <el-tag :type="getMenuType(scope.row)" effect="light">{{
            SysMenuType.getValue(scope.row.menuType)
          }}</el-tag>
        </template>
      </vxe-column>
      <vxe-column title="菜单路由" field="formRouterName" min-width="250px"> </vxe-column>
      <vxe-column title="操作" fixed="right" width="220px">
        <template v-slot="scope">
          <el-button
            @click="onEditSysMenuClick(scope.row)"
            type="primary"
            :size="layoutStore.defaultFormItemSize"
            link
            :disabled="
              !checkPermCodeExist('formSysMenu:fragmentSysMenu:update') ||
              (scope.row.onlineFormId != null && scope.row.menuType === SysMenuType.BUTTON)
            "
          >
            编辑
          </el-button>
          <el-button
            @click="onAddChildSysMenuClick(scope.row)"
            type="primary"
            :size="layoutStore.defaultFormItemSize"
            link
            :disabled="
              !checkPermCodeExist('formSysMenu:fragmentSysMenu:add') ||
              scope.row.menuType === SysMenuType.BUTTON
            "
          >
            添加
          </el-button>
          <el-button
            @click="onDeleteClick(scope.row)"
            type="danger"
            :size="layoutStore.defaultFormItemSize"
            link
            :disabled="
              !checkPermCodeExist('formSysMenu:fragmentSysMenu:delete') ||
              (scope.row.onlineFormId != null && scope.row.menuType === SysMenuType.BUTTON)
            "
          >
            删除
          </el-button>
        </template>
      </vxe-column>
    </table-box>
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
import { useDialog } from '@/components/Dialog/useDialog';
import { MenuItem } from '@/types/upms/menu';
import { SystemMenuController } from '@/api/system';
import TableBox from '@/components/TableBox/index.vue';
import { treeDataTranslate } from '@/common/utils';
import { SysMenuType } from '@/common/staticDict/index';
import OrangeIcon from '@/components/icons/index.vue';
import { usePermissions } from '@/common/hooks/usePermission';
import { T } from '@/types/generic';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { useLayoutStore } from '@/store';
import SysMenuEditForm from '../formEditSysMenu/index.vue';
import { useMenuTools } from './hooks';

let allMenuList: MenuItem[] = [];
const Dialog = useDialog();
const { checkPermCodeExist } = usePermissions();
const layoutStore = useLayoutStore();
const mainContextHeight = inject('mainContextHeight', document.documentElement.clientHeight);

const loadSysMenuData = (params: T): Promise<TableData<MenuItem>> => {
  return new Promise((resolve, reject) => {
    SystemMenuController.getMenuPermList(params)
      .then(res => {
        allMenuList = res.data;
        resolve({
          dataList: treeDataTranslate(res.data, 'menuId'),
          totalCount: res.data.length,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};

/**
 * 菜单数据数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysMenuVerify = () => {
  return true;
};

const tableOptions: TableOptions<MenuItem> = {
  loadTableData: loadSysMenuData,
  verifyTableParameter: loadSysMenuVerify,
  paged: false,
};

// 加载菜单数据
const formSysMenu = reactive({
  formFilter: {},
  formFilterCopy: {},
  SysMenu: {
    impl: useTable(tableOptions),
  },
  isInit: false,
});

const refreshFormSysMenu = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    formSysMenu.SysMenu.impl.refreshTable(true, 1);
  } else {
    formSysMenu.SysMenu.impl.refreshTable();
  }
  formSysMenu.isInit = true;
};

// 菜单的增删改
const onCreateSysMenuClick = () => {
  let params = {
    menuList: allMenuList,
  };
  Dialog.show<MenuItem>(
    '新建',
    SysMenuEditForm,
    {
      // 如果内容高度会发生变化，一定要设为最高高度，否则高度撑开之后会引发dialog刷新z-index，从而遮挡element弹出组件
      area: ['800px', '650px'],
    },
    params,
  )
    .then(res => {
      formSysMenu.SysMenu.impl.refreshTable();
    })
    .catch(e => {
      console.log('dialog reject', e);
    });
};

const onEditSysMenuClick = (row: MenuItem) => {
  //console.log('onEditSysMenuClick', row);
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
          area: ['800px', '650px'],
        },
        params,
      )
        .then(res => {
          formSysMenu.SysMenu.impl.refreshTable();
        })
        .catch(e => {
          console.log('dialog reject', e);
        });
    })
    .catch(e => {
      console.error('viewMenu', e);
    });
};

const onAddChildSysMenuClick = (row: MenuItem) => {
  console.log('onAddChildSysMenuClick', row);
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
      formSysMenu.SysMenu.impl.refreshTable();
    })
    .catch(e => {
      console.log(e);
    });
};

const onDeleteClick = (row: MenuItem) => {
  console.log('onDeleteClick', row);
  let params = {
    menuId: row.menuId,
  };

  ElMessageBox.confirm(`是否删除菜单项【${row.menuName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(res => {
      SystemMenuController.deleteMenu(params)
        .then(() => {
          formSysMenu.SysMenu.impl.refreshTable();
        })
        .catch(e => {
          console.log(e);
        });
    })
    .catch(e => {
      //console.log(e);
    });
};

const { getMenuType } = useMenuTools();

onMounted(() => {
  refreshFormSysMenu();
});
</script>
@/types/upms/menu

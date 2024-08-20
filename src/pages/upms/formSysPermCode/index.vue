<template>
  <div
    class="tab-dialog-box"
    style="position: relative"
    :style="{ height: mainContextHeight + 'px' }"
  >
    <el-tabs v-model="activeName" @tab-click="handleClick" style="background: white">
      <el-tab-pane label="PC端权限字" name="pc" />
      <el-tab-pane label="工作流权限字" name="workflow" />
    </el-tabs>
    <div class="main-box">
      <el-form
        ref="form"
        :model="formPermCode"
        label-width="90px"
        :size="layoutStore.defaultFormItemSize"
        label-position="right"
        @submit.prevent
      >
        <filter-box :item-width="350" @search="refreshFormPermCode(true)" @reset="onReset">
          <el-form-item label="权限字名称" prop="formFilter.showName">
            <el-input
              class="filter-item"
              v-model="formPermCode.formFilter.showName"
              :clearable="true"
              placeholder="权限字名称"
            />
          </el-form-item>
        </filter-box>
      </el-form>
      <table-box
        style="flex-grow: 1; height: 200px"
        :data="getPermCodeList"
        :size="layoutStore.defaultFormItemSize"
        @sort-change="formPermCode.SysPermCode.impl.onSortChange"
        :tree-config="{ rowField: 'permCodeId', parentField: 'parentId' }"
        @refresh="refreshFormPermCode(true)"
        class="border-bottom-0 page-table"
      >
        <template v-slot:operator>
          <el-button
            type="primary"
            :icon="Plus"
            :size="layoutStore.defaultFormItemSize"
            :disabled="!checkPermCodeExist('formSysPermCode:fragmentSysPermCode:add')"
            @click="onCreatePermCodeClick()"
            >新建</el-button
          >
        </template>
        <vxe-column title="权限字名称" field="showName" width="250px" tree-node> </vxe-column>
        <vxe-column title="权限字类型" field="permCodeType" width="150px">
          <template v-slot="scope">
            <el-tag
              :size="layoutStore.defaultFormItemSize"
              :type="getPermCodeType(scope.row.permCodeType)"
              >{{ SysPermCodeType.getValue(scope.row.permCodeType) }}</el-tag
            >
          </template>
        </vxe-column>
        <vxe-column title="显示顺序" field="showOrder" width="100px"> </vxe-column>
        <vxe-column title="权限字标识" field="permCode" min-width="200px"> </vxe-column>
        <vxe-column title="操作" fixed="right" width="230px">
          <template v-slot="scope">
            <el-button
              @click="onEditPermCodeClick(scope.row)"
              type="primary"
              link
              :size="layoutStore.defaultFormItemSize"
              :disabled="!checkPermCodeExist('formSysPermCode:fragmentSysPermCode:update')"
            >
              编辑
            </el-button>
            <el-button
              @click="onAddChildPermCodeClick(scope.row)"
              type="primary"
              link
              :size="layoutStore.defaultFormItemSize"
              :disabled="
                scope.row.permCodeType == SysPermCodeType.OPERATION ||
                !checkPermCodeExist('formSysPermCode:fragmentSysPermCode:add')
              "
            >
              添加
            </el-button>
            <el-button
              @click="onDeleteClick(scope.row)"
              link
              type="danger"
              :size="layoutStore.defaultFormItemSize"
              :disabled="!checkPermCodeExist('formSysPermCode:fragmentSysPermCode:delete')"
            >
              删除
            </el-button>
            <el-button
              type="primary"
              link
              :size="layoutStore.defaultFormItemSize"
              v-if="
                checkPermCodeExist('formSysPermCode:fragmentSysPermCode:listSysPermCodePermDetail')
              "
              @click="onSysPermCodeDetailClick(scope.row)"
            >
              权限详情
            </el-button>
          </template>
        </vxe-column>
      </table-box>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'formSysPermCode',
};
</script>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { computed, inject, onMounted, reactive, ref } from 'vue';
import { usePermissions } from '@/common/hooks/usePermission';
import { TableOptions } from '@/common/types/pagination';
import { PermCode } from '@/types/upms/permcode';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { ANY_OBJECT } from '@/types/generic';
import { PermCodeController } from '@/api/system';
import { treeDataTranslate } from '@/common/utils';
import { SysPermCodeType } from '@/common/staticDict/index';
import { useDialog } from '@/components/Dialog/useDialog';
import { useLayoutStore } from '@/store';
import FormEditSysPermCode from '../formEditSysPermCode/index.vue';
import FormSysPermCodeDetail from './formSysPermCodeDetail.vue';

const Dialog = useDialog();
const layoutStore = useLayoutStore();
const mainContextHeight = inject('mainContextHeight', document.documentElement.clientHeight);
const { checkPermCodeExist } = usePermissions();
const form = ref();
const activeName = ref('pc');

const getPermCodeList = computed(() => {
  try {
    if (formPermCode.SysPermCode.impl.dataList) {
      let temp = formPermCode.SysPermCode.impl.dataList.filter((item: PermCode) => {
        if (
          (item.permCodeKind === 0 && activeName.value === 'pc') ||
          (item.permCodeKind === 2 && activeName.value === 'workflow')
        ) {
          return (
            formPermCode.formFilterCopy.showName == null ||
            formPermCode.formFilterCopy.showName === '' ||
            item.showName.indexOf(formPermCode.formFilterCopy.showName) !== -1
          );
        } else {
          return false;
        }
      });
      return temp;
    }
  } catch (e) {
    console.log(e);
  }
  return [];
});

const currentPermCodeKind = computed(() => {
  switch (activeName.value) {
    case 'pc':
      return 0;
    case 'workflow':
      return 2;
    default:
      return 0;
  }
});

const handleClick = (tab: ANY_OBJECT) => {
  activeName.value = tab.name;
  formPermCode.formFilter.showName = '';
  formPermCode.formFilterCopy.showName = '';
  formPermCode.SysPermCode.impl.refreshTable();
};

/**
 * 权限资源数据获取函数，返回Primise
 */
const loadSysPermCodeData = (params: ANY_OBJECT): Promise<TableData<PermCode>> => {
  return new Promise((resolve, reject) => {
    PermCodeController.getPermCodeList(params)
      .then(res => {
        resolve({
          dataList: treeDataTranslate(res.data, 'permCodeId'),
          totalCount: 0,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 权限资源数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysPermCodeVerify = () => {
  formPermCode.formFilterCopy.showName = formPermCode.formFilter.showName;
  return true;
};

const tableOptions: TableOptions<PermCode> = {
  loadTableData: loadSysPermCodeData,
  verifyTableParameter: loadSysPermCodeVerify,
  paged: true,
  orderFieldName: 'showOrder',
  ascending: true,
};

const formPermCode = reactive<ANY_OBJECT>({
  formFilter: {
    showName: undefined,
  },
  formFilterCopy: {
    showName: undefined,
  },
  SysPermCode: {
    impl: useTable(tableOptions),
    totalCount: 0,
    sortInfo: {
      orderField: 'showOrder',
      asc: 1,
    },
  },
  isInit: false,
});

const getPermCodeType = (permCodeType: number) => {
  // ["primary", "success", "info", "warning", "danger"]
  switch (permCodeType) {
    case SysPermCodeType.FORM:
      return 'primary';
    case SysPermCodeType.FRAGMENT:
      return 'warning';
    case SysPermCodeType.OPERATION:
      return 'success';
    default:
      return 'info';
  }
};
/**
 * 更新权限资源管理
 */
const refreshFormPermCode = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    formPermCode.SysPermCode.impl.refreshTable(true, 1);
  } else {
    formPermCode.SysPermCode.impl.refreshTable();
  }
  formPermCode.isInit = true;
};
const onReset = () => {
  form.value.resetFields();
  refreshFormPermCode(true);
};

/**
 * 添加
 */
const onCreatePermCodeClick = () => {
  let params = {
    permCodeTree: formPermCode.SysPermCode.impl.dataList,
    permCodeKind: currentPermCodeKind.value,
  };

  Dialog.show(
    '添加',
    FormEditSysPermCode,
    {
      area: ['800px', 'auto'],
    },
    params,
  )
    .then(() => {
      refreshFormPermCode(true);
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 编辑
 */
const onEditPermCodeClick = (row: PermCode) => {
  PermCodeController.viewPermCode({
    permCodeId: row.permCodeId,
  })
    .then(res => {
      let params = {
        permCodeTree: formPermCode.SysPermCode.impl.dataList,
        permCodeType: row.permCodeType,
        permCodeKind: currentPermCodeKind.value,
        rowData: { ...res.data },
      };
      return Dialog.show(
        '编辑',
        FormEditSysPermCode,
        {
          area: ['800px', 'auto'],
        },
        params,
      )
        .then(() => {
          refreshFormPermCode(true);
        })
        .catch(e => {
          console.warn(e);
        });
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 添加权限字
 */
const onAddChildPermCodeClick = (row: PermCode) => {
  let params = {
    permCodeTree: formPermCode.SysPermCode.impl.dataList,
    permCodeType: row.permCodeType + 1,
    permCodeKind: currentPermCodeKind.value,
    rowData: {
      parentId: row.permCodeId,
    },
  };

  Dialog.show(
    '添加权限字',
    FormEditSysPermCode,
    {
      area: ['800px', '600px'],
    },
    params,
  )
    .then(() => {
      formPermCode.SysPermCode.impl.refreshTable();
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 删除
 */
const onDeleteClick = (row: PermCode) => {
  let params = {
    permCodeId: row.permCodeId,
  };

  ElMessageBox.confirm(`是否删除权限字【${row.showName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(res => {
      PermCodeController.deletePermCode(params)
        .then(() => {
          ElMessage.success('删除成功');
          formPermCode.SysPermCode.impl.refreshTable();
        })
        .catch(e => {
          console.warn(e);
        });
    })
    .catch(e => {
      console.warn(e);
    });
};
const onSysPermCodeDetailClick = (row: PermCode) => {
  Dialog.show(
    '权限详情',
    FormSysPermCodeDetail,
    {
      area: '1200px',
      offset: '30px',
    },
    {
      permCodeId: row.permCodeId,
      // 注入inject属性
      mainContextHeight: mainContextHeight,
    },
  )
    .then(() => {
      // do nothing
    })
    .catch(e => {
      console.warn(e);
    });
};
const formInit = () => {
  refreshFormPermCode();
};

onMounted(() => {
  formInit();
});
</script>

<style lang="scss" scoped>
.tab-dialog-box {
  display: flex;
  flex-direction: column;
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

  .main-box {
    display: flex;
    height: 100px;
    padding: 16px;
    flex-direction: column;
    flex-grow: 1;
  }
}
</style>

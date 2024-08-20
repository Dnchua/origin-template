<template>
  <div class="tab-content-box" :style="'min-height:' + (mainContextHeight - 76) + 'px'">
    <el-form
      ref="form"
      :model="fragmentSysDataPerm"
      label-width="100px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFragmentSysDataPerm(true)" @reset="onReset">
        <el-form-item label="过滤规则" prop="formFilter.sysDatapermType" label-width="75px">
          <el-select
            class="filter-item"
            v-model="fragmentSysDataPerm.formFilter.sysDatapermType"
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
        <el-form-item label="数据权限名称" prop="formFilter.sysDataPermName">
          <el-input
            class="filter-item"
            v-model="fragmentSysDataPerm.formFilter.sysDataPermName"
            :clearable="true"
            placeholder="数据权限名称"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      :data="fragmentSysDataPerm.SysDataPerm.impl.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="fragmentSysDataPerm.SysDataPerm.impl.onSortChange"
      :seq-config="{
        startIndex:
          (fragmentSysDataPerm.SysDataPerm.impl.currentPage - 1) *
          fragmentSysDataPerm.SysDataPerm.impl.pageSize,
      }"
      @refresh="refreshFragmentSysDataPerm(true)"
    >
      <template v-slot:operator>
        <el-button
          type="primary"
          :icon="Plus"
          :size="layoutStore.defaultFormItemSize"
          :disabled="!checkPermCodeExist('formSysDataPerm:fragmentSysDataPerm:add')"
          @click="onAddDataPermClick()"
        >
          新建
        </el-button>
      </template>
      <vxe-column
        title="序号"
        type="seq"
        width="55px"
        :index="fragmentSysDataPerm.SysDataPerm.impl.getTableIndex"
      />
      <vxe-column title="权限名称" field="dataPermName"> </vxe-column>
      <vxe-column title="过滤规则">
        <template v-slot="scope">
          <span>{{ SysDataPermType.getValue(scope.row.ruleType) }}</span>
        </template>
      </vxe-column>
      <vxe-column title="指定菜单">
        <template v-slot="scope">
          <el-tag
            size="default"
            :type="
              Array.isArray(scope.row.dataPermMenuList) && scope.row.dataPermMenuList.length > 0
                ? 'success'
                : 'danger'
            "
          >
            {{
              Array.isArray(scope.row.dataPermMenuList) && scope.row.dataPermMenuList.length > 0
                ? '是'
                : '否'
            }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="指定轮播图">
        <template v-slot="scope">
          <el-tag size="default" :type="scope.row.bannerCount > 0 ? 'success' : 'danger'">
            {{ scope.row.bannerCount > 0 ? '是' : '否' }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="指定九宫格">
        <template v-slot="scope">
          <el-tag size="default" :type="scope.row.sodukuCount > 0 ? 'success' : 'danger'">
            {{ scope.row.sodukuCount > 0 ? '是' : '否' }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="操作" fixed="right" width="100px">
        <template v-slot="scope">
          <el-button
            @click="onEditDataPermClick(scope.row)"
            type="primary"
            link
            :size="layoutStore.defaultFormItemSize"
            :disabled="!checkPermCodeExist('formSysDataPerm:fragmentSysDataPerm:update')"
          >
            编辑
          </el-button>
          <el-button
            @click="onDeleteClick(scope.row)"
            type="danger"
            link
            :size="layoutStore.defaultFormItemSize"
            :disabled="!checkPermCodeExist('formSysDataPerm:fragmentSysDataPerm:delete')"
          >
            删除
          </el-button>
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="fragmentSysDataPerm.SysDataPerm.impl.totalCount"
            :current-page="fragmentSysDataPerm.SysDataPerm.impl.currentPage"
            :page-size="fragmentSysDataPerm.SysDataPerm.impl.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="fragmentSysDataPerm.SysDataPerm.impl.onCurrentPageChange"
            @size-change="fragmentSysDataPerm.SysDataPerm.impl.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
  </div>
</template>

<script setup lang="ts">
import { inject, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { usePermissions } from '@/common/hooks/usePermission';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { SysDataPermController } from '@/api/system';
import { ANY_OBJECT } from '@/types/generic';
import { useDialog } from '@/components/Dialog/useDialog';
import { MobileEntryType, SysDataPermType } from '@/common/staticDict';
import { PermData } from '@/types/upms/permdata';
import { useLayoutStore } from '@/store';
import FormEditSysDataPerm from '../formEditSysDataPerm/index.vue';

const Dialog = useDialog();
const layoutStore = useLayoutStore();
const mainContextHeight = inject('mainContextHeight', 200);
const { checkPermCodeExist } = usePermissions();

const form = ref();
/**
 * 用户数据权限数据获取函数，返回Primise
 */
const loadSysDataPermData = (params: ANY_OBJECT): Promise<TableData<PermData>> => {
  params.sysDataPermDtoFilter = {
    searchString: fragmentSysDataPerm.formFilterCopy.sysDataPermName,
    ruleType: fragmentSysDataPerm.formFilterCopy.sysDatapermType,
  };
  return new Promise((resolve, reject) => {
    SysDataPermController.list(params)
      .then(res => {
        res.data.dataList.forEach(item => {
          item.bannerCount = (item.dataPermMobileEntryList || []).filter((entry: ANY_OBJECT) => {
            return entry.entryType === MobileEntryType.BANNER;
          }).length;
          item.sodukuCount = (item.dataPermMobileEntryList || []).length - item.bannerCount;
        });
        resolve({
          dataList: res.data.dataList.map(item => {
            return { ...item };
          }),
          totalCount: res.data.totalCount,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 用户数据权限数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysDataPermVerify = () => {
  fragmentSysDataPerm.formFilterCopy.sysDatapermType =
    fragmentSysDataPerm.formFilter.sysDatapermType;
  fragmentSysDataPerm.formFilterCopy.sysDataPermName =
    fragmentSysDataPerm.formFilter.sysDataPermName;
  return true;
};

const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadSysDataPermData,
  verifyTableParameter: loadSysDataPermVerify,
  paged: true,
  //orderFieldName: 'createTime',
  //ascending: true,
};

const fragmentSysDataPerm = reactive({
  formFilter: {
    sysDatapermType: undefined,
    sysDataPermName: undefined,
  },
  formFilterCopy: {
    sysDatapermType: undefined,
    sysDataPermName: undefined,
  },
  SysDataPerm: {
    impl: useTable(tableOptions),
  },
  isInit: false,
});

const onReset = () => {
  form.value.resetFields();
  refreshFragmentSysDataPerm(true);
};

/**
 * 更新数据权限列表
 */
const refreshFragmentSysDataPerm = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    fragmentSysDataPerm.SysDataPerm.impl.refreshTable(true, 1);
  } else {
    fragmentSysDataPerm.SysDataPerm.impl.refreshTable();
  }
  fragmentSysDataPerm.isInit = true;
};
/**
 * 新建
 */
const onAddDataPermClick = () => {
  let params = {};

  Dialog.show(
    '新建数据权限',
    FormEditSysDataPerm,
    {
      area: ['800px', 'auto'],
      offset: '100px',
    },
    params,
  )
    .then(() => {
      refreshFragmentSysDataPerm();
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 编辑
 */
const onEditDataPermClick = (row: ANY_OBJECT) => {
  let params = {
    dataPermId: row.dataPermId,
  };

  Dialog.show(
    '编辑数据权限',
    FormEditSysDataPerm,
    {
      area: ['800px', '600px'],
    },
    params,
  )
    .then(() => {
      fragmentSysDataPerm.SysDataPerm.impl.refreshTable();
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 删除
 */
const onDeleteClick = (row: PermData) => {
  let params = {
    dataPermId: row.dataPermId,
  };

  ElMessageBox.confirm(`是否删除数据权限【${row.dataPermName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      SysDataPermController.delete(params)
        .then(() => {
          ElMessage.success('删除成功');
          fragmentSysDataPerm.SysDataPerm.impl.refreshTable();
        })
        .catch(e => {
          console.warn(e);
        });
    })
    .catch(() => {
      // do nothing
    });
};

defineExpose({
  refreshFragmentSysDataPerm,
});
</script>

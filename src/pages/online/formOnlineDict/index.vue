<template>
  <div style="position: relative">
    <el-form
      ref="form"
      :model="formOnlineDict"
      label-width="80px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshOnlineDict(true)" @reset="onReset">
        <el-form-item label="字典类型" prop="formFilter.dictType">
          <el-select
            class="filter-item"
            v-model="formOnlineDict.formFilter.dictType"
            placeholder=""
            clearable
          >
            <el-option
              v-for="item in SysOnlineDictType.getList()"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="字典名称" prop="formFilter.dictName">
          <el-input
            class="filter-item"
            v-model="formOnlineDict.formFilter.dictName"
            :clearable="true"
            placeholder="字典名称"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      :data="formOnlineDict.dict.impl.dataList"
      @sort-change="formOnlineDict.dict.impl.onSortChange"
      @refresh="refreshOnlineDict(true)"
      :seq-config="{
        startIndex: (formOnlineDict.dict.impl.currentPage - 1) * formOnlineDict.dict.impl.pageSize,
      }"
    >
      <template v-slot:operator>
        <el-button
          type="primary"
          :icon="Plus"
          :size="layoutStore.defaultFormItemSize"
          @click="onFormCreateDictClick()"
          >新建</el-button
        >
      </template>
      <vxe-column
        title="序号"
        type="seq"
        width="55px"
        :index="formOnlineDict.dict.impl.getTableIndex"
      />
      <vxe-column title="字典名称" field="dictName" />
      <vxe-column title="字典类型" field="dictTypeDictMap.name">
        <template v-slot="scope">
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            :type="getDictTypeTagType(scope.row.dictType)"
          >
            {{ scope.row.dictTypeDictMap.name }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="是否树字典">
        <template v-slot="scope">
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            :type="scope.row.treeFlag ? 'success' : 'danger'"
          >
            {{ scope.row.treeFlag ? '是' : '否' }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="操作" fixed="right" width="100px">
        <template v-slot="scope">
          <el-button
            @click.stop="onFormEditDictClick(scope.row)"
            link
            type="primary"
            :size="layoutStore.defaultFormItemSize"
          >
            编辑
          </el-button>
          <el-button
            @click.stop="onFormDeleteDictClick(scope.row)"
            type="danger"
            link
            :size="layoutStore.defaultFormItemSize"
          >
            删除
          </el-button>
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="formOnlineDict.dict.impl.totalCount"
            :current-page="formOnlineDict.dict.impl.currentPage"
            :page-size="formOnlineDict.dict.impl.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="formOnlineDict.dict.impl.onCurrentPageChange"
            @size-change="formOnlineDict.dict.impl.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
  </div>
</template>

<script lang="ts">
export default {
  name: 'formOnlineDict',
};
</script>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { OnlineDictController } from '@/api/online';
import { TableOptions } from '@/common/types/pagination';
import { TableData } from '@/common/types/table';
import { useCommon } from '@/common/hooks/useCommon';
import { ANY_OBJECT } from '@/types/generic';
import { SysOnlineDictType } from '@/common/staticDict/online';
import { useThirdPartyAlive } from '@/components/thirdParty/hooks';
import { useLayoutStore } from '@/store';
import EditOnlineDict from './EditOnlineDict.vue';
const layoutStore = useLayoutStore();

useThirdPartyAlive();

const { useTable, Dialog } = useCommon();
const form = ref();

/**
 * 获取动态表单字典列表
 */
const loadDynamicDictData = (params: ANY_OBJECT): Promise<TableData<ANY_OBJECT>> => {
  params = {
    ...params,
    onlineDictDtoFilter: {
      dictName: formOnlineDict.formFilterCopy.dictName,
      dictType: formOnlineDict.formFilterCopy.dictType,
    },
  };
  return new Promise((resolve, reject) => {
    OnlineDictController.list(params)
      .then(res => {
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
const loadDynamicDictVerify = () => {
  formOnlineDict.formFilterCopy.dictName = formOnlineDict.formFilter.dictName;
  formOnlineDict.formFilterCopy.dictType = formOnlineDict.formFilter.dictType;
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadDynamicDictData,
  verifyTableParameter: loadDynamicDictVerify,
  paged: true,
};

const formOnlineDict = reactive({
  formFilter: {
    dictName: undefined,
    dictType: undefined,
  },
  formFilterCopy: {
    dictName: undefined,
    dictType: undefined,
  },
  dict: {
    impl: useTable(tableOptions),
  },
  isInit: false,
});

// 第三方接入刷新数据
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const refreshOnlineDict = (reloadData: boolean) => {
  if (reloadData) {
    formOnlineDict.dict.impl.refreshTable(true, 1);
  } else {
    formOnlineDict.dict.impl.refreshTable();
  }
  if (!formOnlineDict.isInit) {
    // 初始化下拉数据
  }
  formOnlineDict.isInit = true;
};
const onReset = () => {
  form.value.resetFields();
  refreshOnlineDict(true);
};
const getDictTypeTagType = (type: number) => {
  switch (type) {
    case SysOnlineDictType.TABLE:
      return 'success';
    case SysOnlineDictType.URL:
      return 'primary';
    case SysOnlineDictType.STATIC:
      return 'warning';
    case SysOnlineDictType.CUSTOM:
      return 'danger';
    default:
      return 'info';
  }
};

const onFormCreateDictClick = () => {
  Dialog.show(
    '新建字典',
    EditOnlineDict,
    {
      area: '600px',
      offset: '100px',
    },
    {
      //Extraneous non-props attributes (path) were passed to component but could not be automatically inherited because component renders fragment or text root nodes.
      //path: 'thirdEditOnlineDict',
    },
    {
      pathName: '/thirdParty/thirdEditOnlineDict',
    },
  )
    .then(res => {
      formOnlineDict.dict.impl.refreshTable();
    })
    .catch(e => {
      console.warn(e);
    });
};
const onFormEditDictClick = (row: ANY_OBJECT) => {
  Dialog.show(
    '编辑字典',
    EditOnlineDict,
    {
      area: '600px',
      offset: '100px',
    },
    {
      dictId: row.dictId,
      //path: 'thirdEditOnlineDict',
    },
    {
      pathName: '/thirdParty/thirdEditOnlineDict',
    },
  )
    .then(res => {
      formOnlineDict.dict.impl.refreshTable();
    })
    .catch(e => {
      console.warn(e);
    });
};
const onFormDeleteDictClick = (row: ANY_OBJECT) => {
  ElMessageBox.confirm(`是否删除字典【${row.dictName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(res => {
      let params = {
        dictId: row.dictId,
      };

      return OnlineDictController.delete(params);
    })
    .then(res => {
      ElMessage.success('删除成功！');
      formOnlineDict.dict.impl.refreshTable();
    })
    .catch(e => {
      console.warn(e);
    });
};

const formInit = () => {
  refreshOnlineDict(false);
};

onMounted(() => {
  formInit();
});
</script>

<template>
  <div style="position: relative">
    <el-form
      ref="form"
      :model="formOnlinePage"
      label-width="75px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshOnlinePage(true)" @reset="onReset">
        <el-form-item label="表单类型" prop="formFilter.pageType">
          <el-select
            class="filter-item"
            v-model="formOnlinePage.formFilter.pageType"
            placeholder="表单类型"
            :clearable="true"
          >
            <el-option
              v-for="item in SysOnlinePageType.getList()"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="表单名称" prop="formFilter.pageName">
          <el-input
            class="filter-item"
            v-model="formOnlinePage.formFilter.pageName"
            :clearable="true"
            placeholder="表单名称"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      ref="class"
      :hasExtend="true"
      :data="pageListWidget.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="pageListWidget.onSortChange"
      @refresh="refreshOnlinePage(true)"
      :seq-config="{
        startIndex: (pageListWidget.currentPage - 1) * pageListWidget.pageSize,
      }"
    >
      <template v-slot:operator>
        <el-button
          type="primary"
          :icon="Plus"
          :size="layoutStore.defaultFormItemSize"
          @click="onCreateOnlinePage()"
          >新建</el-button
        >
      </template>
      <vxe-column title="序号" type="seq" width="55px" :index="pageListWidget.getTableIndex" />
      <vxe-column title="页面名称" field="pageName" />
      <vxe-column title="页面代码" field="pageCode" />
      <vxe-column title="页面类型">
        <template v-slot="scope">
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            :type="scope.row.pageType === SysOnlinePageType.BIZ ? 'success' : 'primary'"
          >
            {{ SysOnlinePageType.getValue(scope.row.pageType) }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="页面状态" field="statusDictMap.name">
        <template v-slot="scope">
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            :type="getPageStatusTagType(scope.row.status)"
          >
            {{ SysOnlinePageStatus.getValue(scope.row.status) }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="发布状态">
        <template v-slot="scope">
          <el-switch v-model="scope.row.published" @change="onUpdatePagePublished(scope.row)" />
        </template>
      </vxe-column>
      <vxe-column title="创建时间" field="createTime" />
      <vxe-column title="操作" width="100px" fixed="right">
        <template v-slot="scope">
          <el-button
            link
            type="primary"
            :size="layoutStore.defaultFormItemSize"
            @click="onEditOnlinePage(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            link
            :size="layoutStore.defaultFormItemSize"
            @click="onDeleteOnlinePage(scope.row)"
            >删除</el-button
          >
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="pageListWidget.totalCount"
            :current-page="pageListWidget.currentPage"
            :page-size="pageListWidget.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="pageListWidget.onCurrentPageChange"
            @size-change="pageListWidget.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
  </div>
</template>

<script lang="ts">
export default {
  name: 'formOnlinePage',
};
</script>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useCommon } from '@/common/hooks/useCommon';
import { SysOnlinePageStatus, SysOnlinePageType } from '@/common/staticDict/online';
import { TableOptions } from '@/common/types/pagination';
import { TableData } from '@/common/types/table';
import { ANY_OBJECT } from '@/types/generic';
import { OnlinePageController } from '@/api/online';
import { FormPage } from '@/types/online/page';
import { useThirdPartyAlive } from '@/components/thirdParty/hooks';
import { useLayoutStore } from '@/store';
import EditOnlinePage from '../editOnlinePage/index.vue';

const layoutStore = useLayoutStore();
useThirdPartyAlive();

const { clientHeight, useTable, Dialog } = useCommon();
const form = ref();

const formOnlinePage = reactive({
  formFilter: {
    pageType: undefined,
    pageName: undefined,
  },
  formFilterCopy: {
    pageType: undefined,
    pageName: undefined,
  },
  isInit: false,
});

const loadOnlinePageData = (params: ANY_OBJECT): Promise<TableData<FormPage>> => {
  if (params == null) params = {};
  params = {
    ...params,
    onlinePageDtoFilter: {
      pageType: formOnlinePage.formFilterCopy.pageType,
      pageName: formOnlinePage.formFilterCopy.pageName,
    },
  };
  return new Promise((resolve, reject) => {
    OnlinePageController.list(params)
      .then(res => {
        resolve({
          dataList: res.data.dataList,
          totalCount: res.data.totalCount,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const loadOnlinePageVerify = () => {
  formOnlinePage.formFilterCopy.pageType = formOnlinePage.formFilter.pageType;
  formOnlinePage.formFilterCopy.pageName = formOnlinePage.formFilter.pageName;
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadOnlinePageData,
  verifyTableParameter: loadOnlinePageVerify,
  paged: true,
};

const pageListWidget = reactive(useTable(tableOptions));

const onReset = () => {
  form.value.resetFields();
  refreshOnlinePage(true);
};
const getPageStatusTagType = (status: number) => {
  switch (status) {
    case SysOnlinePageStatus.BASIC:
      return 'warning';
    case SysOnlinePageStatus.DATASOURCE:
      return 'primary';
    case SysOnlinePageStatus.DESIGNING:
      return 'success';
  }
};
const onUpdatePagePublished = (row: ANY_OBJECT) => {
  let params = {
    pageId: row.pageId,
    published: row.published,
  };

  OnlinePageController.updatePublished(params).catch(e => {
    // 恢复发布状态为更改之前
    row.published = !row.published;
  });
};
const refreshOnlinePage = (reloadData = false) => {
  if (reloadData) {
    pageListWidget.refreshTable(true, 1);
  } else {
    pageListWidget.refreshTable();
  }
  if (!formOnlinePage.isInit) {
    // 初始化下拉数据
  }
  formOnlinePage.isInit = true;
};
const formInit = () => {
  refreshOnlinePage();
};

const onCreateOnlinePage = () => {
  Dialog.show(
    '新建页面',
    EditOnlinePage,
    {
      area: ['100vw', '100vh'],
      skin: 'fullscreen-dialog',
    },
    {
      clientHeight,
      //path: 'thirdEditOnlinePage',
    },
    {
      fullscreen: true,
      pathName: '/thirdParty/thirdEditOnlinePage',
    },
  )
    .then(res => {
      pageListWidget.refreshTable();
    })
    .catch(e => {
      console.log(e);
      pageListWidget.refreshTable();
    });
};
const onEditOnlinePage = (row: ANY_OBJECT) => {
  Dialog.show(
    '编辑页面',
    EditOnlinePage,
    {
      area: ['100vw', '100vh'],
      skin: 'fullscreen-dialog',
    },
    {
      pageId: row.pageId,

      clientHeight,
      //path: 'thirdEditOnlinePage',
    },
    {
      fullscreen: true,
      pathName: '/thirdParty/thirdEditOnlinePage',
    },
  )
    .then(() => {
      pageListWidget.refreshTable();
    })
    .catch(e => {
      console.warn(e);
      pageListWidget.refreshTable();
    });
};
const onDeleteOnlinePage = (row: ANY_OBJECT) => {
  ElMessageBox.confirm(`是否删除页面【${row.pageName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(res => {
      let params = {
        pageId: row.pageId,
      };

      return OnlinePageController.delete(params);
    })
    .then(res => {
      ElMessage.success('删除成功！');
      pageListWidget.refreshTable();
    })
    .catch(e => {
      console.warn(e);
    });
};
onMounted(() => {
  formInit();
});
</script>

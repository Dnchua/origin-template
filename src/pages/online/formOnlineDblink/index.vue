<template>
  <AdvanceQuery
    class="form-online-dblink advance-box"
    :height="mainContextHeight"
    :treePanel="dblinkGroupConfig"
    :tablePanel="dblinkConfig"
    @refreshTable="onRefresDblink"
    @addTableItem="onEditOnlineDblink(null)"
  >
    <template v-slot:table>
      <table-box
        class="page-table"
        :data="onlineDblinkWidget.dataList"
        :size="layoutStore.defaultFormItemSize"
        header-cell-class-name="table-header-gray"
        height="auto"
        :hasExtend="false"
        :seq-config="{
          startIndex: (onlineDblinkWidget.currentPage - 1) * onlineDblinkWidget.pageSize,
        }"
      >
        <vxe-column
          title="序号"
          type="seq"
          width="50px"
          :index="onlineDblinkWidget.getTableIndex"
        />
        <vxe-column title="链接名称" field="dblinkName" />
        <vxe-column title="链接类型" field="dblinkTypeDictMap.name" />
        <vxe-column title="操作" width="100px">
          <template v-slot="scope">
            <el-button
              link
              type="primary"
              :size="layoutStore.defaultFormItemSize"
              @click="onEditOnlineDblink(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              :size="layoutStore.defaultFormItemSize"
              @click="onDeleteDblink(scope.row)"
            >
              删除
            </el-button>
          </template>
        </vxe-column>
        <template v-slot:pagination>
          <el-row type="flex" justify="end" style="margin-top: 16px">
            <el-pagination
              :total="onlineDblinkWidget.totalCount"
              :current-page="onlineDblinkWidget.currentPage"
              :page-size="onlineDblinkWidget.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, prev, pager, next, sizes"
              @current-change="onlineDblinkWidget.onCurrentPageChange"
              @size-change="onlineDblinkWidget.onPageSizeChange"
            >
            </el-pagination>
          </el-row>
        </template>
      </table-box>
    </template>
  </AdvanceQuery>
</template>

<script lang="ts">
export default {
  name: 'formOnlineDblink',
};
</script>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus';
import AdvanceQuery from '@/components/AdvanceQuery/index.vue';
import { useCommon } from '@/common/hooks/useCommon';
import { DblinkType } from '@/common/staticDict/index';
import { TableOptions } from '@/common/types/pagination';
import { TableData } from '@/common/types/table';
import { ANY_OBJECT } from '@/types/generic';
import { OnlineDblinkController } from '@/api/online';
import { DBLink } from '@/types/online/dblink';
import { useThirdPartyAlive } from '@/components/thirdParty/hooks';
import { useLayoutStore } from '@/store';
import EditOnlineDblink from './EditOnlineDblink.vue';
const layoutStore = useLayoutStore();

useThirdPartyAlive();

const { mainContextHeight, useTable, Dialog } = useCommon();

const dblinkConfig = reactive({
  title: '数据库链接',
  supportAdd: true,
  addText: '新建链接',
});
let currentDblinkType = DblinkType.MYSQL;

const loadDblinkGroupData = () => {
  //return Promise.resolve(DblinkType.getList().filter(item => item.id !== DblinkType.CLICK_HOUSE));
  return Promise.resolve(
    DblinkType.getList().filter(item => {
      return item.id !== DblinkType.CLICK_HOUSE && item.id !== DblinkType.DORIS;
    }),
  );
};
const dblinkGroupConfig = reactive({
  title: '数据库链接类型',
  supportAdd: false,
  supportEdit: false,
  supportDelete: false,
  keyColumnName: 'id',
  nameColumnName: 'name',
  loadFunction: loadDblinkGroupData,
});
const loadDblinkData = (params: ANY_OBJECT): Promise<TableData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    params.onlineDblinkDtoFilter = {
      dblinkType: currentDblinkType,
    };
    OnlineDblinkController.list(params)
      .then(res => {
        resolve({
          dataList: res.data.dataList,
          totalCount: res.data.totalCount,
        });
      })
      .catch(e => {
        console.log(e);
        reject(e);
      });
  });
};
const loadDblinkDataVerify = () => {
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadDblinkData,
  verifyTableParameter: loadDblinkDataVerify,
  paged: true,
};
const onlineDblinkWidget = reactive(useTable(tableOptions));

const refresDblink = (reload = false) => {
  if (reload) {
    onlineDblinkWidget.refreshTable(true, 1);
  } else {
    onlineDblinkWidget.refreshTable();
  }
};
// 新建数据库链接与编辑
const onEditOnlineDblink = (row: DBLink | null) => {
  Dialog.show(
    '编辑数据库链接',
    EditOnlineDblink,
    {
      area: ['100vw', '100vh'],
      skin: 'fullscreen-dialog',
    },
    {
      dblink: row,
      path: 'thirdEditOnlineDblink',
    },
    {
      fullscreen: true,
      pathName: '/thirdParty/thirdEditOnlineDblink',
    },
  )
    .then(() => {
      refresDblink(true);
    })
    .catch(e => {
      console.warn(e);
    });
};

const onDeleteDblink = (row: DBLink) => {
  //console.log(row);
  ElMessageBox.confirm(`是否删除数据链接【${row.dblinkName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      return OnlineDblinkController.delete({
        dblinkId: row.dblinkId,
      });
    })
    .then(() => {
      ElMessage.success('删除成功');
      refresDblink(true);
    })
    .catch(e => {
      console.warn(e);
    });
};
const onRefresDblink = (dblinkType: ANY_OBJECT) => {
  currentDblinkType = dblinkType.id;
  refresDblink(true);
};
</script>

<style scoped>
:deep(.page-table) {
  padding: 0 16px 16px !important;
}
</style>

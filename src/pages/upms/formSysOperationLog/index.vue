<template>
  <div style="position: relative">
    <el-form
      ref="form"
      :model="formSysOperationLog"
      label-width="80px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFormOperationType(true)" @reset="onReset">
        <el-form-item label="操作人员" prop="formFilter.operatorName">
          <el-input
            class="filter-item"
            v-model="formSysOperationLog.formFilter.operatorName"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="操作类型" prop="formFilter.operationType">
          <el-select
            class="filter-item"
            v-model="formSysOperationLog.formFilter.operationType"
            :clearable="true"
            placeholder=""
            filterable
            :loading="formSysOperationLog.operationType.impl.loading"
            @visible-change="formSysOperationLog.operationType.impl.onVisibleChange"
          >
            <el-option
              v-for="item in formSysOperationLog.operationType.impl.dropdownList"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作状态" prop="formFilter.success">
          <el-select
            class="filter-item"
            v-model="formSysOperationLog.formFilter.success"
            :clearable="true"
            filterable
            placeholder=""
          >
            <el-option :value="1" label="成功" />
            <el-option :value="0" label="失败" />
          </el-select>
        </el-form-item>
        <el-form-item label="Trace Id" prop="formFilter.traceId">
          <el-input
            class="filter-item"
            v-model="formSysOperationLog.formFilter.traceId"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="调用时长" prop="formFilter.elapse">
          <input-number-range
            class="filter-item"
            :size="layoutStore.defaultFormItemSize"
            v-model:value="formSysOperationLog.formFilter.elapse"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="操作日期" prop="formFilter.operationTime">
          <date-range
            class="filter-item"
            :size="layoutStore.defaultFormItemSize"
            :hideTypeOnlyOne="true"
            v-model:value="formSysOperationLog.formFilter.operationTime"
            :clearable="true"
            :allowTypes="['day']"
            align="left"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      ref="teacher"
      :data="formSysOperationLog.operationLog.impl.dataList"
      :size="layoutStore.defaultFormItemSize"
      :hasExtend="false"
      header-cell-class-name="table-header-gray"
      @sort-change="formSysOperationLog.operationLog.impl.onSortChange"
      @refresh="refreshFormOperationType(true)"
      :seq-config="{
        startIndex:
          (formSysOperationLog.operationLog.impl.currentPage - 1) *
          formSysOperationLog.operationLog.impl.pageSize,
      }"
    >
      <vxe-column
        title="序号"
        type="seq"
        width="55px"
        :index="formSysOperationLog.operationLog.impl.getTableIndex"
      />
      <vxe-column title="系统模块" field="serviceName" width="200px" />
      <vxe-column title="操作类型" field="operationType" width="150px">
        <template v-slot="scope">
          <span class="vxe-cell--label">{{
            SysOperationType.getValue(scope.row.operationType)
          }}</span>
        </template>
      </vxe-column>
      <vxe-column title="操作员" field="operatorName" width="150px" />
      <vxe-column title="调用地址" field="requestUrl" min-width="300px" />
      <vxe-column title="登录 IP" field="requestIp" width="150px" />
      <vxe-column title="调用时长" field="elapse" width="100px" />
      <vxe-column title="操作状态" field="success" width="100px">
        <template v-slot="scope">
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            v-if="scope.row.success != null"
            :type="scope.row.success ? 'success' : 'danger'"
          >
            {{ scope.row.success ? '成功' : '失败' }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="操作时间" field="operationTime" width="150px" />
      <vxe-column title="操作" fixed="right" width="150px">
        <template v-slot="scope">
          <el-button
            @click.stop="onFormViewSysOperationLogClick(scope.row)"
            type="primary"
            link
            :size="layoutStore.defaultFormItemSize"
          >
            详情
          </el-button>
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="formSysOperationLog.operationLog.impl.totalCount"
            :current-page="formSysOperationLog.operationLog.impl.currentPage"
            :page-size="formSysOperationLog.operationLog.impl.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="formSysOperationLog.operationLog.impl.onCurrentPageChange"
            @size-change="formSysOperationLog.operationLog.impl.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
  </div>
</template>

<script lang="ts">
export default {
  name: 'formSysOperationLog',
};
</script>

<script setup lang="ts">
import { useCommon } from '@/common/hooks/useCommon';
import { DropdownOptions, ListData } from '@/common/types/list';
import { SysOperationType } from '@/common/staticDict';
import { TableOptions } from '@/common/types/pagination';
import { TableData } from '@/common/types/table';
import { ANY_OBJECT } from '@/types/generic';
import { DictData } from '@/common/staticDict/types';
import { OperationLogController } from '@/api/system';
import InputNumberRange from '@/components/InputNumberRange/index.vue';
import DateRange from '@/components/DateRange/index.vue';
import { useLayoutStore } from '@/store';
import SysOperationLogDetail from './SysOperationLogDetail.vue';
const layoutStore = useLayoutStore();
const { useDropdown, useTable, Dialog } = useCommon();
const form = ref();

/**
 * 操作类型下拉数据获取函数
 */
const loadOperationTypeDropdownList = (): Promise<ListData<DictData>> => {
  return new Promise(resolve => {
    resolve({ dataList: SysOperationType.getList() });
  });
};

const dropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadOperationTypeDropdownList,
};

/**
 * 操作日志数据数据获取函数，返回Promise
 */
const loadOperationLogWidgetData = (params: ANY_OBJECT): Promise<TableData<ANY_OBJECT>> => {
  if (params == null) params = {};
  params = {
    ...params,
    sysOperationLogDtoFilter: {
      operatorName: formSysOperationLog.formFilterCopy.operatorName,
      operationType: formSysOperationLog.formFilterCopy.operationType,
      success: formSysOperationLog.formFilterCopy.success,
      traceId: formSysOperationLog.formFilterCopy.traceId,
      elapseMin: Array.isArray(formSysOperationLog.formFilterCopy.elapse)
        ? formSysOperationLog.formFilterCopy.elapse[0]
        : undefined,
      elapseMax: Array.isArray(formSysOperationLog.formFilterCopy.elapse)
        ? formSysOperationLog.formFilterCopy.elapse[1]
        : undefined,
      operationTimeStart: Array.isArray(formSysOperationLog.formFilterCopy.operationTime)
        ? formSysOperationLog.formFilterCopy.operationTime[0]
        : undefined,
      operationTimeEnd: Array.isArray(formSysOperationLog.formFilterCopy.operationTime)
        ? formSysOperationLog.formFilterCopy.operationTime[1]
        : undefined,
    },
  };
  return new Promise((resolve, reject) => {
    OperationLogController.listSysOperationLog(params)
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
/**
 * 操作日志数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadOperationLogVerify = () => {
  formSysOperationLog.formFilterCopy = {
    ...formSysOperationLog.formFilter,
  };
  return true;
};

const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadOperationLogWidgetData,
  verifyTableParameter: loadOperationLogVerify,
  paged: true,
  orderFieldName: 'logId',
};

const formSysOperationLog = reactive({
  formFilter: {
    operatorName: undefined,
    operationType: undefined,
    success: undefined,
    traceId: undefined,
    elapse: undefined,
    operationTime: undefined,
  },
  formFilterCopy: {
    operatorName: undefined,
    operationType: undefined,
    success: undefined,
    traceId: undefined,
    elapse: undefined,
    operationTime: undefined,
  },
  operationType: {
    impl: useDropdown(dropdownOptions),
  },
  operationLog: {
    impl: useTable(tableOptions),
  },
  isInit: false,
});

/**
 * 更新操作日志
 */
const refreshFormOperationType = (reloadData = false) => {
  if (reloadData) {
    formSysOperationLog.operationLog.impl.refreshTable(true, 1);
  } else {
    formSysOperationLog.operationLog.impl.refreshTable();
  }
  if (!formSysOperationLog.isInit) {
    // 初始化下拉数据
  }
  formSysOperationLog.isInit = true;
};

const onReset = () => {
  form.value.resetFields();
  refreshFormOperationType(true);
};

const formInit = () => {
  refreshFormOperationType();
};

/**
 * 操作日志详情
 */
const onFormViewSysOperationLogClick = (row: ANY_OBJECT) => {
  let params = {
    rowData: row,
  };

  Dialog.show(
    '操作日志详情',
    SysOperationLogDetail,
    {
      area: ['800px', '85vh'],
    },
    params,
  ).catch(e => {
    console.warn(e);
  });
};

onMounted(() => {
  formInit();
});
</script>

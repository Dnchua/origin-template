<template>
  <div style="position: relative">
    <el-form
      ref="form"
      :model="formFlowEntry"
      label-width="80px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFormFlowEntry(true)" @reset="onReset">
        <el-form-item label="流程分类" prop="formFilter.categoryId">
          <el-select
            class="filter-item"
            v-model="formFlowEntry.formFilter.categoryId"
            :clearable="true"
            filterable
            placeholder="流程分类"
            :loading="formFlowEntry.categoryIdWidget.loading"
            @visible-change="formFlowEntry.categoryIdWidget.onVisibleChange"
          >
            <el-option
              v-for="item in formFlowEntry.categoryIdWidget.dropdownList"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="流程名称" prop="formFilter.processDefinitionName">
          <el-input
            class="filter-item"
            v-model="formFlowEntry.formFilter.processDefinitionName"
            :clearable="true"
            placeholder="流程名称"
          />
        </el-form-item>
        <!-- <el-form-item label="流程标识" prop="formFilter.processDefinitionKey">
                <el-input class="filter-item" v-model="formFlowEntry.formFilter.processDefinitionKey"
                  :clearable="true" placeholder="流程标识" />
              </el-form-item> -->
        <el-form-item label="发布状态" prop="formFilter.status">
          <el-select
            class="filter-item"
            v-model="formFlowEntry.formFilter.status"
            :clearable="true"
            filterable
            placeholder="发布状态"
          >
            <el-option
              v-for="item in SysFlowEntryPublishedStatus.getList()"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </el-select>
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      ref="flowEntry"
      :data="formFlowEntry.flowEntryWidget.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="formFlowEntry.flowEntryWidget.onSortChange"
      @refresh="refreshFormFlowEntry(true)"
      :seq-config="{
        startIndex:
          (formFlowEntry.flowEntryWidget.currentPage - 1) * formFlowEntry.flowEntryWidget.pageSize,
      }"
    >
      <template v-slot:operator>
        <el-button
          type="primary"
          :icon="Plus"
          :size="layoutStore.defaultFormItemSize"
          @click="onAddFlowEntryClick()"
          >新建</el-button
        >
      </template>
      <vxe-column
        title="序号"
        type="seq"
        width="70px"
        :index="formFlowEntry.flowEntryWidget.getTableIndex"
      />
      <vxe-column title="流程名称" field="processDefinitionName"> </vxe-column>
      <vxe-column title="流程标识" field="processDefinitionKey"> </vxe-column>
      <vxe-column title="流程分类" field="flowCategory.name"> </vxe-column>
      <vxe-column title="流程图类型">
        <template v-slot="scope">
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            :type="scope.row.diagramType === DiagramType.ORDINARY ? 'success' : 'primary'"
          >
            {{ DiagramType.getValue(scope.row.diagramType) }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="发布状态" field="status">
        <template v-slot="scope">
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            :type="
              scope.row.status === SysFlowEntryPublishedStatus.PUBLISHED ? 'success' : 'warning'
            "
          >
            {{ SysFlowEntryPublishedStatus.getValue(scope.row.status) }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="流程主版本" field="mainFlowEntryPublish">
        <template v-slot="scope">
          <el-tag
            v-if="scope.row.mainFlowEntryPublish"
            :size="layoutStore.defaultFormItemSize"
            type="primary"
            effect="dark"
            style="min-width: 60px"
          >
            {{ 'V:' + scope.row.mainFlowEntryPublish.publishVersion }}
          </el-tag>
          <el-tag
            v-if="scope.row.mainFlowEntryPublish"
            :size="layoutStore.defaultFormItemSize"
            effect="dark"
            style="margin-left: 10px"
            :type="scope.row.mainFlowEntryPublish.activeStatus ? 'success' : 'danger'"
          >
            {{ scope.row.mainFlowEntryPublish.activeStatus ? '激活' : '挂起' }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="最近发布时间" field="latestPublishTime" sortable />
      <vxe-column title="操作" fixed="right" width="280px">
        <template v-slot="scope">
          <el-button
            @click.stop="onStartFlowEntryClick(scope.row)"
            type="primary"
            link
            :size="layoutStore.defaultFormItemSize"
            :disabled="
              !(scope.row.mainFlowEntryPublish && scope.row.mainFlowEntryPublish.activeStatus)
            "
          >
            启动
          </el-button>
          <el-button
            @click.stop="onEditFlowEntryClick(scope.row)"
            type="primary"
            link
            :size="layoutStore.defaultFormItemSize"
          >
            编辑
          </el-button>
          <el-button
            @click.stop="onPublishedClick(scope.row)"
            type="primary"
            link
            :size="layoutStore.defaultFormItemSize"
          >
            发布
          </el-button>
          <el-button
            @click.stop="onPublishedEntryListClick(scope.row)"
            type="primary"
            link
            :size="layoutStore.defaultFormItemSize"
          >
            版本管理
          </el-button>
          <el-button
            @click.stop="onDeleteFlowEntryClick(scope.row)"
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
            :total="formFlowEntry.flowEntryWidget.totalCount"
            :current-page="formFlowEntry.flowEntryWidget.currentPage"
            :page-size="formFlowEntry.flowEntryWidget.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="formFlowEntry.flowEntryWidget.onCurrentPageChange"
            @size-change="formFlowEntry.flowEntryWidget.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { useCommon } from '@/common/hooks/useCommon';
import { FlowEntryController, FlowDictionaryController, FlowOperationController } from '@/api/flow';
import { DropdownOptions, ListData } from '@/common/types/list';
import { TableOptions } from '@/common/types/pagination';
import { ANY_OBJECT } from '@/types/generic';
import { DictData } from '@/common/staticDict/types';
import {
  //SysFlowTaskOperationType,
  SysFlowTaskType,
  DiagramType,
  SysFlowEntryPublishedStatus,
  SysFlowTaskOperationType,
} from '@/common/staticDict/flow';
import { useLayoutStore } from '@/store';
import FormPublishedFlowEntry from './formPublishedFlowEntry.vue';
import FormEditFlowEntry from './formEditFlowEntry.vue';

const layoutStore = useLayoutStore();
const form = ref();
const { Plus, useDropdown, useTable, Dialog } = useCommon();

/**
 * 流程分类下拉数据获取函数
 */
const loadCategoryIdDropdownList = (): Promise<ListData<DictData>> => {
  return new Promise((resolve, reject) => {
    let params = {};
    FlowDictionaryController.dictFlowCategory(params)
      .then(res => {
        resolve({ dataList: res.getList() });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const dropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadCategoryIdDropdownList,
};

/**
 * FlowEntry数据获取函数，返回Promise
 */
const loadFlowEntryWidgetData = (params: ANY_OBJECT) => {
  if (params == null) params = {};
  params = {
    ...params,
    flowEntryDtoFilter: {
      categoryId: formFlowEntry.formFilterCopy.categoryId,
      processDefinitionName: formFlowEntry.formFilterCopy.processDefinitionName,
      processDefinitionKey: formFlowEntry.formFilterCopy.processDefinitionKey,
      status: formFlowEntry.formFilterCopy.status,
    },
  };
  return new Promise((resolve, reject) => {
    FlowEntryController.list(params)
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
/**
 * FlowEntry数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadFlowEntryVerify = () => {
  formFlowEntry.formFilterCopy.categoryId = formFlowEntry.formFilter.categoryId;
  formFlowEntry.formFilterCopy.processDefinitionName =
    formFlowEntry.formFilter.processDefinitionName;
  formFlowEntry.formFilterCopy.processDefinitionKey = formFlowEntry.formFilter.processDefinitionKey;
  formFlowEntry.formFilterCopy.status = formFlowEntry.formFilter.status;
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadFlowEntryWidgetData,
  verifyTableParameter: loadFlowEntryVerify,
  paged: true,
  orderFieldName: 'entryId',
  ascending: true,
};
const formFlowEntry = reactive({
  formFilter: {
    status: undefined,
    categoryId: undefined,
    processDefinitionName: undefined,
    processDefinitionKey: undefined,
  },
  formFilterCopy: {
    status: undefined,
    categoryId: undefined,
    processDefinitionName: undefined,
    processDefinitionKey: undefined,
  },
  categoryIdWidget: reactive(useDropdown(dropdownOptions)),
  flowEntryWidget: reactive(useTable(tableOptions)),
  isInit: false,
});

const router = useRouter();
/**
 * 更新流程设计
 */
const refreshFormFlowEntry = (reloadData = false) => {
  if (reloadData) {
    formFlowEntry.flowEntryWidget.refreshTable(true, 1);
  } else {
    formFlowEntry.flowEntryWidget.refreshTable();
  }
  if (!formFlowEntry.isInit) {
    // 初始化下拉数据
    console.log('');
  }
  formFlowEntry.isInit = true;
};

const onReset = () => {
  form.value.resetFields();
  refreshFormFlowEntry(true);
};
/**
 * 启动
 */
const onStartFlowEntryClick = (row: ANY_OBJECT) => {
  let params = {
    processDefinitionKey: row.processDefinitionKey,
  };
  FlowOperationController.viewInitialTaskInfo(params)
    .then(res => {
      if (res.data && res.data.taskType === SysFlowTaskType.USER_TASK && res.data.assignedMe) {
        let params = {
          processDefinitionKey: row.processDefinitionKey || '',
          formId: res.data.formId || '',
          routerName: res.data.routerName,
          readOnly: res.data.readOnly,
          taskName: '启动流程',
          flowEntryName: row.processDefinitionName || '',
          // 这个会报异常 TypeError: Cannot convert object to primitive value
          operationList: JSON.stringify(
            (res.data.operationList || []).filter((item: ANY_OBJECT) => {
              return (
                item.type !== SysFlowTaskOperationType.CO_SIGN &&
                item.type !== SysFlowTaskOperationType.REVOKE &&
                item.type !== SysFlowTaskOperationType.SIGN_REDUCTION
              );
            }),
          ),
          isDraft: 'true',
          isPreview: 'true',
          // TypeError: can't convert text to primitive type
          variableList: JSON.stringify(res.data.variableList),
        };
        console.log('viewInitialTaskInfo', res.data);
        console.log('params', params);
        router.push({
          name: res.data.routerName || 'handlerFlowTask',
          query: params,
        });
      } else {
        FlowOperationController.startOnly({
          processDefinitionKey: row.processDefinitionKey,
        })
          .then(() => {
            ElMessage.success('启动成功！');
          })
          .catch(e => {
            console.warn(e);
          });
      }
    })
    .catch(e => {
      console.warn(e);
    });
};

/**
 * 新建
 */
const onAddFlowEntryClick = () => {
  Dialog.show(
    '新建页面',
    FormEditFlowEntry,
    {
      area: ['100vw', '100vh'],
      skin: 'fullscreen-dialog',
    },
    {
      //path: 'thirdFormEditFlowEntry',
    },
    {
      fullscreen: true,
      pathName: '/thirdParty/thirdFormEditFlowEntry',
    },
  )
    .then(() => {
      refreshFormFlowEntry();
    })
    .catch(e => {
      console.log(e);
    });
};
/**
 * 编辑
 */
const onEditFlowEntryClick = (row: ANY_OBJECT) => {
  Dialog.show(
    '编辑页面',
    FormEditFlowEntry,
    {
      area: ['100vw', '100vh'],
      skin: 'fullscreen-dialog',
    },
    {
      //path: 'thirdFormEditFlowEntry',
      flowEntry: row,
    },
    {
      fullscreen: true,
      pathName: '/thirdParty/thirdFormEditFlowEntry',
    },
  )
    .then(() => {
      refreshFormFlowEntry();
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 发布
 */
const onPublishedClick = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否发布当前工作流设计？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      if (row.entryId == null) {
        ElMessage.error('请求失败，发现必填参数为空！');
        return;
      }
      let params = {
        entryId: row.entryId,
      };

      FlowEntryController.publish(params)
        .then(() => {
          ElMessage.success('发布成功');
          refreshFormFlowEntry();
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
 * 版本管理
 */
const onPublishedEntryListClick = (row: ANY_OBJECT) => {
  Dialog.show(
    '版本管理',
    FormPublishedFlowEntry,
    {
      area: ['1200px', '750px'],
    },
    {
      flowEntry: row,
    },
    {
      width: '1200px',
      height: '780px',
      pathName: '/thirdParty/thirdFormPublishedFlowEntry',
    },
  )
    .then(() => {
      refreshFormFlowEntry();
    })
    .catch(() => {
      refreshFormFlowEntry();
    });
};
/**
 * 删除
 */
const onDeleteFlowEntryClick = (row: ANY_OBJECT) => {
  if (row.entryId == null) {
    ElMessage.error('请求失败，发现必填参数为空！');
    return;
  }
  let params = {
    entryId: row.entryId,
  };

  ElMessageBox.confirm('是否删除此流程？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      FlowEntryController.delete(params)
        .then(() => {
          ElMessage.success('删除成功');
          formFlowEntry.flowEntryWidget.refreshTable();
        })
        .catch(e => {
          console.warn(e);
        });
    })
    .catch(e => {
      console.warn(e);
    });
};

const refreshData = () => {
  refreshFormFlowEntry(true);
};
const onResume = () => {
  refreshFormFlowEntry();
};
const formInit = () => {
  refreshFormFlowEntry();
};
onMounted(() => {
  // 初始化页面数据
  formInit();
});
defineExpose({
  refreshData,
  onResume,
});
</script>

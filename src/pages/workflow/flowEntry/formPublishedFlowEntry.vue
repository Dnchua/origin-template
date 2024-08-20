<template>
  <!-- 流程版本管理 -->
  <div class="form-single-fragment" style="position: relative">
    <el-row>
      <el-col :span="24" v-if="entryXml == null">
        <vxe-table
          ref="flowEntry"
          :data="publishedFlowEntryWidget.dataList"
          :size="formItemSize"
          height="655px"
          :row-config="{ isHover: true }"
          @sort-change="publishedFlowEntryWidget.onSortChange"
          header-cell-class-name="table-header-gray"
        >
          <vxe-column
            title="序号"
            type="seq"
            width="70px"
            :index="publishedFlowEntryWidget.getTableIndex"
          />
          <vxe-column title="流程名称">
            <template v-slot>
              <span>{{ dialogParams.flowEntry.processDefinitionName }}</span>
            </template>
          </vxe-column>
          <vxe-column title="流程分类">
            <template v-slot>
              <span>{{ dialogParams.flowEntry.flowCategory.name }}</span>
            </template>
          </vxe-column>
          <vxe-column title="流程版本" field="publishVersion">
            <template v-slot="scope">
              <el-tag :size="formItemSize" type="primary" effect="dark">{{
                'V:' + scope.row.publishVersion
              }}</el-tag>
            </template>
          </vxe-column>
          <vxe-column title="激活状态" field="activeStatus">
            <template v-slot="scope">
              <el-tag
                :size="formItemSize"
                effect="dark"
                :type="scope.row.activeStatus ? 'success' : 'danger'"
              >
                {{ scope.row.activeStatus ? '激活' : '挂起' }}
              </el-tag>
            </template>
          </vxe-column>
          <vxe-column title="主版本" field="mainVersion">
            <template v-slot="scope">
              <el-tag
                :size="formItemSize"
                effect="dark"
                :type="scope.row.mainVersion ? 'success' : 'danger'"
              >
                {{ scope.row.mainVersion ? '是' : '否' }}
              </el-tag>
            </template>
          </vxe-column>
          <vxe-column title="发布时间" field="publishTime" min-width="150px" />
          <vxe-column title="操作" fixed="right" width="200px">
            <template v-slot="scope">
              <el-button
                @click.stop="onSetActiveStatus(scope.row)"
                link
                type="danger"
                :size="formItemSize"
              >
                {{ scope.row.activeStatus ? '挂起' : '激活' }}
              </el-button>
              <el-button
                type="primary"
                link
                :size="formItemSize"
                @click="getTaskProcessXml(scope.row)"
              >
                流程图
              </el-button>
              <el-button
                type="primary"
                :disabled="scope.row.mainVersion"
                @click.stop="onSetMainVersion(scope.row)"
                link
                :size="formItemSize"
              >
                设置为主版本
              </el-button>
            </template>
          </vxe-column>
          <template v-slot:empty>
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png" />
              <span>暂无数据</span>
            </div>
          </template>
        </vxe-table>
      </el-col>
      <el-col :span="24" v-show="entryXml != null">
        <ProcessViewer :xml="entryXml" style="height: 653px">
          <el-button
            type="default"
            size="default"
            :icon="CircleClose"
            @click.stop="entryXml = undefined"
          />
        </ProcessViewer>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { VxeTable, VxeColumn } from 'vxe-table';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CircleClose as CircleClose } from '@element-plus/icons-vue';
import { FlowEntryController, FlowOperationController } from '@/api/flow';
import ProcessViewer from '@/pages/workflow/components/ProcessViewer.vue';
import { DialogProp } from '@/components/Dialog/types';
import { ANY_OBJECT } from '@/types/generic';
import { useTable } from '@/common/hooks/useTable';
import { TableOptions } from '@/common/types/pagination';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  flowEntry: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = withDefaults(defineProps<IProps>(), {
  flowEntry: undefined,
});
const { thirdParams } = useThirdParty(props);
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});
const entryXml = ref<string>();
const dialogParams = computed(() => {
  return {
    flowEntry: props.flowEntry || thirdParams.value.flowEntry || {},
  };
});
/**
 * 工作流发布版本数据获取函数，返回Promise
 */
const loadFlowEntryWidgetData = (params: ANY_OBJECT) => {
  if (params == null) params = {};
  params = {
    ...params,
    entryId: dialogParams.value.flowEntry.entryId,
  };
  return new Promise((resolve, reject) => {
    FlowEntryController.listFlowEntryPublish(params)
      .then(res => {
        resolve({
          dataList: res.data,
          totalCount: Array.isArray(res.data) ? res.data.length : 0,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 工作流发布版本数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadFlowEntryVerify = () => {
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadFlowEntryWidgetData,
  verifyTableParameter: loadFlowEntryVerify,
};
const publishedFlowEntryWidget = reactive(useTable(tableOptions));

const refreshFormFlowEntry = (reloadData = false) => {
  if (reloadData) {
    publishedFlowEntryWidget.refreshTable(true, 1);
  } else {
    publishedFlowEntryWidget.refreshTable();
  }
};
/**
 * 激活 / 挂起
 */
const onSetActiveStatus = (row: ANY_OBJECT) => {
  let params = {
    entryPublishId: row.entryPublishId,
  };

  let httpCall = row.activeStatus
    ? FlowEntryController.suspendFlowEntryPublish(params)
    : FlowEntryController.activateFlowEntryPublish(params);
  httpCall
    .then(() => {
      ElMessage.success(`${row.activeStatus ? '挂起成功！' : '激活成功！'}`);
      refreshFormFlowEntry();
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 获取流程图xml
 */
const getTaskProcessXml = (row: ANY_OBJECT) => {
  if (row.processDefinitionId == null || row.processDefinitionId === '') {
    entryXml.value = undefined;
    return;
  }
  let params = {
    processDefinitionId: row.processDefinitionId,
  };
  FlowOperationController.viewProcessBpmn(params)
    .then(res => {
      // 当前流程实例xml
      entryXml.value = res.data;
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 设置主版本
 */
const onSetMainVersion = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否将当前版本设置为主版本？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {
        entryId: dialogParams.value.flowEntry.entryId,
        newEntryPublishId: row.entryPublishId,
      };
      return FlowEntryController.updateMainVersion(params);
    })
    .then(() => {
      ElMessage.success('设置成功！');
      refreshFormFlowEntry();
    })
    .catch(e => {
      console.warn(e);
    });
};

onMounted(() => {
  // 初始化页面数据
  refreshFormFlowEntry();
});
</script>

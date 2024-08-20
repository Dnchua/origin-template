<template>
  <el-col :span="24" v-if="!currentRow" class="main-box" style="min-width: 1100px">
    <vxe-table
      :data="data"
      :row-config="{ isHover: true }"
      :size="formItemSize as SizeType"
      header-cell-class-name="table-header-gray"
    >
      <vxe-column title="序号" type="seq" width="55px" />
      <vxe-column title="数据表名" field="tableName" />
      <vxe-column title="关联类型" field="relationType">
        <template v-slot="scope">
          <el-tag
            :size="formItemSize"
            :type="getDatasourceTableTagType(scope.row.relationType)"
            effect="dark"
          >
            {{ getDatasourceTableTagName(scope.row.relationType) }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="主表关联字段" field="masterColumnName" />
      <vxe-column title="从表关联字段" field="slaveColumnName" />
      <vxe-column title="级联删除" field="cascadeDelete">
        <template v-slot="scope">
          <el-tag
            v-if="scope.row.relationType != null"
            :size="formItemSize"
            :type="scope.row.cascadeDelete ? 'success' : 'danger'"
            effect="dark"
          >
            {{ scope.row.cascadeDelete ? '是' : '否' }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="是否左连接" field="leftJoin">
        <template v-slot="scope">
          <el-tag
            v-if="scope.row.relationType != null"
            :size="formItemSize"
            :type="scope.row.leftJoin ? 'success' : 'danger'"
            effect="dark"
          >
            {{ scope.row.leftJoin ? '是' : '否' }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="操作" width="250px" fixed="right">
        <template v-slot="scope">
          <!-- 数据源主表只有当没有任何关联的时候才可以编辑 -->
          <el-button
            :size="formItemSize"
            type="primary"
            link
            @click="onEditDatasourceTable(scope.row)"
            :disabled="
              scope.row.relationType == null &&
              Array.isArray(scope.row.relationList) &&
              scope.row.relationList.length > 0
            "
          >
            编辑
          </el-button>
          <el-button :size="formItemSize" type="primary" link @click="onEditTableColumn(scope.row)">
            字段管理
          </el-button>
          <el-button
            :size="formItemSize"
            type="primary"
            link
            :disabled="scope.row.relationType != null"
            @click="onEditVirtualColumn(scope.row)"
          >
            聚合计算
          </el-button>
          <el-button
            :size="formItemSize"
            type="danger"
            link
            :disabled="
              scope.row.relationType == null &&
              (!Array.isArray(scope.row.relationList) || scope.row.relationList.length <= 0)
            "
            @click="onDeleteDatasourceTable(scope.row)"
          >
            删除
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
    <el-button
      style="width: 100%; margin-top: 10px; border: 1px dashed #ebeef5"
      :icon="Plus"
      @click="onAddDatasourceClick"
      >新增数据表</el-button
    >
  </el-col>
  <el-col :span="24" v-else-if="currentRow && editTableColumn">
    <OnlinePageTableColumnRule
      ref="tableColumnRuleForm"
      :isMasterTable="!currentRow.relationType"
      :tableId="currentRow.tableId"
      :dblinkId="dataSource?.dblinkId"
      :tableName="currentRow.tableName"
      :dictList="dictList"
      :defaultFormItemSize="layoutStore.defaultFormItemSize"
      :height="layoutStore.documentClientHeight - 80"
    />
  </el-col>
  <el-col :span="24" v-else-if="currentRow && editVirtualColumn">
    <OnlinePageVirtualColumn
      ref="virtualColumnForm"
      :datasource="currentRow.tag"
      :relationList="currentRow.tag.relationList"
      :defaultFormItemSize="layoutStore.defaultFormItemSize"
      :height="layoutStore.documentClientHeight - 80"
    />
  </el-col>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { VxeTable, VxeColumn, SizeType } from 'vxe-table';
import { ElMessageBox } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import {
  SysOnlinePageDatasourceFieldStatus,
  SysOnlineRelationType,
} from '@/common/staticDict/online';
import {
  OnlineDatasourceController,
  OnlineDatasourceRelationController,
  OnlineDblinkController,
} from '@/api/online';
import { Dialog } from '@/components/Dialog';
import { TableInfo } from '@/types/online/table';
import { findItemFromList } from '@/common/utils';
import { Dict } from '@/types/online/dict';
import { useLayoutStore } from '@/store';
import EditOnlinePageDatasource from './editOnlinePageDatasource.vue';
import EditOnlinePageDatasourceRelation from './editOnlinePageDatasourceRelation.vue';
import OnlinePageTableColumnRule from './onlinePageTableColumnRule.vue';
import OnlinePageVirtualColumn from './onlinePageVirtualColumn.vue';
const layoutStore = useLayoutStore();

const emit = defineEmits<{ change: [string]; 'un-saved': [boolean] }>();

const props = defineProps<{
  pageId: string;
  dblinkInfo: ANY_OBJECT;
  data: Array<ANY_OBJECT>;
  dataSource?: ANY_OBJECT;
  dictList: Dict[];
  clientHeight: ANY_OBJECT;
}>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const getClientHeight = computed(() => {
  return props.clientHeight.value;
});

const tableColumnRuleForm = ref();
const virtualColumnForm = ref();
const currentRow = ref<TableInfo>();
const editTableColumn = ref(false);
const editVirtualColumn = ref(false);

/**
 * 获取本数据源下所有导入的表
 */
const loadDatasourceTableList = (datasourceId: string) => {
  return new Promise((resolve, reject) => {
    let params = {
      datasourceId: datasourceId,
    };
    OnlineDatasourceController.view(params)
      .then(res => {
        resolve(res.data.tableList || []);
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 获取数据库下数据表列表
 */
const loadDblinkTableList = (dblinkId: string) => {
  return new Promise((resolve, reject) => {
    // 如果此数据库下数据表已经获取过，直接返回数据表列表
    if (
      Array.isArray(props.dblinkInfo[dblinkId].tableList) &&
      props.dblinkInfo[dblinkId].tableList.length > 0
    ) {
      resolve(props.dblinkInfo[dblinkId].tableList);
      return;
    }
    // 获取数据库下数据表列表
    OnlineDblinkController.listDblinkTables({
      dblinkId: dblinkId,
    })
      .then(res => {
        //props.dblinkInfo[dblinkId].tableList = res.data.dataList;
        resolve(res.data);
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 获得数据源所有可用的数据表列表，包含已经导入的数据表和未导入的数据表
 */
const loadDatasourceValidTableList = (datasource: ANY_OBJECT | null | undefined) => {
  if (!datasource) return Promise.reject();
  if (Array.isArray(datasource.validTableList) && datasource.validTableList.length > 0) {
    return Promise.resolve();
  }
  let httpCalls = [
    loadDatasourceTableList(datasource.datasourceId),
    loadDblinkTableList(datasource.dblinkId),
  ];

  return new Promise((resolve, reject) => {
    Promise.all(httpCalls)
      .then(res => {
        console.log('loadDatasourceValidTableList >>>', res);
        let datasourceTableList = res[0] as Array<TableInfo>;
        let dblinkTableList = res[1] as Array<TableInfo>;
        // 合并两个数据表
        let tableNameSet: Set<string> | null = new Set();
        datasource.validTableList = dblinkTableList.map((table: TableInfo) => {
          tableNameSet?.add(table.tableName);
          let temp = findItemFromList(datasourceTableList, table.tableName, 'tableName');
          return {
            id: temp ? temp.tableId : table.tableName,
            name: table.tableName,
            desc: temp ? temp.tableComment : table.tableComment,
            status: temp
              ? SysOnlinePageDatasourceFieldStatus.USED
              : SysOnlinePageDatasourceFieldStatus.UNUSED,
            dblinkTable: temp == null,
            tag: temp || table,
          };
        });
        // 添加被使用但是已经从数据库中删除的数据表
        datasourceTableList.forEach((table: TableInfo) => {
          if (!tableNameSet?.has(table.tableName)) {
            datasource.validTableList.push({
              id: table.tableId,
              name: table.tableName,
              desc: table.tableComment,
              status: SysOnlinePageDatasourceFieldStatus.DELETED,
              dblinkTable: false,
              tag: table,
            });
          }
        });
        tableNameSet = null;
        resolve(true);
      })
      .catch(e => {
        reject(e);
      });
  });
};
const onAddDatasourceClick = () => {
  if (!props.dataSource) {
    // 新增数据模型
    Dialog.show(
      '新建数据源',
      EditOnlinePageDatasource,
      {
        area: '500px',
      },
      {
        pageId: props.pageId,
        dblinkInfo: props.dblinkInfo,
        //path: 'thirdEditPageDatasource',
      },
      {
        width: '500px',
        height: '500px',
        pathName: '/thirdParty/thirdEditPageDatasource',
      },
    )
      .then(() => {
        emit('change', props.pageId);
      })
      .catch(e => {
        console.warn(e);
      });
  } else {
    // 新增数据模型关联
    loadDatasourceValidTableList(props.dataSource)
      .then(() => {
        Dialog.show(
          '添加关联',
          EditOnlinePageDatasourceRelation,
          {
            area: '600px',
          },
          {
            datasource: props.dataSource,
            dblinkInfo: props.dataSource ? props.dblinkInfo[props.dataSource.dblinkId] : null,
            usedTableNameList: props.data.map(item => item.tableName),
            //path: 'thirdEditPageRelation',
          },
          {
            width: '600px',
            pathName: '/thirdParty/thirdEditPageRelation',
          },
        )
          .then(() => {
            emit('change', props.pageId);
          })
          .catch(e => {
            console.log(e);
          });
      })
      .catch(e => {
        console.log(e);
      });
  }
};

const getDatasourceTableTagType = (relationType: number) => {
  if (relationType == null) return 'success';
  switch (relationType) {
    case SysOnlineRelationType.ONE_TO_ONE:
      return 'primary';
    case SysOnlineRelationType.ONE_TO_MANY:
      return 'warning';
    default:
      return 'info';
  }
};
const getDatasourceTableTagName = (relationType: number) => {
  if (relationType == null) return '数据主表';
  return SysOnlineRelationType.getValue(relationType) || '未知类型';
};

/**
 * 编辑数据模型表
 */
const onEditDatasourceTable = (row: ANY_OBJECT) => {
  loadDatasourceValidTableList(props.dataSource)
    .then(() => {
      if (row.relationType == null) {
        // 编辑数据模型
        Dialog.show(
          '编辑数据源',
          EditOnlinePageDatasource,
          {
            area: '500px',
          },
          {
            pageId: props.pageId,
            dblinkInfo: props.dblinkInfo,
            datasourceId: row.tag.datasourceId,
            //path: 'thirdEditPageDatasource',
          },
          {
            width: '500px',
            height: '500px',
            pathName: '/thirdParty/thirdEditPageDatasource',
          },
        )
          .then(() => {
            emit('change', props.pageId);
          })
          .catch(e => {
            console.warn(e);
          });
      } else {
        // 编辑关联
        Dialog.show(
          '编辑关联',
          EditOnlinePageDatasourceRelation,
          {
            area: '600px',
          },
          {
            relationId: row.id,
            datasource: props.dataSource,
            dblinkInfo: props.dataSource ? props.dblinkInfo[props.dataSource.dblinkId] : null,
            usedTableNameList: props.data.map(item => item.tableName),
            //path: 'thirdEditPageRelation',
          },
          {
            width: '600px',
            pathName: '/thirdParty/thirdEditPageRelation',
          },
        )
          .then(() => {
            emit('change', props.pageId);
          })
          .catch(e => {
            console.log(e);
          });
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
const onEditTableColumn = (row: TableInfo) => {
  currentRow.value = row;
  editTableColumn.value = true;
  emit('un-saved', true);
};
const onEditVirtualColumn = (row: TableInfo) => {
  currentRow.value = row;
  editVirtualColumn.value = true;
  emit('un-saved', true);
};
/**
 * 取消变化
 * @return 可取消返回true,不可取消返回false
 */
const cancel = (): boolean => {
  emit('un-saved', false);
  currentRow.value = undefined;
  editTableColumn.value = false;
  editVirtualColumn.value = false;
  return true;
};
/**
 * 删除数据模型表
 */
const onDeleteDatasourceTable = (row: ANY_OBJECT) => {
  if (row.relationType == null) {
    // 删除数据模型
    let warningMsg = '是否删除此数据模型？';
    if (Array.isArray(row.relationList) && row.relationList.length > 0) {
      warningMsg = '此数据模型下还存在关联，如果删除关联数据也将同时删除，是否继续？';
    }
    ElMessageBox.confirm(warningMsg, '', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        let params = {
          datasourceId: row.id,
        };
        return OnlineDatasourceController.delete(params);
      })
      .then(() => {
        emit('change', props.pageId);
      })
      .catch(e => {
        console.warn(e);
      });
  } else {
    // 删除关联数据
    ElMessageBox.confirm('是否删除此关联数据？', '', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        let params = {
          relationId: row.id,
        };
        return OnlineDatasourceRelationController.delete(params);
      })
      .then(() => {
        emit('change', props.pageId);
      })
      .catch(e => {
        console.warn(e);
      });
  }
};

const save = () => {
  if (currentRow.value) {
    if (editTableColumn.value) {
      tableColumnRuleForm.value.saveColumn();
    }
    if (editVirtualColumn.value) {
      virtualColumnForm.value.saveColumn();
    }
  }
};

defineExpose({
  save,
  cancel,
});
</script>

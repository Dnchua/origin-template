<template>
  <el-row style="flex-wrap: nowrap; width: 100%" :style="{ height: height + 'px' }">
    <!-- 虚拟字段列表 -->
    <div class="table-column-list">
      <div class="title">
        <span class="unified-font" style="font-weight: bold">虚拟字段列表</span>
        <el-button
          :size="formItemSize"
          type="primary"
          link
          :icon="CirclePlus"
          @click.stop="onAddNewVirtualColumn"
          >新增</el-button
        >
      </div>
      <el-scrollbar :style="{ height: height - 51 + 'px' }">
        <div
          v-for="column in allVirtualColumnList"
          :key="column.columnId"
          class="table-column-item"
          :class="{
            'active-column': currentColumn?.virtualColumnId === column.virtualColumnId,
          }"
          :title="column.columnComment"
          @click.stop="onActiveColumnClick(column)"
        >
          <span style="margin-right: 10px">{{ column.columnPrompt }}</span>
          <el-button
            :size="formItemSize"
            link
            style="margin-left: 10px"
            @click.stop="onDeleteColumn(column)"
          >
            删除
          </el-button>
        </div>
      </el-scrollbar>
    </div>
    <!-- 虚拟字段属性 -->
    <div class="column-attributes">
      <el-row
        type="flex"
        justify="end"
        align="middle"
        style="height: 40px; padding-right: 10px; border-bottom: 1px dashed #dcdfe6"
      >
        <div class="attribute-title" style="margin-left: 0">
          <span>字段属性</span>
        </div>
      </el-row>
      <el-form
        class="full-width-input"
        ref="form"
        :model="currentColumn"
        style="width: 100%"
        label-width="120px"
        label-position="right"
        @submit.prevent
        size="default"
        :rules="rules"
      >
        <div v-if="currentColumn" style="padding: 20px" class="attibute-box">
          <el-col class="attribute-item">
            <el-form-item label="结果字段列名" prop="objectFieldName">
              <el-input v-model="currentColumn.objectFieldName" placeholder="结果字段列名" />
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="结果字段显示名" prop="columnPrompt">
              <el-input v-model="currentColumn.columnPrompt" placeholder="结果字段显示名" />
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="聚合关联" prop="relationId">
              <el-select
                v-model="currentColumn.relationId"
                placeholder="聚合关联选择"
                @change="onRelationChange"
              >
                <el-option
                  v-for="item in relationList"
                  :key="item.relationId"
                  :value="item.relationId"
                  :label="item.relationName"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center">
                    <span>{{ item.relationName }}</span>
                    <el-tag
                      style="margin-left: 30px"
                      :size="formItemSize"
                      :type="getDatasourceTableTagType(item.relationType)"
                    >
                      {{ SysOnlineRelationType.getValue(item.relationType) }}
                    </el-tag>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="聚合计算表" prop="aggregationTableId">
              <el-select
                v-model="currentColumn.aggregationTableId"
                placeholder="聚合计算表"
                @change="onAggregationTableIdChange"
              >
                <el-option
                  v-for="item in aggregationTableList"
                  :key="item.relationId"
                  :value="item.tableId"
                  :label="item.tableName"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="聚合计算字段" prop="aggregationColumnId">
              <el-select
                v-model="currentColumn.aggregationColumnId"
                placeholder="聚合计算表"
                @change="onAggregationColumnIdChange"
              >
                <el-option
                  v-for="item in aggregationColumnList"
                  :key="item.relationId"
                  :value="item.columnId"
                  :label="item.columnName"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="结果字段类型" prop="objectFieldType">
              <el-select
                v-model="currentColumn.objectFieldType"
                placeholder="结果字段类型"
                @change="currentColumn.aggregationType = undefined"
              >
                <el-option
                  v-for="item in getVirtualColumnFieldType"
                  :key="item"
                  :value="item"
                  :label="item"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="聚合计算规则" prop="relationId">
              <el-select v-model="currentColumn.aggregationType" placeholder="聚合字段计算规则">
                <el-option
                  v-for="item in getAggregationTypeList"
                  :key="item.id"
                  :value="item.id"
                  :label="item.name"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </div>
      </el-form>
    </div>
    <!-- 过滤条件 -->
    <div class="column-filter">
      <el-row type="flex" align="middle" style="border-bottom: 1px dashed #dcdfe6; height: 40px">
        <span style="color: #043254; font-weight: 700">过滤条件</span>
      </el-row>
      <el-row style="margin-top: 15px">
        <el-col :span="24" style="border-top: 1px solid #ebeef5">
          <el-table
            :size="formItemSize"
            :data="virtualColumnFilterList"
            :show-header="false"
            empty-text="请添加过滤条件"
          >
            <el-table-column label="操作" width="45px">
              <template v-slot="scope">
                <el-button link :icon="Remove" @click="onDeleteColumnFilter(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="参数名称">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  link
                  style="text-decoration: underline"
                  @click="onEditColumnFilter(scope.row)"
                  >{{ (scope.row.column || {}).columnName || '未知字段' }}</el-button
                >
              </template>
            </el-table-column>
            <el-table-column label="所属表" width="100px">
              <template>
                <el-tag :size="formItemSize" type="success">关联从表</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="过滤类型" width="100px">
              <template v-slot="scope">
                <span>{{ SysOnlineFilterOperationType.getValue(scope.row.operatorType) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="参数值" prop="value">
              <template v-slot="scope">
                <span v-if="(scope.row.column || {}).dictInfo == null">{{ scope.row.value }}</span>
                <span v-else>{{
                  scope.row.column.dictInfo.dictName + ' / ' + scope.row.dictValueName
                }}</span>
              </template>
            </el-table-column>
            <template v-slot:empty>
              <div class="table-empty unified-font">
                <img src="@/assets/img/empty.png" />
                <span>暂无数据</span>
              </div>
            </template>
          </el-table>
          <el-button
            style="width: 100%; margin-top: 10px; border: 1px dashed #ebeef5"
            :size="formItemSize"
            :disabled="currentColumn == null || aggregationRelation == null"
            :icon="Plus"
            @click="onEditColumnFilter(null)"
          >
            添加过滤条件
          </el-button>
        </el-col>
      </el-row>
    </div>
  </el-row>
</template>

<script setup lang="ts">
import { CirclePlus, Remove, Plus } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import { OnlineColumnController, OnlineVirtualColumnController } from '@/api/online';
import {
  SysOnlineAggregationType,
  SysOnlineFilterOperationType,
  SysOnlineRelationType,
} from '@/common/staticDict/online';
import { Dialog } from '@/components/Dialog';
import { findItemFromList } from '@/common/utils';
import { useLayoutStore } from '@/store';
import { useDict } from '../../hooks/useDict';
import EditVirtualColumnFilter from './editVirtualColumnFilter.vue';
const layoutStore = useLayoutStore();
const defaultVirtualColumnInfo = {
  virtualColumnId: undefined,
  datasourceId: undefined,
  objectFieldName: undefined,
  columnPrompt: undefined,
  objectFieldType: undefined,
  relationId: undefined,
  aggregationType: undefined,
  aggregationTableId: undefined,
  aggregationColumnId: undefined,
  virtualType: 0,
  whereClauseJson: undefined,
};

const props = withDefaults(
  defineProps<{
    datasource: ANY_OBJECT;
    relationList: Array<ANY_OBJECT>;
    height: number;
  }>(),
  {},
);
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});

const form = ref();
const allVirtualColumnList = ref<ANY_OBJECT[]>([]);
const currentColumn = ref<ANY_OBJECT>();
const aggregationTableList = ref<ANY_OBJECT[]>([]);
const aggregationColumnList = ref<ANY_OBJECT[]>([]);
const virtualColumnFilterList = ref<ANY_OBJECT[]>([]);

const rules = {
  objectFieldName: [{ required: true, message: '结果字段列名不能为空', trigger: 'blur' }],
  objectFieldType: [{ required: true, message: '结果字段类型不能为空', trigger: 'blur' }],
  columnPrompt: [
    {
      required: true,
      message: '结果字段显示名不能为空',
      trigger: 'blur',
    },
  ],
  relationId: [{ required: true, message: '必须选则聚合字段关联', trigger: 'blur' }],
  aggregationType: [{ required: true, message: '必须选则聚合计算规则', trigger: 'blur' }],
  aggregationTableId: [{ required: true, message: '聚合计算表不能为空', trigger: 'blur' }],
  aggregationColumnId: [{ required: true, message: '聚合计算字段不能为空', trigger: 'blur' }],
};

const aggregationColumn = computed(() => {
  if (!currentColumn.value || !currentColumn.value.aggregationColumnId) return null;
  return findItemFromList(
    aggregationColumnList.value,
    currentColumn.value.aggregationColumnId,
    'columnId',
  );
});
const getVirtualColumnFieldType = computed(() => {
  if (!aggregationColumn.value) return [];

  switch (aggregationColumn.value.objectFieldType) {
    case 'String':
    case 'Boolean':
      return ['Integer'];
    case 'Integer':
    case 'Long':
    case 'BigDecimal':
    case 'Double':
      return ['Integer', 'Long', 'Double'];
    case 'Date':
      return ['Integer', 'Date'];
    default:
      return ['Integer', 'Long', 'Double', 'Date'];
  }
});
const getAggregationTypeList = computed(() => {
  if (!aggregationColumn.value) return [];
  return SysOnlineAggregationType.getList().filter(item => {
    switch (item.id) {
      case SysOnlineAggregationType.SUM:
        return (
          currentColumn.value &&
          currentColumn.value.objectFieldType !== 'Date' &&
          ['Date', 'Boolean', 'String'].indexOf(aggregationColumn.value?.objectFieldType) === -1
        );
      case SysOnlineAggregationType.COUNT:
        return true;
      case SysOnlineAggregationType.AVG:
      case SysOnlineAggregationType.MIN:
      case SysOnlineAggregationType.MAX:
        if (aggregationColumn.value?.objectFieldType === 'Date') {
          return currentColumn.value && currentColumn.value.objectFieldType === 'Date';
        } else {
          return (
            ['Integer', 'Long', 'BigDecimal', 'Double'].indexOf(
              aggregationColumn.value?.objectFieldType,
            ) !== -1
          );
        }
      default:
        return false;
    }
  });
});
const aggregationRelation = computed(() => {
  if (!currentColumn.value || !currentColumn.value.relationId) return null;
  return findItemFromList(props.relationList, currentColumn.value.relationId, 'relationId');
});

const getDatasourceTableTagType = (relationType: number) => {
  if (relationType == null) return 'success';
  switch (relationType) {
    case SysOnlineRelationType.ONE_TO_ONE:
      return '';
    case SysOnlineRelationType.ONE_TO_MANY:
      return 'warning';
    default:
      return 'info';
  }
};

const onRelationChange = (relationId: string) => {
  aggregationTableList.value = [];
  aggregationColumnList.value = [];
  if (currentColumn.value) {
    currentColumn.value.aggregationColumnId = undefined;
    currentColumn.value.aggregationTableId = undefined;
    currentColumn.value.aggregationType = undefined;
    currentColumn.value.objectFieldType = undefined;
  }

  let relation = findItemFromList(props.relationList, relationId, 'relationId');
  if (relation != null) {
    aggregationTableList.value = [relation.slaveTable];
  }
};
const onAggregationTableIdChange = () => {
  aggregationColumnList.value = [];
  if (currentColumn.value) {
    currentColumn.value.aggregationColumnId = undefined;
    currentColumn.value.aggregationType = undefined;
    currentColumn.value.objectFieldType = undefined;
  }

  if (aggregationRelation.value && currentColumn.value) {
    loadOnlineTableColumnList(currentColumn.value.aggregationTableId).catch(e => {
      console.warn(e);
    });
  }
};
const onAggregationColumnIdChange = () => {
  if (currentColumn.value) {
    currentColumn.value.aggregationType = undefined;
    currentColumn.value.objectFieldType = undefined;
  }
};

const onAddNewVirtualColumn = () => {
  currentColumn.value = {
    ...defaultVirtualColumnInfo,
  };
};
const onActiveColumnClick = (column: ANY_OBJECT) => {
  currentColumn.value = column;
};
const onDeleteColumn = (column: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此虚拟字段？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {
        virtualColumnId: column.virtualColumnId,
      };

      OnlineVirtualColumnController.delete(params)
        .then(() => {
          if (
            currentColumn.value &&
            column.virtualColumnId === currentColumn.value.virtualColumnId
          ) {
            currentColumn.value = {
              ...defaultVirtualColumnInfo,
            };
          }
          ElMessage.success('删除成功！');
          loadOnlineVirtualColumnList();
        })
        .catch(e => {
          console.warn(e);
        });
    })
    .catch(e => {
      console.warn(e);
    });
};
const loadOnlineVirtualColumnList = () => {
  let params = {
    onlineVirtualColumnDtoFilter: {
      datasourceId: props.datasource.datasourceId,
    },
  };

  OnlineVirtualColumnController.list(params)
    .then(res => {
      allVirtualColumnList.value = res.data.dataList;
      if (!currentColumn.value && allVirtualColumnList.value.length > 0) {
        currentColumn.value = allVirtualColumnList.value[0];
      }
    })
    .catch(e => {
      console.warn(e);
    });
};

const loadOnlineTableColumnList = (tableId: string) => {
  return new Promise((resolve, reject) => {
    if (tableId == null || tableId === '') resolve(false);

    let params = {
      onlineColumnDtoFilter: {
        tableId,
      },
    };

    OnlineColumnController.list(params)
      .then(res => {
        if (aggregationRelation.value != null) {
          aggregationRelation.value.columnList = res.data.dataList;
        }
        aggregationColumnList.value = res.data.dataList;
        buildVirtualColumnFilter();
        resolve(true);
      })
      .catch(e => {
        console.warn(e);
        reject();
      });
  });
};

const { getDictDataList } = useDict();

const buildVirtualColumnFilter = () => {
  let filterList =
    currentColumn.value && currentColumn.value.whereClauseJson
      ? JSON.parse(currentColumn.value.whereClauseJson)
      : [];
  filterList = filterList.map((item: ANY_OBJECT) => {
    return {
      ...item,
      table: aggregationRelation.value,
      column: findItemFromList(aggregationRelation.value?.columnList, item.columnId, 'columnId'),
    };
  });
  // 获取过滤条件种过滤值的字典信息
  let allPromise = filterList.map((filterItem: ANY_OBJECT) => {
    return new Promise(resolve => {
      if (filterItem.column == null || filterItem.column.dictInfo == null) {
        resolve(false);
        return;
      }
      let dictInfo = filterItem.column.dictInfo;
      getDictDataList(dictInfo, {})
        .then(dictValueList => {
          let dictValue = findItemFromList(dictValueList, filterItem.value, 'id');
          if (dictValue) {
            filterItem.dictValueName = dictValue.name;
          } else {
            filterItem.value = undefined;
          }
          resolve(true);
        })
        .catch(e => {
          console.warn(e);
          filterItem.value = undefined;
          resolve(false);
        });
    });
  });
  Promise.all(allPromise)
    .then(() => {
      virtualColumnFilterList.value = filterList;
    })
    .catch(e => {
      console.warn(e);
    });
};

watch(
  () => currentColumn.value,
  (newValue, oldValue) => {
    if (newValue == null) {
      if (Array.isArray(allVirtualColumnList.value) && allVirtualColumnList.value.length > 0) {
        currentColumn.value = allVirtualColumnList.value[0];
      }
    } else if (newValue != oldValue) {
      if (aggregationRelation.value)
        aggregationTableList.value = [aggregationRelation.value.slaveTable];
      if (aggregationRelation.value) {
        loadOnlineTableColumnList(aggregationRelation.value.tableId).catch(e => {
          console.warn(e);
        });
        if (
          Array.isArray(aggregationRelation.value.columnList) &&
          aggregationRelation.value.columnList.length > 0
        ) {
          buildVirtualColumnFilter();
        } else {
          loadOnlineTableColumnList(aggregationRelation.value.tableId).catch(e => {
            console.warn(e);
          });
        }
      }
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

const handlerEditOperate = (row: ANY_OBJECT | null, res: ANY_OBJECT) => {
  if (row == null) {
    res.id = new Date().getTime();
    virtualColumnFilterList.value.push(res);
  } else {
    virtualColumnFilterList.value = virtualColumnFilterList.value.map(item => {
      return item.id === row.id ? res : item;
    });
  }
};

const onEditColumnFilter = (row: ANY_OBJECT | null) => {
  Dialog.show<ANY_OBJECT>(
    row ? '编辑过滤' : '添加过滤',
    EditVirtualColumnFilter,
    {
      area: '500px',
    },
    {
      rowData: row,
      tableList: aggregationTableList.value,
      //path: 'thirdEditVirtualColumnFilter',
    },
    {
      width: '500px',
      height: '500px',
      pathName: '/thirdParty/thirdEditVirtualColumnFilter',
    },
  )
    .then(res => {
      handlerEditOperate(row, res);
    })
    .catch(e => {
      console.warn(e);
    });
};
const onDeleteColumnFilter = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此过滤条件？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      virtualColumnFilterList.value = virtualColumnFilterList.value.filter(item => item !== row);
    })
    .catch(e => {
      console.warn(e);
    });
};

const saveColumn = () => {
  form.value.validate((valid: boolean) => {
    if (valid) {
      let whereClauseJson = virtualColumnFilterList.value.map(item => {
        return {
          tableId: item.tableId,
          columnId: item.columnId,
          operatorType: item.operatorType,
          value: item.value,
        };
      });
      let params = {
        onlineVirtualColumnDto: {
          ...currentColumn.value,
          datasourceId: props.datasource.datasourceId,
          whereClauseJson: JSON.stringify(whereClauseJson),
        },
      };
      let httpCall =
        currentColumn.value && currentColumn.value.virtualColumnId
          ? OnlineVirtualColumnController.update(params)
          : OnlineVirtualColumnController.add(params);
      httpCall
        .then(res => {
          if (currentColumn.value && !currentColumn.value.virtualColumnId)
            currentColumn.value.virtualColumnId = res.data;
          ElMessage.success('保存成功！');
          loadOnlineVirtualColumnList();
        })
        .catch(e => {
          console.warn(e);
        });
    }
  });
};
defineExpose({
  saveColumn,
});

onMounted(() => {
  loadOnlineVirtualColumnList();
});
</script>

<style scoped>
.table-column-list {
  flex-shrink: 0;
  width: 300px;
  height: 100%;
  padding: 0 10px 10px;
  margin-bottom: 10px;
  background: white;
  border-radius: 3px;
}
.table-column-list > .title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  margin-bottom: 10px;
  color: #043254;
  line-height: 30px;
  font-weight: 700;
  border-bottom: 1px dashed #dcdfe6;
}
.table-column-list > .title > span {
  width: 100%;
}
.table-column-list .table-column-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 35px;
  padding: 0 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #043254;
  background: #f4f7fa;
  border: 1px dashed #f3f9ff;
  border-radius: 3px;
  cursor: pointer;
  line-height: 35px;
}
.table-column-list .table-column-item:hover {
  background: #ecf4fc;
}
.table-column-list .table-column-item.active-column {
  background: #ecf4fc;
  border: 1px dashed #b6d8fa;
}
.table-column-list .table-column-item .delete {
  display: none;
}
.table-column-list .table-column-item:hover .delete {
  display: block;
}
.column-attributes {
  width: 100%;
  height: 100%;
  padding: 0 10px 10px;
  margin: 0 10px;
  background: white;
  border-radius: 3px;
}
.column-attributes .attribute-title {
  width: 100%;
  margin-left: 15px;
  color: #043254;
  font-weight: 700;
}
.column-attributes .attibute-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.column-attributes .attibute-box .attribute-item {
  width: 500px;
}
.column-filter {
  flex-shrink: 0;
  width: 430px;
  height: 100%;
  padding: 0 10px 10px;
  background: white;
  border-radius: 3px;
}
</style>

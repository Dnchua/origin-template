<template>
  <el-row style="flex-wrap: nowrap; width: 100%" :style="{ height: height + 'px' }">
    <!-- 字段列表 -->
    <div class="table-column-list">
      <div class="title">
        <span>{{ tableName }}</span>
        <el-dropdown trigger="click" @command="onAddNewColumn">
          <el-button
            :size="formItemSize"
            link
            :icon="CirclePlus"
            :disabled="getNewColumnList.length <= 0"
          >
            新增
          </el-button>
          <template v-slot:dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="newColumn in getNewColumnList"
                :key="newColumn.columnName"
                :command="newColumn"
              >
                {{ newColumn.columnName }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-scrollbar :style="{ height: height - 51 + 'px' }">
        <div
          v-for="column in getAllColumnList"
          :key="column.columnId"
          class="table-column-item"
          :class="{ 'active-column': currentColumn === column }"
          :title="column.columnComment"
          @click.stop="onActiveColumnClick(column)"
        >
          <div>
            <span style="margin-right: 10px">{{ column.columnName }}</span>
            <el-tag v-if="column.deletedFlag" :size="formItemSize" type="danger">已删除</el-tag>
          </div>
          <div class="refresh" style="margin-left: 10px">
            <el-button
              :size="formItemSize"
              type="primary"
              link
              v-if="getNewColumnList.length <= 0"
              @click.stop="onRefreshOnlineColumn(column, column)"
            >
              刷新
            </el-button>
            <el-dropdown v-else trigger="click" @command="onRefreshNewColumn">
              <el-button
                :size="formItemSize"
                type="primary"
                link
                @click.stop="
                  () => {
                    console.log('empty function');
                  }
                "
              >
                刷新
              </el-button>
              <template v-slot:dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="newColumn in getNewColumnList"
                    :key="newColumn.columnName"
                    :command="{ column, newColumn }"
                  >
                    {{ newColumn.columnName }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button
              v-if="column.deletedFlag"
              :size="formItemSize"
              type="danger"
              link
              style="margin-left: 10px"
              @click.stop="onDeleteColumn(column)"
            >
              删除
            </el-button>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <!-- 字段属性 -->
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
        ref="columnAttribute"
        :model="currentColumn"
        class="full-width-input"
        style="width: 100%"
        label-width="120px"
        label-position="right"
        @submit.prevent
        size="default"
      >
        <div v-if="currentColumn != null" style="padding: 20px" class="attibute-box">
          <el-col class="attribute-item">
            <el-form-item label="字段名：">
              <span :title="currentColumn.columnComment">{{ currentColumn.columnName }}</span>
              <el-tag
                :size="formItemSize"
                type="warning"
                v-if="currentColumn.primaryKey"
                style="margin-left: 20px"
                >主键</el-tag
              >
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="字段类型：">
              <span>{{ currentColumn.fullColumnType }}</span>
              <el-tag :size="formItemSize" type="success" effect="dark" style="margin-left: 10px">{{
                currentColumn.tag.objectFieldType
              }}</el-tag>
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="是否必填：">
              <el-switch v-model="currentColumn.required" />
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="显示名称：">
              <el-input
                v-model="currentColumn.columnComment"
                style="width: 278px"
                @change="dirty = true"
                placeholder="字段在表单上的显示名称"
              />
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="字典数据：">
              <el-select
                v-model="currentColumn.dictId"
                placeholder="选择字段绑定的字典"
                style="width: 278px"
                clearable
                filterable
                :disabled="currentColumn.tag.objectFieldType === 'Boolean'"
                @change="onDictChange"
              >
                <el-option
                  v-for="item in dictList"
                  :key="item.dictId"
                  :value="item.dictId!"
                  :label="item.dictName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="过滤支持：">
              <el-radio-group v-model="currentColumn.filterType" @change="dirty = true">
                <el-radio-button
                  v-for="item in SysOnlineColumnFilterType.getList()"
                  :key="item.id"
                  :label="item.id"
                  :disabled="
                    item.id === SysOnlineColumnFilterType.MULTI_SELECT_FILTER &&
                    (currentColumn.dictId == null || currentColumn.dictId === '')
                  "
                >
                  {{ SysOnlineColumnFilterType.getValue(item.id) }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="数据权限过滤：">
              <el-select
                v-model="dataPermFilterType"
                placeholder="字段用于数据权限过滤规则"
                style="width: 278px"
                clearable
                @change="dirty = true"
              >
                <el-option
                  v-for="item in SysOnlineDataPermFilterType.getList()"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col class="attribute-item">
            <el-form-item label="字段类别：">
              <el-select
                v-model="currentColumn.fieldKind"
                clearable
                placeholder="字段的业务类别"
                @change="dirty = true"
                style="width: 278px"
              >
                <el-option
                  v-for="item in getValidColumnKind"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="columnKindItemDisabled(item)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            class="attribute-item"
            v-if="
              currentColumn.fieldKind === SysOnlineFieldKind.UPLOAD ||
              currentColumn.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE
            "
          >
            <el-form-item label="存储类型：">
              <el-select
                v-model="currentColumn.uploadFileSystemType"
                clearable
                placeholder="字段的业务类别"
                @change="dirty = true"
                style="width: 278px"
              >
                <el-option label="本地存储" :value="0" />
                <el-option label="分布式存储" :value="100" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            class="attribute-item"
            v-if="
              currentColumn.fieldKind === SysOnlineFieldKind.UPLOAD ||
              currentColumn.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE
            "
          >
            <el-form-item label="上传文件数量：">
              <el-input-number
                v-model="currentColumn.maxFileCount"
                style="width: 278px"
                placeholder="不填或者0则代表无限制"
                @change="dirty = true"
              />
            </el-form-item>
          </el-col>
        </div>
      </el-form>
    </div>
    <!-- 验证规则 -->
    <div class="column-rules">
      <el-row type="flex" align="middle" style="border-bottom: 1px dashed #dcdfe6; height: 40px">
        <span style="color: #043254; font-weight: 700">验证规则</span>
      </el-row>
      <el-row style="margin-top: 15px">
        <el-col :span="24" style="border-top: 1px solid #ebeef5">
          <el-table
            :size="formItemSize"
            :data="columnRuleList"
            :show-header="false"
            empty-text="请添加验证规则"
          >
            <el-table-column type="index" width="30px" />
            <el-table-column label="规则名称" prop="ruleName" width="120" />
            <el-table-column label="校验错误信息" prop="columnRuleInfo.message" />
            <el-table-column label="操作" width="110px">
              <template v-slot="scope">
                <el-button
                  link
                  type="primary"
                  @click="onEditColumnRule(scope.row)"
                  :size="formItemSize"
                  style="padding: 0"
                  >编辑</el-button
                >
                <el-button
                  link
                  type="danger"
                  @click="onDeleteColumnRule(scope.row)"
                  :size="formItemSize"
                  style="padding: 0"
                  >删除</el-button
                >
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
            :disabled="currentColumn == null"
            :icon="Plus"
            @click="onSetColumnRule"
            :size="formItemSize"
          >
            添加验证规则
          </el-button>
        </el-col>
      </el-row>
    </div>
  </el-row>
</template>

<script setup lang="ts">
import { CirclePlus, Plus } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import {
  SysOnlineFieldKind,
  SysOnlineDataPermFilterType,
  SysOnlineColumnFilterType,
} from '@/common/staticDict/online';
import { OnlineColumnController, OnlineDblinkController } from '@/api/online';
import { Dialog } from '@/components/Dialog';
import { Dict } from '@/types/online/dict';
import { ColumnInfo } from '@/types/online/column';
import { useLayoutStore } from '@/store';
import SetOnlineTableColumnRule from './setOnlineTableColumnRule.vue';
const layoutStore = useLayoutStore();

const props = withDefaults(
  defineProps<{
    isMasterTable: boolean;
    tableId: string;
    dblinkId: string | number;
    tableName: string;
    dictList: Array<Dict>;
    height: number;
  }>(),
  { isMasterTable: false },
);
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});

const dirty = ref(false);
const dataPermFilterType = ref();
const dblinkTableColumnMap = ref();
const columnRuleList = ref<ANY_OBJECT[]>([]);
const currentColumn = ref();
const storeColumn = ref();
const columnMap = ref<Map<string, ANY_OBJECT>>();

const getValidColumnKind = computed(() => {
  return SysOnlineFieldKind.getList().filter(item => {
    return props.isMasterTable ? true : item.id !== SysOnlineFieldKind.FLOW_STATUS;
  });
});
const getAllColumnList = computed(() => {
  let columnList: ANY_OBJECT[] = [];
  if (columnMap.value) {
    columnMap.value.forEach(column => {
      if (dblinkTableColumnMap.value) {
        let dblinkColumn = dblinkTableColumnMap.value.get(column.columnName);
        column.deletedFlag = dblinkColumn == null;
      } else {
        column.deletedFlag = false;
      }
      columnList.push(column);
    });
  }
  return columnList;
});
const getNewColumnList = computed(() => {
  let columnList: ANY_OBJECT[] = [];
  if (dblinkTableColumnMap.value && columnMap.value) {
    dblinkTableColumnMap.value.forEach((column: ANY_OBJECT) => {
      let onlineColumn = columnMap.value?.get(column.columnName);
      if (onlineColumn == null) {
        columnList.push(column);
      }
    });
  }

  return columnList;
});

/**
 * 获取在线表单导入表字段列表
 */
const loadOnlineTableColumns = () => {
  let params = {
    onlineColumnDtoFilter: {
      tableId: props.tableId,
    },
  };
  OnlineColumnController.list(params)
    .then(res => {
      columnMap.value = new Map<string, ANY_OBJECT>();
      res.data.dataList.forEach((item: ColumnInfo) => {
        let temp = {
          columnId: item.columnId,
          columnName: item.columnName,
          columnComment: item.columnComment,
          fullColumnType: item.fullColumnType,
          primaryKey: item.primaryKey,
          required: !item.nullable,
          fieldKind: item.fieldKind,
          maxFileCount: item.maxFileCount,
          uploadFileSystemType: item.uploadFileSystemType || 0,
          filterType: item.filterType,
          dictId: item.dictId,
          tag: item,
        };
        columnMap.value?.set(temp.columnName, temp);
      });
      if (currentColumn.value) {
        nextTick(() => {
          currentColumn.value = columnMap.value
            ? columnMap.value.get(currentColumn.value.columnName)
            : undefined;
        });
      }
    })
    .catch(e => {
      console.warn(e);
    });
};

/**
 * 添加字段
 */
const onAddNewColumn = (newColumn: ANY_OBJECT) => {
  let params = {
    tableId: props.tableId,
    dblinkId: props.dblinkId,
    tableName: props.tableName,
    columnName: newColumn.columnName,
  };

  OnlineColumnController.add(params)
    .then(() => {
      ElMessage.success('添加成功！');
      dirty.value = false;
      loadOnlineTableColumns();
    })
    .catch(e => {
      console.warn(e);
    });
};
const saveColumn = () => {
  if (currentColumn.value == null) return Promise.reject();
  return new Promise((resolve, reject) => {
    let params = {
      onlineColumnDto: {
        ...currentColumn.value.tag,
        dictId:
          currentColumn.value.tag.objectFieldType === 'Boolean'
            ? undefined
            : currentColumn.value.dictId,
        fieldKind: currentColumn.value.fieldKind,
        filterType: currentColumn.value.filterType,
        maxFileCount: currentColumn.value.maxFileCount,
        uploadFileSystemType: currentColumn.value.uploadFileSystemType || 0,
        columnComment: currentColumn.value.columnComment,
        userFilter: dataPermFilterType.value === SysOnlineDataPermFilterType.USER_FILTER,
        deptFilter: dataPermFilterType.value === SysOnlineDataPermFilterType.DEPT_FILTER,
        nullable: !currentColumn.value.required,
      },
    };

    OnlineColumnController.update(params)
      .then(res => {
        dirty.value = false;
        ElMessage.success('保存成功！');
        loadOnlineTableColumns();
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};
const loadColumnRuleList = (columnId: string) => {
  columnRuleList.value = [];
  OnlineColumnController.listOnlineColumnRule({
    columnId: columnId,
  })
    .then(res => {
      res.data.dataList.forEach(item => {
        item.columnRuleInfo = {
          ...JSON.parse(item.onlineColumnRule.propDataJson),
        };
      });
      columnRuleList.value = res.data.dataList;
    })
    .catch(e => {
      console.warn(e);
    });
};
const setCurrentColumn = (column: ANY_OBJECT) => {
  currentColumn.value = column;
  dataPermFilterType.value = undefined;
  if (currentColumn.value.tag.userFilter)
    dataPermFilterType.value = SysOnlineDataPermFilterType.USER_FILTER;
  if (currentColumn.value.tag.deptFilter)
    dataPermFilterType.value = SysOnlineDataPermFilterType.DEPT_FILTER;
  storeColumn.value = { ...column };
  loadColumnRuleList(currentColumn.value.columnId);
};
const onActiveColumnClick = (column: ANY_OBJECT) => {
  if (dirty.value) {
    ElMessageBox.confirm('字段信息已修改，是否保存？', '', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      closeOnClickModal: false,
    })
      .then(() => {
        saveColumn()
          .then(() => {
            setCurrentColumn(column);
          })
          .catch(e => {
            console.warn(e);
          });
      })
      .catch(() => {
        dirty.value = false;
        // 恢复字段属性
        if (storeColumn.value) {
          currentColumn.value.maxFileCount = storeColumn.value.maxFileCount;
          currentColumn.value.uploadFileSystemType = storeColumn.value.uploadFileSystemType || 0;
          currentColumn.value.fieldKind = storeColumn.value.fieldKind;
          currentColumn.value.filterType = storeColumn.value.filterType;
        }
        // 设置当前字段为新字段
        setCurrentColumn(column);
      });
  } else {
    dirty.value = false;
    setCurrentColumn(column);
  }
};

/**
 * 绑定字典改变，如果取消绑定字典，则不能选择多选过滤
 */
const onDictChange = (value: string | undefined) => {
  if (!value && currentColumn.value.filterType === SysOnlineColumnFilterType.MULTI_SELECT_FILTER) {
    currentColumn.value.filterType = SysOnlineColumnFilterType.NONE;
  }
};
/**
 * 刷新字段
 */
const onRefreshOnlineColumn = (column: ANY_OBJECT, newColumn: ANY_OBJECT) => {
  ElMessageBox.confirm('刷新字段将替换现有字段有所的属性，是否继续？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {
        columnId: column.columnId,
        dblinkId: props.dblinkId,
        tableName: props.tableName,
        columnName: newColumn.columnName,
      };

      return OnlineColumnController.refreshColumn(params);
    })
    .then(() => {
      ElMessage.success('刷新成功！');
      dirty.value = false;
      loadOnlineTableColumns();
    })
    .catch(e => {
      console.warn(e);
    });
};
const onRefreshNewColumn = (command: ANY_OBJECT) => {
  onRefreshOnlineColumn(command.column, command.newColumn);
};
const onDeleteColumn = (column: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除字段？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {
        columnId: column.columnId,
      };

      return OnlineColumnController.delete(params);
    })
    .then(() => {
      ElMessage.success('删除成功!');
      loadOnlineTableColumns();
    })
    .catch(e => {
      console.warn(e);
    });
};

const onDeleteColumnRule = (rule: ANY_OBJECT) => {
  ElMessageBox.confirm('是否从当前字段中删除此规则？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {
        columnId: currentColumn.value.columnId,
        ruleId: rule.ruleId,
      };

      return OnlineColumnController.deleteOnlineColumnRule(params);
    })
    .then(() => {
      ElMessage.success('删除成功！');
      loadColumnRuleList(currentColumn.value.columnId);
    })
    .catch(e => {
      console.warn(e);
    });
};
const onEditColumnRule = (rule: ANY_OBJECT) => {
  Dialog.show(
    '编辑字段验证规则',
    SetOnlineTableColumnRule,
    {
      area: '600px',
    },
    {
      column: currentColumn.value,
      columnRule: rule,
      //path: 'thirdSetOnlineTableColumnRule',
    },
    {
      width: '600px',
      height: '500px',
      pathName: '/thirdParty/thirdSetOnlineTableColumnRule',
    },
  )
    .then(() => {
      loadColumnRuleList(currentColumn.value.columnId);
    })
    .catch(e => {
      console.warn(e);
    });
};
const onSetColumnRule = () => {
  Dialog.show(
    '设置字段验证规则',
    SetOnlineTableColumnRule,
    {
      area: '600px',
    },
    {
      column: currentColumn.value,
      //path: 'thirdSetOnlineTableColumnRule',
    },
    {
      width: '600px',
      height: '500px',
      pathName: '/thirdParty/thirdSetOnlineTableColumnRule',
    },
  )
    .then(() => {
      loadColumnRuleList(currentColumn.value.columnId);
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 获取数据库数据表字段列表
 */
const loadDblinkTableColumns = () => {
  let params = {
    dblinkId: props.dblinkId,
    tableName: props.tableName,
  };
  OnlineDblinkController.listDblinkTableColumns(params)
    .then(res => {
      dblinkTableColumnMap.value = new Map();
      res.data.forEach(item => {
        dblinkTableColumnMap.value.set(item.columnName, item);
      });
    })
    .catch(e => {
      console.warn(e);
    });
};
const columnKindItemDisabled = (columnKind: ANY_OBJECT) => {
  switch (columnKind.id) {
    case SysOnlineFieldKind.CREATE_TIME:
    case SysOnlineFieldKind.UPDATE_TIME:
      return currentColumn.value.tag.objectFieldType !== 'Date';
    case SysOnlineFieldKind.UPLOAD:
    case SysOnlineFieldKind.UPLOAD_IMAGE:
    case SysOnlineFieldKind.RICH_TEXT:
    case SysOnlineFieldKind.FIELD_MASK:
      return currentColumn.value.tag.objectFieldType !== 'String';
    case SysOnlineFieldKind.LOGIC_DELETE:
    case SysOnlineFieldKind.FLOW_STATUS:
      return currentColumn.value.tag.objectFieldType !== 'Integer';
    default:
      return false;
  }
};

watch(
  () => getAllColumnList.value,
  () => {
    if (
      currentColumn.value == null &&
      Array.isArray(getAllColumnList.value) &&
      getAllColumnList.value.length > 0
    ) {
      setCurrentColumn(getAllColumnList.value[0]);
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

defineExpose({
  saveColumn,
});

onMounted(() => {
  loadOnlineTableColumns();
  loadDblinkTableColumns();
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
  font-size: 14px;
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
.table-column-list .table-column-item .refresh {
  display: none;
}
.table-column-list .table-column-item:hover .refresh {
  display: flex;
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
  width: 620px;
  flex: 1;
}
.column-rules {
  flex-shrink: 0;
  width: 430px;
  height: 100%;
  padding: 0 10px 10px;
  background: white;
  border-radius: 3px;
}
</style>

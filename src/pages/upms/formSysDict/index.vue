<template>
  <el-container class="advance-query-form form-dict-management advance-box">
    <el-aside width="300px">
      <el-card
        class="base-card"
        shadow="never"
        :body-style="{ padding: '0px' }"
        style="border: none"
      >
        <template v-slot:header>
          <div class="base-card-header">
            <el-row style="width: 100%">
              <el-row
                type="flex"
                justify="space-between"
                align="middle"
                style="width: 100%; line-height: 1"
              >
                <el-dropdown trigger="click" @command="onDictTypeClick" placement="bottom-start">
                  <span style="font-weight: bold"
                    >{{ dictType === 'table' ? '字典表字典' : '编码字典'
                    }}<el-icon class="el-icon--right"><el-icon-arrow-down /></el-icon
                  ></span>
                  <template v-slot:dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        class="header-title"
                        :class="{ active: dictType === 'table' }"
                        command="table"
                        >字典表字典</el-dropdown-item
                      >
                      <el-dropdown-item
                        class="header-title"
                        :class="{ active: dictType === 'code' }"
                        command="code"
                        >编码字典</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <div class="base-card-operation">
                  <el-button
                    class="advance-icon-btn"
                    @click="loadGlobalDictList()"
                    style="width: 40px; height: 32px; padding: 0"
                  >
                    <img src="@/assets/img/refresh2.png" alt="" style="vertical-align: middle" />
                  </el-button>
                  <el-button
                    class="advance-icon-btn"
                    :size="layoutStore.defaultFormItemSize"
                    :disabled="dictType !== 'code'"
                    @click="onEditGlobalDict(null)"
                    style="width: 40px; height: 32px; padding: 0"
                  >
                    <img src="@/assets/img/add.png" alt="" style="vertical-align: middle" />
                  </el-button>
                </div>
              </el-row>
            </el-row>
          </div>
        </template>
        <el-row
          type="flex"
          justify="space-between"
          align="middle"
          style="width: 100%; padding: 16px 16px 0; margin-bottom: 16px; line-height: 1"
        >
          <el-input
            :prefix-icon="Search"
            v-model="filter.dictName"
            placeholder="请输入搜索内容"
            :size="layoutStore.defaultFormItemSize"
            clearable
          ></el-input>
          <!-- <el-popover placement="bottom" popper-class="filter-popover" width="148">
            <template v-slot:reference>
              <img
                style="margin-left: 8px; cursor: pointer; vertical-align: middle"
                src="@/assets/img/filter.png"
                alt=""
              />
            </template>

            <ul>
              <li class="actvie">公用</li>
              <li>非公用</li>
            </ul>
          </el-popover> -->
        </el-row>
        <el-scrollbar :style="{ height: mainContextHeight - 162 + 'px' }">
          <el-tree
            ref="dictListTree"
            :data="currentDictList"
            :props="{ label: 'name' }"
            node-key="keyName"
            :highlight-current="true"
            :current-node-key="(currentDict || {}).variableName"
            @node-click="onDictChange"
          >
            <template v-slot="{ data }">
              <div class="module-node-item">
                <el-row
                  type="flex"
                  justify="space-between"
                  align="middle"
                  style="margin-right: 9px"
                >
                  <div>
                    <span style="padding-left: 16px">{{ data.name }}</span>
                    <el-tag
                      class="custom-tag"
                      v-if="data.tenantCommon"
                      size="default"
                      style="margin-left: 10px"
                      >公共字典</el-tag
                    >
                  </div>
                  <div class="module-node-menu" v-if="dictType == 'code'">
                    <el-button
                      link
                      :size="layoutStore.defaultFormItemSize"
                      @click.stop="onEditGlobalDict(data)"
                      :icon="Edit"
                    ></el-button>
                    <el-button
                      link
                      :size="layoutStore.defaultFormItemSize"
                      @click.stop="onDeleteGlobalDict(data)"
                      :icon="Delete"
                    ></el-button>
                  </div>
                </el-row>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>
      </el-card>
    </el-aside>
    <el-main style="margin-left: 15px">
      <el-form
        label-width="120px"
        v-if="dirtyCount > 0"
        :size="layoutStore.defaultFormItemSize"
        label-position="left"
        @submit.prevent
        style="padding: 24px 24px 0; background-color: white"
      >
        <el-form-item label="失效缓存数量：">
          <span style="color: #f56c6c">{{ dirtyCount }}</span>
        </el-form-item>
      </el-form>
      <table-box
        class="page-table"
        :data="getCurrentDictData"
        :size="layoutStore.defaultFormItemSize"
        @refresh="loadGlobalDictList"
        :row-style="tableRowStyle"
        :hasExtend="currentDict && !currentDict.tenantCommon"
        :tree-config="{}"
      >
        <template v-slot:operator>
          <el-button
            type="primary"
            :size="layoutStore.defaultFormItemSize"
            :plain="true"
            :disabled="
              !checkPermCodeExist('formSysDict:fragmentSysDict:reloadCache') || currentDict == null
            "
            v-show="currentDict && !currentDict.tenantCommon"
            @click="onRefreshCacheData"
          >
            同步缓存
          </el-button>
          <el-button
            type="primary"
            :size="layoutStore.defaultFormItemSize"
            v-show="currentDict && !currentDict.tenantCommon"
            :disabled="
              !checkPermCodeExist('formSysDict:fragmentSysDict:add') || currentDict == null
            "
            @click="onAddDictData"
          >
            添加数据
          </el-button>
        </template>
        <vxe-column title="ID">
          <template v-slot="scope">
            <span class="vxe-cell--label">{{ scope.row.itemId || scope.row.id }}</span>
          </template>
        </vxe-column>
        <vxe-column title="字典名称" field="name">
          <template v-slot="scope">
            <span class="vxe-cell--label">{{ scope.row.name }}</span>
            <el-tag
              v-if="scope.row.dirty"
              :size="layoutStore.defaultFormItemSize"
              effect="dark"
              type="warning"
              style="margin-left: 15px"
            >
              缓存失效
            </el-tag>
          </template>
        </vxe-column>
        <vxe-column title="启用" v-if="dictType === 'code'">
          <template v-slot="scope">
            <el-switch
              size="default"
              v-model="scope.row.status"
              :active-value="0"
              :inactive-value="1"
              :disabled="currentDict && (currentDict || {}).tenantCommon"
              @change="onDictDataStatusChange(scope.row)"
            />
          </template>
        </vxe-column>
        <vxe-column title="操作" width="100px" v-if="currentDict && !currentDict.tenantCommon">
          <template v-slot="scope">
            <el-button
              type="primary"
              link
              :size="layoutStore.defaultFormItemSize"
              :disabled="!checkPermCodeExist('formSysDict:fragmentSysDict:update')"
              @click="onUpdateDictDataClick(scope.row)"
              >编辑</el-button
            >
            <el-button
              link
              type="danger"
              :size="layoutStore.defaultFormItemSize"
              :disabled="!checkPermCodeExist('formSysDict:fragmentSysDict:delete')"
              @click="onDeleteDictDataClick(scope.row)"
              >删除</el-button
            >
          </template>
        </vxe-column>
      </table-box>
    </el-main>
  </el-container>
</template>

<script lang="ts">
export default {
  name: 'formDictManagement',
};
</script>

<script setup lang="ts">
import { Delete, Search, Edit } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { usePermissions } from '@/common/hooks/usePermission';
import { DictionaryController, SysGlobalDictController } from '@/api/system';
import { ANY_OBJECT } from '@/types/generic';
import FormEditGlobalDict from '@/pages/upms/formEditGlobalDict/index.vue';
import FormEditDictData from '@/pages/upms/formEditDictData/index.vue';
import { treeDataTranslate } from '@/common/utils';
import { useLayoutStore } from '@/store';
import { useDialog } from '@/components/Dialog/useDialog';

const Dialog = useDialog();
const layoutStore = useLayoutStore();
const mainContextHeight = inject('mainContextHeight', 200);
const { checkPermCodeExist } = usePermissions();

const dictListTree = ref();
// 字典表字典
const dictList = ref<ANY_OBJECT[]>([
  {
    keyName: 'materialEdition',
    variableName: 'materialEdition',
    name: '教材版本',
    nameKey: 'editionName',
    idKey: 'editionId',
    deletedKey: 'editionIds',
    parentKey: '',
    treeFlag: false,
    listApi: DictionaryController.dictMaterialEditionAll,
    addApi: DictionaryController.dictAddMaterialEdition,
    deleteApi: DictionaryController.dictDeleteMaterialEdition,
    updateApi: DictionaryController.dictUpdateMaterialEdition,
    reloadCachedDataApi: DictionaryController.dictReloadMaterialEditionCachedData,
  },
]);
// 全局编码字典
const globalDictList = ref<ANY_OBJECT[]>([]);
const dictType = ref('code');
const dirtyCount = ref(0);
const currentDict = ref();
const currentDictDataList = ref<ANY_OBJECT[]>([]);
const filter = reactive({
  dictName: undefined,
});

const getCurrentDictData = computed(() => {
  return currentDictDataList.value || [];
});
const currentDictList = computed(() => {
  let tempList = dictType.value == 'table' ? dictList.value : globalDictList.value;
  return tempList.filter(item => {
    if (!filter.dictName) return true;
    return (item.name || '').indexOf(filter.dictName) !== -1;
  });
});

// 切换编码字典数据启用状态
const onDictDataStatusChange = (row: ANY_OBJECT) => {
  SysGlobalDictController.updateItemStatus({
    id: row.id,
    status: row.status,
  })
    .then(() => {
      updateDictData();
    })
    .catch(e => {
      console.warn(e);
    });
};

// 获取字典数据
const updateDictData = () => {
  currentDictDataList.value = [];
  dirtyCount.value = 0;
  if (currentDict.value && currentDict.value.listApi) {
    currentDict.value
      .listApi({
        dictCode: currentDict.value.dictCode,
      })
      .then((res: ANY_OBJECT) => {
        let cachedMap: Map<ANY_OBJECT, ANY_OBJECT> | null = new Map();
        if (Array.isArray(res.data.cachedResultList)) {
          res.data.cachedResultList.forEach((item: ANY_OBJECT) => {
            cachedMap?.set(item.id, item);
          });
        }
        if (Array.isArray(res.data.fullResultList)) {
          res.data.fullResultList.forEach((item: ANY_OBJECT) => {
            let cachedItem = cachedMap?.get(item.id);
            if (cachedItem == null || cachedItem.name !== item.name) {
              item.dirty = true;
              dirtyCount.value++;
            }
          });
        }
        cachedMap = null;
        if (currentDict.value.treeFlag) {
          currentDictDataList.value = treeDataTranslate(res.data.fullResultList, 'id', 'parentId');
        } else {
          currentDictDataList.value = res.data.fullResultList.map((item: ANY_OBJECT) => {
            return { ...item };
          });
        }
      })
      .catch((e: Error) => {
        console.warn(e);
      });
  }
};

// 选中字典切换
const onDictChange = (data: ANY_OBJECT) => {
  if (currentDict.value == data) return;
  currentDictDataList.value = [];
  currentDict.value = data;

  if (currentDict.value != null) {
    nextTick(() => {
      dictListTree.value.setCurrentKey(currentDict.value.keyName);
    });
    updateDictData();
  }
};

const tableRowStyle = ({ row }: { row: ANY_OBJECT; rowIndex: number }) => {
  if (row.dirty) {
    return {
      background: '#FFE1E1',
    };
  }
};

// 获取编码字典列表
const loadGlobalDictList = () => {
  return new Promise((resolve, reject) => {
    SysGlobalDictController.list({})
      .then(res => {
        let cDict = null; // 当前选中字典
        globalDictList.value = (res.data.dataList || []).map(item => {
          let temp = {
            ...item,
            keyName: item.dictCode,
            variableName: 'globalDictItem',
            dictCode: item.dictCode,
            name: item.dictName,
            nameKey: 'itemName',
            idKey: 'itemId',
            deletedKey: 'itemIds',
            parentKey: '',
            treeFlag: false,
            listApi: SysGlobalDictController.listAll,
            addApi: SysGlobalDictController.addItem,
            deleteApi: SysGlobalDictController.deleteItem,
            updateApi: SysGlobalDictController.updateItem,
            reloadCachedDataApi: SysGlobalDictController.reloadCachedData,
          };
          if (temp.dictCode === (currentDict.value || {}).dictCode) {
            cDict = temp;
          }
          return temp;
        });
        // 默认选中第一个字典
        if (cDict == null) cDict = globalDictList.value[0];
        if (cDict != null && dictType.value == 'code') {
          onDictChange(cDict);
        }
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};
const onDictTypeClick = (type: string) => {
  dictType.value = type;
  setTimeout(() => {
    onDictChange(currentDictList.value[0]);
  }, 30);
};

// 编辑、新建编码字典
const onEditGlobalDict = (row: ANY_OBJECT | null) => {
  Dialog.show(
    row ? '编辑编码字典' : '新建编码字典',
    FormEditGlobalDict,
    {
      area: ['600px'],
    },
    {
      rowData: row,
    },
  )
    .then(() => {
      loadGlobalDictList().catch(e => {
        console.warn(e);
      });
    })
    .catch(e => {
      console.warn(e);
    });
};
// 删除编码字典
const onDeleteGlobalDict = (row: ANY_OBJECT) => {
  let params = {
    dictId: row.dictId,
  };

  ElMessageBox.confirm(`是否删除编码字典【${row.name}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      return SysGlobalDictController.delete(params);
    })
    .then(() => {
      ElMessage.success('删除成功');
      loadGlobalDictList().catch(e => {
        console.warn(e);
      });
    })
    .catch(e => {
      console.warn(e);
    });
};
const onRefreshCacheData = () => {
  ElMessageBox.confirm('是否同步缓存？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      return currentDict.value.reloadCachedDataApi({
        dictCode: currentDict.value.dictCode,
      });
    })
    .then(() => {
      ElMessage.success('同步成功');
      updateDictData();
    })
    .catch(e => {
      console.warn(e);
    });
};
const onAddDictData = () => {
  Dialog.show(
    `新建字典数据 - [${currentDict.value.name}]`,
    FormEditDictData,
    {
      area: '500px',
    },
    {
      dictInfo: currentDict.value,
      dictData: currentDict.value.treeFlag ? currentDictDataList.value : [],
    },
  )
    .then(() => {
      updateDictData();
    })
    .catch(e => {
      console.warn(e);
    });
};
const onUpdateDictDataClick = (row: ANY_OBJECT) => {
  Dialog.show(
    `编辑字典数据 - [${currentDict.value.name}]`,
    FormEditDictData,
    {
      area: '500px',
    },
    {
      dictInfo: currentDict.value,
      currentData: row,
      dictData: currentDict.value.treeFlag ? currentDictDataList.value : [],
    },
  )
    .then(() => {
      updateDictData();
    })
    .catch(e => {
      console.warn(e);
    });
};
const onDeleteDictDataClick = (row: ANY_OBJECT) => {
  ElMessageBox.confirm(`是否删除字典数据【${row.name}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {} as ANY_OBJECT;
      if (dictType.value === 'code') {
        params.dictCode = currentDict.value.dictCode;
        params.id = row.id;
      } else {
        params[currentDict.value.idKey] = row.id;
      }
      return currentDict.value.deleteApi(params);
    })
    .then(() => {
      ElMessage.success('删除成功');
      updateDictData();
    })
    .catch(e => {
      console.warn(e);
    });
};

onMounted(() => {
  loadGlobalDictList()
    .then(() => {
      onDictChange(currentDictList.value[0]);
    })
    .catch(e => {
      console.warn(e);
    });
});
</script>

<style lang="scss" scoped>
.el-main {
  display: flex;
  flex-direction: column;
}
.form-dict-management :deep(.el-tree-node__content) {
  height: 35px;
}
.form-dict-management :deep(.el-tree-node__content .is-leaf) {
  display: none;
}
.module-node-item {
  width: 100%;
  height: 35px;
  line-height: 35px;
}
.el-dropdown {
  cursor: pointer;
}
.base-card-header {
  height: auto !important;
}

.el-tree {
  padding: 0 15px;
  span {
    color: #333;
  }
}
.el-tree :deep(.is-current) {
  span {
    color: $color-primary;
  }
  .el-button--text i {
    color: $color-primary;
  }
}
.el-dropdown-menu :deep(.active) {
  position: relative;
  color: #fff;
  background-color: $color-primary;
}
.filter-popover {
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    li {
      position: relative;
      height: 32px;
      padding-left: 12px;
      font-size: 12px;
      line-height: 32px;
      cursor: pointer;
      &.actvie,
      &:hover {
        color: $color-primary;
      }
      &.actvie::before {
        position: absolute;
        top: 14px;
        left: 1px;
        display: block;
        width: 4px;
        height: 4px;
        background-color: $color-primary;
        border-radius: 50%;
        content: '';
      }
    }
  }
}
.custom-tag {
  color: $color-primary !important;
  background-color: transparent;
  border: 1px solid $color-primary !important;
}
</style>

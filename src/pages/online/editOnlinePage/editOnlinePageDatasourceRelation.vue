<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="formEditOnlinePageDatasourceRelation"
      :model="formData"
      class="full-width-input form-box"
      :rules="rules"
      style="width: 100%"
      label-width="100px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="关联名称" prop="relationName">
            <el-input class="input-item" v-model="formData.relationName" :clearable="true" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="关联标识" prop="variableName">
            <el-input class="input-item" v-model="formData.variableName" :clearable="true" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="关联类型">
            <el-select
              class="input-item"
              v-model="formData.relationType"
              placeholder="关联类型"
              :disabled="isEdit"
            >
              <el-option
                v-for="item in SysOnlineRelationType.getList()"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="关联主表">
            <el-input
              :value="
                dialogParams.dblinkInfo.dblinkName +
                ' / ' +
                dialogParams.datasource.masterTableIdDictMap.name
              "
              readonly
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="主表关联字段" prop="masterColumnId">
            <el-select
              class="input-item"
              v-model="formData.masterColumnId"
              :clearable="true"
              filterable
              placeholder="主表关联字段"
              :loading="masterColumnIdWidget.loading"
              @visible-change="masterColumnIdWidget.onVisibleChange"
            >
              <el-option
                v-for="item in masterColumnIdWidget.dropdownList"
                :key="item.columnId"
                :value="item.columnId"
                :label="item.columnName"
              >
                <el-row type="flex" justify="space-between">
                  <span>{{ item.columnName }}</span>
                  <span style="margin-left: 30px">{{ item.columnComment }}</span>
                </el-row>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="关联从表" prop="slaveTableId">
            <el-select
              class="input-item"
              v-model="formData.slaveTableId"
              :clearable="true"
              filterable
              placeholder="关联从表"
              :loading="slaveTableIdWidget.loading"
              :disabled="isEdit"
              @visible-change="slaveTableIdWidget.onVisibleChange"
              @change="onSlaveTableChange"
            >
              <el-option
                v-for="item in slaveTableIdWidget.dropdownList"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="从表关联字段" prop="slaveColumnId">
            <el-select
              class="input-item"
              v-model="formData.slaveColumnId"
              :clearable="true"
              filterable
              placeholder="关联从表"
              :loading="slaveColumnIdWidget.loading"
              @visible-change="slaveColumnIdWidget.onVisibleChange"
            >
              <el-option
                v-for="item in slaveColumnIdWidget.dropdownList"
                :key="item.columnId"
                :value="item.columnId"
                :label="item.columnName"
              >
                <span>{{ item.columnName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="是否级联删除">
            <el-switch v-model="formData.cascadeDelete" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="是否左连接">
            <el-switch
              v-model="formData.leftJoin"
              :disabled="formData.relationType === SysOnlineRelationType.ONE_TO_MANY"
            />
            <span
              class="warning-text"
              style="margin-left: 16px"
              v-if="formData.relationType === SysOnlineRelationType.ONE_TO_MANY"
            >
              一对多关联只能为左链接
            </span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="menu-box">
      <el-col :span="24">
        <el-row class="no-scroll flex-box" type="flex" justify="end">
          <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
          <el-button type="primary" :size="formItemSize" @click="onSubmit"> 保存 </el-button>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { findItemFromList } from '@/common/utils';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import {
  OnlineDatasourceRelationController,
  OnlineDblinkController,
  OnlineColumnController,
} from '@/api/online';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import {
  SysOnlinePageDatasourceFieldStatus,
  SysOnlineRelationType,
} from '@/common/staticDict/online';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  datasource?: ANY_OBJECT;
  dblinkInfo?: ANY_OBJECT;
  relationId?: string;
  usedTableNameList?: ANY_OBJECT[];
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<boolean>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const formEditOnlinePageDatasourceRelation = ref();

// 编辑状态下老的关联从表表名
const oldSlaveTableName = ref<string>();
const formData = ref<ANY_OBJECT>({
  relationId: undefined,
  relationName: undefined,
  relationType: SysOnlineRelationType.ONE_TO_ONE,
  variableName: undefined,
  masterColumnId: undefined,
  slaveTableId: undefined,
  slaveColumnId: undefined,
  cascadeDelete: false,
  leftJoin: false,
});

const dialogParams = computed(() => {
  return {
    datasource: props.datasource || thirdParams.value.datasource,
    dblinkInfo: props.dblinkInfo || thirdParams.value.dblinkInfo,
    relationId: props.relationId || thirdParams.value.relationId,
    usedTableNameList: props.usedTableNameList || thirdParams.value.usedTableNameList,
  };
});
const isEdit = computed(() => {
  return !!dialogParams.value.relationId;
});
const getValidTableList = computed<ANY_OBJECT[]>(() => {
  return dialogParams.value.datasource.validTableList;
});

/**
 * 获取在线表单导入表字段列表
 */
const loadOnlineTableColumns = (tableId: string | null) => {
  return new Promise<ANY_OBJECT[]>((resolve, reject) => {
    if (tableId == null) {
      resolve([]);
      return;
    }
    let params = {
      onlineColumnDtoFilter: {
        tableId: tableId,
      },
    };
    OnlineColumnController.list(params)
      .then(res => {
        resolve(res.data.dataList);
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 获取主表关联字段列表
 */
const loadMasterColumnDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    loadOnlineTableColumns(dialogParams.value.datasource.masterTableId)
      .then(res => {
        resolve({ dataList: res });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const dropdownMasterColumnIdOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadMasterColumnDropdownList,
  isTree: false,
};
// 主表关联字段
const masterColumnIdWidget = ref(useDropdown(dropdownMasterColumnIdOptions));
/**
 * 获取从表下拉表列表
 */
const loadSlaveTableDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return Promise.resolve({
    dataList: getValidTableList.value.filter(item => {
      // 可选从表为未使用的数据表
      return (
        (oldSlaveTableName.value != null && oldSlaveTableName.value === item.name) ||
        (item.name !== dialogParams.value.datasource.masterTableIdDictMap.name &&
          (dialogParams.value.usedTableNameList == null ||
            dialogParams.value.usedTableNameList.indexOf(item.name) === -1))
      );
    }),
  });
};
const dropdownSlaveTableIdOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadSlaveTableDropdownList,
  isTree: false,
};
// 关联从表
const slaveTableIdWidget = ref(useDropdown(dropdownSlaveTableIdOptions));
/**
 * 获取数据库表字段列表
 */
const loadDblinkTableColumns = (dblinkId: string, tableName: string) => {
  return new Promise<ANY_OBJECT[]>((resolve, reject) => {
    let params = {
      dblinkId: dblinkId,
      tableName: tableName,
    };
    OnlineDblinkController.listDblinkTableColumns(params)
      .then(res => {
        resolve(res.data);
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 获取从表关联字段列表
 */
const loadSlaveColumnDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    // 获取从表信息
    let slaveTable: ANY_OBJECT | null = findItemFromList(
      dialogParams.value.datasource.validTableList,
      formData.value.slaveTableId,
      'id',
    );
    if (slaveTable == null) {
      reject();
      return;
    }
    if (slaveTable.status === SysOnlinePageDatasourceFieldStatus.USED) {
      // 从导入数据表中获取数据表字段列表
      loadOnlineTableColumns(slaveTable.id)
        .then(res => {
          resolve({ dataList: res });
        })
        .catch(e => {
          reject(e);
        });
    } else {
      // 从数据库中获取数据表字段列表
      loadDblinkTableColumns(dialogParams.value.datasource.dblinkId, slaveTable.id)
        .then(res => {
          res.forEach(item => {
            item.columnId = item.columnName;
          });
          resolve({ dataList: res });
        })
        .catch(e => {
          reject(e);
        });
    }
  });
};
const dropdownSlaveColumnIdOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadSlaveColumnDropdownList,
  isTree: false,
};
// 从表关联字段
const slaveColumnIdWidget = ref(useDropdown(dropdownSlaveColumnIdOptions));
const rules: ANY_OBJECT = {
  relationName: [{ required: true, message: '请输入关联名称', trigger: 'blur' }],
  variableName: [
    { required: true, message: '请输入关联标识', trigger: 'blur' },
    {
      type: 'string',
      pattern: /^[a-z][a-zA-Z_]+$/,
      message: '数据源标识必须是小驼峰或者下划线命名',
      trigger: 'blur',
    },
  ],
};

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};
const onSubmit = () => {
  formEditOnlinePageDatasourceRelation.value.validate((valid: boolean) => {
    if (!valid) return;
    let params = {
      onlineDatasourceRelationDto: {
        datasourceId: dialogParams.value.datasource.datasourceId,
        relationId: formData.value.relationId,
        relationName: formData.value.relationName,
        relationType: formData.value.relationType,
        variableName: formData.value.variableName,
        masterColumnId: formData.value.masterColumnId,
        slaveTableId: isEdit.value ? formData.value.slaveTableId : undefined,
        slaveTableName: isEdit.value ? undefined : formData.value.slaveTableId,
        slaveColumnId: isEdit.value ? formData.value.slaveColumnId : undefined,
        slaveColumnName: isEdit.value ? undefined : formData.value.slaveColumnId,
        cascadeDelete: formData.value.cascadeDelete,
        leftJoin: formData.value.leftJoin,
      },
    };

    let httpCall = isEdit.value
      ? OnlineDatasourceRelationController.update(params)
      : OnlineDatasourceRelationController.add(params);
    httpCall
      .then(() => {
        ElMessage.success('保存成功');
        if (props.dialog) {
          props.dialog.submit(true);
        } else {
          onCloseThirdDialog(true);
        }
      })
      .catch(e => {
        console.warn(e);
      });
  });
};

/**
 * 从表改变，清空从表关联字段选中
 */
const onSlaveTableChange = () => {
  formData.value.slaveColumnId = null;
  slaveColumnIdWidget.value.refresh();
  formData.value.leftJoin = false;
  formData.value.cascadeDelete = false;
};

const buildRelationVariableName = () => {
  if (formData.value.variableName == null || formData.value.variableName === '') {
    let masterColumn = findItemFromList(
      masterColumnIdWidget.value.dropdownList,
      formData.value.masterColumnId,
      'columnId',
    );
    let slaveTable = findItemFromList(
      slaveTableIdWidget.value.dropdownList,
      formData.value.slaveTableId,
      'id',
    );
    let slaveColumn = findItemFromList(
      slaveColumnIdWidget.value.dropdownList,
      formData.value.slaveColumnId,
      'columnId',
    );
    if (masterColumn && slaveTable && slaveColumn) {
      formData.value.variableName =
        masterColumn.columnName + '_' + slaveTable.name + '_' + slaveColumn.columnName;
    }
  }
};

watch(
  () => formData.value.slaveColumnId,
  () => {
    buildRelationVariableName();
  },
);

onMounted(() => {
  if (isEdit.value) {
    OnlineDatasourceRelationController.view({
      relationId: dialogParams.value.relationId,
    })
      .then(res => {
        oldSlaveTableName.value = res.data.slaveTable.tableName;
        formData.value = {
          ...res.data,
        };
        masterColumnIdWidget.value.onVisibleChange(true);
        slaveTableIdWidget.value.onVisibleChange(true);
        slaveColumnIdWidget.value.onVisibleChange(true);
      })
      .catch(e => {
        console.warn(e);
      });
  }
});
</script>

<style scoped>
.warning-text {
  color: #f56c6c;
  font-size: 12px;
  font-weight: 700;
}
</style>

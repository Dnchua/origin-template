<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="form"
      :model="formOnlineDict"
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
          <el-form-item label="字典名称" prop="dictName">
            <el-input
              class="input-item"
              v-model="formOnlineDict.dictName"
              :clearable="true"
              placeholder="字典名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="字典类型" prop="dictType">
            <el-select
              class="input-item"
              v-model="formOnlineDict.dictType"
              :clearable="true"
              :disabled="isEdit"
              placeholder="字典类型"
              :loading="dictTypeWidget.loading"
              @visible-change="dictTypeWidget.onVisibleChange"
              @change="onDictTypeChange"
            >
              <el-option
                v-for="item in dictTypeWidget.dropdownList"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 静态字典选择 -->
        <el-col :span="24" v-if="formOnlineDict.dictType == SysOnlineDictType.STATIC">
          <el-form-item label="字典选择" prop="staticDictName">
            <el-select
              class="input-item"
              v-model="formOnlineDict.staticDictName"
              :clearable="true"
              filterable
              placeholder="字典类型"
              :loading="staticDictWidget.loading"
              @visible-change="staticDictWidget.onVisibleChange"
              @change="onStaiicDictChange"
            >
              <el-option
                v-for="item in staticDictWidget.dropdownList"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 数据表字典，选择数据表 -->
        <el-col :span="24" v-if="formOnlineDict.dictType == SysOnlineDictType.TABLE">
          <el-form-item label="数据库" prop="dblinkId">
            <el-select
              class="input-item"
              v-model="formOnlineDict.dblinkId"
              :clearable="true"
              placeholder="数据表所属数据库"
              :loading="dblinkIdWidget.loading"
              @visible-change="dblinkIdWidget.onVisibleChange"
              @change="onDblinkChange"
            >
              <el-option
                v-for="item in dblinkIdWidget.dropdownList"
                :key="item.dblinkId"
                :value="item.dblinkId"
                :label="item.dblinkName"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType == SysOnlineDictType.TABLE">
          <el-form-item label="数据表" prop="tableName">
            <el-select
              class="input-item"
              v-model="formOnlineDict.tableName"
              :clearable="true"
              placeholder="选择字典数据表"
              :loading="tableNameWidget.loading"
              filterable
              @visible-change="tableNameWidget.onVisibleChange"
              @change="onDictTableChange"
            >
              <el-option
                v-for="item in tableNameWidget.dropdownList"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- URL字典，输入字典获取url -->
        <el-col :span="24" v-if="formOnlineDict.dictType == SysOnlineDictType.URL">
          <el-form-item label="字典URL" prop="dictListUrl">
            <el-input
              class="input-item"
              v-model="formOnlineDict.dictListUrl"
              :clearable="true"
              placeholder="输入字典获取的Get请求URL"
              @change="clearDictInfo"
            >
              <template v-slot:append>
                <el-button :size="formItemSize" @click="onGetDictData(true)">获取数据</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          style="height: 47px"
          v-if="
            formOnlineDict.dictType == SysOnlineDictType.URL ||
            formOnlineDict.dictType == SysOnlineDictType.TABLE
          "
        >
          <el-form-item label="树状字典">
            <el-switch v-model="formOnlineDict.treeFlag" />
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          v-if="
            formOnlineDict.treeFlag &&
            (formOnlineDict.dictType == SysOnlineDictType.URL ||
              formOnlineDict.dictType == SysOnlineDictType.TABLE)
          "
        >
          <el-form-item label="字典父字段">
            <el-select
              v-model="formOnlineDict.parentKeyColumnName"
              clearable
              placeholder="选择字典父字段"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="column in dictColumnList"
                :key="column"
                :label="column"
                :value="column"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          v-if="
            formOnlineDict.dictType == SysOnlineDictType.URL ||
            formOnlineDict.dictType == SysOnlineDictType.TABLE
          "
        >
          <el-form-item label="字典键字段" prop="keyColumnName">
            <el-select
              v-model="formOnlineDict.keyColumnName"
              clearable
              placeholder="选择字典键字段"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="column in dictColumnList"
                :key="column"
                :label="column"
                :value="column"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          v-if="
            formOnlineDict.dictType == SysOnlineDictType.URL ||
            formOnlineDict.dictType == SysOnlineDictType.TABLE
          "
        >
          <el-form-item label="字典值字段" prop="valueColumnName">
            <el-select
              v-model="formOnlineDict.valueColumnName"
              clearable
              placeholder="选择字典值字段"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="column in dictColumnList"
                :key="column"
                :label="column"
                :value="column"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType == SysOnlineDictType.TABLE">
          <el-form-item label="逻辑删除字段">
            <el-select
              v-model="formOnlineDict.deletedColumnName"
              clearable
              placeholder="选择逻辑删除字段"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="column in dictColumnList"
                :key="column"
                :label="column"
                :value="column"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType == SysOnlineDictType.TABLE">
          <el-form-item label="用户过滤字段">
            <el-select
              v-model="formOnlineDict.userFilterColumnName"
              clearable
              placeholder="选择用户过滤字段，用于数据权限用户过滤"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="column in dictColumnList"
                :key="column"
                :label="column"
                :value="column"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType == SysOnlineDictType.TABLE">
          <el-form-item label="部门过滤字段">
            <el-select
              v-model="formOnlineDict.deptFilterColumnName"
              clearable
              placeholder="选择部门过滤字段，用于数据权限部门过滤"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="column in dictColumnList"
                :key="column"
                :label="column"
                :value="column"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 字典参数 -->
        <el-col
          :span="24"
          v-if="
            formOnlineDict.dictType == SysOnlineDictType.URL ||
            formOnlineDict.dictType == SysOnlineDictType.TABLE
          "
        >
          <el-form-item label="字典参数">
            <el-select
              v-model="dictParamList"
              placeholder="请添加字典获取参数"
              multiple
              filterable
              allow-create
              default-first-option
            >
              <el-option v-for="item in dictColumnList" :key="item" :value="item" :label="item">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 字典数据 -->
        <el-col
          :span="24"
          v-if="
            formOnlineDict.dictType == SysOnlineDictType.STATIC ||
            formOnlineDict.dictType == SysOnlineDictType.CUSTOM
          "
        >
          <vxe-table
            :data="dictData"
            :size="formItemSize"
            :row-config="{ isHover: true }"
            header-cell-class-name="table-header-gray"
            height="300px"
          >
            <vxe-column title="字典键数据" field="id" />
            <vxe-column title="字典值数据" field="name" />
            <vxe-column
              title="操作"
              width="100px"
              fixed="right"
              align="right"
              v-if="formOnlineDict.dictType == SysOnlineDictType.CUSTOM"
            >
              <template v-slot:header>
                <el-row justify="end" align="middle">
                  <EditDictDataButton width="200px" btnText="新建" @save="onAddDictData" />
                </el-row>
              </template>
              <template v-slot="scope">
                <EditDictDataButton
                  width="200px"
                  :value="scope.row"
                  btnText="编辑"
                  @save="onEditDictData"
                />
                <el-button
                  style="padding: 0; margin-left: 10px"
                  :size="formItemSize"
                  type="danger"
                  link
                  @click="onDeleteDictData(scope.row)"
                  >删除</el-button
                >
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
        <!-- 编码字典 -->
        <el-col :span="24" v-if="formOnlineDict.dictType == SysOnlineDictType.CODE">
          <el-form-item label="选择编码字典">
            <el-row :gutter="20" style="width: 100%">
              <el-col :span="21">
                <el-input
                  v-model="filter.dictCode"
                  :clearable="true"
                  placeholder="输入字典编码查询"
                />
              </el-col>
              <el-col :span="3">
                <el-button type="primary" :plain="true" :size="formItemSize" @click="onSearch"
                  >查询</el-button
                >
              </el-col>
            </el-row>
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          v-if="formOnlineDict.dictType == SysOnlineDictType.CODE"
          style="margin-bottom: 15px"
        >
          <el-radio-group class="radio-table" v-model="formOnlineDict.dictCode" style="width: 100%">
            <vxe-table
              ref="table"
              :data="globalDictTableWidget.dataList"
              :row-config="{ isHover: true }"
              :size="formItemSize"
              header-cell-class-name="table-header-gray"
              height="300px"
            >
              <vxe-column title="选择" header-align="center" align="center" width="60px">
                <template v-slot="scope">
                  <el-radio :value="scope.row.dictCode"> </el-radio>
                </template>
              </vxe-column>
              <vxe-column title="字典名称" field="dictName" />
              <vxe-column title="字典编码" field="dictCode" />
              <template v-slot:empty>
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png" />
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
          </el-radio-group>
          <el-row type="flex" justify="end" style="margin-top: 16px">
            <el-pagination
              :total="globalDictTableWidget.totalCount"
              :current-page="globalDictTableWidget.currentPage"
              :page-size="globalDictTableWidget.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, prev, pager, next, sizes"
              @current-change="globalDictTableWidget.onCurrentPageChange"
              @size-change="globalDictTableWidget.onPageSizeChange"
            />
          </el-row>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="menu-box">
      <el-col :span="24" style="margin-top: 15px">
        <el-row class="no-scroll flex-box" type="flex" justify="end">
          <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
          <el-button type="primary" :size="formItemSize" @click="onSaveClick"> 保存 </el-button>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import { VxeTable, VxeColumn } from 'vxe-table';
import { DialogProp } from '@/components/Dialog/types';
import { ANY_OBJECT } from '@/types/generic';
import { OnlineDblinkController, OnlineDictController } from '@/api/online';
import { Dict } from '@/types/online/dict';
import { SysOnlineDictType } from '@/common/staticDict/online';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { findItemFromList } from '@/common/utils';
import { get } from '@/common/http/request';
import { TableInfo } from '@/types/online/table';
import combinedDict from '@/common/staticDict/combined';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
import EditDictDataButton from './EditDictDataButton.vue';
const layoutStore = useLayoutStore();

const StaticDict = { ...combinedDict };

interface IProps extends ThirdProps {
  dictId?: string;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();

const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const form = ref();
const table = ref();

const filter = reactive({
  dictCode: undefined,
});
const dictData = ref<ANY_OBJECT[]>([]);
// 字典字段列表
const dictColumnList = ref<string[]>([]);
// 字典参数列表
const dictParamList = ref([]);
const formOnlineDict = ref({
  dictType: SysOnlineDictType.TABLE,
  treeFlag: false,
} as Dict);
const rules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dblinkId: [
    {
      required: true,
      message: '请选择字典数据表所属数据库',
      trigger: 'blur',
    },
  ],
  tableName: [{ required: true, message: '请选择字典数据表', trigger: 'blur' }],
  dictListUrl: [{ required: true, message: '请输入字典数据获取URL', trigger: 'blur' }],
  staticDictName: [{ required: true, message: '请选择静态字典', trigger: 'blur' }],
  keyColumnName: [{ required: true, message: '请输入字典键字段名称', trigger: 'blur' }],
  valueColumnName: [{ required: true, message: '请输入字典值字段名称', trigger: 'blur' }],
};

const loadDblinkWidgetDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    OnlineDblinkController.list({})
      .then(res => {
        return resolve({ dataList: res.data.dataList });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const dropdownDBLinkIdOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadDblinkWidgetDropdownList,
};
// 数据表所属数据库
const dblinkIdWidget = reactive(useDropdown(dropdownDBLinkIdOptions));

const loadTableNameWidgetDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    if (!formOnlineDict.value.dblinkId) {
      reject('请选择数据表所属数据库');
      return;
    }
    OnlineDblinkController.listDblinkTables({
      dblinkId: formOnlineDict.value.dblinkId,
    })
      .then(res => {
        resolve({
          dataList: res.data.map((item: TableInfo) => {
            return {
              id: item.tableName,
              name: item.tableName,
            };
          }),
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const dropdownTableNameOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadTableNameWidgetDropdownList,
};
// 字典数据表
const tableNameWidget = reactive(useDropdown(dropdownTableNameOptions));

/**
 * 获取字典类型下拉列表
 */
const loadDictTypeWidgetDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return Promise.resolve({ dataList: SysOnlineDictType.getList() });
};
const dropdownDictTypeOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadDictTypeWidgetDropdownList,
};
// 字典类型
const dictTypeWidget = reactive(useDropdown(dropdownDictTypeOptions));

/**
 * 获取静态字典下拉列表
 */
const loadStaticDictWidgetDropdownList = () => {
  const dicts = [];
  for (const [key, dict] of Object.entries(StaticDict)) {
    dicts.push({ id: key, name: dict.showName });
  }
  return Promise.resolve({ dataList: dicts });
};
const dropdownDictOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadStaticDictWidgetDropdownList,
};
// 静态字典下拉选择
const staticDictWidget = reactive(useDropdown(dropdownDictOptions));

const loadGlobalDictList = (params: ANY_OBJECT): Promise<TableData<ANY_OBJECT>> => {
  if (params == null) params = {};
  params = {
    ...params,
    globalDictDtoFilter: {
      dictCode: filter.dictCode == '' ? undefined : filter.dictCode,
    },
  };

  return new Promise((resolve, reject) => {
    OnlineDictController.listAllGlobalDict(params)
      .then(res => {
        if (Array.isArray(res.data.dataList) && formOnlineDict.value.dictCode) {
          let currentRow = findItemFromList(
            res.data.dataList,
            formOnlineDict.value.dictCode,
            'dictCode',
          );
          if (currentRow) {
            table.value.setCurrentRow({ ...currentRow });
          }
        }
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
const loadGlobalDictListVerify = () => {
  return true;
};
const tableOptions: TableOptions<Dict> = {
  loadTableData: loadGlobalDictList,
  verifyTableParameter: loadGlobalDictListVerify,
  paged: true,
};
const globalDictTableWidget = reactive(useTable(tableOptions));

const onSearch = () => {
  formOnlineDict.value.dictCode = undefined;
  onSearchGlobalDict();
};
const onSearchGlobalDict = () => {
  globalDictTableWidget.refreshTable(true, 1);
};
/**
 * 字典数据
 */
const onAddDictData = (data: ANY_OBJECT) => {
  if (data) dictData.value.push(data);
};

const finalDictId = computed(() => {
  return props.dictId || thirdParams.value.dictId;
});
const isEdit = computed(() => {
  return !!finalDictId.value;
});
const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    // 关闭第三方弹窗
    onCloseThirdDialog();
  }
};

// TODO 测试不同的类型
/**
 * 保存字典信息
 */
const onSaveClick = () => {
  form.value.validate((valid: boolean) => {
    if (valid) {
      let params = {
        onlineDictDto: {
          ...formOnlineDict.value,
          dblinkId: formOnlineDict.value.dblinkId,
          dictDataJson: JSON.stringify({
            staticDictName:
              formOnlineDict.value.dictType == SysOnlineDictType.STATIC
                ? formOnlineDict.value.staticDictName
                : undefined,
            dictData:
              formOnlineDict.value.dictType == SysOnlineDictType.CUSTOM
                ? dictData.value
                : undefined,
            paramList: dictParamList.value.map(item => {
              return {
                dictParamName: item,
              };
            }),
          }),
        },
      };

      let httpCall = isEdit.value
        ? OnlineDictController.update(params)
        : OnlineDictController.add(params);
      httpCall
        .then(res => {
          ElMessage.success('保存成功');
          if (props.dialog) {
            props.dialog.submit(res);
          } else {
            onCloseThirdDialog();
          }
        })
        .catch(e => {
          console.warn(e);
          onCancel();
        });
    }
  });
};

/**
 * 清空字典信息
 */
const clearDictInfo = () => {
  formOnlineDict.value.parentKeyColumnName = undefined;
  formOnlineDict.value.keyColumnName = undefined;
  formOnlineDict.value.valueColumnName = undefined;
  formOnlineDict.value.staticDictName = undefined;
  dictParamList.value = [];
  dictData.value = [];
};
const onEditDictData = (newValue: ANY_OBJECT, oldValue: ANY_OBJECT | undefined) => {
  if (newValue && oldValue) {
    dictData.value = dictData.value.map((item: ANY_OBJECT) => {
      return item.id == oldValue.id ? newValue : item;
    });
  }
};
const onDeleteDictData = (row: ANY_OBJECT) => {
  if (row != null) {
    dictData.value = dictData.value.filter((item: ANY_OBJECT) => {
      return item.id !== row.id;
    });
  }
};
const onDblinkChange = () => {
  clearDictInfo();
  tableNameWidget.setDirty(true);
  formOnlineDict.value.tableName = undefined;
};

/**
 * 选择字典数据表
 */
const onDictTableChange = (value: string) => {
  formOnlineDict.value.tableName = value;
  if (formOnlineDict.value.tableName != null) {
    loadTableColumnList();
  }
};

const loadTableColumnList = () => {
  let params = {
    dblinkId: formOnlineDict.value.dblinkId,
    tableName: formOnlineDict.value.tableName,
  };
  dictColumnList.value = [];
  OnlineDblinkController.listDblinkTableColumns(params)
    .then(res => {
      dictColumnList.value = res.data.map(item => {
        return item.columnName;
      });
    })
    .catch(e => {
      console.warn(e);
    });
};
const onDictTypeChange = () => {
  clearDictInfo();
  formOnlineDict.value.dictListUrl = undefined;
  formOnlineDict.value.tableName = undefined;
  formOnlineDict.value.dblinkId = undefined;
  dictColumnList.value = [];
  if (formOnlineDict.value.dictType == SysOnlineDictType.CODE) {
    onSearch();
  }
};
const onStaiicDictChange = () => {
  dictData.value = [];
  if (formOnlineDict.value.staticDictName) {
    const dicts = StaticDict as ANY_OBJECT;
    let staticDict = dicts[formOnlineDict.value.staticDictName];
    if (staticDict != null) {
      dictData.value = staticDict.getList();
    }
  }
};
/**
 * 获取字典数据
 */
const onGetDictData = (showWarning = false) => {
  let url = formOnlineDict.value.dictListUrl;
  if (url == null || url == '') {
    ElMessage.error('请输入字典数据获取URL');
    return;
  }
  dictColumnList.value = [];
  get(url, {})
    .then(res => {
      if (showWarning) {
        ElMessage.success('获取字典数据成功！');
      }
      if (Array.isArray(res.data) && res.data.length > 0) {
        let dictDataItem = res.data[0];
        dictColumnList.value = Object.keys(dictDataItem);
      }
    })
    .catch(e => {
      console.warn(e);
    });
};

onMounted(() => {
  // 获取字典类型下拉列表数据
  dictTypeWidget.onVisibleChange(true);
  // 编辑状态下获取字典参数列表
  if (isEdit.value) {
    OnlineDictController.view({
      dictId: finalDictId.value,
    })
      .then(res => {
        formOnlineDict.value = {
          ...res.data,
        };
        // 解析字典参数信息
        formOnlineDict.value.dictDataJson = undefined;
        let dataJson = null;
        if (res.data.dictDataJson) {
          dataJson = JSON.parse(res.data.dictDataJson);
          if (dataJson && Array.isArray(dataJson.paramList)) {
            dictParamList.value = dataJson.paramList.map((item: ANY_OBJECT) => {
              return item.dictParamName;
            });
          }
        }

        // 获取字典字段
        if (formOnlineDict.value.dictType == SysOnlineDictType.TABLE) {
          // 获取下拉数据
          dblinkIdWidget.onVisibleChange(true);
          tableNameWidget.onVisibleChange(true);
          loadTableColumnList();
        } else if (formOnlineDict.value.dictType == SysOnlineDictType.URL) {
          onGetDictData();
        } else if (formOnlineDict.value.dictType == SysOnlineDictType.STATIC) {
          staticDictWidget.onVisibleChange(true);
          if (dataJson) formOnlineDict.value.staticDictName = dataJson.staticDictName;
          const dicts = StaticDict as ANY_OBJECT;
          dictData.value =
            formOnlineDict.value.staticDictName && dicts[formOnlineDict.value.staticDictName]
              ? dicts[formOnlineDict.value.staticDictName].getList()
              : [];
        } else if (formOnlineDict.value.dictType == SysOnlineDictType.CUSTOM) {
          if (dataJson && Array.isArray(dataJson.dictData)) {
            dictData.value = dataJson.dictData;
          }
        } else if (formOnlineDict.value.dictType == SysOnlineDictType.CODE) {
          onSearchGlobalDict();
        }
      })
      .catch(e => {
        console.warn(e);
      });
  }
});
</script>

<style scoped>
.radio-table :deep(.el-radio__label) {
  display: none;
}
</style>

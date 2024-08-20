<template>
  <div class="online-edit-form" style="position: relative; height: 100%; min-height: 200px">
    <template v-if="dialogParams.fullscreen && !dialogParams.isEdit">
      <el-container>
        <el-header style="height: 72px; background: white">
          <el-row
            type="flex"
            align="middle"
            style="justify-content: space-between; width: 100%; height: 100%"
          >
            <div style="display: flex; height: 40px; line-height: 40px">
              <i
                class="header-logo online-icon icon-orange-icon"
                style="font-size: 40px; color: #fda834; background: rgb(255 119 0 / 10%)"
              />
              <span style="font-size: 22px; color: #333; font-weight: bold">橙单</span>
              <el-divider direction="vertical" style="height: 26px; margin: 7px 8px" />
              <span style="font-size: 18px; color: #333; font-weight: bold">{{
                form.formName
              }}</span>
            </div>
            <el-button
              link
              size="default"
              :icon="Close"
              style="font-size: 24px; color: #909399"
              @click="onCancel"
            />
          </el-row>
        </el-header>
        <el-main style="width: 100%; padding: 25px; background: #f9f9f9">
          <el-row
            type="flex"
            justify="center"
            :style="{
              height:
                'calc(100vh - ' +
                (dialogParams.readOnly && (form.operationList || []).length <= 0 ? 122 : 192) +
                'px)',
            }"
          >
            <div
              style="width: 8000px; max-width: 90vw; height: 100%; padding: 15px; background: white"
            >
              <el-scrollbar style="height: 100%" class="custom-scroll">
                <el-form
                  ref="formRef"
                  :model="formData"
                  class="full-width-input"
                  :rules="rules"
                  style="width: 100%"
                  :label-width="(form.labelWidth || 100) + 'px'"
                  :label-position="form.labelPosition || 'right'"
                  :size="layoutStore.defaultFormItemSize"
                  @submit.prevent
                >
                  <OnlineCustomBlock
                    v-show="isReady"
                    ref="root"
                    v-model:value="form.widgetList"
                    height="100%"
                    :isEdit="dialogParams.isEdit"
                    :showBorder="false"
                    @widgetClick="onWidgetClick"
                  />
                </el-form>
              </el-scrollbar>
            </div>
          </el-row>
        </el-main>
        <el-footer
          v-if="!dialogParams.readOnly || (form.operationList || []).length > 0"
          style="background: white"
          height="70px;"
        >
          <el-row type="flex" justify="center" align="middle" style="height: 70px">
            <el-button
              v-for="operation in form.operationList"
              :key="operation.id"
              size="default"
              style="margin-right: 16px"
              :type="operation.btnType"
              :plain="operation.plain"
              @click="onOperationClick(operation)"
            >
              {{ operation.name || SysCustomWidgetOperationType.getValue(operation.type) }}
            </el-button>
            <el-button
              v-if="!dialogParams.readOnly"
              type="primary"
              size="default"
              style="margin-right: 16px"
              @click="onSubmit"
            >
              保存
            </el-button>
            <el-button size="default" :plain="true" @click="onCancel"> 返回 </el-button>
          </el-row>
        </el-footer>
      </el-container>
    </template>
    <template v-else>
      <div class="form-box" :style="{ 'min-height': dialogParams.isEdit ? height : '0px' }">
        <el-scrollbar style="height: 100%" class="custom-scroll">
          <component
            :is="mode === 'pc' ? ElForm : VanForm"
            ref="formRef"
            :model="formData"
            class="full-width-input"
            :rules="rules"
            style="width: 100%"
            :label-width="(form.labelWidth || 100) + 'px'"
            :label-position="form.labelPosition || 'right'"
            :size="layoutStore.defaultFormItemSize"
            @submit.prevent
          >
            <OnlineCustomBlock
              v-show="isReady"
              ref="root"
              v-model:value="form.widgetList"
              @input="onInput"
              :height="height"
              :isEdit="dialogParams.isEdit"
              :showBorder="false"
              @widgetClick="onWidgetClick"
            />
          </component>
        </el-scrollbar>
      </div>
      <el-row v-if="!dialogParams.isEdit" class="menu-box" type="flex" justify="end">
        <el-button
          v-for="operation in form.operationList"
          :key="operation.id"
          :size="layoutStore.defaultFormItemSize"
          :type="operation.btnType"
          :plain="operation.plain"
          @click="onOperationClick(operation)"
        >
          {{ operation.name || SysCustomWidgetOperationType.getValue(operation.type) }}
        </el-button>
        <el-button
          v-if="!dialogParams.readOnly"
          type="primary"
          :size="layoutStore.defaultFormItemSize"
          :plain="true"
          @click="onCancel"
        >
          取消
        </el-button>
        <el-button
          v-if="!dialogParams.readOnly"
          type="primary"
          :size="layoutStore.defaultFormItemSize"
          @click="onSubmit"
        >
          保存
        </el-button>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue';
import { ElForm, ElMessage } from 'element-plus';
import { Form as VanForm } from 'vant';
import { ANY_OBJECT } from '@/types/generic';
import { OnlineFormEventType, SysCustomWidgetOperationType } from '@/common/staticDict';
import {
  SysOnlineColumnFilterType,
  SysOnlineFieldKind,
  SysOnlineRelationType,
} from '@/common/staticDict/online';
import { post, get } from '@/common/http/request';
import { TableData } from '@/common/http/types';
import OnlineCustomBlock from '@/online/components/OnlineCustomBlock.vue';
import { DialogProp } from '@/components/Dialog/types';
import { API_CONTEXT } from '@/api/config';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import widgetData from '@/online/config/index';
import { useLayoutStore, useLoginStore } from '@/store';
import { useDict } from '../../hooks/useDict';
import { useForm } from '../hooks/useForm';
import { useFormExpose } from '../hooks/useFormExpose';

const loginStore = useLoginStore();

interface IProps extends ThirdProps {
  formConfig: ANY_OBJECT;
  height?: string;
  // 主表数据
  masterTableData?: ANY_OBJECT;
  // 是否表单编辑模式
  isEdit?: boolean;
  // 是否复制
  isCopy?: boolean;
  readOnly?: boolean;
  // 当前选中组件
  currentWidget?: ANY_OBJECT | null;
  // 需要编辑数据，如果是null则是新增
  rowData?: ANY_OBJECT;
  // 是否全屏弹窗
  fullscreen?: boolean;
  // 是否保存到数据库
  saveData?: boolean;
  mode?: string;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}

const emit = defineEmits<{
  widgetClick: [ANY_OBJECT | null];
}>();

const props = withDefaults(defineProps<IProps>(), {
  isEdit: false,
  readOnly: false,
  fullscreen: false,
  saveData: true,
  mode: 'pc',
});

const layoutStore = useLayoutStore();
const { onCloseThirdDialog } = useThirdParty(props);

const formRef = ref();

const { getDictDataList } = useDict();
const {
  isReady,
  rules,
  dialogParams,
  form,
  formData,
  masterTable,
  isRelation,
  tableWidgetList,
  richEditWidgetList,
  getWidgetValue,
  getWidgetVisible,
  onValueChange,
  onWidgetValueChange,
  getPrimaryData,
  getDropdownParams,
  checkOperationPermCode,
  checkOperationDisabled,
  checkOperationVisible,
  cloneWidget,
  handlerOperation,
  loadOnlineFormConfig,
  getTableData,
  setTableData,
  initPage,
  initFormWidgetList,
  initWidgetRule,
  initWidgetLinkage,
  onPrint,
} = useForm(props);

provide('form', () => {
  return {
    ...form.value,
    mode: props.mode || 'pc',
    isEdit: dialogParams.value.isEdit,
    readOnly: dialogParams.value.readOnly,
    formData: formData,
    getWidgetValue: getWidgetValue,
    getWidgetVisible: getWidgetVisible,
    onValueChange: onValueChange,
    onWidgetValueChange: onWidgetValueChange,
    getTableData: getTableData,
    setTableData: setTableData,
    getPrimaryData: getPrimaryData,
    getDropdownParams: getDropdownParams,
    checkOperationPermCode: checkOperationPermCode,
    checkOperationDisabled: checkOperationDisabled,
    checkOperationVisible: checkOperationVisible,
    cloneWidget: cloneWidget,
    handlerOperation: handlerOperation,
    getDictDataList: getDictDataList,
    loadOnlineFormConfig: loadOnlineFormConfig,
    isActive: (widget: ANY_OBJECT) => {
      return props.currentWidget === widget;
    },
    getWidgetObject: widgetData.getWidgetObject,
    instanceData: () => useFormExpose(formData),
  };
});

const onInput = (widgetList: ANY_OBJECT[]) => {
  form.value.widgetList = widgetList;
};

const onWidgetClick = (widget: ANY_OBJECT | null) => {
  emit('widgetClick', widget);
};
const onOperationClick = (operation: ANY_OBJECT) => {
  let keyName;
  if (masterTable.value.relation == null) {
    keyName = masterTable.value.datasource.variableName;
  } else {
    keyName = masterTable.value.relation.variableName;
  }
  onPrint(operation, formData[keyName], null, form.value.formName + '.pdf');
};

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};
// 提交表单数据
const onSaveFormData = () => {
  if (masterTable.value == null || masterTable.value.datasource == null) {
    ElMessage.error('表单使用主数据源或主表不存在！');
    return;
  }
  let params: ANY_OBJECT = {
    datasourceId: masterTable.value.datasource.datasourceId,
    relationId: (masterTable.value.relation || {}).relationId,
    masterData: isRelation.value ? undefined : formData[masterTable.value.datasource.variableName],
  };
  if (isRelation.value) {
    // 从表数据添加或更新
    params.slaveData = {
      ...formData[masterTable.value.relation.variableName],
    };
    // 设置关联字段的值
    let slaveColumnValue = (dialogParams.value.masterTableData || {})[
      masterTable.value.relation.masterColumn.columnName
    ];
    if (slaveColumnValue != null) {
      params.slaveData[masterTable.value.relation.slaveColumn.columnName] = slaveColumnValue;
    }
  } else {
    // 设置一对多从表数据
    params.slaveData = tableWidgetList.reduce((retObj, widget) => {
      if (widget.relation != null) {
        retObj[widget.relation.variableName] = formData[widget.relation.variableName];
      }
      return retObj;
    }, {});
  }

  // 把slaveData里的relationVariableName替换成relationId
  if (!isRelation.value && params.slaveData) {
    let slaveDataKeyList = Object.keys(params.slaveData);
    if (slaveDataKeyList.length > 0) {
      let relationVariableNameMap = new Map();
      form.value.tableMap.forEach((table: ANY_OBJECT) => {
        if (table.relation != null) {
          relationVariableNameMap.set(table.relation.variableName, table.relation.relationId);
        }
      });
      slaveDataKeyList.forEach(key => {
        let relationId = relationVariableNameMap.get(key);
        if (relationId != null) {
          params.slaveData[relationId] = params.slaveData[key];
        }
        params.slaveData[key] = undefined;
      });
    }
  }

  let commitUrl;
  if (isRelation.value) {
    // 从表提交数据
    commitUrl =
      dialogParams.value.rowData == null || dialogParams.value.isCopy
        ? API_CONTEXT + '/online/onlineOperation/addOneToManyRelation/'
        : API_CONTEXT + '/online/onlineOperation/updateOneToManyRelation/';
  } else {
    // 主表提交数据
    commitUrl =
      dialogParams.value.rowData == null || dialogParams.value.isCopy
        ? API_CONTEXT + '/online/onlineOperation/addDatasource/'
        : API_CONTEXT + '/online/onlineOperation/updateDatasource/';
  }
  commitUrl += masterTable.value.datasource.variableName;
  post(commitUrl, params)
    .then(res => {
      ElMessage.success('保存成功！');
      if (props.dialog) {
        props.dialog.submit(res);
      } else {
        onCloseThirdDialog(true, dialogParams.value.rowData, res);
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
// 提交
const onSubmit = () => {
  if (dialogParams.value.isEdit) return;
  if (Array.isArray(richEditWidgetList)) {
    richEditWidgetList.forEach(richWidget => {
      if (richWidget && richWidget.widgetImpl) {
        onValueChange(richWidget, richWidget.widgetImpl.getHtml());
      }
    });
  }
  formRef.value.validate((valid: boolean) => {
    if (!valid) return;
    if (dialogParams.value.saveData) {
      // 非级联保存数据
      onSaveFormData();
    } else {
      if (props.dialog) {
        props.dialog.submit(formData);
      } else {
        onCloseThirdDialog(true, dialogParams.value.rowData, formData);
      }
    }
  });
};

const clearFormData = (data: ANY_OBJECT | null, columnList: string[]) => {
  if (data == null) return;
  columnList.forEach(columnName => {
    data[columnName] = undefined;
  });
};
const loadRelationTableData = (widget: ANY_OBJECT) => {
  if (widget == null || widget.datasource == null || widget.relation == null)
    return Promise.reject();
  return new Promise<void>((resolve, reject) => {
    let params: ANY_OBJECT = {
      datasourceId: widget.datasource.datasourceId,
      relationId: widget.relation.relationId,
      filterDtoList: [
        {
          tableName: widget.table.tableName,
          columnName: widget.relation.slaveColumn.columnName,
          filterType: SysOnlineColumnFilterType.EQUAL_FILTER,
          columnValue: (formData[widget.datasource.variableName] || {})[
            widget.relation.masterColumn.columnName
          ],
        },
      ],
    };
    if (params == null) {
      reject();
      return;
    }
    let httpCall = post<TableData<ANY_OBJECT>>(
      API_CONTEXT +
        '/online/onlineOperation/listByOneToManyRelationId/' +
        widget.datasource.variableName,
      params,
    );
    httpCall
      .then(res => {
        // 复制数据，清空主键id以及自动编码字段
        if (dialogParams.value.isCopy) {
          let temp = new Date().getTime();
          let autoCodeColumnName: string[] = [];
          res.data.dataList.forEach(item => {
            if (widget.primaryColumnName) item[widget.primaryColumnName] = undefined;
            item.__cascade_add_id__ = temp++;
            autoCodeColumnName.forEach(columnName => {
              item[columnName] = undefined;
            });
          });
        }
        formData[widget.relation.variableName] = res.data.dataList;
        resolve();
      })
      .catch(e => {
        reject(e);
      });
  });
};
const initFormData = () => {
  if (dialogParams.value.rowData != null) {
    return new Promise<void>((resolve, reject) => {
      // 如果是复制，清空主键以及自动编码字段
      let clearColumnList: string[] = [];
      if (isRelation.value) {
        Object.keys(dialogParams.value.rowData).forEach(key => {
          formData[masterTable.value.relation.variableName][key] = dialogParams.value.rowData[key];
        });
        clearFormData(formData[masterTable.value.relation.variableName], clearColumnList);
        resolve();
      } else {
        // 初始化主表以及一对一字段数据
        let relationNameList: string[] = [];
        let datasourceName = '';
        form.value.tableMap.forEach((table: ANY_OBJECT) => {
          if (table.relation && table.relation.relationType === SysOnlineRelationType.ONE_TO_ONE) {
            relationNameList.push(table.relation.variableName);
            table.columnList.forEach(column => {
              formData[table.relation.variableName][column.columnName] = undefined;
            });
          } else if (table.relation == null) {
            datasourceName = table.datasource.variableName;
          }
        });
        Object.keys(dialogParams.value.rowData).forEach(key => {
          if (relationNameList.indexOf(key) === -1) {
            // 主表字段
            formData[datasourceName][key] = dialogParams.value.rowData[key];
          } else {
            // 从表字段
            if (dialogParams.value.rowData[key]) {
              Object.keys(dialogParams.value.rowData[key]).forEach(subKey => {
                formData[key][subKey] = dialogParams.value.rowData[key][subKey];
              });
            }
          }
        });
        // 初始化一对多数据
        if (Array.isArray(tableWidgetList) && tableWidgetList.length > 0) {
          try {
            let httpCallList = tableWidgetList
              .map(widget => {
                if (
                  widget.relation &&
                  widget.relation.relationType === SysOnlineRelationType.ONE_TO_MANY
                ) {
                  return loadRelationTableData(widget);
                }
                return null;
              })
              .filter(item => item != null);
            Promise.all(httpCallList)
              .then(() => {
                clearFormData(formData[datasourceName], clearColumnList);
                resolve();
              })
              .catch(e => {
                console.log(e);
                clearFormData(formData[datasourceName], clearColumnList);
                reject(e);
              });
          } catch (e) {
            console.log(e);
          }
        } else {
          clearFormData(formData[datasourceName], clearColumnList);
          resolve();
        }
      }
    });
  } else {
    return Promise.resolve();
  }
};

const formExpose = useFormExpose(formData);

onMounted(() => {
  isReady.value = false;
  if (!dialogParams.value.isEdit) {
    initWidgetRule();
    initFormData()
      .then(() => {
        initWidgetLinkage();
        setTimeout(() => {
          formRef.value.clearValidate();
        });
      })
      .catch((e: Error) => {
        console.error(e);
      });
  }
  isReady.value = true;
});
</script>

<style scoped>
.header-logo {
  display: inline-block;
  width: 40px;
  height: 40px;
  margin-right: 8px;
  text-align: center;
  color: #fda834;
  background: rgb(255 119 0 / 10%);
  border-radius: 8px;
  line-height: 40px;
}
.el-divider--vertical {
  height: 26px;
  margin: 7px 15px;
}
.online-edit-form {
  display: flex;
  flex-direction: column;
}
.online-edit-form .info {
  position: absolute;
  top: 30%;
  width: 100%;
  text-align: center;
  vertical-align: middle;
}
.form-box {
  flex-grow: 1;
  flex-shrink: 1;
  height: 300px;
}
.menu-box {
  flex-grow: 0;
  flex-shrink: 0;
}
</style>

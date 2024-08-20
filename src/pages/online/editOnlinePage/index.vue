<template>
  <el-container class="edit-online-page">
    <el-header
      class="step-header"
      style="overflow: hidden; height: 72px; background: white; border-bottom: 1px solid #ebeef5"
    >
      <el-row type="flex" justify="space-between" align="middle" style="height: 100%">
        <div class="title" style="display: flex; width: 200px; height: 40px; line-height: 40px">
          <i class="header-logo logo online-icon icon-orange-icon" style="font-size: 40px" />
          <span style="font-size: 22px; color: #333; font-weight: bold">橙单在线表单</span>
        </div>
        <!-- v-model:value 可以双向绑定，不需要双向绑定时使用:value即可 -->
        <StepBar class="step" :value="activeStep">
          <StepBarItem icon="online-icon icon-basic-info" :name="SysOnlinePageSettingStep.BASIC"
            >基础信息</StepBarItem
          >
          <StepBarItem icon="online-icon icon-data" :name="SysOnlinePageSettingStep.DATASOURCE"
            >数据模型</StepBarItem
          >
          <StepBarItem
            icon="online-icon icon-form-design"
            :name="SysOnlinePageSettingStep.FORM_DESIGN"
            >表单设计</StepBarItem
          >
        </StepBar>
        <el-row class="operation" type="flex" justify="end" style="width: 200px">
          <el-button
            v-if="!showSaveButton"
            :size="formItemSize"
            :disabled="activeStep == SysOnlinePageSettingStep.BASIC"
            @click="onPrevClick"
          >
            上一步
          </el-button>
          <el-button
            v-if="!showSaveButton"
            :disabled="activeStep == SysOnlinePageSettingStep.FORM_DESIGN"
            :size="formItemSize"
            type="primary"
            @click="onNextClick"
          >
            下一步
          </el-button>
          <el-button v-if="showSaveButton" :size="formItemSize" type="primary" @click="onSaveClick">
            保存
          </el-button>
          <el-button @click="onClose" :size="formItemSize">{{
            showSaveButton ? '返回' : '退出'
          }}</el-button>
        </el-row>
      </el-row>
    </el-header>
    <el-main
      :style="{
        padding: activeStep == SysOnlinePageSettingStep.FORM_DESIGN ? '0px' : '15px',
      }"
    >
      <el-row type="flex" justify="center" style="height: 100%">
        <!-- 基础信息 -->
        <BasicForm
          ref="basicForm"
          v-if="activeStep == SysOnlinePageSettingStep.BASIC"
          class="main-box"
          style="width: 600px"
          v-model="formPageData"
        />
        <!-- 在线表单数据模型配置 -->
        <DataModel
          ref="modelForm"
          :data="getPageDatasourceTableList"
          :defaultFormItemSize="formItemSize"
          :pageId="formPageData.pageId"
          :dataSource="getPageDatasource"
          :dblinkInfo="dblinkInfo"
          :dictList="dictList"
          :clientHeight="clientHeight || thirdParams.clientHeight"
          @change="initPageDatasourceInfo"
          @un-saved="onUnSaved"
          v-if="activeStep == SysOnlinePageSettingStep.DATASOURCE && formPageData.pageId"
        />
        <!-- 表单设计 -->
        <FormDesign
          v-if="activeStep == SysOnlinePageSettingStep.FORM_DESIGN"
          ref="designForm"
          :pageType="formPageData.pageType!"
          :tableList="getPageDatasourceTableList"
          :allFormList="formList"
          :dictList="dictList"
          :height="clientHeight || thirdParams.clientHeight"
          class="design-box"
          style="width: 100%; height: 100%"
          @createForm="onCreateNewForm"
          @updateForm="updateFormInfo"
          @cloneForm="onCloneForm"
          @deleteForm="onDeleteForm"
        />
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Dialog } from '@/components/Dialog';
import {
  SysOnlineFormKind,
  SysOnlinePageSettingStep,
  SysOnlinePageStatus,
  SysOnlinePageType,
} from '@/common/staticDict/online';
import { DialogProp } from '@/components/Dialog/types';
import { ANY_OBJECT } from '@/types/generic';
import StepBar from '@/components/StepBar/index.vue';
import StepBarItem from '@/components/StepBar/stepItem.vue';
import { FormPage } from '@/types/online/page';
import {
  OnlineColumnController,
  OnlineDatasourceRelationController,
  OnlineDblinkController,
  OnlineDictController,
  OnlineFormController,
  OnlinePageController,
} from '@/api/online';
import { Dict } from '@/types/online/dict';
import { DBLink } from '@/types/online/dblink';
import { ResponseDataType } from '@/common/http/types';
import { TableData } from '@/common/types/table';
import { useFormConfig } from '@/pages/online/hooks/useFormConfig';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
import BasicForm from './basic/index.vue';
import DataModel from './dataModel/index.vue';
import FormDesign from './formDesign/index.vue';
import EditOnlineForm from './editOnlineForm.vue';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  pageId?: string;
  clientHeight: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}

const props = defineProps<IProps>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
provide('clientHeight', props.clientHeight || thirdParams.value.clientHeight);

const basicForm = ref();
const modelForm = ref();
const designForm = ref();
const activeStep = ref(SysOnlinePageSettingStep.BASIC);
const formPageData = ref({ published: false } as FormPage);
const dictList = ref<Dict[]>([]);
const formList = ref<ANY_OBJECT[]>([]);
const dblinkInfo = ref();
// TODO 判断条件
const hasUnSaved = ref(false);
const showSaveButton = computed(() => {
  return activeStep.value == SysOnlinePageSettingStep.FORM_DESIGN || hasUnSaved.value;
});
const onUnSaved = (val: boolean) => {
  hasUnSaved.value = val;
};

const pageDatasourceList = ref<ANY_OBJECT[]>([]);

const onPrevClick = () => {
  switch (activeStep.value) {
    case SysOnlinePageSettingStep.DATASOURCE:
      activeStep.value = SysOnlinePageSettingStep.BASIC;
      break;
    case SysOnlinePageSettingStep.FORM_DESIGN:
      //dirty = false;
      activeStep.value = SysOnlinePageSettingStep.DATASOURCE;
      break;
  }
};
const onNextClick = () => {
  switch (activeStep.value) {
    case SysOnlinePageSettingStep.BASIC:
      // Step 2 进入数据模型页面
      basicForm.value
        .save()
        .then((res: FormPage) => {
          if (res) {
            formPageData.value = { ...res };
          }
          if (formPageData.value.pageId) {
            initPageDatasourceInfo(formPageData.value.pageId);
          }
          return res;
        })
        .then(() => {
          activeStep.value = SysOnlinePageSettingStep.DATASOURCE;
        })
        .catch((e: Error) => {
          console.warn(e);
        });

      break;
    case SysOnlinePageSettingStep.DATASOURCE:
      onSavePageDatasourceInfo(false)
        .then(() => {
          // Step 1 获取数据源所有用到的数据表的字段列表
          let httpCalls: ANY_OBJECT[] = [];
          console.log(
            '获取数据源所有用到的数据表的字段列表',
            getPageDatasourceTableList.value.length,
          );
          getPageDatasourceTableList.value.forEach(item => {
            httpCalls.push(loadOnlineTableColumns(item.tableId));
          });
          return Promise.all(httpCalls);
        })
        .then(res => {
          res.forEach((item, index) => {
            getPageDatasourceTableList.value[index].columnList = item;
            return getPageDatasourceTableList.value[index];
          });
          // Step 2 获取表单列表
          return initPageFormList(formPageData.value.pageId);
        })
        .then(() => {
          // Step 3 进入表单设计页面
          activeStep.value = SysOnlinePageSettingStep.FORM_DESIGN;
        })
        .catch(e => {
          console.warn(e);
        });
      break;
  }
};
const loadOnlineTableColumns = (tableId: string) => {
  if (tableId == null || tableId === '') return Promise.reject();

  return new Promise((resolve, reject) => {
    let params = {
      onlineColumnDtoFilter: {
        tableId,
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

const { getFormConfig, mergeWidget, mergeArray } = useFormConfig();

/**
 * 获取页面子表单列表
 */
const initPageFormList = (pageId: string | undefined) => {
  if (!pageId) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    OnlineFormController.list({
      onlineFormDtoFilter: {
        pageId: pageId,
      },
      orderParam: [
        {
          fieldName: 'createTime',
          asc: true,
        },
      ],
    })
      .then(res => {
        console.log('editOnlinePage form list', res.data.dataList);
        formList.value = (res.data.dataList || []).map(item => {
          let config = item.widgetJson ? JSON.parse(item.widgetJson) : {};
          let paramList = item.paramsJson ? JSON.parse(item.paramsJson) : [];
          let formConfig = getFormConfig(item.formType, formPageData.value.pageType);
          let allowMode = ['pc'];
          allowMode.forEach(mode => {
            config[mode] = {
              ...formConfig[mode],
              ...config[mode],
            };

            config[mode].formId = item.formId;
            config[mode].formCode = item.formCode;
            config[mode].formName = item.formName;
            config[mode].formKind = item.formKind;
            config[mode].formType = item.formType;
            config[mode].formTypeDictMap = item.formTypeDictMap;
            config[mode].masterTableId = item.masterTableId;
            // 合并表单操作
            config[mode].operationList = mergeArray(
              config[mode].operationList,
              formConfig[mode].operationList,
              'id',
            );
            // 合并组件操作
            if (Array.isArray(config[mode].widgetList)) {
              config[mode].widgetList.forEach((widget: ANY_OBJECT) => {
                mergeWidget(widget);
              });
            }
            mergeWidget(config[mode].tableWidget);
            mergeWidget(config[mode].leftWidget);
          });
          return {
            ...item,
            ...config,
            paramList,
          };
        });
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};

const onSaveClick = () => {
  if (activeStep.value == SysOnlinePageSettingStep.FORM_DESIGN) {
    designForm.value.saveForm();
  } else if (activeStep.value == SysOnlinePageSettingStep.DATASOURCE) {
    modelForm.value.save();
  }
};
const onClose = () => {
  if (showSaveButton.value) {
    if (activeStep.value == SysOnlinePageSettingStep.DATASOURCE) {
      // 在数据模型页面状态中，点返回时，尝试取消保存返回上一状态
      modelForm.value.cancel();
    } else {
      activeStep.value = SysOnlinePageSettingStep.DATASOURCE;
    }
  } else {
    if (props.dialog) {
      props.dialog.cancel();
    } else {
      // 关闭第三方弹窗
      onCloseThirdDialog(true);
    }
  }
};

/**
 * 变更表单状态
 *
 * @param status 状态
 */
const savePageInfo = (status: number) => {
  let params = {
    onlinePageDto: {
      ...formPageData.value,
      status: status,
      published: false,
    },
  };
  return OnlinePageController.update(params);
};

/**
 * 保存页面数据模型信息
 */
const onSavePageDatasourceInfo = (isPrev = false) => {
  // 如果是上一步，直接返回上一步
  if (isPrev) return Promise.resolve();
  // 下一步需判断是否添加了数据源
  if (getPageDatasource.value == null) {
    ElMessage.error('请设置页面数据模型！');
    if (formPageData.value.status !== SysOnlinePageStatus.DATASOURCE) {
      savePageInfo(SysOnlinePageStatus.DATASOURCE).catch(e => {
        console.warn(e);
      });
    }
    return Promise.reject();
  } else {
    if (formPageData.value.status === SysOnlinePageStatus.DESIGNING) {
      return Promise.resolve();
    } else {
      return savePageInfo(SysOnlinePageStatus.DESIGNING);
    }
  }
};

/**
 * 获取所有在线表单字典信息
 */
const loadOnlineDictList = () => {
  OnlineDictController.list({})
    .then(res => {
      res.data.dataList.forEach((item: Dict) => {
        item.id = item.dictId;
        item.name = item.dictName;
        item.dictData = item.dictDataJson ? JSON.parse(item.dictDataJson) : undefined;
      });
      dictList.value = res.data.dataList;
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 获取数据库信息
 */
const loadDblinkList = () => {
  return new Promise<ANY_OBJECT>((resolve, reject) => {
    dblinkInfo.value = {};
    OnlineDblinkController.list({})
      .then(res => {
        res.data.dataList.forEach((item: DBLink) => {
          if (item.dblinkId) {
            dblinkInfo.value[item.dblinkId] = {
              ...item,
              tableList: undefined,
            };
          }
        });
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};

const initPageInfo = () => {
  formPageData.value = {
    pageId: undefined,
    pageCode: undefined,
    pageName: undefined,
    published: false,
    pageType: SysOnlinePageType.BIZ,
    status: SysOnlinePageStatus.BASIC,
  };
  activeStep.value = SysOnlinePageSettingStep.BASIC;
  let pageId = props.pageId || thirdParams.value.pageId;
  if (pageId != null || formPageData.value.pageId != null) {
    let params = {
      pageId: pageId || formPageData.value.pageId,
    };
    return OnlinePageController.view(params);
  } else {
    return Promise.reject();
  }
};

const getPageDatasource = computed(() => {
  return pageDatasourceList.value[0];
});
const getPageDatasourceTableList = computed<ANY_OBJECT[]>(() => {
  if (getPageDatasource.value == null) return [];

  let tableList = [];
  // 添加主表信息
  tableList.push({
    id: getPageDatasource.value.datasourceId,
    tableName: getPageDatasource.value.masterTableIdDictMap.name,
    tableId: getPageDatasource.value.masterTableId,
    relationType: undefined,
    masterColumnName: undefined,
    slaveColumnName: undefined,
    cascadeDelete: false,
    leftJoin: false,
    showName: getPageDatasource.value.datasourceName,
    tag: getPageDatasource.value,
  });
  // 添加关联从表信息
  if (Array.isArray(getPageDatasource.value.relationList)) {
    getPageDatasource.value.relationList.forEach(relation => {
      tableList.push({
        id: relation.relationId,
        tableName: relation.slaveTable.tableName,
        tableId: relation.slaveTableId,
        relationType: relation.relationType,
        masterColumnName: (relation.masterColumn || {}).columnName || '未知字段',
        slaveColumnName: (relation.slaveColumn || {}).columnName || '未知字段',
        cascadeDelete: relation.cascadeDelete,
        leftJoin: relation.leftJoin,
        showName: relation.relationName,
        tag: relation,
      });
    });
  }
  return tableList;
});
/**
 * 初始化页面数据模型信息
 */
const initPageDatasourceInfo = (pageId: string) => {
  return new Promise((resolve, reject) => {
    OnlinePageController.listOnlinePageDatasource({
      pageId: pageId,
    })
      .then(res => {
        pageDatasourceList.value = res.data.dataList;
        return loadDatasourceRelation();
      })
      .then(res => {
        pageDatasourceList.value = pageDatasourceList.value.map(item => {
          if (item.datasourceId === getPageDatasource.value.datasourceId) {
            item.relationList = res.data.dataList || [];
          }
          return item;
        });
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};

/**
 * 获取数据模型关联信息
 */
const loadDatasourceRelation = () => {
  if (getPageDatasource.value == null)
    return Promise.resolve({
      data: { dataList: [], totalCount: 0 },
      success: false,
      errorCode: null,
      errorMessage: null,
    } as ResponseDataType<TableData<ANY_OBJECT>>);

  return OnlineDatasourceRelationController.list({
    onlineDatasourceRelationDtoFilter: {
      datasourceId: getPageDatasource.value.datasourceId,
    },
  });
};

/**
 * 新建表单
 */
const onCreateNewForm = () => {
  Dialog.show(
    '新建表单',
    EditOnlineForm,
    {
      area: ['600px'],
    },
    {
      pageId: formPageData.value.pageId,
      pageType: formPageData.value.pageType,
      datasourceId: getPageDatasource.value.datasourceId,
      datasourceTableList: getPageDatasourceTableList.value,
      defaultFormItemSize: formItemSize.value,
      //path: 'thirdEditOnlineForm',
    },
    {
      width: '600px',
      height: '400px',
      pathName: '/thirdParty/thirdEditOnlineForm',
    },
  )
    .then(() => {
      initPageFormList(formPageData.value.pageId);
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};
const buildSaveWidget = (widget: ANY_OBJECT) => {
  if (widget == null) return widget;
  let oldWidgetImpl = widget.widgetImpl;
  let childWidgetList = widget.childWidgetList;
  let oldParent = widget.parent;
  widget.widgetImpl = undefined;
  widget.parent = undefined;
  widget.childWidgetList = [];
  let actions = widget.props.actions;
  widget.props.actions = {};
  let temp = JSON.parse(JSON.stringify(widget));
  widget.widgetImpl = oldWidgetImpl;
  widget.parent = oldParent;
  widget.childWidgetList = childWidgetList;
  widget.props.actions = actions;
  temp.column = undefined;
  temp.datasource = undefined;
  temp.relation = undefined;
  temp.bindData.column = undefined;
  temp.bindData.table = undefined;
  temp.widgetImpl = undefined;
  if (temp.props && temp.props.dictInfo) temp.props.dictInfo.dict = undefined;
  if (temp.props && Array.isArray(temp.props.tableColumnList)) {
    temp.props.tableColumnList.forEach((tableColumn: ANY_OBJECT) => {
      tableColumn.table = undefined;
      tableColumn.column = undefined;
    });
  }
  if (Array.isArray(widget.childWidgetList)) {
    temp.childWidgetList = widget.childWidgetList.map(item => {
      return buildSaveWidget(item);
    });
  }
  return temp;
};
const updateFormInfo = (currentForm: ANY_OBJECT | undefined | null) => {
  if (!currentForm) {
    console.warn('currentForm is null or undefined');
    return;
  }
  let allowMode = ['pc'];
  let formConfig: ANY_OBJECT = allowMode.reduce((formConfig: ANY_OBJECT, mode: string) => {
    console.log('reduce', formConfig, mode);
    let tempFormConfig = currentForm[mode];
    formConfig[mode] = {
      gutter: tempFormConfig.gutter,
      filterItemWidth: tempFormConfig.filterItemWidth,
      labelWidth: tempFormConfig.labelWidth,
      labelPosition: tempFormConfig.labelPosition,
      tableWidget: buildSaveWidget(tempFormConfig.tableWidget),
      leftWidget: buildSaveWidget(tempFormConfig.leftWidget),
      operationList: tempFormConfig.operationList,
      customFieldList: tempFormConfig.customFieldList,
      widgetList: tempFormConfig.widgetList.map((widget: ANY_OBJECT) => {
        return buildSaveWidget(widget);
      }),
      formEventList: tempFormConfig.formEventList,
      maskFieldList: tempFormConfig.maskFieldList,
      width: tempFormConfig.width,
      height: tempFormConfig.height,
      fullscreen: tempFormConfig.fullscreen,
      advanceQuery: tempFormConfig.advanceQuery,
    };
    return formConfig;
  }, {});

  let params = {
    onlineFormDto: {
      pageId: currentForm.pageId,
      formId: currentForm.formId,
      formCode: currentForm.pc.formCode,
      formName: currentForm.pc.formName,
      formKind: SysOnlineFormKind.PAGE,
      formType: currentForm.formType,
      masterTableId: currentForm.masterTableId,
      widgetJson: JSON.stringify(formConfig),
      datasourceIdList: [getPageDatasource.value.datasourceId],
    },
  };
  let httpCall = OnlineFormController.update(params);
  httpCall
    .then(() => {
      ElMessage.success('保存成功');
      initPageFormList(formPageData.value.pageId).catch(e => {
        console.warn(e);
      });
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 复制表单
 */
const onCloneForm = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否复制此表单？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {
        formId: row.formId,
      };

      return OnlineFormController.clone(params);
    })
    .then(() => {
      ElMessage.success('复制成功！');
      initPageFormList(formPageData.value.pageId).catch(e => {
        console.warn(e);
      });
    })
    .catch(e => {
      console.warn(e);
    });
};
const onDeleteForm = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此表单？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {
        formId: row.formId,
      };

      return OnlineFormController.delete(params);
    })
    .then(() => {
      ElMessage.success('删除成功！');
      initPageFormList(formPageData.value.pageId).catch(e => {
        console.warn(e);
      });
    })
    .catch(e => {
      console.warn(e);
    });
};

onMounted(() => {
  loadOnlineDictList();
  loadDblinkList()
    .then(() => {
      console.log('dblinkInfo', dblinkInfo.value);
      return initPageInfo();
    })
    .then(res => {
      formPageData.value = {
        ...res.data,
      };
    })
    .catch(e => {
      console.warn(e);
    });
});
</script>

<style scoped>
.edit-online-page {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  background: #f6f6f6 !important;
}
.main-box {
  height: 100%;
  padding: 20px;
  background: white;
}
.design-box {
  height: 100%;
  padding: 0;
  border-radius: 3px;
}
</style>

<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="form"
      :model="formData"
      class="full-width-input form-box"
      :rules="rules"
      style="width: 100%"
      label-width="80px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24" v-if="dialogParams.datasource != null">
          <el-form-item label="绑定字段">
            <el-cascader
              class="input-item"
              v-model="bindColumnPath"
              filterable
              placeholder="变量绑定的数据源字段"
              :options="entryDatasourceData"
              :disabled="dialogParams.datasource == null"
              @change="onBindColumnChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="变量名称" prop="showName">
            <el-input
              class="input-item"
              v-model="formData.showName"
              :clearable="true"
              placeholder="变量名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="变量标识" prop="variableName">
            <el-input
              class="input-item"
              v-model="formData.variableName"
              :clearable="true"
              placeholder="变量标识"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="no-scroll flex-box menu-box" type="flex" justify="end">
      <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
      <el-button type="primary" :size="formItemSize" @click="onSubmit"> 保存 </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { CascaderValue, FormItemRule, ElMessage } from 'element-plus';
import { Arrayable } from 'element-plus/es/utils';
import { ANY_OBJECT } from '@/types/generic';
import { FlowEntryVariableController } from '@/api/flow';
import { findTreeNode } from '@/common/utils';
import { SysFlowVariableType } from '@/common/staticDict/flow';
import { DialogProp } from '@/components/Dialog/types';
import { SysOnlineRelationType } from '@/common/staticDict/online';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  entryId: string;
  datasource?: ANY_OBJECT;
  rowData?: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const form = ref();
const rules: Partial<Record<string, Arrayable<FormItemRule>>> = {
  showName: [{ required: true, message: '变量名称不能为空！', trigger: 'blur' }],
  variableName: [
    { required: true, message: '变量标识不能为空！', trigger: 'blur' },
    {
      type: 'string',
      pattern: /^[a-z][a-zA-Z]+$/,
      message: '变量标识必须是小驼峰命名',
      trigger: 'blur',
    },
  ],
};
const bindColumnPath = ref<string[]>([]);
const formData = ref<ANY_OBJECT>({
  showName: undefined,
  variableName: undefined,
  variableType: SysFlowVariableType.TASK,
  bindDatasourceId: undefined,
  bindRelationId: undefined,
  bindColumnId: undefined,
  builtIn: false,
});

const dialogParams = computed(() => {
  return {
    entryId: props.entryId || thirdParams.value.entryId,
    datasource: props.datasource || thirdParams.value.datasource,
    rowData: props.rowData || thirdParams.value.rowData,
  };
});
const entryDatasourceData = computed(() => {
  if (dialogParams.value.datasource == null) {
    return [];
  } else {
    let temp = [
      {
        label: dialogParams.value.datasource.datasourceName,
        value: dialogParams.value.datasource.datasourceId,
        tableId: dialogParams.value.datasource.masterTableId,
        children: dialogParams.value.datasource.columnList.map((column: ANY_OBJECT) => {
          return {
            label: column.objectFieldName,
            value: column.columnId,
            tag: column,
          };
        }),
        tag: dialogParams.value.datasource,
      },
    ];

    if (Array.isArray(dialogParams.value.datasource.relationList)) {
      dialogParams.value.datasource.relationList.forEach((relation: ANY_OBJECT) => {
        if (relation.relationType === SysOnlineRelationType.ONE_TO_ONE) {
          temp.push({
            label: relation.relationName,
            value: relation.relationId,
            tableId: relation.slaveTableId,
            children: relation.columnList.map((column: ANY_OBJECT) => {
              return {
                label: column.objectFieldName,
                value: column.columnId,
                tag: column,
              };
            }),
            tag: relation,
          });
        }
      });
    }
    return temp;
  }
});

const onBindColumnChange = (values: CascaderValue) => {
  formData.value.bindDatasourceId = dialogParams.value.datasource?.datasourceId;
  formData.value.bindRelationId = undefined;
  formData.value.bindColumnId = undefined;

  if (Array.isArray(values) && values.length > 0) {
    let columnId: string = values[values.length - 1] as string;
    if (columnId) {
      if (values[0] !== formData.value.bindDatasourceId) formData.value.bindRelationId = values[0];
      let column = findTreeNode(entryDatasourceData.value, columnId, 'value');
      if (column != null && column.tag != null) {
        formData.value.showName = column.tag.columnComment;
        formData.value.variableName = column.tag.objectFieldName;
        formData.value.bindColumnId = column.value;
      }
    }
  }
};

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};
const onSubmit = () => {
  form.value.validate((valid: boolean) => {
    if (valid) {
      let params = {
        flowEntryVariableDto: {
          ...formData.value,
          entryId: dialogParams.value.entryId,
        },
      };

      let httpCall =
        dialogParams.value.rowData == null
          ? FlowEntryVariableController.add(params)
          : FlowEntryVariableController.update(params);
      httpCall
        .then(res => {
          ElMessage.success('保存成功！');
          if (props.dialog) {
            props.dialog.submit(res);
          } else {
            onCloseThirdDialog(true);
          }
        })
        .catch(e => {
          console.warn(e);
        });
    }
  });
};

onMounted(() => {
  if (dialogParams.value.rowData != null) {
    formData.value = {
      ...formData.value,
      ...dialogParams.value.rowData,
    };
    if (formData.value.bindColumnId != null && dialogParams.value.datasource != null) {
      bindColumnPath.value = [
        formData.value.bindRelationId || formData.value.bindDatasourceId,
        formData.value.bindColumnId,
      ];
    }
  }
});
</script>

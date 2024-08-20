<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      ref="form"
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
          <el-form-item label="数据源名称" prop="datasourceName">
            <el-input
              class="input-item"
              v-model="formData.datasourceName"
              :clearable="true"
              placeholder="数据源名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="数据源标识" prop="variableName">
            <el-input
              class="input-item"
              v-model="formData.variableName"
              :clearable="true"
              placeholder="数据源标识"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="!isEdit">
          <el-form-item label="数据源主表" prop="masterTableId">
            <el-cascader
              v-model="masterTablePath"
              filterable
              :disabled="isEdit"
              :props="masterTableProps"
              @change="onMasterTableChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-else>
          <el-form-item label="数据源主表">
            <el-input class="input-item" v-model="masterTableIdDictMap.name" :disabled="true" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="menu-box">
      <el-col :span="24">
        <el-row class="no-scroll flex-box" type="flex" justify="end">
          <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
          <el-button type="primary" :size="formItemSize" @click="onSubmit()"> 保存 </el-button>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {
  CascaderNode,
  CascaderProps,
  CascaderValue,
  ElMessage,
  FormItemRule,
  Resolve,
} from 'element-plus';
import { computed } from 'vue';
import { Arrayable } from 'element-plus/es/utils';
import { DialogProp } from '@/components/Dialog/types';
import { ANY_OBJECT } from '@/types/generic';
import { OnlineDatasourceController, OnlineDblinkController } from '@/api/online';
import { DBLink } from '@/types/online/dblink';
import { useLayoutStore } from '@/store';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  pageId?: string;
  datasourceId?: string;
  dblinkInfo?: DBLink;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});

const form = ref();

const formData = ref({
  datasourceId: '',
  datasourceName: '',
  variableName: '',
  dblinkId: '',
  masterTableId: '',
});
const rules: Partial<Record<string, Arrayable<FormItemRule>>> = {
  datasourceName: [{ required: true, message: '数据源名称不能为空！', trigger: 'blur' }],
  variableName: [
    { required: true, message: '数据源标识不能为空！', trigger: 'blur' },
    {
      type: 'string',
      pattern: /^[a-z][a-zA-Z]+$/,
      message: '数据源标识必须是小驼峰命名',
      trigger: 'blur',
    },
  ],
  masterTableId: [{ required: true, message: '数据源主表不能为空！', trigger: 'blur' }],
};
const masterTablePath = ref<CascaderValue>([]);
const masterTableIdDictMap = ref<ANY_OBJECT>({});

const dialogParams = computed(() => {
  return {
    pageId: props.pageId || thirdParams.value.pageId,
    datasourceId: props.datasourceId || thirdParams.value.datasourceId,
    dblinkInfo: props.dblinkInfo || thirdParams.value.dblinkInfo,
  };
});
const isEdit = computed(() => {
  return !!dialogParams.value.datasourceId;
});
/**
 * 获取字典表级联数据
 */
const loadMasterTableData = (node: CascaderNode, resolve: Resolve) => {
  const { level } = node;
  if (level == 0) {
    // 获取dblink信息 TODO 第三方
    // 须放在nextTick内执行，否则会报生命周期警告信息
    nextTick(() => {
      OnlineDblinkController.list({})
        .then(res => {
          console.log(res);
          resolve(
            res.data.dataList.map(item => {
              return {
                value: item.dblinkId,
                label: item.dblinkName,
                leaf: false,
              };
            }),
          );
        })
        .catch((e: Error) => {
          console.warn(e);
          node.loaded = false;
          node.loading = false;
        });
    });
  } else if (level == 1) {
    OnlineDblinkController.listDblinkTables({
      dblinkId: node.value,
    })
      .then(res => {
        resolve(
          res.data.map(item => {
            return {
              value: item.tableName,
              label: item.tableName,
              leaf: true,
            };
          }),
        );
      })
      .catch((e: Error) => {
        console.warn(e);
        node.loaded = false;
        node.loading = false;
      });
  }
};

const masterTableProps: CascaderProps = {
  lazy: true,
  lazyLoad: loadMasterTableData,
};

const onMasterTableChange = (value: CascaderValue) => {
  console.log('change......', value);
  if (Array.isArray(value) && value.length > 0) {
    formData.value.dblinkId = value[0] as string;
    formData.value.masterTableId = value[1] as string;
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
    if (!valid) return;

    let params = {
      pageId: dialogParams.value.pageId,
      onlineDatasourceDto: {
        datasourceId: formData.value.datasourceId,
        datasourceName: formData.value.datasourceName,
        variableName: formData.value.variableName,
        dblinkId: formData.value.dblinkId,
        masterTableName: formData.value.masterTableId,
        masterTableId: isEdit.value ? formData.value.masterTableId : undefined,
      },
    };

    let httpCall = isEdit.value
      ? OnlineDatasourceController.update(params)
      : OnlineDatasourceController.add(params);
    httpCall
      .then(res => {
        ElMessage.success('保存成功');
        if (props.dialog) {
          props.dialog.submit(res);
        } else {
          onCloseThirdDialog(true, thirdParams.value.rowData, res);
        }
      })
      .catch(e => {
        console.warn(e);
      });
  });
};

onMounted(() => {
  if (dialogParams.value.datasourceId != null) {
    OnlineDatasourceController.view({
      datasourceId: dialogParams.value.datasourceId,
    })
      .then(res => {
        formData.value.datasourceId = res.data.datasourceId;
        formData.value.datasourceName = res.data.datasourceName;
        formData.value.dblinkId = res.data.dblinkId;
        formData.value.masterTableId = res.data.masterTableId;
        formData.value.variableName = res.data.variableName;
        masterTablePath.value = [formData.value.dblinkId, formData.value.masterTableId];
        masterTableIdDictMap.value = res.data.masterTableIdDictMap;
      })
      .catch(e => {
        console.warn(e);
      });
  }
});
</script>

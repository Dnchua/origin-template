<template>
  <el-form
    label-position="top"
    :size="layoutStore.defaultFormItemSize"
    @submit.prevent
    style="width: 100%"
  >
    <el-form-item label="表单 ID">
      <el-row justify="space-between" align="middle" style="flex-wrap: nowrap; width: 100%">
        <el-input readonly :model-value="formConfig().form.formId" />
        <el-button
          class="formShareBtn"
          link
          :icon="Share"
          style="margin-left: 8px"
          :title="
            formConfig().form.formType !== SysOnlineFormType.QUERY &&
            formConfig().form.formType !== SysOnlineFormType.ADVANCE_QUERY
              ? '只允许接入查询表单'
              : '复制接入信息'
          "
          :disabled="
            formConfig().form.formType !== SysOnlineFormType.QUERY &&
            formConfig().form.formType !== SysOnlineFormType.ADVANCE_QUERY
          "
          :data-clipboard-text="shareInfo"
          @click="onShareForm"
        />
      </el-row>
    </el-form-item>
    <el-form-item label="表单类型">
      <el-input v-model="(formConfig().form.formTypeDictMap || {}).name" placeholder="" disabled />
    </el-form-item>
    <el-form-item label="表单名称">
      <el-input v-model="formConfig().form.formName" placeholder="" clearable filterable />
    </el-form-item>
    <el-form-item label="表单编码">
      <el-input v-model="formConfig().form.formCode" placeholder="" clearable filterable />
    </el-form-item>
    <el-form-item label="标签位置">
      <el-row type="flex" align="middle" style="width: 100%; height: 40px">
        <el-radio-group v-model="formConfig().form.labelPosition" size="default">
          <el-radio-button value="left">居左</el-radio-button>
          <el-radio-button value="right">居右</el-radio-button>
          <el-radio-button value="top">顶部</el-radio-button>
        </el-radio-group>
      </el-row>
    </el-form-item>
    <el-form-item label="标签宽度">
      <el-row type="flex" style="width: 100%">
        <el-input-number
          v-model="formConfig().form.labelWidth"
          style="width: 100%"
          controls-position="right"
        />
      </el-row>
    </el-form-item>
    <el-form-item label="栅格间距">
      <el-row type="flex" style="width: 100%">
        <el-input-number
          v-model="formConfig().form.gutter"
          style="width: 100%"
          controls-position="right"
        />
      </el-row>
    </el-form-item>
    <el-form-item
      label="过滤组件宽度"
      v-if="
        formConfig().form.formType === SysOnlineFormType.QUERY ||
        formConfig().form.formType === SysOnlineFormType.ADVANCE_QUERY
      "
    >
      <el-row type="flex" style="width: 100%">
        <el-input-number
          v-model="formConfig().form.filterItemWidth"
          style="width: 100%"
          controls-position="right"
        />
      </el-row>
    </el-form-item>
    <el-form-item label="是否全屏" v-if="supportDialog">
      <el-row type="flex" align="middle" style="width: 100%; height: 40px">
        <el-radio-group v-model="formConfig().form.fullscreen" size="default">
          <el-radio :value="true">全屏</el-radio>
          <el-radio :value="false">弹窗</el-radio>
        </el-radio-group>
      </el-row>
    </el-form-item>
    <el-form-item v-if="supportDialog && !formConfig().form.fullscreen" label="弹窗宽度">
      <el-row type="flex" style="width: 100%">
        <el-input-number
          v-model="formConfig().form.width"
          style="width: 100%"
          controls-position="right"
        />
      </el-row>
    </el-form-item>
    <el-form-item v-if="supportDialog && !formConfig().form.fullscreen" label="弹窗高度">
      <el-row type="flex" style="width: 100%">
        <el-input-number
          v-model="formConfig().form.height"
          style="width: 100%"
          controls-position="right"
        />
      </el-row>
    </el-form-item>
    <MultiItemList
      v-model:data="formConfig().form.customFieldList"
      label="自定义字段"
      :supportSort="true"
      @add="onEditFormField(null)"
      @edit="onEditFormField"
      @delete="onRemoveFormField"
      :prop="{
        label: 'fieldName',
        value: 'fieldName',
      }"
    >
    </MultiItemList>
  </el-form>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { Share } from '@element-plus/icons-vue';
import Clipboard from 'clipboard';
import { computed } from 'vue';
import { ANY_OBJECT } from '@/types/generic';
import MultiItemList from '@/components/MultiItemList/index.vue';
import { SysOnlineFormType } from '@/common/staticDict/index';
import { SysOnlineFieldKind } from '@/common/staticDict/online';
import { Dialog } from '@/components/Dialog';
import { findItemFromList } from '@/common/utils';
import { useLayoutStore } from '@/store';
import EditFormField from './EditFormField.vue';

const formConfig = inject('formConfig', () => {
  console.error('CustomFormSetting: formConfig not injected');
  return {} as ANY_OBJECT;
});

const layoutStore = useLayoutStore();

// TODO 保存变更
const handlerEditOperate = (row: ANY_OBJECT | null, fieldName: string) => {
  if (Array.isArray(formConfig().form.customFieldList)) {
    if (row == null) {
      let temp = findItemFromList(formConfig().form.customFieldList, fieldName, 'fieldName');
      if (temp != null) {
        ElMessage.error('此字段已存在！');
      } else {
        formConfig().form.customFieldList.push({
          fieldName: fieldName,
        });
      }
    } else {
      if (row.fieldName !== fieldName) {
        // 修改了字段名
        let temp = findItemFromList(formConfig().form.customFieldList, fieldName, 'fieldName');
        if (temp != null) {
          ElMessage.error('此字段已存在！');
        } else {
          formConfig().form.customFieldList = formConfig().form.customFieldList.map(
            (item: ANY_OBJECT) => {
              if (item.fieldName === row.fieldName) {
                return {
                  fieldName: fieldName,
                };
              } else {
                return {
                  ...item,
                };
              }
            },
          );
        }
      }
    }
  } else {
    formConfig().form.customFieldList = [
      {
        fieldName: fieldName,
      },
    ];
  }
};
const onEditFormField = (row: ANY_OBJECT | null) => {
  Dialog.show<string>(
    row ? '编辑字段' : '添加字段',
    EditFormField,
    {
      area: '600px',
    },
    {
      rowData: row,
      //path: 'thirdEditFormField',
    },
    {
      height: '200px',
      width: '600px',
      pathName: '/thirdParty/thirdEditFormField',
    },
  )
    .then(fieldName => {
      handlerEditOperate(row, fieldName);
    })
    .catch(e => {
      console.warn(e);
    });
};
const onRemoveFormField = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否移除此字段？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      formConfig().form.customFieldList = formConfig().form.customFieldList.filter(
        (item: ANY_OBJECT) => {
          return item !== row;
        },
      );
    })
    .catch(e => {
      console.warn(e);
    });
};
const shareInfo = computed(() => {
  let shareUrl = {
    url:
      window.location.origin + '/#/thirdParty/thirdOnlineForm?formId=' + formConfig().form.formId,
    datasourceVariableName:
      formConfig().getMasterTable == null
        ? undefined
        : formConfig().getMasterTable.tag.variableName,
  };

  return JSON.stringify(shareUrl);
});
const onShareForm = () => {
  let clipboard = new Clipboard('.formShareBtn');
  clipboard.on('success', () => {
    ElMessage.success('接入信息复制成功！');
    clipboard.destroy();
  });
  clipboard.on('error', () => {
    ElMessage.error('浏览器不支持复制，请手动复制接入信息：' + shareInfo.value);
    clipboard.destroy();
  });
};

const supportDialog = computed(() => {
  return (
    // 编辑表单支持弹窗
    formConfig().form.formType === SysOnlineFormType.FORM ||
    // 子表查询页面支持弹窗
    (formConfig().form.formType === SysOnlineFormType.QUERY &&
      formConfig().getMasterTable &&
      formConfig().getMasterTable.relationType != null)
  );
});
const getMaskTableList = computed(() => {
  if (formConfig().form.formType === SysOnlineFormType.FORM) {
    return formConfig().getAllTableList.filter((table: ANY_OBJECT) => {
      if (formConfig().getMasterTable.relationType == null) {
        // 主表编辑
        return true;
      } else {
        // 从表编辑
        return table.tableId === formConfig().getMasterTable.tableId;
      }
    });
  } else {
    return formConfig().getValidTableList;
  }
});
const getAllTableMaskColumnTree = computed(() => {
  console.log('getMaskTableList', getMaskTableList);
  return getMaskTableList.value
    .map((table: ANY_OBJECT) => {
      let maskColumnList = table.columnList
        .filter((column: ANY_OBJECT) => {
          return column.fieldKind === SysOnlineFieldKind.FIELD_MASK;
        })
        .map((column: ANY_OBJECT) => {
          return {
            id: column.columnId,
            name: column.columnName,
          };
        });
      if (maskColumnList.length > 0) {
        return {
          id: table.tableId,
          name: table.tableName,
          children: maskColumnList,
        };
      }
      return null;
    })
    .filter((item: ANY_OBJECT) => item != null);
});
</script>

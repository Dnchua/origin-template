<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <el-form
      v-if="dialogParams.rowData"
      ref="form"
      :model="formData"
      class="full-width-input form-box"
      :rules="rules"
      style="width: 100%; height: 450px"
      label-width="120px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-form-item label="字段名：">
        <span :title="formData.columnComment">{{ formData.columnName }}</span>
        <el-tag
          :size="formItemSize"
          type="warning"
          v-if="formData.primaryKey"
          style="margin-left: 20px"
          >主键</el-tag
        >
      </el-form-item>
      <el-form-item label="字段类型：">
        <span>{{ formData.fullColumnType }}</span>
        <el-tag :size="formItemSize" type="success" effect="dark" style="margin-left: 10px">{{
          formData.objectFieldType
        }}</el-tag>
      </el-form-item>
      <el-form-item label="是否必填：">
        <el-switch v-model="formData.required" />
      </el-form-item>
      <el-form-item label="显示名称：">
        <el-input
          v-model="formData.columnComment"
          style="width: 100%"
          @change="dirty = true"
          placeholder="字段在表单上的显示名称"
        />
      </el-form-item>
      <el-form-item label="字典数据：">
        <el-select
          v-model="formData.dictId"
          placeholder="选择字段绑定的字典"
          style="width: 100%"
          clearable
          filterable
          :disabled="formData.objectFieldType === 'Boolean'"
          @change="onDictChange"
        >
          <el-option
            v-for="item in dialogParams.dictList"
            :key="item.dictId"
            :value="item.dictId"
            :label="item.dictName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="过滤支持：">
        <el-radio-group v-model="formData.filterType" @change="dirty = true">
          <el-radio-button
            v-for="item in SysOnlineColumnFilterType.getList()"
            :key="item.id"
            :label="item.id"
            :disabled="
              item.id === SysOnlineColumnFilterType.MULTI_SELECT_FILTER &&
              (formData.dictId == null || formData.dictId === '')
            "
          >
            {{ SysOnlineColumnFilterType.getValue(item.id) }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="字段类别：">
        <el-select
          v-model="formData.fieldKind"
          clearable
          placeholder="字段的业务类别"
          @change="dirty = true"
          style="width: 100%"
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
      <el-form-item
        v-if="
          formData.fieldKind === SysOnlineFieldKind.UPLOAD ||
          formData.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE
        "
        label="存储类型："
      >
        <el-select
          v-model="formData.uploadFileSystemType"
          clearable
          placeholder="字段的业务类别"
          @change="dirty = true"
          style="width: 100%"
        >
          <el-option label="本地存储" :value="0" />
          <el-option label="分布式存储" :value="100" />
        </el-select>
      </el-form-item>
    </el-form>
    <el-row class="no-scroll flex-box menu-box" type="flex" justify="end">
      <el-button :size="formItemSize" :plain="true" @click="onCancel"> 取消 </el-button>
      <el-button type="primary" :size="formItemSize" @click="onSubmit"> 保存 </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { OnlineColumnController } from '@/api/online';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { SysOnlineFieldKind, SysOnlineColumnFilterType } from '@/common/staticDict/online';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  rowData?: ANY_OBJECT;
  isMasterTable?: boolean;
  dictList?: ANY_OBJECT[];
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<boolean>;
}
const props = withDefaults(defineProps<IProps>(), { isMasterTable: false });
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const dirty = ref(false);
const formData = ref<ANY_OBJECT>({});
const rules = {};

const dialogParams = computed(() => {
  return {
    rowData: props.rowData || thirdParams.value.rowData,
    isMasterTable: props.isMasterTable || thirdParams.value.isMasterTable,
    dictList: props.dictList || thirdParams.value.dictList,
  };
});
const getValidColumnKind = computed(() => {
  return SysOnlineFieldKind.getList().filter(item => {
    return dialogParams.value.isMasterTable ? true : item.id !== SysOnlineFieldKind.FLOW_STATUS;
  });
});

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};
const onSubmit = () => {
  let params = {
    onlineColumnDto: {
      ...formData.value,
      dictId: formData.value.objectFieldType === 'Boolean' ? undefined : formData.value.dictId,
      uploadFileSystemType: formData.value.uploadFileSystemType || 0,
      // userFilter: this.dataPermFilterType === SysOnlineDataPermFilterType.USER_FILTER,
      // deptFilter: this.dataPermFilterType === SysOnlineDataPermFilterType.DEPT_FILTER,
      nullable: !formData.value.required,
    },
  };

  OnlineColumnController.update(params)
    .then(() => {
      dirty.value = false;
      ElMessage.success('保存成功！');
      if (props.dialog) {
        props.dialog.submit(true);
      } else {
        onCloseThirdDialog(true);
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
const columnKindItemDisabled = (columnKind: ANY_OBJECT) => {
  switch (columnKind.id) {
    case SysOnlineFieldKind.CREATE_TIME:
    case SysOnlineFieldKind.UPDATE_TIME:
      return formData.value.objectFieldType !== 'Date';
    case SysOnlineFieldKind.UPLOAD:
    case SysOnlineFieldKind.UPLOAD_IMAGE:
    case SysOnlineFieldKind.RICH_TEXT:
      return formData.value.objectFieldType !== 'String';
    case SysOnlineFieldKind.LOGIC_DELETE:
    case SysOnlineFieldKind.FLOW_STATUS:
      return formData.value.objectFieldType !== 'Integer';
    default:
      return false;
  }
};
/**
 * 绑定字典改变，如果取消绑定字典，则不能选择多选过滤
 */
const onDictChange = (value: string | null) => {
  if (
    (value == null || value === '') &&
    formData.value.filterType === SysOnlineColumnFilterType.MULTI_SELECT_FILTER
  ) {
    formData.value.filterType = SysOnlineColumnFilterType.NONE;
  }
};

onMounted(() => {
  formData.value = {
    ...dialogParams.value.rowData,
  };
});
</script>

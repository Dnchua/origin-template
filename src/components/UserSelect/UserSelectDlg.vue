<template>
  <div style="width: 100%">
    <el-form
      ref="formSysUser"
      :model="formFilter"
      label-width="75px"
      size="default"
      label-position="right"
      @submit.prevent
    >
      <el-row type="flex" justify="space-between">
        <el-form-item label="登录名称" prop="sysUserLoginName">
          <el-input
            v-model="formFilter.sysUserLoginName"
            style="width: 200px"
            :clearable="true"
            placeholder="登录名称"
            @change="refreshFormSysUser(true)"
          />
        </el-form-item>
        <el-button type="primary" @click="onSubmit" style="height: 28px" size="default">
          确定
        </el-button>
      </el-row>
    </el-form>
    <el-row>
      <el-col :span="24">
        <vxe-table
          ref="table"
          :row-id="dialogParams.props.value"
          :data="formSysUserWidget.dataList"
          height="470"
          show-overflow="title"
          show-header-overflow="title"
          :row-config="{ height: 35, isHover: true }"
          :radio-config="{ highlight: true }"
          :checkbox-config="getSelectConfig"
          @radio-change="onSelectChange"
          @checkbox-change="onSelectChange"
          @checkbox-all="onSelectChange"
        >
          <vxe-column :type="dialogParams.multiple ? 'checkbox' : 'radio'" :width="50" />
          <vxe-column title="用户名" field="loginName" />
          <vxe-column title="昵称" field="showName" />
          <vxe-column title="所属部门" field="deptIdDictMap.name" />
          <template v-slot:empty>
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png" />
              <span>暂无数据</span>
            </div>
          </template>
        </vxe-table>
      </el-col>
      <el-col :span="24">
        <el-row type="flex" justify="end" style="margin-top: 10px">
          <el-pagination
            :total="formSysUserWidget.totalCount"
            :current-page="formSysUserWidget.currentPage"
            :page-size="formSysUserWidget.pageSize"
            layout="total, prev, pager, next"
            @current-change="formSysUserWidget.onCurrentPageChange"
            @size-change="formSysUserWidget.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { VxeTable, VxeColumn, VxeTableDefines } from 'vxe-table';
import { reactive, ref, nextTick, computed, onMounted } from 'vue';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { useTable } from '@/common/hooks/useTable';
import { TableOptions } from '@/common/types/pagination';
import { SysCommonBizController } from '@/api/system';
import { findItemFromList } from '@/common/utils';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';

interface IProps extends ThirdProps {
  value: Array<ANY_OBJECT>;
  props?: ANY_OBJECT;
  multiple?: boolean;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT | ANY_OBJECT[] | undefined>;
}
const props = withDefaults(defineProps<IProps>(), {
  props: () => {
    return {
      label: 'showName',
      value: 'userId',
    };
  },
  multiple: false,
});

const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const table = ref();
const formFilter = reactive<{ sysUserLoginName: string | undefined }>({
  sysUserLoginName: undefined,
});
const dialogSelectItems = ref<ANY_OBJECT | ANY_OBJECT[]>();

const dialogParams = computed(() => {
  return {
    value: props.value || thirdParams.value.value,
    props:
      props.props || thirdParams.value.props == null ? props.props : thirdParams.value.props || {},
    multiple:
      props.multiple || thirdParams.value.multiple == null
        ? props.multiple
        : thirdParams.value.multiple,
  };
});
const getSelectConfig = computed(() => {
  let selectRowKeys =
    dialogParams.value.multiple && Array.isArray(dialogSelectItems.value)
      ? (dialogSelectItems.value || []).map((item: ANY_OBJECT) => {
          return item[dialogParams.value.props.value];
        })
      : ((dialogSelectItems.value as ANY_OBJECT) || {})[dialogParams.value.props.value];
  return {
    highlight: true,
    checkStrictly: true,
    checkRowKeys: dialogParams.value.multiple ? selectRowKeys : undefined,
    checkRowKey: dialogParams.value.multiple ? undefined : selectRowKeys,
    showHeader: false,
  };
});

const setTableSelectRow = () => {
  if (table.value == null || !Array.isArray(formSysUserWidget.dataList)) return;
  setTimeout(() => {
    table.value.clearRadioRow();
    table.value.clearCheckboxRow();
    if (dialogParams.value.multiple) {
      table.value.setCheckboxRow(
        formSysUserWidget.dataList.filter(item => {
          return (
            findItemFromList(
              dialogSelectItems.value as ANY_OBJECT[],
              item[dialogParams.value.props.value],
              dialogParams.value.props.value,
            ) != null
          );
        }),
        true,
      );
    } else {
      let selectRow = findItemFromList(
        formSysUserWidget.dataList,
        ((dialogSelectItems.value as ANY_OBJECT) || {})[dialogParams.value.props.value],
        dialogParams.value.props.value,
      );
      table.value.setRadioRow(selectRow);
    }
  }, 50);
};
const loadSysUserData = (params: ANY_OBJECT) => {
  params.widgetType = 'upms_user';
  params.filter = {
    loginName: formFilter.sysUserLoginName,
  };
  return new Promise((resolve, reject) => {
    SysCommonBizController.list(params)
      .then(res => {
        resolve({
          dataList: res.data.dataList,
          totalCount: res.data.totalCount,
        });
        nextTick(() => {
          setTableSelectRow();
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const loadSysUserVerify = () => {
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadSysUserData,
  verifyTableParameter: loadSysUserVerify,
  paged: true,
};
const formSysUserWidget = reactive(useTable(tableOptions));

const refreshFormSysUser = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    formSysUserWidget.refreshTable(true, 1);
  } else {
    formSysUserWidget.refreshTable();
  }
};
const onSelectChange = ({
  checked,
  row,
}: VxeTableDefines.RadioChangeEventParams | VxeTableDefines.CheckboxAllEventParams) => {
  if (dialogParams.value.multiple) {
    if (row == null) {
      dialogSelectItems.value = [];
      if (checked) {
        dialogSelectItems.value = formSysUserWidget.dataList;
      }
    } else {
      if (dialogSelectItems.value == null) dialogSelectItems.value = [];
      if (checked) {
        dialogSelectItems.value.push(row);
      } else {
        dialogSelectItems.value = dialogSelectItems.value.filter((item: ANY_OBJECT) => {
          return item[dialogParams.value.props.value] !== row[dialogParams.value.props.value];
        });
      }
    }
  } else {
    dialogSelectItems.value = row;
  }
};

const onSubmit = () => {
  if (props.dialog) {
    props.dialog.submit(dialogSelectItems.value);
  } else {
    onCloseThirdDialog(true, dialogParams.value.value, dialogSelectItems.value);
  }
};

onMounted(() => {
  if (Array.isArray(dialogParams.value.value) && dialogParams.value.value.length > 0) {
    if (dialogParams.value.multiple) {
      dialogSelectItems.value = dialogParams.value.value.map(item => {
        return {
          ...item,
        };
      });
    } else {
      dialogSelectItems.value = {
        ...dialogParams.value.value[0],
      };
    }
  }
  refreshFormSysUser(true);
});
</script>

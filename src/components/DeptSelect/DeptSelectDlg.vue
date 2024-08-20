<template>
  <div style="width: 100%">
    <el-form
      ref="formSysDept"
      :model="formFilter"
      label-width="75px"
      size="default"
      label-position="right"
      @submit.prevent
    >
      <el-row type="flex" justify="space-between">
        <el-form-item label="部门名称">
          <el-input
            v-model="formFilter.deptName"
            style="width: 200px"
            :clearable="true"
            placeholder="部门名称"
            @change="refreshFormSysDept(true)"
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
          :data="formSysDeptWidget.dataList"
          height="500"
          show-overflow="title"
          show-header-overflow="title"
          :row-config="{ height: 35, isHover: true }"
          :radio-config="{ highlight: true }"
          :checkbox-config="getSelectConfig"
          :tree-config="{
            transform: true,
            rowField: 'deptId',
            parentField: 'parentId',
            expandAll: true,
          }"
          @radio-change="onSelectChange"
          @checkbox-all="onSelectChange"
          @checkbox-change="onSelectChange"
        >
          <vxe-column :type="dialogParams.multiple ? 'checkbox' : 'radio'" :width="50" />
          <vxe-column title="部门名称" field="deptName" tree-node />
          <template v-slot:empty>
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png" />
              <span>暂无数据</span>
            </div>
          </template>
        </vxe-table>
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
      label: 'deptName',
      value: 'deptId',
    };
  },
  multiple: false,
});

const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const table = ref();
const formFilter = reactive<{ deptName: string | undefined }>({ deptName: undefined });
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
    dialogParams.value.multiple || Array.isArray(dialogSelectItems.value)
      ? (dialogSelectItems.value || []).map((item: ANY_OBJECT) => {
          return item[dialogParams.value.props.value];
        })
      : (dialogSelectItems.value || {})[dialogParams.value.props.value];
  return {
    highlight: true,
    checkStrictly: true,
    checkRowKeys: dialogParams.value.multiple ? selectRowKeys : undefined,
    checkRowKey: dialogParams.value.multiple ? undefined : selectRowKeys,
    showHeader: false,
  };
});

const setTableSelectRow = () => {
  if (table.value == null || !Array.isArray(formSysDeptWidget.dataList)) return;
  setTimeout(() => {
    table.value.clearRadioRow();
    table.value.clearCheckboxRow();
    if (dialogParams.value.multiple || Array.isArray(dialogSelectItems.value)) {
      table.value.setCheckboxRow(
        formSysDeptWidget.dataList.filter(item => {
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
        formSysDeptWidget.dataList,
        (dialogSelectItems.value || {})[dialogParams.value.props.value],
        dialogParams.value.props.value,
      );
      table.value.setRadioRow(selectRow);
    }
  }, 50);
};
const loadSysDeptData = (params: ANY_OBJECT) => {
  params.widgetType = 'upms_dept';
  params.filter = {
    deptName: formFilter.deptName,
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
      .catch((e: Error) => {
        reject(e);
      });
  });
};
const loadSysDeptVerify = () => {
  return true;
};
const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadSysDeptData,
  verifyTableParameter: loadSysDeptVerify,
};
const formSysDeptWidget = reactive(useTable(tableOptions));

const onSubmit = () => {
  if (props.dialog) {
    props.dialog.submit(dialogSelectItems.value);
  } else {
    onCloseThirdDialog(true, dialogParams.value.value, dialogSelectItems.value);
  }
};

const refreshFormSysDept = (reloadData = false) => {
  // 重新获取数据组件的数据
  if (reloadData) {
    formSysDeptWidget.refreshTable(true, 1);
  } else {
    formSysDeptWidget.refreshTable();
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
        dialogSelectItems.value = formSysDeptWidget.dataList;
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
  refreshFormSysDept(true);
});
</script>

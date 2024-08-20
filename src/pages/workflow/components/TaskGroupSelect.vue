<template>
  <div class="form-single-fragment" style="position: relative">
    <el-form
      label-width="100px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row type="flex" justify="end">
        <el-button
          type="primary"
          :size="layoutStore.defaultFormItemSize"
          @click="onSubmit"
          :disabled="!canCommit"
        >
          添加分组
        </el-button>
      </el-row>
    </el-form>
    <el-row style="margin-top: 18px">
      <el-col :span="24">
        <el-table
          :data="dialogParams.allGroupList"
          :size="layoutStore.defaultFormItemSize"
          height="452px"
          header-cell-class-name="table-header-gray"
          row-key="id"
          :default-expand-all="true"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="50px"
            header-align="center"
            align="center"
            :selectable="canSelect"
          />
          <el-table-column label="部门名称" prop="name" />
          <template v-slot:empty>
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png" />
              <span>暂无数据</span>
            </div>
          </template>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';

interface IProps extends ThirdProps {
  allGroupList: Array<ANY_OBJECT>;
  // 已经被使用的分组列表
  usedIdList: Array<string>;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT | ANY_OBJECT[] | null | undefined>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();
let multiSelectGroup = ref<ANY_OBJECT[]>([]);

const dialogParams = computed(() => {
  return {
    allGroupList: props.allGroupList || thirdParams.value.allGroupList,
    usedIdList: props.usedIdList || thirdParams.value.usedIdList,
  };
});
const canCommit = computed(() => {
  return multiSelectGroup.value.length > 0;
});

const handleSelectionChange = (values: ANY_OBJECT[]) => {
  multiSelectGroup.value = values;
};
const onSubmit = () => {
  if (props.dialog) {
    props.dialog.submit(multiSelectGroup.value);
  } else {
    onCloseThirdDialog(true, undefined, multiSelectGroup.value);
  }
};
const canSelect = (row: ANY_OBJECT) => {
  if (Array.isArray(dialogParams.value.usedIdList) && dialogParams.value.usedIdList.length > 0) {
    return dialogParams.value.usedIdList.indexOf(row.id) === -1;
  } else {
    return true;
  }
};
</script>

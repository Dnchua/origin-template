<template>
  <el-container>
    <el-main style="background-color: white">
      <el-card
        class="base-card"
        shadow="never"
        :body-style="{ padding: '16px' }"
        style="border: none"
      >
        <template #header>
          <div class="base-card-header">
            <el-row align="middle" style="flex-wrap: nowrap">
              <el-radio-group
                v-model="formData.deptType"
                :size="layoutStore.defaultFormItemSize"
                @change="formData.deptId = undefined"
              >
                <el-radio-button value="allDeptPost">全部</el-radio-button>
                <el-radio-button value="selfDeptPost">本部门</el-radio-button>
                <el-radio-button value="siblingDeptPost">同级部门</el-radio-button>
                <el-radio-button value="upDeptPost">上级部门</el-radio-button>
                <el-radio-button value="deptPost">指定部门</el-radio-button>
              </el-radio-group>
              <div v-show="formData.deptType === 'deptPost'">
                <el-cascader
                  v-model="formData.deptId"
                  :clearable="true"
                  :size="layoutStore.defaultFormItemSize"
                  placeholder="选择部门"
                  :props="{ value: 'id', label: 'name', checkStrictly: true }"
                  :options="dialogParams.deptList"
                >
                </el-cascader>
              </div>
            </el-row>
            <div class="base-card-operation">
              <el-button
                type="primary"
                :size="layoutStore.defaultFormItemSize"
                :disabled="selectPost.length <= 0"
                @click="onAddPostClick()"
              >
                添加岗位
              </el-button>
            </div>
          </div>
        </template>
        <el-table
          :data="getValidDeptPostList"
          :size="layoutStore.defaultFormItemSize"
          height="470px"
          header-cell-class-name="table-header-gray"
          row-key="deptPostId"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50px" :selectable="canSelect" />
          <el-table-column label="岗位名称">
            <template v-slot="scope">
              <span>{{ scope.row.postShowName || scope.row.postName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="领导岗位">
            <template v-slot="scope">
              <el-tag
                :size="layoutStore.defaultFormItemSize"
                :type="scope.row.leaderPost ? 'success' : 'danger'"
              >
                {{ scope.row.leaderPost ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="岗位级别" prop="postLevel" />
          <template v-slot:empty>
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png" />
              <span>暂无数据</span>
            </div>
          </template>
        </el-table>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';

interface IProps extends ThirdProps {
  deptList: ANY_OBJECT[];
  postList: ANY_OBJECT[];
  deptPostList: ANY_OBJECT[];
  usedIdList: ANY_OBJECT[];
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT | ANY_OBJECT[] | null | undefined>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const formData = ref<ANY_OBJECT>({
  deptType: 'allDeptPost',
  deptId: undefined,
  postId: undefined,
});
const selectPost = ref<ANY_OBJECT[]>([]);

const dialogParams = computed(() => {
  return {
    deptList: props.deptList || thirdParams.value.deptList,
    postList: props.postList || thirdParams.value.postList,
    deptPostList: props.deptPostList || thirdParams.value.deptPostList,
    usedIdList: props.usedIdList || thirdParams.value.usedIdList,
  };
});
const getValidDeptPostList = computed(() => {
  if (formData.value.deptType !== 'deptPost') {
    return dialogParams.value.postList || [];
  } else {
    return (dialogParams.value.deptPostList || []).filter(item => {
      return (
        item.deptId ===
        (Array.isArray(formData.value.deptId)
          ? formData.value.deptId[formData.value.deptId.length - 1]
          : formData.value.deptId)
      );
    });
  }
});

const canSelect = (row: ANY_OBJECT) => {
  if (Array.isArray(dialogParams.value.usedIdList) && dialogParams.value.usedIdList.length > 0) {
    return (
      dialogParams.value.usedIdList
        .map(id => {
          return id.split('__')[1];
        })
        .indexOf(row.deptPostId || row.postId) === -1
    );
  } else {
    return true;
  }
};
const handleSelectionChange = (values: ANY_OBJECT[]) => {
  selectPost.value = values;
};
const onAddPostClick = () => {
  const data = selectPost.value.map(item => {
    return {
      id: `${formData.value.deptType}__${item.deptPostId || item.postId}`,
      deptType: formData.value.deptType,
      deptPostId: formData.value.deptType === 'deptPost' ? item.deptPostId : undefined,
      postId: formData.value.deptType === 'deptPost' ? undefined : item.postId,
    };
  });
  if (props.dialog) {
    props.dialog.submit(data);
  } else {
    onCloseThirdDialog(true, undefined, data);
  }
};
</script>

<style scoped>
.dept-tree :deep(.el-tree-node__content) {
  height: 35px;
}
</style>

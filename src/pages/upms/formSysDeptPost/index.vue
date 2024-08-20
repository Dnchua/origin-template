<template>
  <div>
    <el-form
      ref="form"
      :model="formSysDeptPost"
      label-width="80px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFormSysDeptPost(true)" @reset="onReset">
        <el-form-item label="岗位名称" prop="formFilter.postName">
          <el-input
            class="filter-item"
            v-model="formSysDeptPost.formFilter.postName"
            :clearable="true"
            placeholder="岗位名称"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      ref="sysPost"
      :data="formSysDeptPost.SysPost.impl.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="formSysDeptPost.SysPost.impl.onSortChange"
      @refresh="refreshFormSysDeptPost(true)"
      :seq-config="{
        startIndex:
          (formSysDeptPost.SysPost.impl.currentPage - 1) * formSysDeptPost.SysPost.impl.pageSize,
      }"
    >
      <template v-slot:operator>
        <el-button
          type="primary"
          :disabled="!checkPermCodeExist('formSysDept:fragmentSysDept:editPost')"
          @click="onFormSetDeptPostClick()"
        >
          岗位设置
        </el-button>
      </template>
      <vxe-column
        title="序号"
        type="seq"
        width="55px"
        :index="formSysDeptPost.SysPost.impl.getTableIndex"
      />
      <vxe-column title="岗位名称" field="postName"> </vxe-column>
      <vxe-column title="岗位别名" field="sysDeptPost.postShowName">
        <template v-slot="scope">
          <span
            v-if="
              formSysDeptPost.SysPost.currentRow == null ||
              formSysDeptPost.SysPost.currentRow.postId !== scope.row.postId
            "
            >{{ (scope.row.sysDeptPost || {}).postShowName }}</span
          >
          <el-input
            v-else
            :size="layoutStore.defaultFormItemSize"
            v-model="formSysDeptPost.SysPost.currentRow.sysDeptPost.postShowName"
          />
        </template>
      </vxe-column>
      <vxe-column title="岗位层级" field="postLevel" sortable> </vxe-column>
      <vxe-column title="领导岗位" field="leaderPost" sortable>
        <template v-slot="scope">
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            :type="scope.row.leaderPost ? 'success' : 'danger'"
          >
            {{ scope.row.leaderPost ? '是' : '否' }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="操作" fixed="right" width="130px">
        <template v-slot="scope">
          <el-button
            v-if="formSysDeptPost.SysPost.currentRow == null"
            @click.stop="onEditPostName(scope.row)"
            type="primary"
            link
            size="default"
            :disabled="!checkPermCodeExist('formSysDept:fragmentSysDept:editPost')"
          >
            修改别名
          </el-button>
          <el-button
            v-if="formSysDeptPost.SysPost.currentRow == null"
            @click.stop="onDeleteSysDeptPostClick(scope.row)"
            type="danger"
            link
            size="default"
            :disabled="!checkPermCodeExist('formSysDept:fragmentSysDept:editPost')"
          >
            移除
          </el-button>
          <el-button
            v-if="
              formSysDeptPost.SysPost.currentRow != null &&
              formSysDeptPost.SysPost.currentRow.postId === scope.row.postId
            "
            @click.stop="onSavePostName(scope.row)"
            type="primary"
            link
            size="default"
          >
            保存
          </el-button>
          <el-button
            v-if="
              formSysDeptPost.SysPost.currentRow != null &&
              formSysDeptPost.SysPost.currentRow.postId === scope.row.postId
            "
            @click.stop="onCancelSavePostName"
            link
            size="default"
          >
            取消
          </el-button>
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row type="flex" justify="end" style="margin-top: 16px">
          <el-pagination
            :total="formSysDeptPost.SysPost.impl.totalCount"
            :current-page="formSysDeptPost.SysPost.impl.currentPage"
            :page-size="formSysDeptPost.SysPost.impl.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="formSysDeptPost.SysPost.impl.onCurrentPageChange"
            @size-change="formSysDeptPost.SysPost.impl.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
    <page-close-button if="closeVisible == '1'" @close="onClose" />
  </div>
</template>

<script setup lang="ts">
import { inject, reactive, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import { SysDeptPost } from '@/types/upms/department';
import { usePermissions } from '@/common/hooks/usePermission';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { SysDeptController } from '@/api/system';
import PageCloseButton from '@/components/PageCloseButton/index.vue';
import { treeDataTranslate } from '@/common/utils';
import { useDialog } from '@/components/Dialog/useDialog';
import { useLayoutStore } from '@/store';
import FormSetDeptPost from './formSetDeptPost.vue';

const Dialog = useDialog();
const props = defineProps<{ closeVisible: string; deptId: string }>();
const layoutStore = useLayoutStore();

const onClose = () => {
  console.log('返回父级页面');
};

const { checkPermCodeExist } = usePermissions();

const form = ref();

/**
 * 部门岗位数据获取函数，返回Promise
 */
const loadSysPostWidgetData = (params: ANY_OBJECT): Promise<TableData<SysDeptPost>> => {
  if (props.deptId == null) {
    formSysDeptPost.SysPost.impl.clearTable();
    return Promise.reject();
  }
  if (params == null) params = {};
  params = {
    ...params,
    deptId: props.deptId,
    sysPostDtoFilter: {
      postName: formSysDeptPost.formFilterCopy.postName,
    },
  };
  return new Promise((resolve, reject) => {
    SysDeptController.listSysDeptPost(params)
      .then(res => {
        resolve({
          dataList: treeDataTranslate<SysDeptPost>(res.data.dataList),
          totalCount: res.data.totalCount,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 部门岗位数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysPostVerify = () => {
  formSysDeptPost.formFilterCopy.postName = formSysDeptPost.formFilter.postName;
  return true;
};

const tableOptions: TableOptions<ANY_OBJECT> = {
  loadTableData: loadSysPostWidgetData,
  verifyTableParameter: loadSysPostVerify,
  paged: true,
  orderFieldName: 'postLevel',
  ascending: true,
};

const formSysDeptPost = reactive({
  formFilter: {
    postName: undefined,
  },
  formFilterCopy: {
    postName: undefined,
  },
  SysPost: {
    currentRow: {} as SysDeptPost | null,
    impl: useTable(tableOptions),
  },
  isInit: false,
});

const refreshFormSysDeptPost = (reloadData = false) => {
  if (reloadData) {
    formSysDeptPost.SysPost.impl.refreshTable(true, 1);
  } else {
    formSysDeptPost.SysPost.impl.refreshTable();
  }
  if (!formSysDeptPost.isInit) {
    // 初始化下拉数据
  }
  formSysDeptPost.isInit = true;
  formSysDeptPost.SysPost.currentRow = null;
};

const onReset = () => {
  form.value.resetFields();
  refreshFormSysDeptPost(true);
};

const onFormSetDeptPostClick = () => {
  let params = {
    deptId: props.deptId,
  };

  Dialog.show(
    '岗位设置',
    FormSetDeptPost,
    {
      area: ['1200px', '500px'],
    },
    params,
  )
    .then(() => {
      refreshFormSysDeptPost();
    })
    .catch(e => {
      console.warn(e);
    });
};

/**
 * 修改别名
 */
const onEditPostName = (row: SysDeptPost) => {
  formSysDeptPost.SysPost.currentRow = row;
};
/**
 * 保存别名
 */
const onSavePostName = (row: SysDeptPost) => {
  SysDeptController.updateSysDeptPost({
    sysDeptPostDto: {
      deptPostId: row.sysDeptPost.deptPostId,
      deptId: row.sysDeptPost.deptId,
      postId: row.postId,
      postShowName: formSysDeptPost.SysPost.currentRow?.sysDeptPost.postShowName,
    },
  })
    .then(() => {
      refreshFormSysDeptPost();
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 取消保存
 */
const onCancelSavePostName = () => {
  refreshFormSysDeptPost();
};
/**
 * 移除
 */
const onDeleteSysDeptPostClick = (row: SysDeptPost) => {
  if (props.deptId == null || row.postId == null) {
    ElMessage.error('请求失败，发现必填参数为空！');
    return;
  }
  let params = {
    deptId: props.deptId,
    postId: row.postId,
  };

  ElMessageBox.confirm('是否从部门中移除此岗位？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    SysDeptController.deleteSysDeptPost(params)
      .then(() => {
        ElMessage.success('移除成功');
        formSysDeptPost.SysPost.impl.refreshTable();
      })
      .catch(e => {
        console.warn(e);
      });
  });
};

onMounted(() => {
  refreshFormSysDeptPost(true);
});
</script>

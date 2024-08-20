<template>
  <div style="position: relative">
    <el-form
      ref="form"
      :model="formSysPost"
      label-width="75px"
      :size="layoutStore.defaultFormItemSize"
      label-position="right"
      @submit.prevent
    >
      <filter-box :item-width="350" @search="refreshFormSysPost(true)" @reset="onReset">
        <el-form-item label="岗位名称" prop="formFilter.postName">
          <el-input
            class="filter-item"
            v-model="formSysPost.formFilter.postName"
            :clearable="true"
            placeholder="岗位名称"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box
      class="page-table"
      ref="sysPost"
      :data="formSysPost.sysPost.impl.dataList"
      :size="layoutStore.defaultFormItemSize"
      @sort-change="formSysPost.sysPost.impl.onSortChange"
      @refresh="refreshFormSysPost(true)"
      :seq-config="{
        startIndex: (formSysPost.sysPost.impl.currentPage - 1) * formSysPost.sysPost.impl.pageSize,
      }"
    >
      <template v-slot:operator>
        <el-button
          type="primary"
          :icon="Plus"
          :size="layoutStore.defaultFormItemSize"
          :disabled="!checkPermCodeExist('formSysPost:fragmentSysPost:add')"
          @click="onFormAddPostClick()"
          >新建</el-button
        >
      </template>
      <vxe-column
        title="序号"
        type="seq"
        width="55px"
        :index="formSysPost.sysPost.impl.getTableIndex"
      />
      <vxe-column title="岗位名称" field="postName"> </vxe-column>
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
      <vxe-column title="操作" fixed="right" width="100px">
        <template v-slot="scope">
          <el-button
            @click.stop="onFormEditPostClick(scope.row)"
            type="primary"
            link
            :size="layoutStore.defaultFormItemSize"
            :disabled="!checkPermCodeExist('formSysPost:fragmentSysPost:update')"
          >
            编辑
          </el-button>
          <el-button
            @click.stop="onDeleteClick(scope.row)"
            link
            :size="layoutStore.defaultFormItemSize"
            type="danger"
            :disabled="!checkPermCodeExist('formSysPost:fragmentSysPost:delete')"
          >
            删除
          </el-button>
        </template>
      </vxe-column>
      <template v-slot:pagination>
        <el-row justify="end" style="margin-top: 16px">
          <el-pagination
            :total="formSysPost.sysPost.impl.totalCount"
            :current-page="formSysPost.sysPost.impl.currentPage"
            :page-size="formSysPost.sysPost.impl.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="formSysPost.sysPost.impl.onCurrentPageChange"
            @size-change="formSysPost.sysPost.impl.onPageSizeChange"
          >
          </el-pagination>
        </el-row>
      </template>
    </table-box>
  </div>
</template>

<script lang="ts">
export default {
  name: 'formSysPost',
};
</script>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usePermissions } from '@/common/hooks/usePermission';
import { TableOptions } from '@/common/types/pagination';
import { Post } from '@/types/upms/post';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { ANY_OBJECT } from '@/types/generic';
import { SysPostController } from '@/api/system';
import { useDialog } from '@/components/Dialog/useDialog';
import { useLayoutStore } from '@/store';
import FormEditPost from '../formEditSysPost/index.vue';
const layoutStore = useLayoutStore();
const Dialog = useDialog();
const { checkPermCodeExist } = usePermissions();
const form = ref();

/**
 * 岗位管理数据获取函数，返回Promise
 */
const loadSysPostWidgetData = (params: ANY_OBJECT): Promise<TableData<Post>> => {
  if (params == null) params = {};
  params = {
    ...params,
    sysPostDtoFilter: {
      postName: formSysPost.formFilterCopy.postName,
    },
  };
  return new Promise((resolve, reject) => {
    SysPostController.list(params)
      .then(res => {
        resolve({
          dataList: res.data.dataList.map(item => {
            return { ...item };
          }),
          totalCount: res.data.totalCount,
        });
      })
      .catch(e => {
        reject(e);
      });
  });
};
/**
 * 岗位管理数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysPostVerify = () => {
  formSysPost.formFilterCopy.postName = formSysPost.formFilter.postName;
  return true;
};

const tableOptions: TableOptions<Post> = {
  loadTableData: loadSysPostWidgetData,
  verifyTableParameter: loadSysPostVerify,
  paged: true,
  orderFieldName: 'postLevel',
  ascending: true,
};

const formSysPost = reactive({
  formFilter: {
    postName: undefined,
  },
  formFilterCopy: {
    postName: undefined,
  },
  sysPost: {
    impl: useTable(tableOptions),
  },
  isInit: false,
});

const onReset = () => {
  form.value.resetFields();
  refreshFormSysPost(true);
};

/**
 * 更新岗位管理
 */
const refreshFormSysPost = (reloadData = false) => {
  if (reloadData) {
    formSysPost.sysPost.impl.refreshTable(true, 1);
  } else {
    formSysPost.sysPost.impl.refreshTable();
  }
  if (!formSysPost.isInit) {
    // 初始化下拉数据
  }
  formSysPost.isInit = true;
};
/**
 * 新建
 */
const onFormAddPostClick = () => {
  let params = {};

  Dialog.show(
    '新建',
    FormEditPost,
    {
      area: '600px',
    },
    params,
  )
    .then(() => {
      refreshFormSysPost();
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 编辑
 */
const onFormEditPostClick = (row: Post) => {
  let params = {
    postId: row.postId,
  };

  Dialog.show(
    '编辑',
    FormEditPost,
    {
      area: '600px',
    },
    params,
  )
    .then(() => {
      formSysPost.sysPost.impl.refreshTable();
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 删除
 */
const onDeleteClick = (row: Post) => {
  if (row.postId == null) {
    ElMessage.error('请求失败，发现必填参数为空！');
    return;
  }
  let params = {
    postId: row.postId,
  };

  ElMessageBox.confirm(`是否删除岗位【${row.postName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      SysPostController.delete(params)
        .then(() => {
          ElMessage.success('删除成功');
          formSysPost.sysPost.impl.refreshTable();
        })
        .catch(e => {
          console.warn(e);
        });
    })
    .catch(() => {
      // do nothing
    });
};

onMounted(() => {
  refreshFormSysPost(true);
});
</script>

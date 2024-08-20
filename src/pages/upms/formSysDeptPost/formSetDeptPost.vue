<template>
  <div class="form-single-fragment" style="position: relative">
    <el-form
      ref="form"
      :model="formSetDeptPost"
      label-width="80px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
      style="overflow: hidden"
    >
      <filter-box
        :item-width="350"
        @search="refreshFormSetDeptPost(true)"
        @reset="onReset"
        style="float: left; padding: 0; margin: 0"
      >
        <el-form-item label="岗位名称" prop="formFilter.postName">
          <el-input
            class="filter-item"
            :size="formItemSize"
            v-model="formSetDeptPost.formFilter.postName"
            :clearable="true"
            placeholder="岗位名称"
          />
        </el-form-item>
      </filter-box>
      <el-button
        style="float: right"
        type="primary"
        :size="formItemSize"
        :disabled="
          tableSelectRowList.length <= 0 ||
          !checkPermCodeExist('formSysDept:fragmentSysDept:editPost')
        "
        @click="onAddSysDeptPostClick()"
      >
        添加岗位
      </el-button>
    </el-form>
    <el-row style="height: 350px">
      <el-col :span="24">
        <vxe-table
          :data="formSetDeptPost.SysPost.impl.dataList"
          :size="tableSize"
          header-cell-class-name="table-header-gray"
          :row-config="{ isHover: true }"
          :seq-config="{
            startIndex:
              (formSetDeptPost.SysPost.impl.currentPage - 1) *
              formSetDeptPost.SysPost.impl.pageSize,
          }"
          @sort-change="formSetDeptPost.SysPost.impl.onSortChange"
          @checkbox-change="onSysPostSelectionChange"
          @checkbox-all="onSysPostSelectionChange"
        >
          <vxe-column type="checkbox" header-align="center" align="center" width="40px" />
          <vxe-column
            title="序号"
            type="seq"
            width="55px"
            :index="formSetDeptPost.SysPost.impl.getTableIndex"
          />
          <vxe-column title="岗位名称" field="postName"> </vxe-column>
          <vxe-column title="岗位层级" field="postLevel" sortable> </vxe-column>
          <vxe-column title="领导岗位" field="leaderPost" sortable>
            <template v-slot="scope">
              <el-tag :size="formItemSize" :type="scope.row.leaderPost ? 'success' : 'danger'">
                {{ scope.row.leaderPost ? '是' : '否' }}
              </el-tag>
            </template>
          </vxe-column>
          <template v-slot:empty>
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png" />
              <span>暂无数据</span>
            </div>
          </template>
        </vxe-table>
        <el-col :span="24">
          <el-row type="flex" justify="end" style="margin-top: 16px">
            <el-pagination
              :total="formSetDeptPost.SysPost.impl.totalCount"
              :current-page="formSetDeptPost.SysPost.impl.currentPage"
              :page-size="formSetDeptPost.SysPost.impl.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, prev, pager, next, sizes"
              @current-change="formSetDeptPost.SysPost.impl.onCurrentPageChange"
              @size-change="formSetDeptPost.SysPost.impl.onPageSizeChange"
            >
            </el-pagination>
          </el-row>
        </el-col>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { VxeTable, VxeColumn, SizeType } from 'vxe-table';
import { ElMessage } from 'element-plus';
import { SysDeptController } from '@/api/system';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { TableOptions } from '@/common/types/pagination';
import { useTable } from '@/common/hooks/useTable';
import { TableData } from '@/common/types/table';
import { SysDeptPost } from '@/types/upms/department';
import { usePermissions } from '@/common/hooks/usePermission';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  deptId: string;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize;
});
const tableSize = computed(() => {
  return layoutStore.defaultFormItemSize as SizeType;
});
const { checkPermCodeExist } = usePermissions();

const form = ref();
const tableSelectRowList = ref([]);

/**
 * 部门岗位数据获取函数，返回Promise
 */
const loadSysPostWidgetData = (params: ANY_OBJECT): Promise<TableData<SysDeptPost>> => {
  if (props.deptId == null) {
    formSetDeptPost.SysPost.impl.clearTable();
    return Promise.reject();
  }
  if (params == null) params = {};
  params = {
    ...params,
    deptId: props.deptId,
    sysPostDtoFilter: {
      postName: formSetDeptPost.formFilterCopy.postName,
    },
  };
  return new Promise((resolve, reject) => {
    SysDeptController.listNotInSysDeptPost(params)
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
 * 部门岗位数据获取检测函数，返回true正常获取数据，返回false停止获取数据
 */
const loadSysPostVerify = () => {
  formSetDeptPost.formFilterCopy.postName = formSetDeptPost.formFilter.postName;
  return true;
};

const tableOptions: TableOptions<SysDeptPost> = {
  loadTableData: loadSysPostWidgetData,
  verifyTableParameter: loadSysPostVerify,
  paged: true,
  orderFieldName: 'postLevel',
  ascending: true,
};

const formSetDeptPost = reactive({
  formFilter: {
    postName: undefined,
  },
  formFilterCopy: {
    postName: undefined,
  },
  SysPost: {
    impl: useTable(tableOptions),
  },
  isInit: false,
});

const onReset = () => {
  form.value.resetFields();
  refreshFormSetDeptPost(true);
};

const onSysPostSelectionChange = (values: ANY_OBJECT) => {
  tableSelectRowList.value = values.records;
};

/**
 * 更新设置部门岗位
 */
const refreshFormSetDeptPost = (reloadData = false) => {
  if (reloadData) {
    formSetDeptPost.SysPost.impl.refreshTable(true, 1);
  } else {
    formSetDeptPost.SysPost.impl.refreshTable();
  }
  if (!formSetDeptPost.isInit) {
    // 初始化下拉数据
  }
  formSetDeptPost.isInit = true;
};
/**
 * 添加岗位
 */
const onAddSysDeptPostClick = () => {
  if (props.deptId == null) {
    ElMessage.error('请求失败，发现必填参数为空！');
    return;
  }
  let params = {
    deptId: props.deptId,
    sysDeptPostDtoList: tableSelectRowList.value.map((item: SysDeptPost) => {
      return {
        postId: item.postId,
        postShowName: item.postName,
      };
    }),
  };

  SysDeptController.addSysDeptPost(params)
    .then(res => {
      ElMessage.success('添加岗位成功');
      if (props.dialog) {
        props.dialog.submit(res);
      } else {
        onCloseThirdDialog(true, res);
      }
    })
    .catch(e => {
      console.warn(e);
    });
};

const formInit = () => {
  refreshFormSetDeptPost();
};

onMounted(() => {
  formInit();
});
</script>

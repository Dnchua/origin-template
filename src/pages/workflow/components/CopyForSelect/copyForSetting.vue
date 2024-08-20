<template>
  <div class="copy-select" :span="24">
    <el-button :icon="Plus" :size="layoutStore.defaultFormItemSize" @click="onEditCopyForItem"
      >添加抄送</el-button
    >
    <ul>
      <li v-for="row in tableDataList" :key="row.type">
        <label>{{ SysFlowCopyForType.getValue(row.type) }}</label>
        <div v-if="row.showNameList.length">
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            effect="dark"
            v-for="item in row.showNameList"
            :key="item.id"
            closable
            @close="onCloseSubItem(row, item)"
          >
            {{ item.name }}
          </el-tag>
        </div>
        <div v-else>
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            effect="dark"
            :key="row.type"
            closable
            @close="onDeleteCopyItem(row)"
          >
            {{ SysFlowCopyForType.getValue(row.type) }}
          </el-tag>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { treeDataTranslate } from '@/common/utils';
import { SysCommonBizController } from '@/api/system';
import { ANY_OBJECT } from '@/types/generic';
import { Dialog } from '@/components/Dialog';
import { SysFlowCopyForType } from '@/common/staticDict/flow';
import { useLayoutStore } from '@/store';
import addCopyForItem from './addCopyForItem.vue';

const emit = defineEmits<{ 'update:value': ANY_OBJECT[] }>();
const props = withDefaults(defineProps<{ value?: ANY_OBJECT[] }>(), { value: () => [] });
const layoutStore = useLayoutStore();

const isInit = ref(false);
let roleList: ANY_OBJECT[] = [];
let roleMap: Map<string, ANY_OBJECT> | null = new Map();
let deptList: ANY_OBJECT[] = [];
let deptMap: Map<string, ANY_OBJECT> | null = new Map();
let postList: ANY_OBJECT[] = [];
let postMap: Map<string, ANY_OBJECT> | null = new Map();
let deptPostList: ANY_OBJECT[] = [];
let deptPostMap: Map<string, ANY_OBJECT> | null = new Map();
const calcUserName: ANY_OBJECT = {
  '${startUserName}': '流程发起人',
  '${appointedAssignee}': '指定审批人',
};

const tableDataList = computed<ANY_OBJECT[]>(() => {
  if (isInit.value && Array.isArray(props.value)) {
    return props.value.map(item => {
      let showNameList: (ANY_OBJECT | undefined)[] = [];
      let idList: string[] = (item.id || '').split(',');
      switch (item.type) {
        case SysFlowCopyForType.USER:
          showNameList = idList
            .map((id: string) => {
              return id && id !== ''
                ? {
                    id: id,
                    name: calcUserName[id]
                      ? calcUserName[id]
                      : (item.userName || []).find((row: ANY_OBJECT) => row.id === id)?.name || id,
                  }
                : undefined;
            })
            .filter((item: ANY_OBJECT | undefined) => item != undefined);
          break;
        case SysFlowCopyForType.ROLE:
          showNameList = idList
            .map((id: string) => {
              let role = roleMap?.get(id);
              return role
                ? {
                    id: id,
                    name: role.name,
                    ...role,
                  }
                : undefined;
            })
            .filter((item: ANY_OBJECT | undefined) => item != undefined);
          break;
        case SysFlowCopyForType.DEPT:
          showNameList = idList
            .map(id => {
              let dept = deptMap?.get(id);
              return dept
                ? {
                    id: id,
                    name: dept.name,
                  }
                : undefined;
            })
            .filter((item: ANY_OBJECT | undefined) => item != undefined);
          break;
        case SysFlowCopyForType.SELF_DEPT_LEADER:
        case SysFlowCopyForType.UP_DEPT_LEADER:
          showNameList = [];
          break;
        case SysFlowCopyForType.POST:
        case SysFlowCopyForType.SELF_DEPT_POST:
        case SysFlowCopyForType.SLIBING_DEPT_POST:
        case SysFlowCopyForType.UP_DEPT_POST:
          showNameList = idList
            .map(id => {
              let post = postMap?.get(id);
              return post
                ? {
                    id: id,
                    name: post.postName,
                  }
                : undefined;
            })
            .filter(item => item != null);
          break;
        case SysFlowCopyForType.DEPT_POST:
          showNameList = idList
            .map(id => {
              let deptPost = deptPostMap?.get(id);
              return deptPost
                ? {
                    id: id,
                    name: deptPost.deptName + ' / ' + deptPost.postShowName,
                  }
                : undefined;
            })
            .filter(item => item != null);
          break;
      }
      return {
        ...item,
        showNameList,
      };
    });
  }
  return [];
});

const onDeleteCopyItem = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此抄送人？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let temp = (props.value || []).filter(item => {
        return row.type !== item.type;
      });
      emit('update:value', temp);
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};
const onCloseSubItem = (row: ANY_OBJECT, item: ANY_OBJECT) => {
  ElMessageBox.confirm('是否移除此抄送人？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let temp = (props.value || []).filter(copyItem => {
        if (row.type === copyItem.type) {
          if (copyItem.id == null || copyItem.id === '') return false;
          let tempIdList: string[] = (copyItem.id || '').split(',');
          tempIdList = tempIdList.filter(subItemId => {
            return subItemId !== item.id;
          });
          if (tempIdList.length <= 0) {
            return false;
          } else {
            copyItem.id = tempIdList.join(',');
            return true;
          }
        } else {
          return true;
        }
      });
      emit('update:value', temp);
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};
const onEditCopyForItem = () => {
  Dialog.show<ANY_OBJECT>(
    '添加抄送人',
    addCopyForItem,
    {
      area: '600px',
    },
    {
      roleList: roleList,
      deptList: deptList,
      postList: postList,
      deptPostList: deptPostList,
      path: 'thirdAddCopyForItem',
    },
    {
      width: '600px',
      height: '450px',
      pathName: '/thirdParty/thirdAddCopyForItem',
    },
  )
    .then(res => {
      updateEditCopyForItem(res);
    })
    .catch(e => {
      console.warn(e);
    });
};
const updateEditCopyForItem = (res: ANY_OBJECT) => {
  let copyForType = res.type;
  let bFind = false;
  // 按照抄送类型更新
  let temp = (props.value || []).map(copyItem => {
    if (copyItem.type === copyForType) {
      bFind = true;
      let oldIdList = (copyItem.id || '').split(',');
      let newIdList = (res.id || '').split(',');
      // 合并新旧选项
      let idList = oldIdList;
      newIdList.forEach(id => {
        if (idList.indexOf(id) === -1) idList.push(id);
      });
      return {
        ...copyItem,
        id: idList.join(','),
        userName: res.userName.concat(copyItem.userName),
      };
    } else {
      return {
        ...copyItem,
      };
    }
  });
  if (!bFind) {
    temp.push({
      ...res,
    });
  }
  emit('update:value', temp);
};
const loadSysDeptList = () => {
  return new Promise((resolve, reject) => {
    let params = {
      widgetType: 'upms_dept',
      filter: {},
    };
    SysCommonBizController.list(params, {
      showMask: false,
    })
      .then(res => {
        deptList = [];
        res.data.dataList.forEach(item => {
          const obj = {
            id: String(item.deptId),
            name: item.deptName,
            parentId: item.parentId,
            ...item,
          };
          deptMap?.set(obj.id, obj);
          deptList.push(obj);
        });
        deptList = treeDataTranslate(deptList);
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};
const loadDeptPostList = () => {
  return new Promise((resolve, reject) => {
    let params = {
      widgetType: 'upms_dept_post',
      filter: {},
    };
    SysCommonBizController.list(params, {
      showMask: false,
    })
      .then(res => {
        res.data.dataList.forEach(item => {
          deptPostMap?.set(item.deptPostId, item);
        });
        deptPostList = res.data.dataList.sort((value1, value2) => {
          return value1.postLevel - value2.postLevel;
        });
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};
const loadSysPostList = () => {
  postMap = new Map();
  return new Promise((resolve, reject) => {
    let params = {
      widgetType: 'upms_post',
      filter: {},
    };
    SysCommonBizController.list(params, {
      showMask: false,
    })
      .then(res => {
        res.data.dataList.forEach(item => {
          const obj = {
            id: String(item.postId),
            name: item.postName,
            ...item,
          };
          postMap?.set(obj.id, obj);
        });
        postList = res.data.dataList;
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};
const loadSysRoleList = () => {
  return new Promise((resolve, reject) => {
    let params = {
      widgetType: 'upms_role',
      filter: {},
    };
    SysCommonBizController.list(params, {
      showMask: false,
    })
      .then(res => {
        roleList = res.data.dataList.map(item => {
          return {
            id: String(item.roleId),
            name: item.roleName,
            ...item,
          };
        });

        roleList.forEach(item => {
          roleMap?.set(item.id, item);
        });
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};

onMounted(() => {
  let httpCalls = [loadSysDeptList(), loadSysPostList(), loadDeptPostList(), loadSysRoleList()];
  Promise.all(httpCalls)
    .then(() => {
      isInit.value = true;
    })
    .catch(e => {
      console.warn(e);
    });
});

onBeforeUnmount(() => {
  roleMap = null;
  deptMap = null;
  postMap = null;
  deptPostMap = null;
});

const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdAddCopyForItem' && data.isSuccess) {
    updateEditCopyForItem(data.data);
  }
};
defineExpose({ refreshData });
</script>

<style lang="scss" scoped>
.full-line-btn {
  width: 100%;
  margin: 10px 0;
  border: 1px dashed #ebeef5;
}

.copy-select {
  :deep(.el-tag) {
    padding-right: 4px;
    margin-right: 8px;
    color: #666;
    background-color: #f6f6f6;
    border-color: #e8e8e8;
    .el-tag__close {
      right: 1px;
      font-size: 12px;
      color: #666;
      transform: scale(1);
      &:hover {
        background-color: transparent;
      }
    }
  }
  ul {
    padding: 0;
    margin: 4px 0 0;
    list-style: none;
    li {
      margin-bottom: 8px;
      label {
        display: inline-block;
        margin-bottom: 2px;
        font-size: 12px;
        color: #666;
        line-height: 32px;
      }
    }
  }
}
</style>

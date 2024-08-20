<template>
  <div class="copy-select" :span="24">
    <el-table :data="tableDataList" :show-header="false">
      <el-table-column label="操作" width="28px">
        <template v-slot="scope">
          <el-button link :icon="Remove" @click="onDeleteCopyItem(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="抄送类型" width="150px">
        <template v-slot="scope">
          <span>{{ SysFlowCopyForType.getValue(scope.row.type) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="抄送对象">
        <template v-slot="scope">
          <el-tag
            :size="layoutStore.defaultFormItemSize"
            type="primary"
            effect="dark"
            v-for="item in scope.row.showNameList"
            :key="item.id"
            closable
            @close="onCloseSubItem(scope.row, item)"
          >
            {{ item.name }}
          </el-tag>
        </template>
      </el-table-column>
      <template v-slot:empty>
        <div class="table-empty unified-font">
          <img src="@/assets/img/empty.png" />
          <span>暂无数据</span>
        </div>
      </template>
    </el-table>
    <el-button
      class="add-btn"
      :size="layoutStore.defaultFormItemSize"
      :icon="Plus"
      @click="onEditCopyForItem()"
      >添加抄送人</el-button
    >
  </div>
</template>

<script setup lang="ts">
import { Plus, Remove } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { SysCommonBizController } from '@/api/system';
import { treeDataTranslate } from '@/common/utils';
import { ANY_OBJECT } from '@/types/generic';
import { SysFlowCopyForType } from '@/common/staticDict/flow';
import { Dialog } from '@/components/Dialog';
import { useLayoutStore } from '@/store';
import addCopyForItem from './addCopyForItem.vue';

const emit = defineEmits<{ 'update:value': [ANY_OBJECT[]] }>();
const props = withDefaults(defineProps<{ value?: ANY_OBJECT[] }>(), { value: () => [] });
const layoutStore = useLayoutStore();

const isInit = ref(false);
const calcUserName: ANY_OBJECT = {
  '${startUserName}': '流程发起人',
  '${appointedAssignee}': '指定审批人 ',
};
const roleList = ref<ANY_OBJECT[]>([]);
const roleMap = new Map();
const deptList = ref<ANY_OBJECT[]>([]);
const deptMap = new Map();
const postList = ref<ANY_OBJECT[]>([]);
const postMap = new Map();
const deptPostList = ref<ANY_OBJECT[]>([]);
const deptPostMap = new Map();

const tableDataList = computed(() => {
  if (isInit.value && Array.isArray(props.value)) {
    return props.value.map((item: ANY_OBJECT) => {
      let showNameList = (item.id || '').split(',');
      switch (item.type) {
        case SysFlowCopyForType.USER: {
          let userNames = item?.userName || [];
          showNameList = showNameList
            .map((id: string) => {
              return id && id !== ''
                ? {
                    id: id,
                    name: calcUserName[id]
                      ? calcUserName[id]
                      : userNames.find((row: ANY_OBJECT) => row.id === id)?.name || id,
                  }
                : undefined;
            })
            .filter((item: ANY_OBJECT) => item != null);
          break;
        }
        case SysFlowCopyForType.ROLE:
          showNameList = showNameList
            .map((id: string) => {
              let role = roleMap.get(id);
              return role
                ? {
                    id: id,
                    name: role.name,
                  }
                : undefined;
            })
            .filter((item: ANY_OBJECT) => item != null);
          break;
        case SysFlowCopyForType.DEPT:
          showNameList = showNameList
            .map((id: string) => {
              let dept = deptMap.get(id);
              return dept
                ? {
                    id: id,
                    name: dept.name,
                  }
                : undefined;
            })
            .filter((item: ANY_OBJECT) => item != null);
          break;
        case SysFlowCopyForType.SELF_DEPT_LEADER:
        case SysFlowCopyForType.UP_DEPT_LEADER:
          showNameList = [];
          break;
        case SysFlowCopyForType.POST:
        case SysFlowCopyForType.SELF_DEPT_POST:
        case SysFlowCopyForType.SLIBING_DEPT_POST:
        case SysFlowCopyForType.UP_DEPT_POST:
          showNameList = showNameList
            .map((id: string) => {
              let post = postMap.get(id);
              return post
                ? {
                    id: id,
                    name: post.postName,
                  }
                : undefined;
            })
            .filter((item: ANY_OBJECT) => item != null);
          break;
        case SysFlowCopyForType.DEPT_POST:
          showNameList = showNameList
            .map((id: string) => {
              let deptPost = deptPostMap.get(id);
              return deptPost
                ? {
                    id: id,
                    name: deptPost.deptName + ' / ' + deptPost.postShowName,
                  }
                : undefined;
            })
            .filter((item: ANY_OBJECT) => item != null);
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
      let temp = (props.value || []).filter((item: ANY_OBJECT) => {
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
      roleList: roleList.value,
      deptList: deptList.value,
      postList: postList.value,
      deptPostList: deptPostList.value,
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
      newIdList.forEach((id: string) => {
        if (idList.indexOf(id) === -1) idList.push(id);
      });
      return {
        ...copyItem,
        id: idList.join(','),
        userName: res.userName,
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
        let list: ANY_OBJECT[] = [];
        res.data.dataList.forEach((item: ANY_OBJECT) => {
          const obj = {
            id: String(item.deptId),
            name: item.deptName,
            parentId: item.parentId,
            ...item,
          };
          deptMap.set(obj.id, obj);
          list.push(obj);
        });
        deptList.value = treeDataTranslate(list);
        resolve(true);
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
        res.data.dataList.forEach((item: ANY_OBJECT) => {
          deptPostMap.set(item.deptPostId, item);
        });
        deptPostList.value = res.data.dataList.sort((value1, value2) => {
          return value1.postLevel - value2.postLevel;
        });
        resolve(true);
      })
      .catch(e => {
        reject(e);
      });
  });
};
const loadSysPostList = () => {
  return new Promise((resolve, reject) => {
    let params = {
      widgetType: 'upms_post',
      filter: {},
    };
    SysCommonBizController.list(params, {
      showMask: false,
    })
      .then(res => {
        res.data.dataList.forEach((item: ANY_OBJECT) => {
          const obj = {
            id: String(item.postId),
            name: item.postName,
            ...item,
          };
          postMap.set(obj.id, obj);
        });
        postList.value = res.data.dataList;
        resolve(true);
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
        roleList.value = res.data.dataList.map((item: ANY_OBJECT) => {
          return {
            id: String(item.roleId),
            name: item.roleName,
            ...item,
          };
        });

        roleList.value.forEach((item: ANY_OBJECT) => {
          roleMap.set(item.id, item);
        });
        resolve(true);
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
onUnmounted(() => {
  roleMap.clear();
  deptMap.clear();
  postMap.clear();
  deptPostMap.clear();
});
</script>

<style lang="scss" scoped>
.add-btn {
  margin-top: 16px;
  color: $color-primary;
  border-color: $color-primary;
}

.copy-select :deep(.el-tag) {
  margin-right: 8px;
}

.table-btn.delete :deep(.el-icon-remove-outline) {
  font-size: 16px;
  color: #999;
}
.el-table :deep(.cell) {
  color: #333;
}
.el-table :deep(td) {
  padding: 0;
}
.el-table :deep(.el-table__row) {
  height: 50px;
}

.copy-select :deep(.el-tag--primary) {
  color: #666;
  background-color: #f6f6f6;
  border-color: #e8e8e8;
}

.copy-select :deep(.el-tag__close) {
  top: 0;
  right: -2px;
  font-size: 14px;
  color: #999;
  transform: scale(1);
}
.copy-select :deep(.el-tag__close:hover) {
  color: #999;
  background-color: transparent;
}
</style>

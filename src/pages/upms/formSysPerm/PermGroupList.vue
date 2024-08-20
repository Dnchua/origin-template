<template>
  <el-card class="base-card" shadow="never" style="border: none">
    <template v-slot:header>
      <div class="base-card-header">
        <span style="color: #333; font-weight: bold" class="header-title">权限模块</span>
        <div class="base-card-operation">
          <div class="base-card-operation">
            <el-button
              class="advance-icon-btn"
              style="width: 40px; height: 32px; padding: 0"
              @click="emit('change')"
            >
              <img src="@/assets/img/refresh2.png" alt="" style="vertical-align: middle" />
            </el-button>
            <el-button
              class="advance-icon-btn"
              style="width: 40px; height: 32px; padding: 0"
              @click="onAddClick"
            >
              <img src="@/assets/img/add.png" alt="" style="vertical-align: middle" />
            </el-button>
          </div>
        </div>
      </div>
    </template>
    <el-scrollbar :style="{ height: mainContextHeight - 130 + 'px' }">
      <el-tree
        ref="moduleTree"
        :data="getModuleTreeData"
        :props="{ label: 'moduleName' }"
        node-key="moduleId"
        @node-click="onModuleNodeClick"
        :default-expanded-keys="expandedModule"
        :highlight-current="true"
        @node-expand="onModuleNodeExpand"
        @node-collapse="onModuleNodeCollapse"
      >
        <template v-slot="{ data }">
          <div class="module-node-item">
            <div
              class="module-node-menu"
              :class="{
                group: data.moduleType == SysPermModuleType.GROUP,
              }"
              v-if="!data.isAll"
            >
              <el-button
                link
                type="primary"
                :size="layoutStore.defaultFormItemSize"
                v-show="data.moduleType == SysPermModuleType.GROUP"
                :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:addPermModule')"
                :icon="CirclePlus"
                @click.stop="onAddChildClick(data)"
              ></el-button>
              <el-button
                link
                type="primary"
                :size="layoutStore.defaultFormItemSize"
                :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:updatePermModule')"
                :icon="Edit"
                @click.stop="onEditClick(data)"
              ></el-button>
              <el-button
                link
                type="danger"
                :size="layoutStore.defaultFormItemSize"
                :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:deletePermModule')"
                :icon="Delete"
                @click.stop="onDeleteClick(data)"
              ></el-button>
            </div>
            <div
              class="module-node-text"
              :class="{
                group: data.moduleType == SysPermModuleType.GROUP,
              }"
            >
              <div class="text">{{ data.moduleName }}</div>
            </div>
          </div>
        </template>
      </el-tree>
    </el-scrollbar>
  </el-card>
</template>

<script setup lang="ts">
import { Delete, CirclePlus, Edit } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage, ElTree } from 'element-plus';
import { computed, inject, ref } from 'vue';
import { ANY_OBJECT } from '@/types/generic';
import { usePermissions } from '@/common/hooks/usePermission';
import { SysPermModuleType } from '@/common/staticDict/index';
import { PermController } from '@/api/system';
import { PermModule } from '@/types/upms/perm';
import { useDialog } from '@/components/Dialog/useDialog';
import { useLayoutStore } from '@/store';
import FormEditSysPermModule from '../formEditSysPermModule/index.vue';

const emit = defineEmits<{
  select: [PermModule];
  change: [];
}>();

const props = defineProps<{ permModuleList: PermModule[] }>();

const Dialog = useDialog();
const layoutStore = useLayoutStore();
const mainContextHeight = inject('mainContextHeight', 200);
const { checkPermCodeExist } = usePermissions();

const getModuleTreeData = computed(() => {
  let tempList: PermModule[] = [
    {
      moduleName: '全部',
      moduleType: SysPermModuleType.CONTROLLER,
      isAll: true,
    },
  ];
  return tempList.concat(props.permModuleList);
});

const expandedModule = ref<string[]>([]);

const onModuleNodeClick = (data: PermModule) => {
  emit('select', data);
};

const onModuleNodeCollapse = (data: ANY_OBJECT) => {
  let pos = expandedModule.value.indexOf(data.moduleId);
  if (pos !== -1) {
    expandedModule.value.splice(pos, 1);
  }
};
const onModuleNodeExpand = (data: ANY_OBJECT) => {
  let pos = expandedModule.value.indexOf(data.moduleId);
  if (pos == -1) {
    expandedModule.value.push(data.moduleId);
  }
};

/**
 * 新建模块
 */
const onAddClick = () => {
  let params = {
    moduleType: SysPermModuleType.GROUP,
    moduleList: props.permModuleList,
  };

  Dialog.show(
    '新建模块',
    FormEditSysPermModule,
    {
      area: ['600px'],
    },
    params,
  )
    .then(() => {
      emit('change');
    })
    .catch(e => {
      console.warn(e);
    });
};
/**
 * 编辑模块
 */
const onEditClick = (row: PermModule) => {
  let params = {
    rowData: row,
    moduleList: props.permModuleList,
  };

  Dialog.show(
    '编辑模块',
    FormEditSysPermModule,
    {
      area: ['600px'],
    },
    params,
  )
    .then(() => {
      emit('change');
    })
    .catch(() => {
      // do nothing
    });
};
/**
 * 删除
 */
const onDeleteClick = (row: PermModule) => {
  let params = {
    moduleId: row.moduleId,
  };

  ElMessageBox.confirm(`是否删除模块【${row.moduleName}】？`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      PermController.deletePermGroup(params)
        .then(() => {
          ElMessage.success('删除成功');
          emit('change');
        })
        .catch(e => {
          console.warn(e);
        });
    })
    .catch(e => {
      console.warn(e);
    });
};

const onAddChildClick = (row: PermModule) => {
  let params = {
    parentId: row.moduleId,
    moduleType: SysPermModuleType.CONTROLLER,
    moduleList: props.permModuleList,
  };

  Dialog.show(
    '添加子模块',
    FormEditSysPermModule,
    {
      area: ['600px'],
    },
    params,
  )
    .then(() => {
      emit('change');
    })
    .catch(e => {
      console.warn(e);
    });
};
</script>

<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative; height: 100%">
    <div class="table-box form-box">
      <el-tabs v-model="activeName">
        <el-tab-pane v-if="formWidgetConfig.pc" label="PC端表单" name="pc"></el-tab-pane>
        <el-tab-pane v-if="formWidgetConfig.mobile" label="移动端表单" name="mobile"> </el-tab-pane>
      </el-tabs>
      <el-table
        :data="activeTableData"
        row-key="formId"
        height="100%"
        style="flex-grow: 1; height: 100%"
        :default-expand-all="true"
      >
        <el-table-column label="组件名称" prop="showName" />
        <el-table-column label="组件标识" prop="variableName" />
        <el-table-column label="禁用">
          <template #default="scope">
            <el-switch
              v-model="scope.row.disabled"
              size="mini"
              @change="val => onWidgetDisableChange(scope.row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="隐藏">
          <template #default="scope">
            <el-switch
              v-model="scope.row.hidden"
              size="mini"
              @change="val => onWidgetHideChange(scope.row, val)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-row class="no-scroll flex-box menu-box" type="flex" justify="end" style="padding-top: 10px">
      <el-button :size="layoutStore.defaultFormItemSize" :plain="true" @click="onCancel(false)">
        取消
      </el-button>
      <el-button type="primary" :size="layoutStore.defaultFormItemSize" @click="onSubmit()">
        保存
      </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Dialog } from '@/components/Dialog';
import { DialogProp } from '@/components/Dialog/types';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
import { findTreeNodeObjectPath } from '@/common/utils/index';
import { ANY_OBJECT } from '@/types/generic';

const layoutStore = useLayoutStore();
interface IProps extends ThirdProps {
  formAuth?: ANY_OBJECT;
  formWidgetConfig?: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT | ANY_OBJECT[] | undefined>;
}
const props = withDefaults(defineProps<IProps>(), {
  formAuth: () => {
    return {};
  },
  formWidgetConfig: () => {
    return {};
  },
});
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const activeName = ref('pc');
const pcFormWidgetList = ref([]);
const mobileFormWidgetList = ref([]);

const activeTableData = computed(() => {
  return activeName.value === 'pc' ? pcFormWidgetList.value : mobileFormWidgetList.value;
});

const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};

const buildWidgetAuthInfo = (widget, authData) => {
  if (widget.disabled || widget.hidden) {
    authData[widget.variableName] = `${widget.disabled ? 1 : 0},${widget.hidden ? 1 : 0}`;
  }
  if (Array.isArray(widget.children) && widget.children.length) {
    widget.children.forEach(child => {
      buildWidgetAuthInfo(child, authData);
    });
  }
};

const onSubmit = () => {
  let authData = {
    pc: {},
    mobile: {},
  };
  pcFormWidgetList.value.forEach(item => {
    buildWidgetAuthInfo(item, authData.pc);
  });
  mobileFormWidgetList.value.forEach(item => {
    buildWidgetAuthInfo(item, authData.mobile);
  });
  console.log(authData);
  if (props.dialog) {
    props.dialog.submit(authData);
  } else {
    onCloseThirdDialog(true);
  }
};

const setParentStatus = (widget, fieldName, val) => {
  if (widget == null) return;
  // 设置父组件的状态
  let parentPath = findTreeNodeObjectPath(
    activeTableData.value,
    widget.formId,
    'formId',
    'children',
  );
  if (Array.isArray(parentPath)) {
    parentPath.forEach(parent => {
      parent[fieldName] = val;
    });
  }
};

const setChildStatus = (widget, fieldName, val) => {
  if (widget == null) return;
  // 设置子组件的状态
  widget[fieldName] = val;
  if (Array.isArray(widget.children) && widget.children.length) {
    widget.children.forEach(child => {
      setChildStatus(child, fieldName, val);
    });
  }
};

const onWidgetDisableChange = (widget, val) => {
  // 当val为true时，当前组件的所有子组件都禁用，当val为false时，当前组件的父组件都启用
  val ? setChildStatus(widget, 'disabled', val) : setParentStatus(widget, 'disabled', val);
  if (activeName.value === 'pc') {
    pcFormWidgetList.value = [...pcFormWidgetList.value];
  } else {
    mobileFormWidgetList.value = [...mobileFormWidgetList.value];
  }
};

const onWidgetHideChange = (widget, val) => {
  // 当val为true时，当前组件的所有子组件都隐藏，当val为false时，当前组件的父组件都显示
  val ? setChildStatus(widget, 'hidden', val) : setParentStatus(widget, 'hidden', val);
  if (activeName.value === 'pc') {
    pcFormWidgetList.value = [...pcFormWidgetList.value];
  } else {
    mobileFormWidgetList.value = [...mobileFormWidgetList.value];
  }
};

const initFormAuthInfo = (widget, authInfo) => {
  let itemAuthInfo = authInfo[widget.variableName] || [0, 0];
  return {
    ...widget,
    disabled: itemAuthInfo[0] === 1,
    hidden: itemAuthInfo[1] === 1,
    children: Array.isArray(widget.children)
      ? widget.children.map(child => initFormAuthInfo(child, authInfo))
      : undefined,
  };
};
onMounted(() => {
  if (props.formWidgetConfig.pc) {
    activeName.value = 'pc';
  } else {
    activeName.value = 'mobile';
  }

  let authInfo = {
    pc: Object.keys(props.formAuth.pc || {}).reduce((acc, key) => {
      acc[key] = props.formAuth.pc[key].split(',').map(item => parseInt(item));
      return acc;
    }, {}),
    mobile: Object.keys(props.formAuth.mobile || {}).reduce((acc, key) => {
      acc[key] = props.formAuth.mobile[key].split(',').map(item => parseInt(item));
      return acc;
    }, {}),
  };
  if (props.formWidgetConfig.pc && props.formWidgetConfig.pc.widgetList) {
    pcFormWidgetList.value = props.formWidgetConfig.pc.widgetList.map(item => {
      return initFormAuthInfo(item, authInfo.pc);
    });
  }
  if (props.formWidgetConfig.mobile && props.formWidgetConfig.mobile.widgetList) {
    mobileFormWidgetList.value = props.formWidgetConfig.mobile.widgetList.map(item => {
      return initFormAuthInfo(item, authInfo.mobile);
    });
  }
});
</script>

<style scoped>
.table-box {
  display: flex;
  flex-direction: column;
}
</style>

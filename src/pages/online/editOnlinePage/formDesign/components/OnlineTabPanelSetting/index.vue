<template>
  <MultiItemBox
    :data="(formConfig().currentWidget || {}).childWidgetList"
    addText="添加标签页"
    @add="onEditTabPanel()"
    @edit="onEditTabPanel"
    @delete="onRemoveTabPanel"
    :prop="{
      label: 'showName',
      value: 'variableName',
    }"
  />
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import MultiItemBox from '@/components/MultiItemBox/index.vue';
import widgetData from '@/online/config/index';
import blockConfig from '@/online/config/customBlock';
import { ANY_OBJECT } from '@/types/generic';
import { Dialog } from '@/components/Dialog';
import { useLayoutStore } from '@/store';
import EditOnlineTabPanel from './editOnlineTabPanel.vue';

const layoutStore = useLayoutStore();
const formConfig = inject('formConfig', () => {
  console.error('OnlineTabPanelSetting: formConfig not injected');
  return {} as ANY_OBJECT;
});

const refreshData = (data: ANY_OBJECT) => {
  if (data.path === 'thirdEditOnlineTabPanel' && data.isSuccess) {
    handlerEditOperate(data.rowData, data.data);
  }
};
defineExpose({ refreshData });

const handlerEditOperate = (row: ANY_OBJECT | null, res: ANY_OBJECT) => {
  if (row == null) {
    res = createTabPanel(res);
    formConfig().currentWidget.childWidgetList.push(res);
  } else {
    formConfig().currentWidget.childWidgetList = formConfig().currentWidget.childWidgetList.map(
      (item: ANY_OBJECT) => {
        return item.variableName === row.variableName ? res : item;
      },
    );
  }
};
const onEditTabPanel = (row: ANY_OBJECT | null = null) => {
  Dialog.show<ANY_OBJECT>(
    row ? '编辑标签页' : '添加标签页',
    EditOnlineTabPanel,
    {
      area: '600px',
    },
    {
      rowData: row,
      tabPanelList: (formConfig().currentWidget.childWidgetList || [])
        .filter((item: ANY_OBJECT) => {
          return row != null ? item.variableName !== row.variableName : true;
        })
        .map((item: ANY_OBJECT) => item.variableName),
      path: 'thirdEditOnlineTabPanel',
    },
    {
      width: '600px',
      height: '500px',
      pathName: '/thirdParty/thirdEditOnlineTabPanel',
    },
  )
    .then(res => {
      handlerEditOperate(row, res);
    })
    .catch(e => {
      console.log(e);
    });
};
const onRemoveTabPanel = (row: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此标签页？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      formConfig().currentWidget.childWidgetList =
        formConfig().currentWidget.childWidgetList.filter((item: ANY_OBJECT) => {
          return item.variableName !== row.variableName;
        });
    })
    .catch(e => {
      console.warn(e);
    });
};
const createTabPanel = (res: ANY_OBJECT) => {
  let temp = widgetData.getWidgetObject(blockConfig);
  temp.showName = res.showName;
  temp.variableName = res.variableName;
  temp.relation = undefined;
  temp.datasource = undefined;
  temp.column = undefined;
  return temp;
};
</script>

<template>
  <div
    :class="{
      advance: formConfig && formConfig.formType === SysOnlineFormType.ADVANCE_QUERY,
    }"
    style="position: relative; width: 100; padding: 0 !important"
  >
    <OnlineQueryForm
      v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.QUERY"
      :height="mainContextHeight - 32 + 'px'"
      :formConfig="formConfig"
    />
    <OnlineAdvanceQueryForm
      v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.ADVANCE_QUERY"
      :height="mainContextHeight - 32 + 'px'"
      :formConfig="formConfig"
    />
    <OnlineOneToOneForm
      v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.ONE_TO_ONE_QUERY"
      :height="mainContextHeight - 32 + 'px'"
      :formConfig="formConfig"
    />
    <OnlineEditForm
      v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.FORM"
      :formConfig="formConfig"
      :readOnly="readOnly"
    />
    <OnlineWorkFlowForm
      ref="workflow"
      v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.FLOW"
      :formConfig="formConfig"
      :flowInfo="flowInfo"
      :readOnly="readOnly"
    />
    <OnlineWorkOrderForm
      v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.WORK_ORDER"
      :height="mainContextHeight - 32 + 'px'"
      :formConfig="formConfig"
      :entryId="entryId"
    />
  </div>
</template>

<script setup lang="ts">
import { ANY_OBJECT } from '@/types/generic';
import { OnlineFormController } from '@/api/online';
import { SysOnlineFormType } from '@/common/staticDict';
import OnlineQueryForm from './OnlineQueryForm/index.vue';
import OnlineAdvanceQueryForm from './OnlineAdvanceQueryForm/index.vue';
import OnlineOneToOneForm from './OnlineOneToOneForm/index.vue';
import OnlineEditForm from './OnlineEditForm/index.vue';
import OnlineWorkFlowForm from './OnlineWorkFlowForm/index.vue';
import OnlineWorkOrderForm from './OnlineWorkOrderForm/index.vue';

const mainContextHeight = inject('mainContextHeight', 200);

const props = withDefaults(
  defineProps<{
    formId: string;
    entryId?: string;
    flowInfo?: ANY_OBJECT;
    readOnly?: boolean;
  }>(),
  {
    readOnly: false,
  },
);

const workflow = ref();
const formConfig = ref();
const isReady = ref(false);

const clear = () => {
  formConfig.value = null;
};
const loadOnlineFormConfig = () => {
  isReady.value = false;
  clear();
  OnlineFormController.render({
    formId: props.formId,
  })
    .then(res => {
      let onlineForm = res.data.onlineForm;
      let formConfigData = JSON.parse(onlineForm.widgetJson);
      formConfigData = formConfigData.pc;
      formConfig.value = {
        rawData: res.data,
        readOnly: props.readOnly,
        formName: onlineForm.formName,
        formType: onlineForm.formType,
        formKind: onlineForm.formKind,
        masterTableId: onlineForm.masterTableId,
        labelWidth: formConfigData.labelWidth,
        labelPosition: formConfigData.labelPosition,
        filterItemWidth: formConfigData.filterItemWidth,
        gutter: formConfigData.gutter,
        height: formConfigData.height,
        width: formConfigData.width,
        widgetList: formConfigData.widgetList,
        operationList: (formConfigData.operationList || []).sort(
          (value1: ANY_OBJECT, value2: ANY_OBJECT) => {
            return (value1.showOrder || 0) - (value2.showOrder || 0);
          },
        ),
        tableWidget: formConfigData.tableWidget,
        leftWidget: formConfigData.leftWidget,
        customFieldList: formConfigData.customFieldList,
        formEventList: formConfigData.formEventList,
        maskFieldList: formConfigData.maskFieldList,
      };
      isReady.value = true;
    })
    .catch(e => {
      console.log(e);
    });
};
const getFormData = (isDraft: boolean, variableList: ANY_OBJECT[]) => {
  return workflow.value ? workflow.value.getFormData(isDraft, variableList) : Promise.reject();
};

defineExpose({
  getFormData,
});

watch(
  () => props.formId,
  () => {
    loadOnlineFormConfig();
    //formKey++;
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style scoped>
.advance {
  padding: 0 !important;
}
</style>

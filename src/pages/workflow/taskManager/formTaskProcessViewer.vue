<template>
  <!-- 流程图 -->
  <div class="form-single-fragment" style="position: relative">
    <el-row>
      <ProcessViewer
        :xml="taskProcessXml"
        :finishedInfo="finishedInfo"
        :allCommentList="flowTaskCommentList"
        style="height: 655px"
      />
    </el-row>
  </div>
</template>

<script setup lang="ts">
import ProcessViewer from '@/pages/workflow/components/ProcessViewer.vue';
import { FlowOperationController } from '@/api/flow';
import { ANY_OBJECT } from '@/types/generic';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';

interface IProps extends ThirdProps {
  processDefinitionId: string;
  processInstanceId: string;
}
const props = defineProps<IProps>();
const { thirdParams } = useThirdParty(props);

const finishedInfo = ref<ANY_OBJECT>();
const taskProcessXml = ref<string>();
const flowTaskCommentList = ref<ANY_OBJECT[]>();
const dialogParams = computed(() => {
  return {
    processDefinitionId: props.processDefinitionId || thirdParams.value.processDefinitionId,
    processInstanceId: props.processInstanceId || thirdParams.value.processInstanceId,
  };
});

const loadProcessCommentList = () => {
  flowTaskCommentList.value = [];
  if (dialogParams.value.processInstanceId == null || dialogParams.value.processInstanceId === '') {
    return;
  }
  FlowOperationController.listFlowTaskComment({
    processInstanceId: dialogParams.value.processInstanceId,
  })
    .then(res => {
      console.log('loadProcessCommentList', res);
      flowTaskCommentList.value = res.data;
    })
    .catch(e => {
      console.warn(e);
    });
};
const getTaskHighlightData = () => {
  if (dialogParams.value.processInstanceId == null || dialogParams.value.processInstanceId === '') {
    return;
  }
  let params = {
    processInstanceId: dialogParams.value.processInstanceId,
  };
  FlowOperationController.viewHighlightFlowData(params)
    .then(res => {
      // 已完成节点
      finishedInfo.value = res.data;
    })
    .catch(e => {
      console.warn(e);
    });
};
const getTaskProcessXml = () => {
  let params = {
    processDefinitionId: dialogParams.value.processDefinitionId,
  };
  FlowOperationController.viewProcessBpmn(params)
    .then(res => {
      // 当前流程实例xml
      taskProcessXml.value = res.data;
    })
    .catch(e => {
      console.warn(e);
    });
};

onMounted(() => {
  getTaskHighlightData();
  getTaskProcessXml();
  loadProcessCommentList();
});
</script>
